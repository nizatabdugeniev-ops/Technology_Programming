// ==================== МОДЕЛЬ ДАННЫХ ====================
const STORAGE_KEY = "attendance_system_v1";

let students = [];
let attendance = [];

function load() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    students = parsed.students || [];
    attendance = parsed.attendance || [];
  } else {
    // Тестовые данные
    students = [
      { id: "S001", name: "Иванов Иван Иванович", group: "ИВТ-21" },
      { id: "S002", name: "Петрова Анна Сергеевна", group: "ИВТ-21" },
      { id: "S003", name: "Сидоров Алексей Петрович", group: "ИВТ-22" },
      { id: "S004", name: "Кузнецова Мария Дмитриевна", group: "ПИ-21" },
    ];
    const today = new Date().toISOString().slice(0, 10);
    attendance = [
      { studentId: "S001", subject: "Программирование", date: today, status: "присутствует", teacher: "Козлов А.А." },
      { studentId: "S002", subject: "Программирование", date: today, status: "отсутствует", teacher: "Козлов А.А." },
      { studentId: "S001", subject: "Базы данных", date: today, status: "присутствует", teacher: "Смирнова Е.В." },
      { studentId: "S003", subject: "Программирование", date: today, status: "опоздал", teacher: "Козлов А.А." },
    ];
    save();
  }
  renderStudentSelect();
  renderStudentList();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ students, attendance }));
}

// ==================== УТИЛИТЫ ====================
function showMsg(el, text, isError = false) {
  el.textContent = text;
  el.className = "msg " + (isError ? "error" : "success");
  setTimeout(() => { el.className = "msg"; el.textContent = ""; }, 3000);
}

function getStudentName(id) {
  const s = students.find(x => x.id === id);
  return s ? s.name : id;
}

// ==================== СТУДЕНТЫ ====================
function renderStudentSelect() {
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = students.map(s => `<option value="${s.id}">${s.id} — ${s.name}</option>`).join("");
}

function renderStudentList() {
  const list = document.getElementById("studentList");
  if (!students.length) {
    list.innerHTML = "<p>Студентов пока нет</p>";
    return;
  }
  list.innerHTML = `
    <table>
      <tr><th>ID</th><th>ФИО</th><th>Группа</th></tr>
      ${students.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.group}</td></tr>`).join("")}
    </table>`;
}

document.getElementById("studentForm").addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("newId").value.trim().toUpperCase();
  const name = document.getElementById("newName").value.trim();
  const group = document.getElementById("newGroup").value.trim();
  const msg = document.getElementById("studentMsg");

  if (!/^S\d{3,}$/.test(id)) {
    showMsg(msg, "ID должен быть в формате SXXX (например S005)", true);
    return;
  }
  if (students.some(s => s.id === id)) {
    showMsg(msg, "Студент с таким ID уже существует", true);
    return;
  }
  if (name.length < 3) {
    showMsg(msg, "ФИО слишком короткое", true);
    return;
  }

  students.push({ id, name, group });
  save();
  renderStudentSelect();
  renderStudentList();
  e.target.reset();
  showMsg(msg, "Студент добавлен");
});

// ==================== РЕГИСТРАЦИЯ ====================
document.getElementById("lessonDate").value = new Date().toISOString().slice(0, 10);

document.getElementById("attendanceForm").addEventListener("submit", e => {
  e.preventDefault();
  const studentId = document.getElementById("studentSelect").value;
  const subject = document.getElementById("subject").value.trim();
  const date = document.getElementById("lessonDate").value;
  const status = document.getElementById("status").value;
  const teacher = document.getElementById("teacher").value.trim();
  const msg = document.getElementById("registerMsg");

  if (!subject) {
    showMsg(msg, "Укажите предмет", true);
    return;
  }
  if (!teacher) {
    showMsg(msg, "Укажите преподавателя", true);
    return;
  }

  attendance.push({ studentId, subject, date, status, teacher });
  save();
  e.target.reset();
  document.getElementById("lessonDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("teacher").value = "Козлов А.А.";
  showMsg(msg, "Запись о посещении добавлена");
});

// ==================== ПОИСК ====================
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const sid = document.getElementById("searchStudent").value.trim().toUpperCase();
  const subj = document.getElementById("searchSubject").value.trim().toLowerCase();

  let results = attendance.filter(r => {
    if (sid && r.studentId !== sid) return false;
    if (subj && !r.subject.toLowerCase().includes(subj)) return false;
    return true;
  });

  const box = document.getElementById("searchResults");
  if (!results.length) {
    box.innerHTML = "<p>Записи не найдены</p>";
    return;
  }

  box.innerHTML = `
    <table>
      <tr><th>Студент</th><th>Предмет</th><th>Дата</th><th>Статус</th><th>Преподаватель</th></tr>
      ${results.map(r => `
        <tr>
          <td>${getStudentName(r.studentId)}</td>
          <td>${r.subject}</td>
          <td>${r.date}</td>
          <td>${r.status}</td>
          <td>${r.teacher}</td>
        </tr>`).join("")}
    </table>`;
});

// ==================== СТАТИСТИКА ====================
document.getElementById("statsForm").addEventListener("submit", e => {
  e.preventDefault();
  const sid = document.getElementById("statsStudent").value.trim().toUpperCase();
  const subj = document.getElementById("statsSubject").value.trim().toLowerCase();

  let records = attendance.filter(r => {
    if (sid && r.studentId !== sid) return false;
    if (subj && !r.subject.toLowerCase().includes(subj)) return false;
    return true;
  });

  const total = records.length;
  const present = records.filter(r => r.status === "присутствует").length;
  const absent = records.filter(r => r.status === "отсутствует").length;
  const late = records.filter(r => r.status === "опоздал").length;
  const effective = present + late * 0.5;
  const percent = total ? Math.round((effective / total) * 1000) / 10 : 0;

  const box = document.getElementById("statsResult");
  if (!total) {
    box.innerHTML = "<p>Нет данных для статистики</p>";
    return;
  }

  box.innerHTML = `
    <div class="stats-box">
      <div class="stat"><div class="num">${total}</div><div class="label">Всего занятий</div></div>
      <div class="stat"><div class="num">${present}</div><div class="label">Присутствовал</div></div>
      <div class="stat"><div class="num">${absent}</div><div class="label">Отсутствовал</div></div>
      <div class="stat"><div class="num">${late}</div><div class="label">Опоздал</div></div>
      <div class="stat"><div class="num">${percent}%</div><div class="label">Посещаемость</div></div>
    </div>`;
});

// ==================== ТАБЫ ====================
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Старт
load();
