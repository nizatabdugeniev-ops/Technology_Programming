import { getTotalQuestions, getQuestion, checkAnswer, calculateScore } from './quiz.js';

let current = 0;
let userAnswers = [];

const progressEl = document.getElementById('progress');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');
const errorEl = document.getElementById('error');
const quizContainer = document.getElementById('quiz-container');

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

function clearError() {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
}

function renderQuestion() {
    clearError();
    const q = getQuestion(current);
    if (!q) return;

    progressEl.textContent = `Вопрос ${current + 1} из ${getTotalQuestions()}`;
    questionEl.textContent = q.question;

    answersEl.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const label = document.createElement('label');
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = idx;
        
        const text = document.createTextNode(' ' + opt);
        
        label.appendChild(input);
        label.appendChild(text);
        answersEl.appendChild(label);
    });

    nextBtn.disabled = true;

}

function finishQuiz() {
    const score = calculateScore(userAnswers);
    quizContainer.classList.add('hidden');
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `
        Викторина завершена!<br>
        Правильных ответов: <strong>${score.correct}</strong> из ${score.total}<br>
        Результат: <strong>${score.percent}%</strong>
    `;
}

answersEl.addEventListener('change', () => {
    nextBtn.disabled = false;
    clearError();
});

nextBtn.addEventListener('click', () => {
    const selected = answersEl.querySelector('input[name="answer"]:checked');
    if (!selected) {
        showError('Выберите один из вариантов ответа.');
        return;
    }

    const answerIndex = Number(selected.value);
    userAnswers[current] = answerIndex;

    current++;
    if (current >= getTotalQuestions()) {
        finishQuiz();
    } else {
        renderQuestion();
    }
});

renderQuestion();