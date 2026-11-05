export function average(scores) {
    if (!scores || scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
}

export function overallAverage(students) {
    if (!students.length) return 0;
    const all = students.flatMap(s => s.scores);
    return average(all);
}

export function countByGroup(students) {
    const map = {};
    students.forEach(s => {
        map[s.group] = (map[s.group] || 0) + 1;
    });
    return map;
}

export function bestStudent(students) {
    if (!students.length) return null;
    return students.reduce((best, s) => 
        average(s.scores) > average(best.scores) ? s : best
    );
}