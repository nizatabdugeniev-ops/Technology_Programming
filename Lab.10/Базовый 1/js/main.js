/**
 * main.js
 * Интерфейс приложения (DOM + события)
 */

import {
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    celsiusToKelvin,
    kelvinToCelsius
} from './temperature.js';

import {
    parseTemperature,
    getValidationErrorMessage
} from './validators.js';

const tempInput = document.getElementById('tempInput');
const fromUnitSelect = document.getElementById('fromUnit');
const toUnitSelect = document.getElementById('toUnit');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

function clearMessages() {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    resultDiv.textContent = '';
}

function showError(message) {
    resultDiv.textContent = '';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showResult(value, unit) {
    errorDiv.style.display = 'none';
    const rounded = Math.round(value * 100) / 100;
    const unitSymbol = unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K';
    resultDiv.textContent = `${rounded} ${unitSymbol}`;
}

function convertTemperature() {
    clearMessages();

    const rawInput = tempInput.value;
    const value = parseTemperature(rawInput);

    if (value === null) {
        showError(getValidationErrorMessage(rawInput));
        return;
    }

    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;

    if (fromUnit === toUnit) {
        showResult(value, toUnit);
        return;
    }

    let celsius;
    switch (fromUnit) {
        case 'C':
            celsius = value;
            break;
        case 'F':
            celsius = fahrenheitToCelsius(value);
            break;
        case 'K':
            celsius = kelvinToCelsius(value);
            break;
        default:
            showError('Неизвестная исходная единица.');
            return;
    }

    let result;
    switch (toUnit) {
        case 'C':
            result = celsius;
            break;
        case 'F':
            result = celsiusToFahrenheit(celsius);
            break;
        case 'K':
            result = celsiusToKelvin(celsius);
            break;
        default:
            showError('Неизвестная целевая единица.');
            return;
    }

    showResult(result, toUnit);
}

// События
convertBtn.addEventListener('click', convertTemperature);

tempInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        convertTemperature();
    }
});

tempInput.addEventListener('input', () => {
    if (errorDiv.style.display === 'block') {
        errorDiv.style.display = 'none';
    }
});

fromUnitSelect.addEventListener('change', () => {
    if (tempInput.value.trim() !== '') {
        convertTemperature();
    }
});

toUnitSelect.addEventListener('change', () => {
    if (tempInput.value.trim() !== '') {
        convertTemperature();
    }
});

window.addEventListener('load', () => {
    tempInput.focus();
});