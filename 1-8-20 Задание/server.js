const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const { loadDB, saveDB, hashPassword } = require('./seed');

// Load .env simply
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const PORT = process.env.PORT || 3000;
const SLIDING_MS = (parseInt(process.env.SESSION_SLIDING_MINUTES || 15) * 60 * 1000);
const ABSOLUTE_MS = (parseInt(process.env.SESSION_ABSOLUTE_HOURS || 8) * 60 * 60 * 1000);
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json'
};

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'");
}

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    list[name.trim()] = decodeURIComponent(rest.join('='));
  });
  return list;
}

function getSessionToken(req) {
  const cookies = parseCookies(req);
  return cookies.session || null;
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const id = crypto.createHash('sha256').update(token).digest('hex');
  const now = Date.now();
  const session = {
    id,
    user_id: userId,
    created_at: now,
    last_seen_at: now,
    expires_at: now + ABSOLUTE_MS
  };
  const db = loadDB();
  db.sessions.push(session);
  saveDB(db);
  return token;
}

function getValidSession(token) {
  if (!token) return null;
  const id = crypto.createHash('sha256').update(token).digest('hex');
  const db = loadDB();
  const session = db.sessions.find(s => s.id === id);
  if (!session) return null;
  const now = Date.now();
  if (now > session.expires_at) return null;
  if (now - session.last_seen_at > SLIDING_MS) return null;
  // update last_seen
  session.last_seen_at = now;
  saveDB(db);
  return session;
}

function getUser(userId) {
  const db = loadDB();
  return db.users.find(u => u.id === userId) || null;
}

function verifyPassword(login, password) {
  const db = loadDB();
  const user = db.users.find(u => u.login === login.toLowerCase());
  const dummySalt = crypto.randomBytes(16).toString('hex');
  const dummyHash = crypto.scryptSync('dummy', dummySalt, 64);
  if (!user) {
    crypto.timingSafeEqual(dummyHash, dummyHash); // dummy
    return null;
  }
  const hash = crypto.scryptSync(password, user.salt, 64);
  const stored = Buffer.from(user.hash, 'hex');
  const equal = crypto.timingSafeEqual(hash, stored);
  return equal ? user : null;
}

function checkRateLimit(login, ip) {
  const db = loadDB();
  const key = `${login.toLowerCase()}|${ip}`;
  const now = Date.now();
  const window = 15 * 60 * 1000;
  db.rateLimits = db.rateLimits.filter(r => now - r.ts < window);
  const fails = db.rateLimits.filter(r => r.key === key).length;
  if (fails >= 5) {
    const oldest = Math.min(...db.rateLimits.filter(r => r.key === key).map(r => r.ts));
    const wait = Math.ceil((oldest + window - now) / 1000);
    return { blocked: true, wait };
  }
  return { blocked: false };
}

function recordFail(login, ip) {
  const db = loadDB();
  db.rateLimits.push({ key: `${login.toLowerCase()}|${ip}`, ts: Date.now() });
  saveDB(db);
}

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    setSecurityHeaders(res);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}

