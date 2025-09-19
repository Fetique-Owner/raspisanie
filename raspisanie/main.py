from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.enums import ParseMode
import asyncio
import logging
import re
from datetime import datetime
import aiohttp
import json
import sys
import os
from aiogram.client.default import DefaultBotProperties

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

bot = Bot(
    token="8398756811:AAHCqsiw1lNJjAf6DWNjweQUwd9yXO6DHMA",
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()

# Установка меню команд
async def set_commands():
    await bot.set_my_commands([
        types.BotCommand(command="start", description="Запустить бота"),
        types.BotCommand(command="help", description="Помощь"),
        types.BotCommand(command="today", description="Расписание на сегодня"),
        types.BotCommand(command="tomorrow", description="Расписание на завтра"),
        types.BotCommand(command="week", description="Расписание на неделю"),
        types.BotCommand(command="bells", description="Расписание звонков"),
        types.BotCommand(command="day", description="Расписание на конкретный день"),
        types.BotCommand(command="admin", description="Команды для админов")
    ])

ADMIN_USER_IDS = [1390197754, 1320788717, 1138387660]

BELL_SCHEDULE = [
    "1️⃣ 8:00 - 8:30",
    "2️⃣ 8:45 - 9:25",
    "завтрак",
    "3️⃣ 9:40 - 10:20",
    "4️⃣ 10:30 - 11:10",
    "5️⃣ 11:25 - 12:05",
    "обед",
    "6️⃣ 12:20 - 13:00",
    "7️⃣ 13:10 - 13:50",
    "8️⃣ 14:00 - 14:40",
    "9️⃣ 14:50 - 15:30",
]

BELL_SCHEDULE1 = [
    "1️⃣ 8:00 - 8:40",
    "2️⃣ 8:55 - 9:35",
    "завтрак", 
    "3️⃣ 9:50 - 10:30",
    "4️⃣ 10:40 - 11:20",
    "5️⃣ 11:35 - 12:15",
    "обед",
    "6️⃣ 12:30 - 13:10",
    "7️⃣ 13:20 - 14:00",
    "8️⃣ 14:10 - 14:50",
    "9️⃣ 15:00 - 15:40"
]



# Файл для хранения расписания
SCHEDULE_FILE = os.path.join(os.path.dirname(__file__), "schedule.json")

# Загрузка расписания из файла или использование стандартного
def load_schedule():
    try:
        if os.path.exists(SCHEDULE_FILE):
            with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Ошибка загрузки расписания: {e}")
    return {
    "понедельник": ["1.📚 Разговор о важном 13 - 8:00 - 8:30", "2.📚 Математика (Б) 36 / Математика (ПР) 11 - 8:45 - 9:25", "3.📚 Математика(Б) 36 / Математика(ПR) 11 - 9:40 - 10:20", "4.🏃 Физическая культура - 10:30 - 11:10", "5.🏃 Физическая культура - 11:25- 12:05", "6.🌍 Иностранный язык 22 - 12:20 - 13:00", "7.📚 История (Б) 37 / История (ПР) 32 11 - 13:10 - 13:50", "8.📚 История (ПР) 32 - 14:00 - 14:40"],
    "вторник": ["1.📚 Математика (ПР) 12 / Химия (ПР) 44 - 8:00 - 8:40", "2.🧪 Химия (Б) 44 / Биология (ПР) 35 - 8:55 - 9:35", "3.🌍 География 42 - 9:50 - 10:30", "4.🔭 Биология (ПР) 41 / Математика (ПР) 12 - 10:40 - 11:20", "5.💻 Информатика (109) / Информатика (Б) 36 - 11:35 - 12:15", "6.💻 Информатика (109) / Физика (ПР) 38 / Обществознание (ПР) 32 - 12:30 - 13:10", "7.🔭 Физика (ПР) 38 / эл.курс по математике 11/1 - 13:20 - 14:00"],
    "среда": ["1.📚 Математика (ПР) 12 / Математика (Б) 31 - 8:00 - 8:40", "2.📚 Русский язык 13 - 8:55 - 9:35", "3.📚 Литература 13 - 9:50 - 10:30", "4.🌍 Иностранный язык 22 - 10:40 - 11:20", "5.📚 История (Б) 35 / История (ПР) 32 - 11:35 - 12:15", "6.📚 ОБЗР 42 - 13:30 - 13:10", "7.🔭 Биология (ПР) 44 - 13:20 - 14:00", "8.🔭 Физика (Б) 38 / Эл.курс по математике (ПР) 12 - 14:10 - 14:50"],
    "четверг": ["1.📚 Россия - мои горизонты 13 - 8:00 - 8:30", "2.📚 Обществознание (Б) 37 / Обществознание (ПР) 32 - 8:45 - 9:25", "3.📚 Русский язык 13 - 9:40 - 10:20", "4.📚 Литература 13 - 10:30 - 11:10", "5.📚 Математика (Б) 36 / Математика (ПР) 12 - 11:25 - 12:05", "6.🔭 Физика (ПР) 38 / Информатика (109) - 12:20 - 13:00", "7.🔭 Физика (ПР) 38 / Информатика (109) - 13:10 - 13:50", "8.📚 Эл.курс по математике (Б) - 14:00 - 14:40"],
    "пятница": ["1.📚 Химия (ПР) 44 / Математика (ПР) 12 / История (ПР) 32 - 8:00 - 8:40", "2.📚 Математика (Б) 36 / Математика (ПР) 11 - 8:55 - 9:35", "3.🔭 Физика (Б) - 9:50 - 10:30", "4.🔭 Биология (Б) - 10:40 - 11:20", "5.📚 Литература 13 - 11:35 - 12:15", "6.🌍 Иностранный язык 22 - 12:30 - 13:10", "7.📚 Эл. курс по литературе - 13:20 - 14:40", "8.🔭 Физика (ПР) 38 / Обществознание (ПР) 32 / Химия (ПР) 44 - 14:10 - 14:50"],
    "суббота": ["Выходной! Бухаем! 🎉"],
    "воскресенье": ["Повторяем субботу! 🎉"]
}

# Сохранение расписания в файл
def save_schedule():
    try:
        with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
            json.dump(schedule, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Ошибка сохранения расписания: {e}")

# Загружаем расписание при старте
schedule = load_schedule()

def get_current_day():
    """Получить текущий день недели на русском"""
    try:
        days = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
        return days[datetime.now().weekday()]
    except Exception as e:
        logger.error(f"Ошибка в get_current_day: {e}")
        return "понедельник"

def get_tomorrow_day():
    """Получить завтрашний день недели на русском"""
    try:
        days = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
        tomorrow_index = (datetime.now().weekday() + 1) % 7
        return days[tomorrow_index]
    except Exception as e:
        logger.error(f"Ошибка в get_tomorrow_day: {e}")
        return "вторник"

def extract_day_from_text(text):
    """Извлечь конкретный день из текста"""
    days_pattern = r'\b(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)\b'
    match = re.search(days_pattern, text)
    return match.group(0) if match else None

@dp.message(Command("start", "help"))
async def send_welcome(message: types.Message):
    """Обработчик команд /start и /help"""
    try:
        welcome_text = """
👋 Привет! Я бот с расписанием занятий.

📋 Доступные команды:
/start, /help - показать это сообщение
/today - расписание на сегодня
/tomorrow - расписание на завтра  
/week - расписание на всю неделю
/day [день] - расписание на конкретный день
/bells - расписание звонков

📋 Или напиши мне:
• "расписание на завтра"
• "расписание на сегодня"
• "расписание на понедельник" (или другой день)
• "расписание на неделю"
• "расписание звонков"

"""
        await message.reply(welcome_text)
        logger.info(f"Отправлено приветствие пользователю {message.from_user.id}")
    except aiohttp.ClientConnectorError:
        logger.warning("Ошибка подключения к Telegram API")
    except Exception as e:
        logger.error(f"Ошибка в send_welcome: {e}")

@dp.message(Command("bells"))
async def schedule_bells(message: types.Message):
    """Обработчик команды /bells"""
    try:
        response = "🔔 Расписание звонков на понедельник, четверг:\n\n" + "\n".join(BELL_SCHEDULE)
        response += "\n\n🔔 Расписание звонков на вторник, среду, пятницу:\n\n" + "\n".join(BELL_SCHEDULE1)
        await message.reply(response)
        logger.info(f"Отправлено расписание звонков пользователю {message.from_user.id}")
    except Exception as e:
        logger.error(f"Ошибка в schedule_bells: {e}")
        await message.reply("❌ Произошла ошибка при получении расписания звонков")

@dp.message(Command("today"))
async def schedule_today(message: types.Message):
    """Обработчик команды /today"""
    try:
        day = get_current_day()
        lessons = schedule.get(day, ["Расписание не найдено"])
        response = f"📅 Расписание на сегодня ({day.capitalize()}):\n\n" + "\n".join(lessons)
        await message.reply(response)
        logger.info(f"Отправлено расписание на сегодня пользователю {message.from_user.id}")
    except Exception as e:
        logger.error(f"Ошибка в schedule_today: {e}")
        await message.reply("❌ Произошла ошибка при получении расписания")

@dp.message(Command("tomorrow"))
async def schedule_tomorrow(message: types.Message):
    """Обработчик команды /tomorrow"""
    try:
        day = get_tomorrow_day()
        lessons = schedule.get(day, ["Расписание не найдено"])
        response = f"📅 Расписание на завтра ({day.capitalize()}):\n\n" + "\n".join(lessons)
        await message.reply(response)
        logger.info(f"Отправлено расписание на завтра пользователю {message.from_user.id}")
    except Exception as e:
        logger.error(f"Ошибка в schedule_tomorrow: {e}")
        await message.reply("❌ Произошла ошибка при получении расписания")

@dp.message(Command("week"))
async def schedule_week(message: types.Message):
    """Обработчик команды /week"""
    try:
        response = "📅 Расписание на неделю:\n\n"
        for day, lessons in schedule.items():
            response += f"📌 {day.capitalize()}:\n"
            response += "\n".join(lessons) + "\n\n"
        await message.reply(response)
        logger.info(f"Отправлено расписание на неделю пользователю {message.from_user.id}")
    except Exception as e:
        logger.error(f"Ошибка в schedule_week: {e}")
        await message.reply("❌ Произошла ошибка при получении расписания")

@dp.message(Command("day"))
async def schedule_day(message: types.Message):
    """Обработчик команды /day"""
    try:
        args = message.text.split()
        if len(args) < 2:
            await message.reply("❌ Укажите день недели после команды /day\nНапример: /day понедельник")
            return
        
        day_name = args[1].lower()
        if day_name not in schedule:
            await message.reply("❌ День недели не найден. Используйте: понедельник, вторник, среда, четверг, пятница, суббота, воскресенье")
            return
        
        lessons = schedule.get(day_name, ["Расписание не найдено"])
        response = f"📅 Расписание на {day_name.capitalize()}:\n\n" + "\n".join(lessons)
        await message.reply(response)
        logger.info(f"Отправлено расписание на {day_name} пользователю {message.from_user.id}")
    except Exception as e:
        logger.error(f"Ошибка в schedule_day: {e}")
        await message.reply("❌ Произошла ошибка при получении расписания")

@dp.message(Command("edit_schedule"))
async def edit_schedule_command(message: types.Message):
    """Команда для редактирования расписания"""
    try:
        if message.from_user.id not in ADMIN_USER_IDS:
            await message.reply("❌ У вас нет прав для редактирования расписания")
            return
        
        help_text = """
📝 Редактирование расписания:

Используйте формат:
/edit день номер_урока новый_урок

Пример:
/edit понедельник 3 📚 Математика отменена
/edit вторник 5 💻 Информатика перенесена на 12:30

❗ Урок автоматически получит номер, не пишите номер в начале!
        """
        await message.reply(help_text)
        
    except Exception as e:
        logger.error(f"Ошибка в edit_schedule_command: {e}")
        await message.reply("❌ Произошла ошибка")

@dp.message(Command("edit"))
async def edit_schedule(message: types.Message):
    """Обработчик редактирования расписания"""
    try:
        if message.from_user.id not in ADMIN_USER_IDS:
            await message.reply("❌ У вас нет прав для редактирования расписания")
            return
        
        args = message.text.split(maxsplit=3)
        if len(args) < 4:
            await message.reply("❌ Неправильный формат. Используйте: /edit день номер новый_урок")
            return
        
        day_name = args[1].lower()
        lesson_num = args[2]
        new_lesson = args[3]
        
        if day_name not in schedule:
            await message.reply("❌ День недели не найден")
            return
        
        try:
            lesson_index = int(lesson_num) - 1
            if 0 <= lesson_index < len(schedule[day_name]):
                # Автоматически добавляем номер к уроку
                numbered_lesson = f"{lesson_num}.{new_lesson}"
                schedule[day_name][lesson_index] = numbered_lesson
                save_schedule()
                await message.reply(f"✅ Расписание на {day_name} обновлено!\nУрок {lesson_num}: {new_lesson}")
                logger.info(f"Пользователь {message.from_user.id} обновил расписание: {day_name} урок {lesson_num}")
            else:
                await message.reply("❌ Неверный номер урока")
        except ValueError:
            await message.reply("❌ Номер урока должен быть числом")
            
    except Exception as e:
        logger.error(f"Ошибка в edit_schedule: {e}")
        await message.reply("❌ Произошла ошибка при редактировании расписания")

@dp.message(Command("reset_schedule"))
async def reset_schedule(message: types.Message):
    """Сброс расписания к стандартному"""
    try:
        if message.from_user.id not in ADMIN_USER_IDS:
            await message.reply("❌ У вас нет прав для сброса расписания")
            return
        
        global schedule
        schedule = {
            "понедельник": ["1.📚 Разговор о важном 13 - 8:00 - 8:30", "2.📚 Математика (Б) 36 / Математика (ПР) 11 - 8:45 - 9:25", "3.📚 Математика(Б) 36 / Математика(ПR) 11 - 9:40 - 10:20", "4.🏃 Физическая культура - 10:30 - 11:10", "5.🏃 Физическая культура - 11:25- 12:05", "6.🌍 Иностранный язык 22 - 12:20 - 13:00", "7.📚 История (Б) 37 / История (ПР) 32 11 - 13:10 - 13:50", "8.📚 История (ПР) 32 - 14:00 - 14:40"],
            "вторник": ["1.📚 Математика (ПР) 12 / Химия (ПР) 44 - 8:00 - 8:40", "2.🧪 Химия (Б) 44 / Биология (ПР) 35 - 8:55 - 9:35", "3.🌍 География 42 - 9:50 - 10:30", "4.🔭 Биология (ПР) 41 / Математика (ПР) 12 - 10:40 - 11:20", "5.💻 Информатика (109) / Информатика (Б) 36 - 11:35 - 12:15", "6.💻 Информатика (109) / Физика (ПР) 38 / Обществознание (ПР) 32 - 12:30 - 13:10", "7.🔭 Физика (ПР) 38 / эл.курс по математике 11/1 - 13:20 - 14:00"],
            "среда": ["1.📚 Математика (ПР) 12 / Математика (Б) 31 - 8:00 - 8:40", "2.📚 Русский язык 13 - 8:55 - 9:35", "3.📚 Литература 13 - 9:50 - 10:30", "4.🌍 Иностранный язык 22 - 10:40 - 11:20", "5.📚 История (Б) 35 / История (ПР) 32 - 11:35 - 12:15", "6.📚 ОБЗР 42 - 13:30 - 13:10", "7.🔭 Биология (ПР) 44 - 13:20 - 14:00", "8.🔭 Физика (Б) 38 / Эл.курс по математике (ПР) 12 - 14:10 - 14:50"],
            "четверг": ["1.📚 Россия - мои горизонты 13 - 8:00 - 8:30", "2.📚 Обществознание (Б) 37 / Обществознание (ПР) 32 - 8:45 - 9:25", "3.📚 Русский язык 13 - 9:40 - 10:20", "4.📚 Литература 13 - 10:30 - 11:10", "5.📚 Математика (Б) 36 / Математика (ПР) 12 - 11:25 - 12:05", "6.🔭 Физика (ПР) 38 / Информатика (109) - 12:20 - 13:00", "7.🔭 Физика (ПР) 38 / Информатика (109) - 13:10 - 13:50", "8.📚 Эл.курс по математике (Б) - 14:00 - 14:40"],
            "пятница": ["1.📚 Химия (ПР) 44 / Математика (ПР) 12 / История (ПР) 32 - 8:00 - 8:40", "2.📚 Математика (Б) 36 / Математика (ПР) 11 - 8:55 - 9:35", "3.🔭 Физика (Б) - 9:50 - 10:30", "4.🔭 Биология (Б) - 10:40 - 11:20", "5.📚 Литература 13 - 11:35 - 12:15", "6.🌍 Иностранный язык 22 - 12:30 - 13:10", "7.📚 Эл. курс по литературе - 13:20 - 14:40", "8.🔭 Физика (ПР) 38 / Обществознание (ПР) 32 / Химия (ПР) 44 - 14:10 - 14:50"],
            "суббота": ["Выходной! Бухаем! 🎉"],
            "воскресенье": ["Повторяем субботу! 🎉"]
        }
        save_schedule()
        await message.reply("✅ Расписание сброшено к стандартному!")
        logger.info(f"Пользователь {message.from_user.id} сбросил расписание")
        
    except Exception as e:
        logger.error(f"Ошибка в reset_schedule: {e}")
        await message.reply("❌ Произошла ошибка при сбросе расписания")

@dp.message(Command("admin"))
async def admin_commands(message: types.Message):
    """Показать команды для админов"""
    try:
        if message.from_user.id not in ADMIN_USER_IDS:
            await message.reply("❌ У вас нет прав администратора")
            return
        
        admin_text = """
👨‍💼 Команды для админов:

/edit_schedule - инструкция по редактированию
/edit > день > номер > новый_урок - изменить урок
/reset_schedule - сбросить к стандартному расписанию

Примеры:
/edit понедельник 3 📚 Математика отменена
/edit вторник 5 💻 Информатика перенесена
        """
        await message.reply(admin_text)
        logger.info(f"Отправлены команды админа пользователю {message.from_user.id}")
        
    except Exception as e:
        logger.error(f"Ошибка в admin_commands: {e}")
        await message.reply("❌ Произошла ошибка")

@dp.message()
async def handle_text_messages(message: types.Message):
    """Обработчик всех текстовых сообщений"""
    try:
        text = message.text.lower().strip()
        logger.info(f"Получено сообщение от {message.from_user.id}: {text}")
        
        response = None
        
        if re.match(r'^(какое расписание на завтра|завтрашнее расписание)$', text):
            day = get_tomorrow_day()
            lessons = schedule.get(day, ["Расписание не найдено"])
            response = f"📅 Расписание на завтра ({day.capitalize()}):\n\n" + "\n".join(lessons)
            
        elif re.match(r'^(какое расписание на сегодня|сегодняшнее расписание)$', text):
            day = get_current_day()
            lessons = schedule.get(day, ["Расписание не найдено"])
            response = f"📅 Расписание на сегодня ({day.capitalize()}):\n\n" + "\n".join(lessons)
            
        elif re.match(r'^(какое расписание на неделю|полное расписание)$', text):
            response = "📅 Расписание на неделю:\n\n"
            for day, lessons in schedule.items():
                response += f"📌 {day.capitalize()}:\n"
                response += "\n".join(lessons) + "\n\n"
        
        elif re.match(r'^какое расписание на (понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)$', text):
            specific_day = extract_day_from_text(text)
            if specific_day:
                 lessons = schedule.get(specific_day, ["Расписание не найдено"])
                 response = f"📅 Расписание на {specific_day.capitalize()}:\n\n" + "\n".join(lessons)
        
        elif re.match(r'^(расписание звонков|какое расписание звонков|звонки)$', text):
            response = "🔔 Расписание звонков на понедельник, четверг:\n\n" + "\n".join(BELL_SCHEDULE)
            response += "\n\n🔔 Расписание звонков на другие дни:\n\n" + "\n".join(BELL_SCHEDULE1)
        
        if response:
            await message.reply(response)
            logger.info(f"Отправлен ответ пользователю {message.from_user.id}")
        else:
            logger.info(f"Сообщение не содержит точного запроса расписания: {text}")
        
    except aiohttp.ClientConnectorError:
        logger.warning("Ошибка подключения при отправке сообщения")
    except Exception as e:
        logger.error(f"Ошибка в handle_text_messages: {e}")

async def main():
    """Основная функция запуска бота"""
    await set_commands()
    
    for admin_id in ADMIN_USER_IDS:
        try:
            await bot.send_message(admin_id, "🤖 Бот запущен на Heroku!")
        except:
            pass
    
    while True:
        try:
            logger.info("Запуск бота...")
            await dp.start_polling(bot, skip_updates=True)
        except Exception as e:
            logger.error(f"Ошибка: {e}")
            await asyncio.sleep(10)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот полностью остановлен")