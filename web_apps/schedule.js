const scheduleData = {
    "понедельник": [
        { time: "8:00-8:30", name: "Разговор о важном", room: "13" },
        { time: "8:45-9:25", name: "Математика Б/П", room: "36/11" },
        { time: "9:40-10:20", name: "Математика Б/П", room: "36/11" },
        { time: "10:30-11:10", name: "Физра", room: "" },
        { time: "11:25-12:05", name: "Физра", room: "" },
        { time: "12:20-13:00", name: "Английский", room: "22" },
        { time: "13:10-13:50", name: "История Б/П", room: "37/32" },
        { time: "14:00-14:40", name: "История П", room: "32" }
    ],
    "вторник": [
        { time: "8:00-8:40", name: "Матем П/Хим П", room: "12/44" },
        { time: "8:55-9:35", name: "Хим Б/Био П", room: "44/35" },
        { time: "9:50-10:30", name: "География", room: "42" },
        { time: "10:40-11:20", name: "Био П/Матем П", room: "41/12" },
        { time: "11:35-12:15", name: "Инфа Б/П", room: "109/36" },
        { time: "12:30-13:10", name: "Инфа П/Физ П", room: "109/38" },
        { time: "13:20-14:00", name: "Физика П", room: "38" }
    ],
    "среда": [
        { time: "8:00-8:40", name: "Математика П/Б", room: "12/31" },
        { time: "8:55-9:35", name: "Русский", room: "13" },
        { time: "9:50-10:30", name: "Литература", room: "13" },
        { time: "10:40-11:20", name: "Английский", room: "22" },
        { time: "11:35-12:15", name: "История Б/П", room: "35/32" },
        { time: "12:30-13:10", name: "ОБЗР", room: "42" },
        { time: "13:20-14:00", name: "Биология П", room: "44" },
        { time: "14:10-14:50", name: "Физ Б/Мат П", room: "38/12" }
    ],
    "четверг": [
        { time: "8:00-8:30", name: "Россия-горизонты", room: "13" },
        { time: "8:45-9:25", name: "Общество Б/П", room: "37/32" },
        { time: "9:40-10:20", name: "Русский", room: "13" },
        { time: "10:30-11:10", name: "Литература", room: "13" },
        { time: "11:25-12:05", name: "Математика Б/П", room: "36/12" },
        { time: "12:20-13:00", name: "Физ П/Инф П", room: "38/109" },
        { time: "13:10-13:50", name: "Физ П/Инф П", room: "38/109" }
    ],
    "пятница": [
        { time: "8:00-8:40", name: "Хим П/Мат П/Ист П", room: "44/12/32" },
        { time: "8:55-9:35", name: "Математика Б/П", room: "36/11" },
        { time: "9:50-10:30", name: "Физика Б", room: "" },
        { time: "10:40-11:20", name: "Биология Б", room: "" },
        { time: "11:35-12:15", name: "Литература", room: "13" },
        { time: "12:30-13:10", name: "Английский", room: "22" },
        { time: "13:20-14:00", name: "Литература", room: "" },
        { time: "14:10-14:50", name: "Физ П/Общ П/Хим П", room: "38/32/44" }
    ],
    "суббота": [
        { time: "Выходной", name: "Отдых! 🎉", room: "" }
    ],
    "воскресенье": [
        { time: "Выходной", name: "Отдых! 🎉", room: "" }
    ]
};

function loadSchedule() {
    showDay('понедельник');
}

function showDay(dayName) {
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('scheduleContent');
    const lessons = scheduleData[dayName] || [];
    
    if (lessons.length === 0) {
        content.innerHTML = '<div class="lesson-item">Выходной! 🎉</div>';
        return;
    }
    
    content.innerHTML = lessons.map((lesson, index) => `
        <div class="lesson-item">
            <div class="lesson-time">${index + 1}. ${lesson.time}</div>
            <div class="lesson-name">${lesson.name}</div>
            <div class="lesson-room">${lesson.room ? `Каб: ${lesson.room}` : ''}</div>
        </div>
    `).join('');
}