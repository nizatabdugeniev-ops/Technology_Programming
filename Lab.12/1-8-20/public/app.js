const themeToggle = document.getElementById('theme-toggle');
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initial = stored || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initial);
themeToggle.textContent = initial === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'fetch',
      ...(options.headers || {})
    },
    credentials: 'same-origin'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data;
}

const form = document.getElementById('login-form');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    message.textContent = 'Загрузка...';
    message.className = '';
    try {
      const login = document.getElementById('login').value.trim();
      const password = document.getElementById('password').value;
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ login, password })
      });
      message.textContent = 'Вход выполнен';
      message.className = 'success';
      setTimeout(() => {
        window.location.href = data.role === 'teacher' ? '/teacher' : '/student';
      }, 500);
    } catch (err) {
      message.textContent = err.data?.error || 'Ошибка входа';
      message.className = 'error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function loadCabinet() {
  try {
    const me = await api('/api/me');
    document.getElementById('user-info').textContent = `${me.name} (${me.role}${me.group ? ', ' + me.group : ''})`;
    const content = document.getElementById('content');
    if (me.role === 'student') {
      const grades = await api('/api/student/grades');
      content.innerHTML = '<h2>Мои оценки</h2>';
      grades.forEach(g => {
        const p = document.createElement('p');
        p.textContent = `${g.subject}: ${g.grade} (${g.date})`;
        content.appendChild(p);
      });
    } else if (me.role === 'teacher') {
      const students = await api('/api/teacher/students');
      content.innerHTML = '<h2>Студенты</h2>';
      students.forEach(s => {
        const p = document.createElement('p');
        p.textContent = `${s.name} (${s.group})`;
        content.appendChild(p);
      });
    }
  } catch (err) {
    if (err.status === 401) {
      message.textContent = 'Сессия истекла, войдите снова';
      message.className = 'error';
      setTimeout(() => window.location.href = '/login', 1500);
    }
  }
}

if (document.getElementById('user-info')) {
  loadCabinet();
  document.getElementById('logout').addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });
  document.getElementById('logout-all').addEventListener('click', async () => {
    await api('/api/logout-all', { method: 'POST' });
    window.location.href = '/login';
  });
}
