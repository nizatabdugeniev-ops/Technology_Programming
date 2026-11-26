from collections import deque
 
 
def find_order(queue, number):
    "Возвращает заказ с указанным номером или None."
    for order in queue:
        if order["number"] == number:
            return order
    return None
 
 
def add_order(queue, number, description):
    "Ставит заказ в конец очереди. Возвращает False, если номер занят."
    if find_order(queue, number) is not None:
        return False
    queue.append({"number": number, "description": description})
    return True
 
 
def serve_order(queue):
    "Выдаёт первый заказ. Возвращает None, если очередь пуста."
    if not queue:
        return None
    return queue.popleft()
 
 
def format_order(order):
    return f"№{order['number']}: {order['description']}"
 
 
def show_report(queue):
    "Выводит отчёт об оставшихся заказах."
    if not queue:
        print("Оставшихся заказов нет.")
        return
    print(f"Осталось заказов: {len(queue)}")
    for position, order in enumerate(queue, start=1):
        print(f"{position}) {format_order(order)}")
 
 
def read_number():
    "Читает положительный номер заказа. При ошибке возвращает None."
    try:
        number = int(input("Номер заказа: "))
    except ValueError:
        number = 0
    if number <= 0:
        print("Номер должен быть целым положительным числом.")
        return None
    return number
 
 
def main():
    queue = deque()
    while True:
        print("\n1 - добавить, 2 - выдать первый, 3 - найти, 4 - отчёт, 0 - выход")
        choice = input("Выберите действие: ").strip()
 
        if choice == "1":
            number = read_number()
            if number is None:
                continue
            description = input("Что заказано: ").strip()
            if not description:
                print("Описание не может быть пустым.")
            elif add_order(queue, number, description):
                print("Заказ добавлен.")
            else:
                print("Заказ с таким номером уже в очереди.")
        elif choice == "2":
            order = serve_order(queue)
            if order is None:
                print("Очередь пуста, выдавать нечего.")
            else:
                print(f"Выдан заказ {format_order(order)}")
        elif choice == "3":
            number = read_number()
            if number is None:
                continue
            order = find_order(queue, number)
            if order is None:
                print(f"Заказ №{number} не найден.")
            else:
                print(f"Найден заказ {format_order(order)}")
        elif choice == "4":
            show_report(queue)
        elif choice == "0":
            print("Работа завершена.")
            break
        else:
            print("Неизвестная команда.")
 
 
if __name__ == "__main__":
    main()
 