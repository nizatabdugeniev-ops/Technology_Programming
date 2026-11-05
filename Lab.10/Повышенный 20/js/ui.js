import { students } from './data.js';
import { average, overallAverage, countByGroup, bestStudent } from './stats.js';
import { applyFilters } from './filters.js';

const minScoreInput = document.getElementById('minScore');
const groupSelect = document.getElementById('groupFilter');
const applyBtn = document.getElementById('applyBtn');
const statsEl = document.getElementById('stats');
const tableContainer = document.getElementById('table-container');
const errorEl = document.getElementById('error');

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

function clearError() {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
}

function render(studentsList) {
    clearError();

    if (studentsList.length === 0) {
        showError('Нет студентов, соответствующих фильтрам.');
        statsEl.innerHTML = '';
        tableContainer.innerHTML = '';
        return;
    }

    const avg = overallAverage(studentsList);
    const groups = countByGroup(studentsList);
    const best = bestStudent(studentsList);

    statsEl.innerHTML = `
        <div class="stat-card"><strong>${studentsList.length}</strong>Студентов</div>
        <div class="stat-card"><strong>${avg}</strong>Средний балл</div>
        <div class="stat-card"><strong>${Object.keys(groups).length}</strong>Групп</div>
        <div class="stat-card"><strong>${best ? best.name.split(' ')[0] : '—'}</strong>Лучший</div>
    `;

    let html = `<table>
        <thead><tr><th>Имя</th><th>Группа</th><th>Средний балл</th><th>Оценки</th></tr></thead>
        <tbody>`;

    studentsList.forEach(s => {
        const avgScore = average(s.scores);
        html += `<tr>
            <td>${s.name}</td>
            <td>${s.group}</td>
            <td>${avgScore}</td>
            <td>${s.scores.join(', ')}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function apply() {
    const min = minScoreInput.value;
    const group = groupSelect.value;

    if (min !== '' && (isNaN(Number(min)) || Number(min) < 0 || Number(min) > 100)) {
        showError('Минимальный балл должен быть числом от 0 до 100.');
        return;
    }

    const filtered = applyFilters(students, min, group);
    render(filtered);
}

applyBtn.addEventListener('click', apply);
minScoreInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') apply();
});

render(students);