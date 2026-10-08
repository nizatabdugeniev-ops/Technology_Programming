const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const stats = document.querySelector("#stats");
const clearDoneButton = document.querySelector("#clear-done");

const tasks = [];

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function updateView() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const left = total - done;

  if (total === 0) {
    stats.textContent = "Нет задач";
  } else {
    stats.textContent = `${left} ${plural(left, "осталась", "осталось", "осталось")} · выполнено ${done}`;
  }

  emptyState.classList.toggle("hidden", total > 0);
  clearDoneButton.disabled = done === 0;
  clearDoneButton.textContent = done > 0
    ? `Очистить выполненные (${done})`
    : "Очистить выполненные";
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = task.done ? "task done" : "task";
  li.dataset.id = String(task.id);

  const mark = document.createElement("span");
  mark.className = "check";
  mark.setAttribute("role", "checkbox");
  mark.setAttribute("aria-checked", String(task.done));

  const text = document.createElement("p");
  text.className = "task-text";
  text.textContent = task.text;

  const remove = document.createElement("button");
  remove.className = "delete";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Удалить задачу: ${task.text}`);

  li.append(mark, text, remove);
  return li;
}

function render() {
  list.replaceChildren(...tasks.map(createTaskElement));
  updateView();
}

function addTask(rawText) {
  const text = rawText.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text,
    done: false
  };
  tasks.push(task);
  list.append(createTaskElement(task));
  input.value = "";
  updateView();
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    input.value = "";
  }
});

list.addEventListener("click", (event) => {
  const row = event.target.closest(".task");
  if (!row) return;

  const id = Number(row.dataset.id);
  const task = tasks.find((entry) => entry.id === id);
  if (!task) return;

  if (event.target.closest(".delete")) {
    const index = tasks.findIndex((entry) => entry.id === id);
    tasks.splice(index, 1);
    row.remove();
    updateView();
    return;
  }

  task.done = !task.done;
  row.classList.toggle("done", task.done);
  row.querySelector(".check").setAttribute("aria-checked", String(task.done));
  updateView();
});

clearDoneButton.addEventListener("click", () => {
  const remaining = tasks.filter((task) => !task.done);
  tasks.length = 0;
  tasks.push(...remaining);

  list.querySelectorAll(".task.done").forEach((row) => row.remove());
  updateView();
});

updateView();
