// chess.js - полная реализация шахмат с мультиплеером
class ChessGame {
    constructor(playerColor = 'white') {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameActive = true;
        this.playerColor = playerColor;
        this.opponentColor = playerColor === 'white' ? 'black' : 'white';
        this.gameId = null;
        this.opponent = null;
        this.moveHistory = [];
    }

    initializeBoard() {
        return [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
    }

    // Основные методы игры
    selectPiece(row, col) {
        if (!this.gameActive || this.currentPlayer !== this.playerColor) {
            return false;
        }
        
        const piece = this.board[row][col];
        if (!piece) {
            this.selectedPiece = null;
            this.validMoves = [];
            return false;
        }
        
        const pieceColor = this.getPieceColor(piece);
        if (pieceColor !== this.playerColor) {
            return false;
        }
        
        this.selectedPiece = { row, col, piece };
        this.validMoves = this.calculateValidMoves(row, col, piece);
        return true;
    }

    // Обновите метод movePiece в ChessGame
movePiece(toRow, toCol) {
    if (!this.selectedPiece || !this.isValidMove(toRow, toCol)) {
        return false;
    }

    const { row: fromRow, col: fromCol, piece } = this.selectedPiece;
    
    // Отправляем ход на сервер
    chessAPI.sendMove([fromRow, fromCol], [toRow, toCol]).then(result => {
        if (result.success) {
            // Ход успешно отправлен, обновляем локальную доску
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = '';
            
            this.moveHistory.push({
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                piece: piece
            });
            
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            
            this.selectedPiece = null;
            this.validMoves = [];
            
            drawChessBoard();
            setupChessPieces();
            updateChessGameStatus();
        } else {
            alert('Ошибка отправки хода: ' + result.error);
        }
    });
    
    return true;
}

    // Валидация ходов для всех фигур
    calculateValidMoves(row, col, piece) {
        const moves = [];
        const pieceType = piece.toLowerCase();
        
        switch (pieceType) {
            case 'p': // Пешка
                this.addPawnMoves(row, col, piece, moves);
                break;
            case 'r': // Ладья
                this.addRookMoves(row, col, piece, moves);
                break;
            case 'n': // Конь
                this.addKnightMoves(row, col, piece, moves);
                break;
            case 'b': // Слон
                this.addBishopMoves(row, col, piece, moves);
                break;
            case 'q': // Ферзь
                this.addQueenMoves(row, col, piece, moves);
                break;
            case 'k': // Король
                this.addKingMoves(row, col, piece, moves);
                break;
        }
        
        return this.filterValidMoves(moves, row, col, piece);
    }

    addPawnMoves(row, col, piece, moves) {
        const direction = piece === 'P' ? -1 : 1;
        const startRow = piece === 'P' ? 6 : 1;
        
        // Ход вперед
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Двойной ход с начальной позиции
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Взятие по диагонали
        for (let dc of [-1, 1]) {
            if (this.isInBounds(row + direction, col + dc)) {
                const target = this.board[row + direction][col + dc];
                if (target && this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push({ row: row + direction, col: col + dc });
                }
            }
        }
    }

    addRookMoves(row, col, piece, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        this.addSlidingMoves(row, col, piece, directions, moves);
    }

    addBishopMoves(row, col, piece, moves) {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        this.addSlidingMoves(row, col, piece, directions, moves);
    }

    addQueenMoves(row, col, piece, moves) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        this.addSlidingMoves(row, col, piece, directions, moves);
    }

