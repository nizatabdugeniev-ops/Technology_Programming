const loadBtn = document.getElementById("loadBtn");
const retryBtn = document.getElementById("retryBtn");
const statusEl = document.getElementById("status");
const dashboard = document.getElementById("dashboard");
const todosList = document.getElementById("todosList");
const userFilter = document.getElementById("userFilter");
const completedCountEl = document.getElementById("completedCount");
const pendingCountEl = document.getElementById("pendingCount");
const totalCountEl = document.getElementById("totalCount");

const API_URL = "https://jsonplaceholder.typicode.com/todos";

let allTodos = [];

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + (type || "");
}

function clearList() {
  while (todosList.firstChild) {
    todosList.removeChild(todosList.firstChild);
  }
}

function updateStats(todos) {
  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.length - completed;

  completedCountEl.textContent = completed;
  pendingCountEl.textContent = pending;
  totalCountEl.textContent = todos.length;
}

function populateUserFilter(todos) {
  const userIds = [...new Set(todos.map((t) => t.userId))].sort((a, b) => a - b);

  // Очищаем старые опции, оставляем "Все"
  while (userFilter.options.length > 1) {
    userFilter.remove(1);
  }

  userIds.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = "User " + id;
    userFilter.appendChild(option);
  });
}

function renderTodos(todos) {
  clearList();

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "Нет задач для отображения";
    todosList.appendChild(empty);
    return;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");

    const statusDiv = document.createElement("div");
    statusDiv.className = "todo-status " + (todo.completed ? "done" : "pending");

    const content = document.createElement("div");
    content.className = "todo-content";

    const meta = document.createElement("div");
    meta.className = "todo-meta";
    meta.textContent = "ID: " + todo.id + " · User: " + todo.userId;

    const title = document.createElement("div");
    title.className = "todo-title";
    title.textContent = todo.title;

    content.appendChild(meta);
    content.appendChild(title);
    li.appendChild(statusDiv);
    li.appendChild(content);
    todosList.appendChild(li);
  });
}

function applyFilter() {
  const selected = userFilter.value;

  let filtered = allTodos;
  if (selected) {
    filtered = allTodos.filter((t) => String(t.userId) === selected);
  }

  updateStats(filtered);
  renderTodos(filtered);
}

async function loadTodos() {
  setStatus("Загрузка...", "loading");
  clearList();
  dashboard.classList.add("hidden");
  retryBtn.classList.add("hidden");
  loadBtn.disabled = true;
  userFilter.value = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const todos = await response.json();

    if (!Array.isArray(todos) || todos.length === 0) {
      throw new Error("Получен пустой или некорректный ответ");
    }

    allTodos = todos;
    populateUserFilter(todos);
    updateStats(todos);
    renderTodos(todos);
    setStatus(`Успех: загружено ${todos.length} задач`, "success");
    dashboard.classList.remove("hidden");
  } catch (error) {
    clearList();
    allTodos = [];
    setStatus(`Ошибка: ${error.message}`, "error");
    retryBtn.classList.remove("hidden");
    dashboard.classList.add("hidden");
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadTodos);
retryBtn.addEventListener("click", loadTodos);
userFilter.addEventListener("change", applyFilter);

// Автозагрузка
loadTodos();