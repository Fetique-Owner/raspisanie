const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

const BLOCK_COLORS = [
    { base: '#00FF8C', light: '#80FFC6', dark: '#00CC70' },
    { base: '#4169E1', light: '#A0B4FF', dark: '#2A4FB3' },
    { base: '#BA55D3', light: '#DDAAEB', dark: '#8A2BE2' },
    { base: '#00CED1', light: '#80E6E8', dark: '#00A8A8' },
    { base: '#FFD700', light: '#FFEB80', dark: '#CCAC00' },
    { base: '#FF4500', light: '#FFA280', dark: '#CC3700' },
    { base: '#1E90FF', light: '#8FC7FF', dark: '#0066CC' }
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
    dropInterval: 1000,
    blockSize: 0,
    canvas: null,
    ctx: null,
    particles: []
};

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    gameState.canvas = canvas;
    gameState.ctx = canvas.getContext('2d');
    
    // Адаптивный размер - более компактный для мобильных
    const maxWidth = Math.min(280, window.innerWidth - 30);
    gameState.blockSize = Math.floor(maxWidth / BOARD_WIDTH);
    const canvasWidth = gameState.blockSize * BOARD_WIDTH;
    const canvasHeight = gameState.blockSize * BOARD_HEIGHT;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    resetGame();
    setupControls();
    gameLoop();
}

function resetGame() {
    gameState.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    gameState.currentPiece = generateNewPiece();
    gameState.nextPiece = generateNewPiece();
    gameState.score = 0;
    gameState.level = 1;
    gameState.linesCleared = 0;
    gameState.gameActive = true;
    gameState.dropTime = Date.now();
    gameState.dropInterval = 1000;
    gameState.particles = [];
    
    updateGameStats();
    drawNextPiece();
    createBackgroundParticles();
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
    
    const colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length);
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
        drawGameOver();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const currentTime = Date.now();
    
    drawBackground();
    updateParticles();
    drawGrid();
    
    // Отрисовка установленных блоков
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (gameState.board[y][x] !== 0) {
                drawColorfulBlock(x, y, gameState.board[y][x] - 1, true);
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

function drawBackground() {
    const ctx = gameState.ctx;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, gameState.canvas.height);
    gradient.addColorStop(0, '#2a2a4e');
    gradient.addColorStop(1, '#1a1a2e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.3;
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            ctx.strokeRect(
                x * gameState.blockSize, 
                y * gameState.blockSize, 
                gameState.blockSize, 
                gameState.blockSize
            );
        }
    }
}

function drawGrid() {
    const ctx = gameState.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            ctx.strokeRect(
                x * gameState.blockSize, 
                y * gameState.blockSize, 
                gameState.blockSize, 
                gameState.blockSize
            );
        }
    }
}

function drawColorfulBlock(x, y, colorIndex, isPlaced = false) {
    const ctx = gameState.ctx;
    const size = gameState.blockSize;
    const colors = BLOCK_COLORS[colorIndex];
    
    const posX = x * size;
    const posY = y * size;
    
    ctx.fillStyle = colors.base;
    ctx.fillRect(posX, posY, size, size);
    
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(posX + size * 0.7, posY);
    ctx.lineTo(posX + size * 0.3, posY + size * 0.3);
    ctx.closePath();
    ctx.fillStyle = colors.light;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(posX + size, posY);
    ctx.lineTo(posX + size * 0.3, posY);
    ctx.lineTo(posX + size * 0.7, posY + size * 0.3);
    ctx.closePath();
    ctx.fillStyle = colors.light;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(posX, posY + size);
    ctx.lineTo(posX + size * 0.3, posY + size * 0.7);
    ctx.lineTo(posX, posY + size * 0.3);
    ctx.closePath();
    ctx.fillStyle = colors.dark;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(posX + size, posY + size);
    ctx.lineTo(posX + size * 0.7, posY + size * 0.7);
    ctx.lineTo(posX + size, posY + size * 0.3);
    ctx.closePath();
    ctx.fillStyle = colors.dark;
    ctx.fill();
    
    ctx.fillStyle = colors.base;
    ctx.fillRect(posX + size * 0.3, posY + size * 0.3, size * 0.4, size * 0.4);
    
    const shineGradient = ctx.createRadialGradient(
        posX + size * 0.5, 
        posY + size * 0.5, 
        0,
        posX + size * 0.5, 
        posY + size * 0.5, 
        size * 0.2
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = shineGradient;
    ctx.fillRect(posX + size * 0.3, posY + size * 0.3, size * 0.4, size * 0.4);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(posX, posY, size, size);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(posX + size * 0.3, posY + size * 0.3);
    ctx.moveTo(posX + size, posY);
    ctx.lineTo(posX + size * 0.7, posY + size * 0.3);
    ctx.moveTo(posX, posY + size);
    ctx.lineTo(posX + size * 0.3, posY + size * 0.7);
    ctx.moveTo(posX + size, posY + size);
    ctx.lineTo(posX + size * 0.7, posY + size * 0.7);
    ctx.stroke();
}

function drawPiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                drawColorfulBlock(piece.x + x, piece.y + y, piece.color, false);
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
                    createLockParticles(boardX, boardY, piece.color);
                }
            }
        }
    }
}

function spawnNewPiece() {
    gameState.currentPiece = gameState.nextPiece;
    gameState.nextPiece = generateNewPiece();
    drawNextPiece();
    
    if (!isValidMove(gameState.currentPiece.shape, gameState.currentPiece.x, gameState.currentPiece.y)) {
        gameState.gameActive = false;
        saveScore();
        createGameOverParticles();
    }
}

