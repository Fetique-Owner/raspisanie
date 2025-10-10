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

function openChessMenu() {
    showScreen('chessMenu');
}

function backToChessMenu() {
    showScreen('chessMenu');
}

function startChessWithFriend() {
    showScreen('chessFriendScreen');
    loadFriendsList();
}

function showChessLeaderboard() {
    alert("📊 Рейтинг шахматистов скоро будет доступен!");
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

function displayFriendsList(friends) {
    const container = document.getElementById('friendsContainer');
    container.innerHTML = '';
    
    friends.forEach(friend => {
        const friendElement = document.createElement('div');
        friendElement.className = 'friend-item';
        friendElement.onclick = () => startChessGame(friend.id, friend.name);
        
        friendElement.innerHTML = `
            <div class="friend-avatar">${friend.name[0]}</div>
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-status ${friend.status}">
                    ${friend.status === 'online' ? '🟢 В сети' : '🔴 Не в сети'}
                </div>
            </div>
        `;
        
        container.appendChild(friendElement);
    });
}

function startChessGame(friendId, friendName) {
    alert(`♟️ Начинаем шахматную партию с ${friendName}!`);
    // Здесь будет логика начала шахматной игры
}

// Поиск друзей
document.getElementById('friendSearch')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
});

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

function showLeaderboard() {
    showScreen('leaderboardScreen');
    if (typeof loadLeaderboard === 'function') {
        loadLeaderboard();
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

// Добавьте эти функции в main.js

let chessGameState = {
    gameId: null,
    opponent: null,
    playerColor: 'white',
    currentTurn: 'white',
    board: null,
    gameActive: false
};

function startChessGame(friendId, friendName) {
    // Создаем игру и приглашаем друга
    chessGameState = {
        gameId: 'chess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        opponent: { id: friendId, name: friendName },
        playerColor: 'white',
        currentTurn: 'white',
        board: initializeChessBoard(),
        gameActive: true
    };
    
    showScreen('chessGameScreen');
    initChessGame();
    
    // В реальном приложении здесь будет отправка приглашения
    alert(`♟️ Приглашение отправлено ${friendName}! Ожидаем подключения...`);
}

function initChessGame() {
    const canvas = document.getElementById('chessCanvas');
    if (!canvas) return;
    
    canvas.width = 400;
    canvas.height = 400;
    
    drawChessBoard();
    setupChessPieces();
}

function initializeChessBoard() {
    // Стандартная начальная позиция шахмат
    return [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'], // черные
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // черные пешки
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // белые пешки
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']  // белые
    ];
}

function drawChessBoard() {
    const canvas = document.getElementById('chessCanvas');
    const ctx = canvas.getContext('2d');
    const squareSize = canvas.width / 8;
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем доску
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const isLight = (row + col) % 2 === 0;
            ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
    }
}

function setupChessPieces() {
    const canvas = document.getElementById('chessCanvas');
    const ctx = canvas.getContext('2d');
    const squareSize = canvas.width / 8;
    
    const pieceSymbols = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chessGameState.board[row][col];
            if (piece) {
                ctx.font = `${squareSize * 0.7}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = piece === piece.toUpperCase() ? 'white' : 'black';
                
                const x = col * squareSize + squareSize / 2;
                const y = row * squareSize + squareSize / 2;
                
                ctx.fillText(pieceSymbols[piece], x, y);
            }
        }
    }
}

function handleChessMove(fromRow, fromCol, toRow, toCol) {
    if (!chessGameState.gameActive) return;
    if (chessGameState.currentTurn !== chessGameState.playerColor) {
        alert('Сейчас ход соперника!');
        return;
    }
    
    const piece = chessGameState.board[fromRow][fromCol];
    chessGameState.board[toRow][toCol] = piece;
    chessGameState.board[fromRow][fromCol] = '';
    
    chessGameState.currentTurn = chessGameState.playerColor === 'white' ? 'black' : 'white';
    
    drawChessBoard();
    setupChessPieces();
    
    updateChessGameStatus();
}

function updateChessGameStatus() {
    const statusElement = document.getElementById('chessGameStatus');
    if (statusElement) {
        if (chessGameState.currentTurn === chessGameState.playerColor) {
            statusElement.textContent = 'Ваш ход';
        } else {
            statusElement.textContent = `Ход ${chessGameState.opponent.name}`;
        }
    }
}

function surrenderChessGame() {
    if (confirm('Сдаться?')) {
        chessGameState.gameActive = false;
        alert('Вы сдались!');
        backToChessMenu();
    }
}

function offerDraw() {
    alert('Предложение ничьи отправлено сопернику');
}

function startChessGame(friendId, friendName) {
    const playerColor = Math.random() > 0.5 ? 'white' : 'black';
    
    chessGameState = {
        gameId: 'chess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        opponent: { id: friendId, name: friendName },
        playerColor: playerColor,
        currentTurn: 'white',
        gameActive: true
    };
    
    showScreen('chessGameScreen');
    initChessGame(playerColor);
    
    document.getElementById('playerColor').textContent = 
        playerColor === 'white' ? 'Белые' : 'Черные';
    updateChessGameStatus();
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.showPopup({
            title: 'Приглашение отправлено!',
            message: `Ждем подключения ${friendName}...`,
            buttons: [{ type: 'ok' }]
        });
    }
}

function initChessGame(playerColor) {
    const canvas = document.getElementById('chessCanvas');
    if (!canvas) return;
    
    const maxSize = Math.min(400, window.innerWidth - 40, window.innerHeight - 200);
    canvas.width = maxSize;
    canvas.height = maxSize;
    
    if (typeof initChessGame === 'function') {
        window.initChessGame(playerColor);
    }
}

function surrenderChessGame() {
    if (confirm('Вы уверены, что хотите сдаться?')) {
        if (currentChessGame) {
            currentChessGame.surrender();
        }
        
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Игра окончена',
                message: 'Вы сдались!',
                buttons: [{ type: 'ok' }]
            });
        }
        
        backToChessMenu();
    }
}

function offerDraw() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.showPopup({
            title: 'Предложение ничьи',
            message: 'Предложение отправлено сопернику',
            buttons: [{ type: 'ok' }]
        });
    }
}
function initChessAPI() {
    if (chessAPI.init()) {
        console.log('Chess API инициализирован');
        
        const urlParams = new URLSearchParams(window.location.search);
        const chessGameId = urlParams.get('chess');
        
        if (chessGameId) {
            autoJoinChessGame(chessGameId);
        }
    } else {
        console.log('Chess API не доступен');
    }
}

async function autoJoinChessGame(gameId) {
    showScreen('chessGameScreen');
    
    const result = await chessAPI.joinGame(gameId);
    if (result.success) {
        const playerColor = Math.random() > 0.5 ? 'white' : 'black';
        
        initChessGame(playerColor);
        startGamePolling();
        
        document.getElementById('gameId').textContent = gameId.substring(0, 8) + '...';
        document.getElementById('playerColor').textContent = 
            playerColor === 'white' ? 'Белые' : 'Черные';
    } else {
        alert('Ошибка присоединения к игре: ' + result.error);
        backToChessMenu();
    }
}

async function createNewChessGame() {
    const result = await chessAPI.createGame();
    if (result.success) {
        showScreen('chessGameScreen');
        
        initChessGame('white');
        startGamePolling();
        
        document.getElementById('gameId').textContent = result.gameId.substring(0, 8) + '...';
        document.getElementById('playerColor').textContent = 'Белые';
        
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Игра создана!',
                message: `ID игры: ${result.gameId}\nОтправьте ссылку другу: ${result.inviteLink}`,
                buttons: [{ type: 'ok' }]
            });
        }
    } else {
        alert('Ошибка создания игры: ' + result.error);
    }
}

function startGamePolling() {
    setInterval(async () => {
        const result = await chessAPI.getGameState();
        if (result.success) {
            updateGameUI(result.state);
        }
    }, 3000);
}

function updateGameUI(gameState) {
    if (!gameState) return;
    
    document.getElementById('whitePlayer').textContent = gameState.players.white.name;
    document.getElementById('blackPlayer').textContent = gameState.players.black.name;
    
    document.querySelectorAll('.player').forEach(player => {
        player.classList.remove('active');
    });
    
    if (gameState.currentTurn === 'white') {
        document.querySelector('.player.white').classList.add('active');
    } else {
        document.querySelector('.player.black').classList.add('active');
    }
    
    const statusElement = document.getElementById('chessGameStatus');
    if (gameState.yourColor === gameState.currentTurn) {
        statusElement.textContent = 'Ваш ход';
        statusElement.style.color = '#4ECDC4';
    } else {
        statusElement.textContent = 'Ход соперника';
        statusElement.style.color = '#FF6B6B';
    }
}

function copyGameLink() {
    const gameId = document.getElementById('gameId').textContent;
    const inviteLink = `https://t.me/@tes1tes1tes1bot?start=chess_${gameId}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Ссылка скопирована!',
                message: 'Отправьте другу чтобы он присоединился',
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert('Ссылка скопирована в буфер обмена!');
        }
    });
}

function startChessGame(friendId, friendName) {
    createNewChessGame();
}

document.addEventListener('DOMContentLoaded', function() {
    initChessAPI();
});
