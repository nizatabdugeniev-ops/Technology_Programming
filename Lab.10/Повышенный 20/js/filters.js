import { average } from './stats.js';

export function filterByMinScore(students, minScore) {
    const min = Number(minScore);
    if (isNaN(min)) return students;
    return students.filter(s => average(s.scores) >= min);
}

export function filterByGroup(students, group) {
    if (!group) return students;
    return students.filter(s => s.group === group);
}

export function applyFilters(students, minScore, group) {
    let result = [...students];
    result = filterByMinScore(result, minScore);
    result = filterByGroup(result, group);
    return result;
}