const form = document.querySelector("#add-form");
const input = document.querySelector("#item-input");
const list = document.querySelector("#shopping-list");
const emptyState = document.querySelector("#empty-state");
const totalCount = document.querySelector("#total-count");
const leftCount = document.querySelector("#left-count");

const items = [];

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function updateStats() {
  const total = items.length;
  const left = items.filter((item) => !item.done).length;
  totalCount.textContent = `${total} ${plural(total, "товар", "товара", "товаров")}`;
  leftCount.textContent = `осталось ${left}`;
  emptyState.classList.toggle("hidden", total > 0);
}

function createItemElement(item) {
  const li = document.createElement("li");
  li.className = item.done ? "item done" : "item";
  li.dataset.id = String(item.id);

  const mark = document.createElement("span");
  mark.className = "check";
  mark.setAttribute("aria-hidden", "true");

  const name = document.createElement("p");
  name.className = "item-name";
  name.textContent = item.text;

  const remove = document.createElement("button");
  remove.className = "delete";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Удалить ${item.text}`);

  li.append(mark, name, remove);
  return li;
}

function render() {
  list.replaceChildren();
  items.forEach((item) => {
    list.append(createItemElement(item));
  });
  updateStats();
}

function addItem(text) {
  const value = text.trim();
  if (!value) return;

  items.push({
    id: Date.now(),
    text: value,
    done: false
  });
  input.value = "";
  render();
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addItem(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    input.value = "";
    input.blur();
  }
});

list.addEventListener("click", (event) => {
  const row = event.target.closest(".item");
  if (!row) return;

  const id = Number(row.dataset.id);
  const item = items.find((entry) => entry.id === id);
  if (!item) return;

  if (event.target.closest(".delete")) {
    const index = items.findIndex((entry) => entry.id === id);
    items.splice(index, 1);
    row.remove();
    updateStats();
    return;
  }

  item.done = !item.done;
  row.classList.toggle("done", item.done);
  updateStats();
});

render();