function json(res, status, obj) {
  setSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function redirect(res, location) {
  setSecurityHeaders(res);
  res.writeHead(302, { Location: location });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  // CSRF for mutating
  if (['POST', 'PUT', 'DELETE'].includes(method) && pathname.startsWith('/api/') && req.headers['x-requested-with'] !== 'fetch') {
    return json(res, 403, { error: 'CSRF' });
  }

  const token = getSessionToken(req);
  const session = getValidSession(token);
  const user = session ? getUser(session.user_id) : null;

  // Static files
  if (pathname === '/login.html' || pathname === '/style.css' || pathname === '/app.js') {
    return serveStatic(req, res, path.join(__dirname, 'public', pathname.slice(1)));
  }
  if (pathname === '/cabinet.html') {
    return serveStatic(req, res, path.join(__dirname, 'public/cabinet.html'));
  }

  // Routes
  if (pathname === '/login' && method === 'GET') {
    return serveStatic(req, res, path.join(__dirname, 'public/login.html'));
  }

  if (pathname === '/api/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const login = (data.login || '').trim();
        const password = data.password || '';
        if (!login || !password) return json(res, 400, { error: 'Введите логин и пароль' });
        if (!/^[a-zA-Z0-9_]{3,32}$/.test(login)) return json(res, 400, { error: 'Неверный логин или пароль' });
        if (password.length < 8 || password.length > 128) return json(res, 400, { error: 'Неверный логин или пароль' });

        const ip = req.socket.remoteAddress || 'unknown';
        const limit = checkRateLimit(login, ip);
        if (limit.blocked) return json(res, 429, { error: `Слишком много попыток. Подождите ${limit.wait} сек.` });

        const found = verifyPassword(login, password);
        if (!found) {
          recordFail(login, ip);
          return json(res, 401, { error: 'Неверный логин или пароль' });
        }

        const newToken = createSession(found.id);
        const cookie = `session=${newToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(ABSOLUTE_MS/1000)}${COOKIE_SECURE ? '; Secure' : ''}`;
        setSecurityHeaders(res);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookie });
        res.end(JSON.stringify({ ok: true, role: found.role }));
      } catch (e) {
        json(res, 500, { error: 'Server error' });
      }
    });
    return;
  }

  if (pathname === '/api/logout' && method === 'POST') {
    if (!session) return json(res, 401, { error: 'UNAUTHENTICATED' });
    const db = loadDB();
    db.sessions = db.sessions.filter(s => s.id !== session.id);
    saveDB(db);
    const cookie = 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0';
    setSecurityHeaders(res);
    res.writeHead(200, { 'Set-Cookie': cookie, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname === '/api/logout-all' && method === 'POST') {
    if (!session) return json(res, 401, { error: 'UNAUTHENTICATED' });
    const db = loadDB();
    db.sessions = db.sessions.filter(s => s.user_id !== session.user_id);
    saveDB(db);
    const cookie = 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0';
    setSecurityHeaders(res);
    res.writeHead(200, { 'Set-Cookie': cookie, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname === '/api/me' && method === 'GET') {
    if (!user) return json(res, 401, { error: session ? 'SESSION_EXPIRED' : 'UNAUTHENTICATED' });
    return json(res, 200, { id: user.id, login: user.login, name: user.name, role: user.role, group: user.group });
  }

  if (pathname === '/student' && method === 'GET') {
    if (!user) return redirect(res, '/login');
    if (user.role !== 'student') return json(res, 403, { error: 'Forbidden' });
    return serveStatic(req, res, path.join(__dirname, 'public/cabinet.html'));
  }

  if (pathname === '/teacher' && method === 'GET') {
    if (!user) return redirect(res, '/login');
    if (user.role !== 'teacher') return json(res, 403, { error: 'Forbidden' });
    return serveStatic(req, res, path.join(__dirname, 'public/cabinet.html'));
  }

  if (pathname === '/api/student/grades' && method === 'GET') {
    if (!user || user.role !== 'student') return json(res, 401, { error: 'UNAUTHENTICATED' });
    const db = loadDB();
    const grades = db.grades.filter(g => g.student_id === user.id);
    return json(res, 200, grades);
  }

  if (pathname === '/api/teacher/students' && method === 'GET') {
    if (!user || user.role !== 'teacher') return json(res, 401, { error: 'UNAUTHENTICATED' });
    const db = loadDB();
    const students = db.users.filter(u => u.role === 'student').map(u => ({ id: u.id, name: u.name, group: u.group }));
    return json(res, 200, students);
  }

  if (pathname.startsWith('/api/grades/') && method === 'GET') {
    const studentId = parseInt(pathname.split('/')[3]);
    if (!user) return json(res, 401, { error: 'UNAUTHENTICATED' });
    if (user.role === 'student' && user.id !== studentId) return json(res, 403, { error: 'Forbidden' });
    if (user.role !== 'student' && user.role !== 'teacher') return json(res, 403, { error: 'Forbidden' });
    const db = loadDB();
    const grades = db.grades.filter(g => g.student_id === studentId);
    return json(res, 200, grades);
  }

  // Default
  if (pathname === '/') return redirect(res, '/login');
  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Note: better-sqlite3 and helmet not used (install issues). Using built-in http, crypto, fs (JSON DB).');
});
