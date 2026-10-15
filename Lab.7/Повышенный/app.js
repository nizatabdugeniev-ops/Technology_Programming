// app.js — Логика SPA «Бронирование аудиторий»

// ===== ДАННЫЕ =====
const rooms = [
  { id: 1, name: "Аудитория 101", capacity: 30, equipment: "Проектор, маркерная доска, Wi-Fi" },
  { id: 2, name: "Аудитория 202", capacity: 50, equipment: "Компьютеры (25 мест), проектор, колонки" },
  { id: 3, name: "Лекционный зал 305", capacity: 120, equipment: "Проектор, микрофон, экран" },
  { id: 4, name: "Компьютерный класс 110", capacity: 24, equipment: "ПК, проектор, принтер" },
  { id: 5, name: "Аудитория 215", capacity: 40, equipment: "Интерактивная доска, проектор" }
];

let bookings = [
  { id: 1, roomId: 1, date: "2026-10-16", startTime: "10:00", endTime: "12:00", purpose: "Лекция по математике", bookedBy: "Петров А.С." },
  { id: 2, roomId: 2, date: "2026-10-16", startTime: "14:00", endTime: "16:00", purpose: "Практикум по программированию", bookedBy: "Сидорова М.В." },
  { id: 3, roomId: 3, date: "2026-10-17", startTime: "09:00", endTime: "11:00", purpose: "Общая лекция", bookedBy: "Иванов И.И." }
];

let nextBookingId = 4;

// ===== DOM-элементы =====
const tabs = document.querySelectorAll('.tab');
const content = document.getElementById('content');
const modal = document.getElementById('bookingModal');
const closeBtn = document.querySelector('.close');
const bookingForm = document.getElementById('bookingForm');
const formError = document.getElementById('formError');

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  // Обработчики вкладок
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Модальное окно
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  bookingForm.addEventListener('submit', handleBookingSubmit);

  // Начальная вкладка
  switchTab('rooms');

  // Установить минимальную дату — сегодня
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookDate').min = today;
});

// ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =====
function switchTab(tabName) {
  // Выделение активной вкладки
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Отрисовка контента
  content.innerHTML = '';
  if (tabName === 'rooms') renderRooms();
  else if (tabName === 'bookings') renderBookings();
  else if (tabName === 'rules') renderRules();
}

// ===== ОТРИСОВКА АУДИТОРИЙ =====
function renderRooms() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<h2>Доступные аудитории</h2>';

  const grid = document.createElement('div');
  grid.className = 'rooms-grid';

  rooms.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <h3>${room.name}</h3>
      <p><strong>Вместимость:</strong> ${room.capacity} человек</p>
      <p><strong>Оборудование:</strong> ${room.equipment}</p>
      <button class="btn primary" data-room-id="${room.id}">Забронировать</button>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  content.appendChild(section);

  // Обработчики кнопок бронирования
  section.querySelectorAll('.btn.primary').forEach(btn => {
    btn.addEventListener('click', () => openBookingModal(parseInt(btn.dataset.roomId)));
  });
}

