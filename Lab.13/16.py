from collections import deque
 
 
def add_task(urgent, normal, title, is_urgent):
    """Ставит задачу в конец нужной очереди. Пустое название не принимается."""
    if not title:
        return False
    if is_urgent:
        urgent.append(title)
    else:
        normal.append(title)
    return True
 
 
def serve_task(urgent, normal):
    """Берёт первую срочную задачу, а если срочных нет, то первую обычную.
 
    Возвращает None, если обе очереди пусты.
    """
    if urgent:
        return urgent.popleft()
    if normal:
        return normal.popleft()
    return None
 
 
def show_queue(name, queue):
    print(f"{name} ({len(queue)}):")
    if not queue:
        print("  пусто")
    for position, title in enumerate(queue, start=1):
        print(f"  {position}. {title}")
 
 
def main():
    urgent = deque()
    normal = deque()
    while True:
        print("\n1 - обычная задача, 2 - срочная задача, "
              "3 - выполнить следующую, 4 - показать, 0 - выход")
        choice = input("Выберите действие: ").strip()
 
        if choice in ("1", "2"):
            title = input("Название задачи: ").strip()
            if add_task(urgent, normal, title, is_urgent=choice == "2"):
                print("Задача добавлена.")
            else:
                print("Название не может быть пустым.")
        elif choice == "3":
            title = serve_task(urgent, normal)
            if title is None:
                print("Задач нет.")
            else:
                print(f"Выполняется: {title}")
        elif choice == "4":
            show_queue("Срочные", urgent)
            show_queue("Обычные", normal)
        elif choice == "0":
            print("Работа завершена.")
            break
        else:
            print("Неизвестная команда.")
 
 
if __name__ == "__main__":
    main()
 