function checkLines() {
    let linesCleared = 0;
    let clearedRows = [];
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (gameState.board[y].every(cell => cell !== 0)) {
            clearedRows.push(y);
            gameState.board.splice(y, 1);
            gameState.board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        createLineClearParticles(clearedRows);
        
        const points = [100, 300, 500, 800];
        gameState.score += points[Math.min(linesCleared - 1, 3)] * gameState.level;
        gameState.linesCleared += linesCleared;
        
        gameState.level = Math.floor(gameState.linesCleared / 10) + 1;
        gameState.dropInterval = Math.max(100, 1000 - (gameState.level - 1) * 50);
        
        updateGameStats();
    }
}

function rotatePiece() {
    if (!gameState.currentPiece) return;
    
    const shape = gameState.currentPiece.shape;
    const rows = shape.length;
    const cols = shape[0].length;
    
    const rotated = [];
    for (let x = 0; x < cols; x++) {
        rotated[x] = [];
        for (let y = 0; y < rows; y++) {
            rotated[x][y] = shape[rows - 1 - y][x];
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
        }
    });
    
    setupMobileControls();
    setupSwipeControls();
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

function setupSwipeControls() {
    let startX, startY;
    
    gameState.canvas.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault();
    });
    
    gameState.canvas.addEventListener('touchend', (e) => {
        if (!gameState.gameActive) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = endX - startX;
        const diffY = endY - startY;
        const minSwipe = 30;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipe) {
                if (diffX > 0) movePiece(1, 0);
                else movePiece(-1, 0);
            }
        } else {
            if (Math.abs(diffY) > minSwipe) {
                if (diffY > 0) movePiece(0, 1);
                else rotatePiece();
            }
        }
    });
}

function createBackgroundParticles() {
    for (let i = 0; i < 25; i++) {
        gameState.particles.push({
            x: Math.random() * gameState.canvas.width,
            y: Math.random() * gameState.canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
}

function createLockParticles(x, y, colorIndex) {
    for (let i = 0; i < 6; i++) {
        gameState.particles.push({
            x: (x + 0.5) * gameState.blockSize,
            y: (y + 0.5) * gameState.blockSize,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            color: BLOCK_COLORS[colorIndex].light,
            life: 1.0,
            decay: 0.025
        });
    }
}

function createLineClearParticles(rows) {
    rows.forEach(row => {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            gameState.particles.push({
                x: (x + 0.5) * gameState.blockSize,
                y: (row + 0.5) * gameState.blockSize,
                size: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 5,
                speedY: (Math.random() - 0.5) * 5,
                color: '#FFFFFF',
                life: 1.0,
                decay: 0.02
            });
        }
    });
}

function createGameOverParticles() {
    for (let i = 0; i < 80; i++) {
        gameState.particles.push({
            x: gameState.canvas.width / 2,
            y: gameState.canvas.height / 2,
            size: Math.random() * 6 + 3,
            speedX: (Math.random() - 0.5) * 10,
            speedY: (Math.random() - 0.5) * 10,
            color: i % 3 === 0 ? '#4ECDC4' : i % 3 === 1 ? '#45B7D1' : '#2E8B57', // Синие и зеленые тона
            life: 1.0,
            decay: 0.008
        });
    }
}

function updateParticles() {
    const ctx = gameState.ctx;
    
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        
        if (!p.speedX) {
            p.y += p.speed;
            if (p.y > gameState.canvas.height) {
                p.y = 0;
                p.x = Math.random() * gameState.canvas.width;
            }
            
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        } else {
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                gameState.particles.splice(i, 1);
                continue;
            }
            
            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
    }
}

function drawGameOver() {
    const ctx = gameState.ctx;
    
    const overlayGradient = ctx.createLinearGradient(0, 0, 0, gameState.canvas.height);
    overlayGradient.addColorStop(0, 'rgba(26, 26, 46, 0.9)');
    overlayGradient.addColorStop(1, 'rgba(22, 33, 62, 0.95)');
    
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    const boxWidth = gameState.canvas.width * 0.8;
    const boxHeight = 120;
    const boxX = (gameState.canvas.width - boxWidth) / 2;
    const boxY = (gameState.canvas.height - boxHeight) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 15);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(' ИГРА ОКОНЧЕНА ', gameState.canvas.width / 2, boxY + 35);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText(`🏆 Счет: ${gameState.score}`, gameState.canvas.width / 2, boxY + 65);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Нажмите 🔄 для новой игры', gameState.canvas.width / 2, boxY + 90);
    
    const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 0.9;
    ctx.strokeStyle = `rgba(78, 205, 196, ${pulse})`;
    ctx.lineWidth = 3 * pulse;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 15);
    ctx.stroke();
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
    
    const blockSize = 12;
    const offsetX = (canvas.width - piece.shape[0].length * blockSize) / 2;
    const offsetY = (canvas.height - piece.shape.length * blockSize) / 2;
    
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const colors = BLOCK_COLORS[piece.color];
                const posX = offsetX + x * blockSize;
                const posY = offsetY + y * blockSize;
                
                ctx.fillStyle = colors.base;
                ctx.fillRect(posX, posY, blockSize, blockSize);
                
                ctx.fillStyle = colors.light;
                ctx.beginPath();
                ctx.moveTo(posX, posY);
                ctx.lineTo(posX + blockSize * 0.7, posY);
                ctx.lineTo(posX + blockSize * 0.3, posY + blockSize * 0.3);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = colors.dark;
                ctx.beginPath();
                ctx.moveTo(posX + blockSize, posY + blockSize);
                ctx.lineTo(posX + blockSize * 0.7, posY + blockSize * 0.7);
                ctx.lineTo(posX + blockSize, posY + blockSize * 0.3);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = colors.base;
                ctx.fillRect(posX + blockSize * 0.3, posY + blockSize * 0.3, blockSize * 0.4, blockSize * 0.4);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(posX, posY, blockSize, blockSize);
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