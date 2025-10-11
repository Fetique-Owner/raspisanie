const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA500'];

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function getCanvasSize() {
    const maxWidth = Math.min(300, window.innerWidth - 40);
    return Math.floor(maxWidth / 10) * 10;
}

const SHAPES = [
    { shape: [[1,1,1,1]], color: 0, name: 'I' },
    { shape: [[1,1],[1,1]], color: 1, name: 'O' },
    { shape: [[0,1,0],[1,1,1]], color: 2, name: 'T' },
    { shape: [[1,0,0],[1,1,1]], color: 3, name: 'L' },
    { shape: [[0,0,1],[1,1,1]], color: 4, name: 'J' },
    { shape: [[0,1,1],[1,1,0]], color: 5, name: 'S' },
    { shape: [[1,1,0],[0,1,1]], color: 6, name: 'Z' }
];

let gameState = {
    board: [],
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    linesCleared: 0,
    gameActive: false,
    dropTime: 0,
    dropInterval: 800,
    lastMoveTime: 0,
    moveDelay: 100,
    renderX: 0,
    renderY: 0
};

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    // Адаптивный размер с учетом плотности пикселей
    const pixelRatio = window.devicePixelRatio || 1;
    const maxWidth = Math.min(320, window.innerWidth - 40);
    const blockSize = Math.floor(maxWidth / 10);
    const canvasWidth = blockSize * 10;
    const canvasHeight = blockSize * 20;
    
    // Устанавливаем размеры с учетом pixel ratio
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);
    
    const board = Array(20).fill().map(() => Array(10).fill(0));
    
    gameState = {
        board: board,
        currentPiece: generateNewPiece(),
        nextPiece: generateNewPiece(),
        score: 0,
        level: 1,
        linesCleared: 0,
        gameActive: true,
        dropTime: Date.now(),
        dropInterval: 800,
        blockSize: blockSize,
        lastMoveTime: 0,
        moveDelay: 100,
        renderX: 0,
        renderY: 0,
        pixelRatio: pixelRatio
    };
    
    updateGameStats();
    drawNextPiece();
    setupMobileControls();
    setupTouchControls();
    
    gameLoop(ctx);
}

function setupTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let lastSwipeTime = 0;
    const SWIPE_DELAY = 200;
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        const currentTime = Date.now();
        if (currentTime - lastSwipeTime < SWIPE_DELAY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        const minSwipeDistance = 30;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    movePiece(1, 0);
                } else {
                    movePiece(-1, 0);
                }
                lastSwipeTime = currentTime;
            }
        } else {
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    movePiece(0, 1);
                } else {
                    rotatePiece();
                }
                lastSwipeTime = currentTime;
            }
        }
    }, { passive: false });
    
    let lastTap = 0;
    canvas.addEventListener('touchstart', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            gameState.gameActive = !gameState.gameActive;
            if (gameState.gameActive) {
                gameState.dropTime = Date.now();
            }
        }
        lastTap = currentTime;
    }, { passive: false });
}

function generateNewPiece() {
    const pieceData = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
        shape: pieceData.shape,
        color: pieceData.color,
        name: pieceData.name,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceData.shape[0].length / 2),
        y: 0
    };
}

function drawBoard(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            ctx.strokeRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (gameState.board[i][j] !== 0) {
                drawBlock(ctx, j, i, COLORS[gameState.board[i][j] - 1], true);
            }
        }
    }
    
    if (gameState.currentPiece) {
        drawPiece(ctx, gameState.currentPiece);
        
        drawShadow(ctx, gameState.currentPiece);
    }
}

function drawBlock(ctx, x, y, color, isPlaced = false) {
    const size = gameState.blockSize;
    
    // Основной блок
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    
    // Градиент для 3D эффекта
    const gradient = ctx.createLinearGradient(
        x * size, y * size,
        x * size + size, y * size + size
    );
    
    if (!isPlaced) {
        // Падающие блоки - яркие
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, shadeColor(color, -30));
        ctx.fillStyle = gradient;
        ctx.fillRect(x * size, y * size, size, size);
        
        // Контур
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * size, y * size, size, size);
        
        // Блики
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * size + 2, y * size + 2, size * 0.3, 2);
        ctx.fillRect(x * size + 2, y * size + 2, 2, size * 0.3);
    } else {
        // Установленные блоки - темнее
        gradient.addColorStop(0, shadeColor(color, -20));
        gradient.addColorStop(1, shadeColor(color, -40));
        ctx.fillStyle = gradient;
        ctx.fillRect(x * size, y * size, size, size);
        
        // Тень для глубины
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x * size, y * size + size - 2, size, 2);
        ctx.fillRect(x * size + size - 2, y * size, 2, size);
    }
}

function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    return `#${R.toString(16).padStart(2,'0')}${G.toString(16).padStart(2,'0')}${B.toString(16).padStart(2,'0')}`;
}

