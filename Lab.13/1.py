def find_item(items, name):
    "Возвращает индекс товара (без учёта регистра) или None."
    for index, item in enumerate(items):
        if item.casefold() == name.casefold():
            return index
    return None


def add_item(items, name):
    "Добавляет товар. Возвращает False, если название пустое или уже есть."
    if not name or find_item(items, name) is not None:
        return False
    items.append(name)
    return True
 
def remove_item(items, name):
    "Удаляет товар по названию. Возвращает False, если его нет."
    index = find_item(items, name)
    if index is None:
        return False
    items.pop(index)
    return True
 
 
def show_items(items):
    "Выводит все товары с номерами."
    if not items:
        print("Список покупок пуст.")
        return
    print("Список покупок:")
    for number, item in enumerate(items, start=1):
        print(f"{number}. {item}")
 
 
def main():
    items = []
    while True:
        print("\n1 - добавить, 2 - удалить, 3 - показать, 0 - выход")
        choice = input("Выберите действие: ").strip()
 
        if choice == "1":
            name = input("Название товара: ").strip()
            if add_item(items, name):
                print(f"Товар «{name}» добавлен.")
            else:
                print("Не добавлено: название пустое или товар уже есть.")
        elif choice == "2":
            name = input("Какой товар удалить: ").strip()
            if remove_item(items, name):
                print(f"Товар «{name}» удалён.")
            else:
                print(f"Товар «{name}» не найден.")
        elif choice == "3":
            show_items(items)
        elif choice == "0":
            print("Работа завершена.")
            break
        else:
            print("Неизвестная команда.")
 
 
if __name__ == "__main__":
    main()
 