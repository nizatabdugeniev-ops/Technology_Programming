// app.js — Средний уровень: «Учебные курсы»

const courses = [
  { id: 1, title: "Основы JavaScript", teacher: "Смирнов А.А.", duration: "8 недель", description: "Переменные, функции, DOM, события." },
  { id: 2, title: "Веб-дизайн и CSS", teacher: "Козлова Е.В.", duration: "6 недель", description: "Flexbox, Grid, адаптивная вёрстка." },
  { id: 3, title: "Базы данных SQL", teacher: "Новиков Д.П.", duration: "10 недель", description: "SELECT, JOIN, нормализация." },
  { id: 4, title: "Алгоритмы и структуры данных", teacher: "Волков М.И.", duration: "12 недель", description: "Массивы, деревья, сложность." }
];

let myCourses = []; // id курсов, на которые записан пользователь

const tabs = document.querySelectorAll('.tab');
const content = document.getElementById('content');

document.addEventListener('DOMContentLoaded', () => {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  switchTab('courses');
});

function switchTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  content.innerHTML = '';
  if (tabName === 'courses') renderCourses();
  else if (tabName === 'my-courses') renderMyCourses();
  else if (tabName === 'info') renderInfo();
}

function renderCourses() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<h2>Доступные курсы</h2>';

  courses.forEach(course => {
    const isEnrolled = myCourses.includes(course.id);
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <h3>${course.title}</h3>
      <p><strong>Преподаватель:</strong> ${course.teacher}</p>
      <p><strong>Длительность:</strong> ${course.duration}</p>
      <p>${course.description}</p>
      <button class="btn enroll" data-id="${course.id}" ${isEnrolled ? 'disabled' : ''}>
        ${isEnrolled ? 'Уже записаны' : 'Записаться'}
      </button>
    `;
    section.appendChild(card);
  });

  content.appendChild(section);

  section.querySelectorAll('.btn.enroll:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => enroll(parseInt(btn.dataset.id)));
  });
}

function renderMyCourses() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<h2>Мои курсы</h2>';

  if (myCourses.length === 0) {
    section.innerHTML += '<div class="empty">Вы пока не записаны ни на один курс.</div>';
  } else {
    myCourses.forEach(id => {
      const course = courses.find(c => c.id === id);
      if (course) {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
          <h3>${course.title}</h3>
          <p><strong>Преподаватель:</strong> ${course.teacher}</p>
          <p>${course.description}</p>
          <button class="btn" style="background:#dc2626;color:white;" data-id="${course.id}">Отписаться</button>
        `;
        section.appendChild(card);
      }
    });
  }

  content.appendChild(section);

  section.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => unenroll(parseInt(btn.dataset.id)));
  });
}

function renderInfo() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = `
    <h2>Информация</h2>
    <div class="course-card">
      <p>Запись на курс происходит мгновенно без перезагрузки страницы.</p>
      <p>Вы можете записываться и отписываться в любой момент.</p>
      <p>Все данные хранятся только в памяти браузера (после обновления страницы сбросятся).</p>
    </div>
  `;
  content.appendChild(section);
}

function enroll(courseId) {
  if (!myCourses.includes(courseId)) {
    myCourses.push(courseId);
    // Перерисовываем текущую вкладку, чтобы обновить кнопки
    switchTab(document.querySelector('.tab.active').dataset.tab);
  }
}

function unenroll(courseId) {
  myCourses = myCourses.filter(id => id !== courseId);
  switchTab('my-courses');
}
