window.showScreen = function(screenId) {
    console.log('Showing screen:', screenId);
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function backToMainMenu() {
    showScreen('mainMenu');
}

function openSchedule() {
    showScreen('scheduleScreen');
    loadSchedule();
}

function openGames() {
    showScreen('gamesScreen');
}

function backToGamesMenu() {
    showScreen('gamesScreen');
}

async function loadFriendsList() {
    const container = document.getElementById('friendsContainer');
    container.innerHTML = '<div class="friend-item">Загрузка друзей...</div>';
    
    try {
        const friends = [
            { id: 1, name: "Алексей", status: "online" },
            { id: 2, name: "Мария", status: "online" },
            { id: 3, name: "Дмитрий", status: "offline" },
            { id: 4, name: "Екатерина", status: "online" }
        ];
        
        displayFriendsList(friends);
    } catch (error) {
        container.innerHTML = '<div class="friend-item">Ошибка загрузки</div>';
    }
}

function openGame(gameName) {
    if (gameName === 'Sextris') {
        showScreen('SextrisMenu');
    }
}

function backToGameMenu() {
    showScreen('gamesScreen');
}

// Инициализация Telegram Web App
document.addEventListener('DOMContentLoaded', function() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Получаем данные пользователя
        const user = Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            console.log('Пользователь:', user.first_name, user.last_name);
        }
    }
});

function startGame() {
    showScreen('gameScreen');
    if (typeof initGame === 'function') {
        initGame();
    }
}

function restartGame() {
    if (typeof gameState !== 'undefined') {
        gameState.gameActive = false;
        setTimeout(() => {
            if (typeof initGame === 'function') {
                initGame();
            }
        }, 100);
    }
}

function startDanceGame() {
    showScreen('gameScreen');
    if (typeof initDanceGame === 'function') {
        initDanceGame();
    } else {
        console.error('Функция initDanceGame не найдена');
        loadScript('dance-game.js');
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function updateGameStats(score, level, lines) {
    const scoreElem = document.getElementById('score');
    const levelElem = document.getElementById('level');
    const linesElem = document.getElementById('lines');
    
    if (scoreElem) scoreElem.textContent = score || 0;
    if (levelElem) levelElem.textContent = level || 1;
    if (linesElem) linesElem.textContent = lines || 0;
}
