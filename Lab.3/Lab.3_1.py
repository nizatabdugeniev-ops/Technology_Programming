class Student:
    """Класс студента: имя, возраст, специальность."""

    def __init__(self, name, age, specialty):
        # скрытые атрибуты (инкапсуляция)
        self.__name = name
        self.__age = age
        self.__specialty = specialty

    def show_info(self):
        """Вывод информации о студенте."""
        print(f"Имя: {self.__name}")
        print(f"Возраст: {self.__age}")
        print(f"Специальность: {self.__specialty}")

    def change_specialty(self, new_specialty):
        """Изменение специальности."""
        if new_specialty and isinstance(new_specialty, str):
            old = self.__specialty
            self.__specialty = new_specialty
            print(f"Специальность изменена: {old} -> {self.__specialty}")
        else:
            print("Ошибка: специальность должна быть непустой строкой")

    # геттеры — контролируемый доступ к данным
    def get_name(self):
        return self.__name

    def get_age(self):
        return self.__age

    def get_specialty(self):
        return self.__specialty


# --- демонстрация работы ---
student1 = Student("Анна Иванова", 19, "Информатика")
student1.show_info()

print()
student1.change_specialty("Программная инженерия")

print()
student1.show_info()