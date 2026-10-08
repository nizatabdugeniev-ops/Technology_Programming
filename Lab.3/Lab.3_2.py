class Laptop:
    def __init__(self, manufacturer, model, ram, price):
        self.__manufacturer = manufacturer
        self.__model = model
        self.__ram = ram
        self.__price = price

    def show_info(self):
        print(f"Производитель: {self.__manufacturer}")
        print(f"Модель: {self.__model}")
        print(f"RAM: {self.__ram} ГБ")
        print(f"Цена: {self.__price}")

    def upgrade_ram(self, extra_gb):
        if isinstance(extra_gb, (int, float)) and extra_gb > 0:
            old = self.__ram
            self.__ram += extra_gb
            print(f"RAM увеличена: {old} ГБ -> {self.__ram} ГБ")
        else:
            print("Ошибка: увеличение RAM должно быть положительным числом")

    def change_price(self, new_price):
        if isinstance(new_price, (int, float)) and new_price >= 0:
            old = self.__price
            self.__price = new_price
            print(f"Цена изменена: {old} -> {self.__price}")
        else:
            print("Ошибка: цена должна быть неотрицательным числом")


laptop1 = Laptop("Lenovo", "ThinkPad E14", 16, 65000)
laptop1.show_info()

print()
laptop1.upgrade_ram(16)

print()
laptop1.change_price(72000)

print()
laptop1.show_info()