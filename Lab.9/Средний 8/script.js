const loadBtn = document.getElementById("loadBtn");
const retryBtn = document.getElementById("retryBtn");
const statusEl = document.getElementById("status");
const postsList = document.getElementById("postsList");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");

const API_URL = "https://jsonplaceholder.typicode.com/posts";

let allPosts = [];

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + (type || "");
}

function clearList() {
  while (postsList.firstChild) {
    postsList.removeChild(postsList.firstChild);
  }
}

function renderPosts(posts) {
  clearList();

  if (posts.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "Ничего не найдено";
    postsList.appendChild(empty);
    return;
  }

  posts.forEach((post) => {
    const li = document.createElement("li");
    li.className = "post-item";

    const idSpan = document.createElement("span");
    idSpan.className = "post-id";
    idSpan.textContent = "ID: " + post.id;

    const titleP = document.createElement("p");
    titleP.className = "post-title";
    titleP.textContent = post.title;

    li.appendChild(idSpan);
    li.appendChild(titleP);
    postsList.appendChild(li);
  });
}

function filterPosts(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    renderPosts(allPosts);
    return;
  }

  const filtered = allPosts.filter((post) =>
    post.title.toLowerCase().includes(normalized)
  );

  renderPosts(filtered);
}

async function loadPosts() {
  setStatus("Загрузка...", "loading");
  clearList();
  searchContainer.classList.add("hidden");
  retryBtn.classList.add("hidden");
  loadBtn.disabled = true;
  searchInput.value = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const posts = await response.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Получен пустой или некорректный ответ");
    }

    allPosts = posts;
    renderPosts(allPosts);
    setStatus(`Успех: загружено ${posts.length} публикаций`, "success");
    searchContainer.classList.remove("hidden");
    searchInput.focus();
  } catch (error) {
    clearList();
    allPosts = [];
    setStatus(`Ошибка: ${error.message}`, "error");
    retryBtn.classList.remove("hidden");
    searchContainer.classList.add("hidden");
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadPosts);
retryBtn.addEventListener("click", loadPosts);

searchInput.addEventListener("input", () => {
  filterPosts(searchInput.value);
});

// Автозагрузка при открытии страницы
loadPosts();