function drawPiece(ctx, piece) {
    const targetX = piece.x * BLOCK_SIZE;
    const targetY = piece.y * BLOCK_SIZE;
    
    gameState.renderX += (targetX - gameState.renderX) * 0.3;
    gameState.renderY += (targetY - gameState.renderY) * 0.3;
    
    for (let i = 0; i < piece.shape.length; i++) {
        for (let j = 0; j < piece.shape[i].length; j++) {
            if (piece.shape[i][j] !== 0) {
                drawBlockAtPosition(ctx, gameState.renderX + j * BLOCK_SIZE, gameState.renderY + i * BLOCK_SIZE, COLORS[piece.color], false);
            }
        }
    }
}

function drawBlockAtPosition(ctx, x, y, color, isPlaced = false) {
    // Основной блок
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    
    // 3D эффект для падающих фигур
    if (!isPlaced) {
        // Контур для падающей фигуры
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        
        // Легкий внутренний свет
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    }
}

function drawShadow(ctx, piece) {
    const shadowY = calculateShadowPosition(piece);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    
    for (let i = 0; i < piece.shape.length; i++) {
        for (let j = 0; j < piece.shape[i].length; j++) {
            if (piece.shape[i][j] !== 0) {
                ctx.fillRect(
                    (piece.x + j) * BLOCK_SIZE, 
                    (shadowY + i) * BLOCK_SIZE, 
                    BLOCK_SIZE, 
                    BLOCK_SIZE
                );
            }
        }
    }
}

function calculateShadowPosition(piece) {
    let shadowY = piece.y;
    while (isValidMove(piece.shape, piece.x, shadowY + 1)) {
        shadowY++;
    }
    return shadowY;
}

function isValidMove(shape, x, y) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] !== 0) {
                const newX = x + j;
                const newY = y + i;
                
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

function movePiece(dx, dy) {
    if (!gameState.currentPiece) return false;
    
    const currentTime = Date.now();
    if (currentTime - gameState.lastMoveTime < gameState.moveDelay) {
        return false;
    }
    
    const newX = gameState.currentPiece.x + dx;
    const newY = gameState.currentPiece.y + dy;
    
    if (isValidMove(gameState.currentPiece.shape, newX, newY)) {
        gameState.currentPiece.x = newX;
        gameState.currentPiece.y = newY;
        gameState.lastMoveTime = currentTime;
        return true;
    }
    
    if (dy > 0) {
        lockPiece();
        checkLines();
        spawnNewPiece();
    }
    
    return false;
}

function spawnNewPiece() {
    gameState.currentPiece = gameState.nextPiece;
    gameState.nextPiece = generateNewPiece();
    
    // СБРОСЬ render позиции для новой фигуры
    gameState.renderX = gameState.currentPiece.x * BLOCK_SIZE;
    gameState.renderY = gameState.currentPiece.y * BLOCK_SIZE;
    
    // Отрисовываем следующую фигуру
    drawNextPiece();
    
    // Проверяем game over
    if (!isValidMove(gameState.currentPiece.shape, gameState.currentPiece.x, gameState.currentPiece.y)) {
        gameState.gameActive = false;
        setTimeout(() => {
            alert(`🎮 Игра окончена!\n🏆 Ваш счет: ${gameState.score}\n📊 Линий собрано: ${gameState.linesCleared}`);
            saveScore();
        }, 100);
    }
}

function gameLoop(ctx) {
    if (!gameState.gameActive) {
        drawBoard(ctx);
        return;
    }
    
    const currentTime = Date.now();
    
    // Автоматическое плавное падение
    if (currentTime - gameState.dropTime > gameState.dropInterval) {
        movePiece(0, 1);
        gameState.dropTime = currentTime;
    }
    
    drawBoard(ctx);
    updateGameStats();
    requestAnimationFrame(() => gameLoop(ctx));
}

function rotatePiece() {
    if (!gameState.currentPiece) return;
    
    const currentTime = Date.now();
    if (currentTime - gameState.lastMoveTime < gameState.moveDelay) {
        return;
    }
    
    const rotated = rotateMatrix(gameState.currentPiece.shape);
    
    if (isValidMove(rotated, gameState.currentPiece.x, gameState.currentPiece.y)) {
        gameState.currentPiece.shape = rotated;
        gameState.lastMoveTime = currentTime;
    }
}

function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            rotated[j][rows - 1 - i] = matrix[i][j];
        }
    }
    
    return rotated;
}

function lockPiece() {
    if (!gameState.currentPiece) return;
    
    for (let i = 0; i < gameState.currentPiece.shape.length; i++) {
        for (let j = 0; j < gameState.currentPiece.shape[i].length; j++) {
            if (gameState.currentPiece.shape[i][j] !== 0) {
                const boardY = gameState.currentPiece.y + i;
                const boardX = gameState.currentPiece.x + j;
                
                if (boardY >= 0) {
                    gameState.board[boardY][boardX] = gameState.currentPiece.color + 1;
                }
            }
        }
    }
}