// ===== ОТРИСОВКА БРОНИРОВАНИЙ =====
function renderBookings() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<h2>Текущие бронирования</h2>';

  if (bookings.length === 0) {
    section.innerHTML += '<div class="empty-state">Пока нет бронирований</div>';
    content.appendChild(section);
    return;
  }

  const table = document.createElement('table');
  table.className = 'bookings-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Аудитория</th>
        <th>Дата</th>
        <th>Время</th>
        <th>Цель</th>
        <th>Кто забронировал</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');
  // Сортировка по дате и времени
  const sorted = [...bookings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  sorted.forEach(booking => {
    const room = rooms.find(r => r.id === booking.roomId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${room ? room.name : '—'}</td>
      <td>${formatDate(booking.date)}</td>
      <td>${booking.startTime} – ${booking.endTime}</td>
      <td>${booking.purpose}</td>
      <td>${booking.bookedBy}</td>
      <td><button class="btn danger" data-id="${booking.id}">Отменить</button></td>
    `;
    tbody.appendChild(tr);
  });

  section.appendChild(table);
  content.appendChild(section);

  // Обработчики отмены
  section.querySelectorAll('.btn.danger').forEach(btn => {
    btn.addEventListener('click', () => cancelBooking(parseInt(btn.dataset.id)));
  });
}

// ===== ОТРИСОВКА ПРАВИЛ =====
function renderRules() {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = `
    <h2>Правила бронирования аудиторий</h2>
    <ol class="rules-list">
      <li>Бронирование осуществляется только на учебные и научные цели.</li>
      <li>Минимальная продолжительность брони — 30 минут, максимальная — 4 часа.</li>
      <li>Нельзя бронировать аудиторию, если время пересекается с уже существующей бронью.</li>
      <li>Бронирование на текущий день возможно не позднее чем за 1 час до начала.</li>
      <li>Отмена бронирования возможна в любой момент через вкладку «Бронирования».</li>
      <li>Администрация оставляет за собой право отменить бронь при необходимости.</li>
      <li>Пользователь несёт ответственность за сохранность оборудования в аудитории.</li>
    </ol>
  `;
  content.appendChild(section);
}

// ===== МОДАЛЬНОЕ ОКНО БРОНИРОВАНИЯ =====
function openBookingModal(roomId) {
  const room = rooms.find(r => r.id === roomId);
  if (!room) return;

  document.getElementById('roomId').value = roomId;
  document.getElementById('roomNameDisplay').textContent = room.name;
  bookingForm.reset();
  formError.textContent = '';
  modal.classList.add('show');
}

function closeModal() {
  modal.classList.remove('show');
  formError.textContent = '';
}

// ===== ПРОВЕРКА ПЕРЕСЕЧЕНИЯ ВРЕМЕНИ =====
function hasOverlap(roomId, date, startTime, endTime) {
  return bookings.some(b => {
    if (b.roomId !== roomId || b.date !== date) return false;
    // Пересечение: start1 < end2 && end1 > start2
    return startTime < b.endTime && endTime > b.startTime;
  });
}

// ===== ОБРАБОТКА ОТПРАВКИ ФОРМЫ =====
function handleBookingSubmit(e) {
  e.preventDefault();
  formError.textContent = '';

  const roomId = parseInt(document.getElementById('roomId').value);
  const date = document.getElementById('bookDate').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const purpose = document.getElementById('purpose').value.trim();
  const bookedBy = document.getElementById('bookedBy').value.trim();

  // Валидация
  if (startTime >= endTime) {
    formError.textContent = 'Время окончания должно быть позже времени начала.';
    return;
  }

  // Проверка продолжительности (примерно)
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const durationMin = (eh * 60 + em) - (sh * 60 + sm);
  if (durationMin < 30) {
    formError.textContent = 'Минимальная продолжительность брони — 30 минут.';
    return;
  }
  if (durationMin > 240) {
    formError.textContent = 'Максимальная продолжительность брони — 4 часа.';
    return;
  }

  // Проверка пересечения
  if (hasOverlap(roomId, date, startTime, endTime)) {
    formError.textContent = 'Время пересекается с уже существующей бронью этой аудитории.';
    return;
  }

  // Добавление брони
  const newBooking = {
    id: nextBookingId++,
    roomId,
    date,
    startTime,
    endTime,
    purpose,
    bookedBy
  };
  bookings.push(newBooking);

  closeModal();
  // Обновляем текущую вкладку (если открыты бронирования — обновим)
  const activeTab = document.querySelector('.tab.active').dataset.tab;
  switchTab(activeTab);

  // Небольшое уведомление
  alert('Аудитория успешно забронирована!');
}

// ===== ОТМЕНА БРОНИ =====
function cancelBooking(id) {
  if (confirm('Вы уверены, что хотите отменить эту бронь?')) {
    bookings = bookings.filter(b => b.id !== id);
    switchTab('bookings'); // Перерисовываем
  }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ =====
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}
