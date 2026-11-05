import { questions } from './questions.js';

export function getTotalQuestions() {
    return questions.length;
}

export function getQuestion(index) {
    if (index < 0 || index >= questions.length) {
        return null;
    }
    return questions[index];
}

export function checkAnswer(questionIndex, answerIndex) {
    const q = getQuestion(questionIndex);
    if (!q) return false;
    return q.correct === answerIndex;
}

export function calculateScore(answers) {
    let correct = 0;
    answers.forEach((ans, i) => {
        if (checkAnswer(i, ans)) correct++;
    });
    return {
        correct,
        total: questions.length,
        percent: Math.round((correct / questions.length) * 100)
    };
}