function checkLines() {
    let linesCleared = 0;
    
    for (let i = BOARD_HEIGHT - 1; i >= 0; i--) {
        if (gameState.board[i].every(cell => cell !== 0)) {
            // Удаляем линию с анимацией
            animateLineClear(i);
            
            // Удаляем линию
            gameState.board.splice(i, 1);
            gameState.board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            i++; // Проверяем ту же позицию снова
        }
    }
    
    if (linesCleared > 0) {
        // Начисляем очки
        const linePoints = [100, 300, 500, 800]; // За 1,2,3,4 линии
        gameState.score += linePoints[Math.min(linesCleared - 1, 3)] * gameState.level;
        gameState.linesCleared += linesCleared;
        
        // Повышаем уровень каждые 10 линий
        const newLevel = Math.floor(gameState.linesCleared / 10) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            gameState.dropInterval = Math.max(100, 800 - (gameState.level - 1) * 50);
        }
    }
}

function animateLineClear(row) {
    // Простая анимация - мигание строки
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        if (flashCount % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        }
        
        ctx.fillRect(0, row * BLOCK_SIZE, canvas.width, BLOCK_SIZE);
        
        flashCount++;
        if (flashCount >= 6) {
            clearInterval(flashInterval);
        }
    }, 100);
}

function updateGameStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('lines').textContent = gameState.linesCleared;
}

function setupMobileControls() {
    const controls = document.getElementById('mobileControls');
    if (!controls) return;
    
    controls.innerHTML = `
        <div class="control-row">
            <button id="rotateBtn" class="control-btn">↻</button>
        </div>
        <div class="control-row">
            <button id="leftBtn" class="control-btn">←</button>
            <button id="downBtn" class="control-btn">↓</button>
            <button id="rightBtn" class="control-btn">→</button>
        </div>
    `;
    
    document.getElementById('leftBtn').addEventListener('click', () => movePiece(-1, 0));
    document.getElementById('rightBtn').addEventListener('click', () => movePiece(1, 0));
    document.getElementById('downBtn').addEventListener('click', () => movePiece(0, 1));
    document.getElementById('rotateBtn').addEventListener('click', rotatePiece);
}

function drawNextPiece() {
    const nextPieceCanvas = document.getElementById('nextPieceCanvas');
    if (!nextPieceCanvas || !gameState.nextPiece) return;
    
    const nextCtx = nextPieceCanvas.getContext('2d');
    nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    const isSmallScreen = window.innerWidth < 400;
    const canvasSize = isSmallScreen ? 60 : 80;
    nextPieceCanvas.width = canvasSize;
    nextPieceCanvas.height = canvasSize;
    
    nextCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    nextCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    const piece = gameState.nextPiece;
    const blockSize = isSmallScreen ? 15 : 20;
    const offsetX = (nextPieceCanvas.width - piece.shape[0].length * blockSize) / 2;
    const offsetY = (nextPieceCanvas.height - piece.shape.length * blockSize) / 2;
    
    for (let i = 0; i < piece.shape.length; i++) {
        for (let j = 0; j < piece.shape[i].length; j++) {
            if (piece.shape[i][j] !== 0) {
                nextCtx.fillStyle = COLORS[piece.color];
                nextCtx.fillRect(offsetX + j * blockSize, offsetY + i * blockSize, blockSize, blockSize);
                
                nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                nextCtx.lineWidth = 1;
                nextCtx.strokeRect(offsetX + j * blockSize, offsetY + i * blockSize, blockSize, blockSize);
            }
        }
    }
}

function saveScore() {
    console.log(`Счет сохранен: ${gameState.score}`);
}

async function loadLeaderboard() {
    const leadersList = document.getElementById('leadersList');
    leadersList.innerHTML = '<div class="leader-item">Загрузка...</div>';
    
    setTimeout(() => {
        const leaders = [
            { name: "Вы", score: gameState.score || 0 }
        ];
        
        for (let i = leaders.length; i < 5; i++) {
            leaders.push({ name: `Игрок ${i + 1}`, score: 0 });
        }
        
        displayLeaders(leaders);
    }, 500);
}

function displayLeaders(leaders) {
    const leadersList = document.getElementById('leadersList');
    leadersList.innerHTML = '';
    
    leaders.sort((a, b) => b.score - a.score).forEach((leader, index) => {
        const leaderItem = document.createElement('div');
        leaderItem.className = 'leader-item';
        leaderItem.innerHTML = `
            <div class="leader-rank">${index + 1}</div>
            <div class="leader-name">${leader.name}</div>
            <div class="leader-score">${leader.score}</div>
        `;
        leadersList.appendChild(leaderItem);
    });
}

function gameOver() {
    gameState.gameActive = false;
    
    if (window.Telegram && Telegram.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: user.id,
                    text: `/tetris_score ${gameState.score} ${gameState.linesCleared}`
                })
            });
        }
    }
    
    setTimeout(() => {
        alert(`🎮 Игра окончена!\n🏆 Ваш счет: ${gameState.score}\n📊 Линий собрано: ${gameState.linesCleared}`);
        showLeaderboard();
    }, 100);
}
