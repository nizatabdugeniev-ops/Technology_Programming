const loadBtn = document.getElementById("loadBtn");
const retryBtn = document.getElementById("retryBtn");
const statusEl = document.getElementById("status");
const postsList = document.getElementById("postsList");

const API_URL = "https://jsonplaceholder.typicode.com/posts?_limit=10";

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

async function loadPosts() {
  setStatus("Загрузка...", "loading");
  clearList();
  retryBtn.classList.add("hidden");
  loadBtn.disabled = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const posts = await response.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error("Получен пустой или некорректный ответ");
    }

    renderPosts(posts);
    setStatus(`Успех: загружено ${posts.length} публикаций`, "success");
  } catch (error) {
    clearList();
    setStatus(`Ошибка: ${error.message}`, "error");
    retryBtn.classList.remove("hidden");
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadPosts);
retryBtn.addEventListener("click", loadPosts);

// Автозагрузка при открытии страницы (можно убрать)
loadPosts();