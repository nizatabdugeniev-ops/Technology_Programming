const quizRoot = document.querySelector("#quiz");
const stepLabel = document.querySelector("#step");
const barFill = document.querySelector("#bar-fill");
const feedback = document.querySelector("#feedback");
const nextButton = document.querySelector("#next-button");

const questions = [
  {
    text: "Какой метод находит первый элемент по CSS-селектору?",
    options: ["getElementsByTagName()", "querySelector()", "createElement()", "appendChild()"],
    correct: 1
  },
  {
    text: "Чем addEventListener() удобнее атрибута onclick?",
    options: [
      "Можно повесить несколько обработчиков и легко их снять",
      "Он работает только с клавиатурой",
      "Он сам создаёт новые DOM-элементы",
      "Он меняет CSS без классов"
    ],
    correct: 0
  },
  {
    text: "Какое свойство меняет текст элемента без разбора HTML?",
    options: ["innerHTML", "textContent", "className", "style.display"],
    correct: 1
  },
  {
    text: "Как динамически создать новый элемент списка?",
    options: [
      "document.createElement('li')",
      "document.remove('li')",
      "element.classList.toggle('li')",
      "window.alert('li')"
    ],
    correct: 0
  },
  {
    text: "Что делает classList.toggle('done')?",
    options: [
      "Удаляет элемент из DOM",
      "Добавляет класс, если его нет, и убирает, если он есть",
      "Меняет текст кнопки",
      "Останавливает всплытие события"
    ],
    correct: 1
  }
];

let current = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const question = questions[current];
  answered = false;

  stepLabel.textContent = `Вопрос ${current + 1} из ${questions.length}`;
  barFill.style.width = `${((current + 1) / questions.length) * 100}%`;

  feedback.hidden = true;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextButton.hidden = true;
  nextButton.textContent = current === questions.length - 1 ? "Показать итог" : "Дальше";

  quizRoot.replaceChildren();

  const title = document.createElement("h2");
  title.className = "question";
  title.textContent = question.text;

  const options = document.createElement("div");
  options.className = "options";

  question.options.forEach((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.textContent = label;
    button.dataset.index = String(index);
    options.append(button);
  });

  quizRoot.append(title, options);
}

function showResult() {
  stepLabel.textContent = "Тест завершён";
  barFill.style.width = "100%";
  feedback.hidden = true;
  nextButton.hidden = true;
  quizRoot.replaceChildren();

  const box = document.createElement("div");
  box.className = "result";

  const title = document.createElement("h2");
  title.textContent = score === questions.length ? "Отлично" : "Итог";

  const scoreLine = document.createElement("p");
  scoreLine.className = "score";
  scoreLine.textContent = `Верных ответов: ${score} из ${questions.length}`;

  const note = document.createElement("p");
  note.className = "feedback";
  note.textContent = score >= 4
    ? "База по DOM и событиям уже на месте."
    : "Стоит ещё раз пройти методы поиска, классы и addEventListener().";

  const restart = document.createElement("button");
  restart.type = "button";
  restart.className = "restart";
  restart.textContent = "Пройти ещё раз";
  restart.addEventListener("click", () => {
    current = 0;
    score = 0;
    renderQuestion();
  });

  box.append(title, scoreLine, note, restart);
  quizRoot.append(box);
}

quizRoot.addEventListener("click", (event) => {
  const button = event.target.closest(".option");
  if (!button || answered) return;

  answered = true;
  const chosen = Number(button.dataset.index);
  const question = questions[current];
  const options = quizRoot.querySelectorAll(".option");

  options.forEach((option) => {
    option.disabled = true;
    const index = Number(option.dataset.index);
    if (index === question.correct) option.classList.add("correct");
    if (index === chosen && chosen !== question.correct) option.classList.add("wrong");
  });

  feedback.hidden = false;
  if (chosen === question.correct) {
    score += 1;
    feedback.textContent = "Верно.";
    feedback.className = "feedback ok";
  } else {
    feedback.textContent = `Неверно. Правильный ответ: ${question.options[question.correct]}.`;
    feedback.className = "feedback bad";
  }

  nextButton.hidden = false;
});

nextButton.addEventListener("click", () => {
  current += 1;
  if (current >= questions.length) {
    showResult();
    return;
  }
  renderQuestion();
});

renderQuestion();
