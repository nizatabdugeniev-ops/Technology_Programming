length = float(input("Длина: "))          # ввод длины
width = float(input("Ширина: "))          # ввод ширины

area = length * width                     # площадь
perimeter = 2 * (length + width)          # периметр
diagonal = (length * 2 + width * 2) ** 0.5  # диагональ

print("Площадь:", area)
print("Периметр:", perimeter)
print("Диагональ:", diagonal)
