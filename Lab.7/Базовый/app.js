// app.js — Базовый уровень: «Мой университет»

const data = {
  faculties: [
    { name: "Факультет информатики", dean: "Иванов И.И.", description: "Программирование, алгоритмы, базы данных." },
    { name: "Экономический факультет", dean: "Петрова А.С.", description: "Финансы, менеджмент, маркетинг." },
    { name: "Факультет иностранных языков", dean: "Сидоров В.В.", description: "Английский, немецкий, перевод." }
  ],
  schedule: [
    { day: "Понедельник", subject: "Математика", time: "09:00–10:30", room: "101" },
    { day: "Понедельник", subject: "Программирование", time: "11:00–12:30", room: "202" },
    { day: "Вторник", subject: "Базы данных", time: "10:00–11:30", room: "305" },
    { day: "Среда", subject: "Английский язык", time: "09:00–10:30", room: "110" }
  ],
  contacts: {
    address: "г. Москва, ул. Университетская, д. 1",
    phone: "+7 (495) 123-45-67",
    email: "info@university.ru",
    website: "https://university.ru"
  }
};

const tabs = document.querySelectorAll('.tab');
const content = document.getElementById('content');

document.addEventListener('DOMContentLoaded', () => {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  switchTab('faculties');
});

function switchTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  content.innerHTML = '';
  if (tabName === 'faculties') renderFaculties();
  else if (tabName === 'schedule') renderSchedule();
  else if (tabName === 'contacts') renderContacts();
}

function renderFaculties() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<h2>Факультеты</h2>';

  data.faculties.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${f.name}</h3>
      <p><strong>Декан:</strong> ${f.dean}</p>
      <p>${f.description}</p>
    `;
    section.appendChild(card);
  });

  content.appendChild(section);
}

function renderSchedule() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<h2>Расписание</h2>';

  data.schedule.forEach(item => {
    const div = document.createElement('div');
    div.className = 'schedule-item';
    div.innerHTML = `
      <strong>${item.day}</strong> — ${item.subject}<br>
      <span>${item.time} | Аудитория ${item.room}</span>
    `;
    section.appendChild(div);
  });

  content.appendChild(section);
}

function renderContacts() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = `
    <h2>Контакты</h2>
    <div class="card">
      <p><strong>Адрес:</strong> ${data.contacts.address}</p>
      <p><strong>Телефон:</strong> ${data.contacts.phone}</p>
      <p><strong>Email:</strong> ${data.contacts.email}</p>
      <p><strong>Сайт:</strong> <a href="${data.contacts.website}" target="_blank">${data.contacts.website}</a></p>
    </div>
  `;
  content.appendChild(section);
}
