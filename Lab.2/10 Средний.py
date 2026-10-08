number = int(input("Введите трехзначное число: "))  # ввод числа

hundreds = number // 100     # сотни
tens = number // 10 % 10     # десятки
units = number % 10          # единицы

sum_digits = hundreds + tens + units          # сумма цифр
product_digits = hundreds * tens * units      # произведение цифр

print("Сумма цифр:", sum_digits)
print("Произведение цифр:", product_digits)