    addKnightMoves(row, col, piece, moves) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (let [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    addKingMoves(row, col, piece, moves) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isInBounds(newRow, newCol)) {
                    const target = this.board[newRow][newCol];
                    if (!target || this.getPieceColor(target) !== this.getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
    }

    addSlidingMoves(row, col, piece, directions, moves) {
        for (let [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isInBounds(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.getPieceColor(target) !== this.getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
    }

    // Вспомогательные методы
    filterValidMoves(moves, fromRow, fromCol, piece) {
        return moves.filter(move => {
            // Временное перемещение для проверки шаха
            const originalPiece = this.board[move.row][move.col];
            this.board[move.row][move.col] = piece;
            this.board[fromRow][fromCol] = '';
            
            const inCheck = this.isKingInCheck(this.getPieceColor(piece));
            
            // Восстанавливаем доску
            this.board[fromRow][fromCol] = piece;
            this.board[move.row][move.col] = originalPiece;
            
            return !inCheck;
        });
    }

    isKingInCheck(color) {
        // Упрощенная проверка шаха
        // В реальной игре нужна более сложная логика
        return false;
    }

    handleSpecialMoves(move) {
        // Превращение пешки
        if ((move.piece.toLowerCase() === 'p') && 
            (move.to.row === 0 || move.to.row === 7)) {
            this.board[move.to.row][move.to.col] = 
                this.getPieceColor(move.piece) === 'white' ? 'Q' : 'q';
        }
    }

    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getPieceColor(piece) {
        return piece === piece.toUpperCase() ? 'white' : 'black';
    }

    // Мультиплеер функции
    setGameId(gameId) {
        this.gameId = gameId;
    }

    setOpponent(opponent) {
        this.opponent = opponent;
    }

    sendMoveToOpponent(move) {
        // В реальном приложении здесь будет отправка через WebSocket
        console.log('Sending move to opponent:', move);
        
        // Имитация получения хода от оппонента
        setTimeout(() => {
            if (window.handleOpponentMove) {
                window.handleOpponentMove(move);
            }
        }, 1000);
    }

    applyOpponentMove(move) {
        if (!this.gameActive || this.currentPlayer !== this.opponentColor) {
            return false;
        }
        
        this.board[move.to.row][move.to.col] = move.piece;
        this.board[move.from.row][move.from.col] = '';
        
        this.moveHistory.push(move);
        this.currentPlayer = this.playerColor;
        
        return true;
    }

    // Управление игрой
    surrender() {
        this.gameActive = false;
        return true;
    }

    offerDraw() {
        // Логика предложения ничьи
        return true;
    }

    getGameState() {
        return {
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
            moveHistory: [...this.moveHistory]
        };
    }
}

// Глобальные функции для управления шахматной игрой
let currentChessGame = null;

function initChessGame(playerColor = 'white') {
    currentChessGame = new ChessGame(playerColor);
    drawChessBoard();
    setupChessPieces();
    setupChessTouchControls();
}

function drawChessBoard() {
    const canvas = document.getElementById('chessCanvas');
    if (!canvas) return;
    
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
            
            // Подсветка выбранной клетки
            if (currentChessGame.selectedPiece && 
                currentChessGame.selectedPiece.row === row && 
                currentChessGame.selectedPiece.col === col) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
            }
            
            // Подсветка возможных ходов
            if (currentChessGame.validMoves.some(move => move.row === row && move.col === col)) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
            }
        }
    }
}

function setupChessPieces() {
    const canvas = document.getElementById('chessCanvas');
    if (!canvas || !currentChessGame) return;
    
    const ctx = canvas.getContext('2d');
    const squareSize = canvas.width / 8;
    
    // Unicode символы шахматных фигур
    const pieceSymbols = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    
    // Рисуем фигуры
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = currentChessGame.board[row][col];
            if (piece) {
                ctx.font = `bold ${squareSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = currentChessGame.getPieceColor(piece) === 'white' ? 'white' : 'black';
                
                const x = col * squareSize + squareSize / 2;
                const y = row * squareSize + squareSize / 2;
                
                ctx.fillText(pieceSymbols[piece], x, y);
                
                // Тень для лучшей видимости
                ctx.fillStyle = currentChessGame.getPieceColor(piece) === 'white' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
                ctx.fillText(pieceSymbols[piece], x + 1, y + 1);
            }
        }
    }
}

function setupChessTouchControls() {
    const canvas = document.getElementById('chessCanvas');
    if (!canvas) return;
    
    canvas.addEventListener('click', function(e) {
        if (!currentChessGame || !currentChessGame.gameActive) return;
        
        const rect = canvas.getBoundingClientRect();
        const squareSize = canvas.width / 8;
        const col = Math.floor((e.clientX - rect.left) / squareSize);
        const row = Math.floor((e.clientY - rect.top) / squareSize);
        
        if (!currentChessGame.isInBounds(row, col)) return;
        
        // Если фигура уже выбрана, пытаемся сделать ход
        if (currentChessGame.selectedPiece) {
            if (currentChessGame.movePiece(row, col)) {
                drawChessBoard();
                setupChessPieces();
                updateChessGameStatus();
            } else {
                // Если ход не удался, выбираем новую фигуру
                currentChessGame.selectPiece(row, col);
                drawChessBoard();
                setupChessPieces();
            }
        } else {
            // Выбираем фигуру
            currentChessGame.selectPiece(row, col);
            drawChessBoard();
            setupChessPieces();
        }
    });
}

// Функция для обработки хода оппонента
window.handleOpponentMove = function(move) {
    if (currentChessGame && currentChessGame.applyOpponentMove(move)) {
        drawChessBoard();
        setupChessPieces();
        updateChessGameStatus();
    }
};

function updateChessGameStatus() {
    const statusElement = document.getElementById('chessGameStatus');
    if (statusElement && currentChessGame) {
        if (currentChessGame.currentPlayer === currentChessGame.playerColor) {
            statusElement.textContent = 'Ваш ход';
            statusElement.style.color = '#4ECDC4';
        } else {
            statusElement.textContent = `Ход соперника`;
            statusElement.style.color = '#FF6B6B';
        }
    }
}