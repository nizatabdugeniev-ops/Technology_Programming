class Library:
    def __init__(self):
        self.__books = []

    def show_books(self):
        if not self.__books:
            print("Библиотека пуста")
            return
        print("Книги в библиотеке:")
        for i, title in enumerate(self.__books, start=1):
            print(f"{i}. {title}")

    def add_book(self, title):
        if title and isinstance(title, str):
            self.__books.append(title)
            print(f"Добавлена книга: {title}")
        else:
            print("Ошибка: название должно быть непустой строкой")

    def remove_book(self, title):
        if title in self.__books:
            self.__books.remove(title)
            print(f"Удалена книга: {title}")
        else:
            print(f"Книга не найдена: {title}")

    def find_book(self, title):
        found = [book for book in self.__books if title.lower() in book.lower()]
        if found:
            print("Найдено:")
            for book in found:
                print(f"- {book}")
        else:
            print(f"Ничего не найдено по запросу: {title}")


library = Library()
library.add_book("Война и мир")
library.add_book("Преступление и наказание")
library.add_book("Мастер и Маргарита")

print()
library.show_books()

print()
library.find_book("мастер")

print()
library.remove_book("Война и мир")

print()
library.show_books()