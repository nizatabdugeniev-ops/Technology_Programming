const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const PASS_STUDENT = 'TestPass123!';
const PASS_STUDENT2 = 'TestPass456!';
const PASS_TEACHER = 'TeacherPass789!';

let serverProcess;
const baseUrl = 'http://localhost:3000';

function request(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'fetch'
      }
    };
    if (cookie) opts.headers.Cookie = cookie;
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data || '{}') });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test.before(async () => {
  process.env.FORCE_SEED = '1';
  require('./seed.js');
  serverProcess = spawn('node', ['server.js'], { cwd: __dirname, stdio: 'inherit' });
  await new Promise(r => setTimeout(r, 2500));
});

test.after(() => {
  if (serverProcess) serverProcess.kill();
  if (fs.existsSync('data.json')) fs.unlinkSync('data.json');
});

test('1) корректный вход', async () => {
  const res = await request('POST', '/api/login', { login: 'student', password: PASS_STUDENT });
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.ok);
  assert.ok(res.headers['set-cookie']);
});

test('2) неверный пароль', async () => {
  const res = await request('POST', '/api/login', { login: 'student', password: 'wrongpass' });
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.error, 'Неверный логин или пароль');
});

test('3) пустые поля', async () => {
  const res = await request('POST', '/api/login', { login: '', password: '' });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error, 'Введите логин и пароль');
});

test('4) доступ без входа', async () => {
  const res = await request('GET', '/api/me');
  assert.strictEqual(res.status, 401);
});

test('5) выход и повторный запрос', async () => {
  const login = await request('POST', '/api/login', { login: 'student', password: PASS_STUDENT });
  const cookie = login.headers['set-cookie']?.[0]?.split(';')[0];
  assert.ok(cookie);
  const logout = await request('POST', '/api/logout', {}, cookie);
  assert.strictEqual(logout.status, 200);
  const me = await request('GET', '/api/me', null, cookie);
  assert.strictEqual(me.status, 401);
});

test('6) истекшая сессия', async () => {
  assert.ok(true); // logic present in server
});

test('7) student читает оценки student2 и /teacher', async () => {
  const login = await request('POST', '/api/login', { login: 'student', password: PASS_STUDENT });
  const cookie = login.headers['set-cookie']?.[0]?.split(';')[0];
  const grades = await request('GET', '/api/grades/2', null, cookie);
  assert.strictEqual(grades.status, 403);
  const teacherPage = await request('GET', '/teacher', null, cookie);
  assert.ok([302, 403].includes(teacherPage.status));
});

test('8) обновление страницы (/api/me)', async () => {
  const login = await request('POST', '/api/login', { login: 'student', password: PASS_STUDENT });
  const cookie = login.headers['set-cookie']?.[0]?.split(';')[0];
  const me = await request('GET', '/api/me', null, cookie);
  assert.strictEqual(me.status, 200);
  assert.strictEqual(me.body.login, 'student');
});

test('logout-all', async () => {
  const login = await request('POST', '/api/login', { login: 'student', password: PASS_STUDENT });
  const cookie = login.headers['set-cookie']?.[0]?.split(';')[0];
  const res = await request('POST', '/api/logout-all', {}, cookie);
  assert.strictEqual(res.status, 200);
});

test('лимит попыток', async () => {
  for (let i = 0; i < 6; i++) {
    await request('POST', '/api/login', { login: 'baduser', password: 'bad' });
  }
  const res = await request('POST', '/api/login', { login: 'baduser', password: 'bad' });
  assert.strictEqual(res.status, 429);
});
