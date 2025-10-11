const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA500'];

let gameState = {
    board: [],
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    linesCleared: 0,
    gameActive: false,
    dropTime: 0,
    dropInterval: 1000,
    blockSize: 0,
    canvas: null,
    ctx: null
};

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    gameState.canvas = canvas;
    gameState.ctx = canvas.getContext('2d');
    
    // Адаптивный размер
    const maxWidth = Math.min(300, window.innerWidth - 40);
    gameState.blockSize = Math.floor(maxWidth / BOARD_WIDTH);
    const canvasWidth = gameState.blockSize * BOARD_WIDTH;
    const canvasHeight = gameState.blockSize * BOARD_HEIGHT;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    // Инициализация игрового состояния
    resetGame();
    setupControls();
    gameLoop();
}

function resetGame() {
    // Очистка доски
    gameState.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    gameState.currentPiece = generateNewPiece();
    gameState.nextPiece = generateNewPiece();
    gameState.score = 0;
    gameState.level = 1;
    gameState.linesCleared = 0;
    gameState.gameActive = true;
    gameState.dropTime = Date.now();
    gameState.dropInterval = 1000;
    
    updateGameStats();
    drawNextPiece();
}

function generateNewPiece() {
    const shapes = [
        [[1,1,1,1]], // I
        [[1,1],[1,1]], // O
        [[0,1,0],[1,1,1]], // T
        [[1,0,0],[1,1,1]], // L
        [[0,0,1],[1,1,1]], // J
        [[0,1,1],[1,1,0]], // S
        [[1,1,0],[0,1,1]]  // Z
    ];
    
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
        shape: shape,
        color: colorIndex,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

function gameLoop() {
    if (!gameState.gameActive) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const currentTime = Date.now();
    
    // Очистка canvas
    gameState.ctx.fillStyle = '#1a1a2e';
    gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Отрисовка сетки
    gameState.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    gameState.ctx.lineWidth = 1;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            gameState.ctx.strokeRect(
                x * gameState.blockSize, 
                y * gameState.blockSize, 
                gameState.blockSize, 
                gameState.blockSize
            );
        }
    }
    
    // Отрисовка установленных блоков
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (gameState.board[y][x] !== 0) {
                drawBlock(x, y, COLORS[gameState.board[y][x] - 1], true);
            }
        }
    }
    
    // Отрисовка текущей фигуры
    if (gameState.currentPiece) {
        drawPiece(gameState.currentPiece);
        
        // Автоматическое падение
        if (currentTime - gameState.dropTime > gameState.dropInterval) {
            movePiece(0, 1);
            gameState.dropTime = currentTime;
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function drawBlock(x, y, color, isPlaced = false) {
    const ctx = gameState.ctx;
    const size = gameState.blockSize;
    
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    
    // 3D эффект
    if (!isPlaced) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * size, y * size, size, size);
    }
}

function drawPiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                drawBlock(piece.x + x, piece.y + y, COLORS[piece.color], false);
            }
        }
    }
}

function movePiece(dx, dy) {
    if (!gameState.currentPiece) return false;
    
    const newX = gameState.currentPiece.x + dx;
    const newY = gameState.currentPiece.y + dy;
    
    if (isValidMove(gameState.currentPiece.shape, newX, newY)) {
        gameState.currentPiece.x = newX;
        gameState.currentPiece.y = newY;
        return true;
    }
    
    // Если движение вниз невозможно - фиксируем фигуру
    if (dy > 0) {
        lockPiece();
        checkLines();
        spawnNewPiece();
    }
    
    return false;
}

function isValidMove(shape, x, y) {
    for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
            if (shape[py][px] !== 0) {
                const newX = x + px;
                const newY = y + py;
                
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return false;
                }
                
                if (newY >= 0 && gameState.board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function lockPiece() {
    const piece = gameState.currentPiece;
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const boardY = piece.y + y;
                const boardX = piece.x + x;
                if (boardY >= 0) {
                    gameState.board[boardY][boardX] = piece.color + 1;
                }
            }
        }
    }
}

