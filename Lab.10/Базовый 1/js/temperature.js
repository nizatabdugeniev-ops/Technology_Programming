/**
 * temperature.js
 * Формулы преобразования температур
 */

export function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

export function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}

export function celsiusToKelvin(celsius) {
    return celsius + 273.15;
}

export function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

export function fahrenheitToKelvin(fahrenheit) {
    const celsius = fahrenheitToCelsius(fahrenheit);
    return celsiusToKelvin(celsius);
}

export function kelvinToFahrenheit(kelvin) {
    const celsius = kelvinToCelsius(kelvin);
    return celsiusToFahrenheit(celsius);
}