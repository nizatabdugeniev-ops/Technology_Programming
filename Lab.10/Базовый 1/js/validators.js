/**
 * validators.js
 * Валидация пользовательского ввода
 */

export function isValidTemperatureInput(input) {
    if (input === null || input === undefined || input.trim() === "") {
        return false;
    }
    const num = Number(input);
    return !isNaN(num) && isFinite(num);
}

export function parseTemperature(input) {
    if (!isValidTemperatureInput(input)) {
        return null;
    }
    return Number(input);
}

export function getValidationErrorMessage(input) {
    if (input === null || input === undefined || input.trim() === "") {
        return "Пожалуйста, введите значение температуры.";
    }
    if (isNaN(Number(input))) {
        return "Введите корректное число (например: 25 или -10.5).";
    }
    return "Некорректное значение температуры.";
}