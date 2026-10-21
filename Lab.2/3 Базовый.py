import math
length = float(input("Длина: "))          # ввод длины
width = float(input("Ширина: "))          # ввод ширины

area = length * width                     # площадь
perimeter = 2 * (length + width)          # периметр
diagonal = math.sqrt(length * 2 + width * 2)  # диагональ

print("Площадь:", area)
print("Периметр:", perimeter)
print("Диагональ:", diagonal)