function spawnNewPiece() {
    gameState.currentPiece = gameState.nextPiece;
    gameState.nextPiece = generateNewPiece();
    drawNextPiece();
    
    // Проверка game over
    if (!isValidMove(gameState.currentPiece.shape, gameState.currentPiece.x, gameState.currentPiece.y)) {
        gameState.gameActive = false;
        saveScore();
        setTimeout(() => {
            alert(`Игра окончена! Счет: ${gameState.score}`);
            showScreen('SextrisMenu');
        }, 100);
    }
}

function checkLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (gameState.board[y].every(cell => cell !== 0)) {
            gameState.board.splice(y, 1);
            gameState.board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Проверяем ту же позицию снова
        }
    }
    
    if (linesCleared > 0) {
        const points = [100, 300, 500, 800];
        gameState.score += points[Math.min(linesCleared - 1, 3)] * gameState.level;
        gameState.linesCleared += linesCleared;
        
        // Повышение уровня
        gameState.level = Math.floor(gameState.linesCleared / 10) + 1;
        gameState.dropInterval = Math.max(100, 1000 - (gameState.level - 1) * 50);
        
        updateGameStats();
    }
}

function rotatePiece() {
    if (!gameState.currentPiece) return;
    
    const rotated = [];
    const shape = gameState.currentPiece.shape;
    
    // Транспонирование матрицы
    for (let x = 0; x < shape[0].length; x++) {
        rotated[x] = [];
        for (let y = 0; y < shape.length; y++) {
            rotated[x][y] = shape[shape.length - 1 - y][x];
        }
    }
    
    if (isValidMove(rotated, gameState.currentPiece.x, gameState.currentPiece.y)) {
        gameState.currentPiece.shape = rotated;
    }
}

function setupControls() {
    // Клавиатура
    document.addEventListener('keydown', (e) => {
        if (!gameState.gameActive) return;
        
        switch(e.code) {
            case 'ArrowLeft': movePiece(-1, 0); break;
            case 'ArrowRight': movePiece(1, 0); break;
            case 'ArrowDown': movePiece(0, 1); break;
            case 'ArrowUp': rotatePiece(); break;
            case 'Space': 
                while(movePiece(0, 1)) {} // Hard drop
                break;
        }
    });
    
    // Мобильное управление
    setupMobileControls();
}

function setupMobileControls() {
    const controls = document.getElementById('mobileControls');
    if (!controls) return;
    
    controls.innerHTML = `
        <div class="control-row">
            <button onclick="rotatePiece()" class="control-btn">↻</button>
        </div>
        <div class="control-row">
            <button onclick="movePiece(-1, 0)" class="control-btn">←</button>
            <button onclick="movePiece(0, 1)" class="control-btn">↓</button>
            <button onclick="movePiece(1, 0)" class="control-btn">→</button>
        </div>
    `;
}

function updateGameStats() {
    const scoreElem = document.getElementById('score');
    const levelElem = document.getElementById('level');
    const linesElem = document.getElementById('lines');
    
    if (scoreElem) scoreElem.textContent = gameState.score;
    if (levelElem) levelElem.textContent = gameState.level;
    if (linesElem) linesElem.textContent = gameState.linesCleared;
}

function drawNextPiece() {
    const canvas = document.getElementById('nextPieceCanvas');
    if (!canvas || !gameState.nextPiece) return;
    
    const ctx = canvas.getContext('2d');
    const piece = gameState.nextPiece;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const blockSize = 15;
    const offsetX = (canvas.width - piece.shape[0].length * blockSize) / 2;
    const offsetY = (canvas.height - piece.shape.length * blockSize) / 2;
    
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                ctx.fillStyle = COLORS[piece.color];
                ctx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
            }
        }
    }
}

function saveScore() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
            command: 'tetris_score',
            score: gameState.score,
            lines: gameState.linesCleared
        }));
    }
}
