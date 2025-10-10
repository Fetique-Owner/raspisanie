// chess-api.js - работа с Telegram ботом
class ChessAPI {
    constructor() {
        this.baseUrl = 'https://api.telegram.org/bot' + (window.Telegram?.WebApp?.initData || '');
        this.currentGameId = null;
        this.userId = null;
    }

    // Инициализация API
    init() {
        if (window.Telegram && Telegram.WebApp) {
            this.userId = Telegram.WebApp.initDataUnsafe?.user?.id;
            return true;
        }
        return false;
    }

    // Создание новой игры
    async createGame() {
        try {
            // В реальном приложении здесь будет вызов API бота
            // Для демо создаем локальную игру
            const gameId = 'chess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            this.currentGameId = gameId;
            
            return {
                success: true,
                gameId: gameId,
                inviteLink: `https://t.me/your_bot?start=chess_${gameId}`
            };
        } catch (error) {
            console.error('Ошибка создания игры:', error);
            return { success: false, error: error.message };
        }
    }

    // Присоединение к игре
    async joinGame(gameId) {
        try {
            this.currentGameId = gameId;
            
            // Имитируем успешное присоединение
            return {
                success: true,
                gameId: gameId,
                message: 'Вы успешно присоединились к игре'
            };
        } catch (error) {
            console.error('Ошибка присоединения:', error);
            return { success: false, error: error.message };
        }
    }

    // Отправка хода на сервер
    async sendMove(from, to) {
        if (!this.currentGameId) {
            return { success: false, error: 'Игра не выбрана' };
        }

        try {
            const moveData = {
                gameId: this.currentGameId,
                from: from,
                to: to,
                userId: this.userId,
                timestamp: Date.now()
            };

            // В реальном приложении здесь будет отправка на сервер
            console.log('Отправка хода:', moveData);
            
            // Имитируем успешную отправку
            return { success: true, move: moveData };
        } catch (error) {
            console.error('Ошибка отправки хода:', error);
            return { success: false, error: error.message };
        }
    }

    // Получение обновлений игры
    async getGameState() {
        if (!this.currentGameId) {
            return { success: false, error: 'Игра не выбрана' };
        }

        try {
            // Имитируем получение состояния игры
            const gameState = {
                gameId: this.currentGameId,
                board: currentChessGame ? currentChessGame.board : null,
                currentTurn: currentChessGame ? currentChessGame.currentPlayer : 'white',
                players: {
                    white: { name: 'Игрок 1' },
                    black: { name: 'Игрок 2' }
                },
                yourColor: currentChessGame ? currentChessGame.playerColor : 'white'
            };

            return { success: true, state: gameState };
        } catch (error) {
            console.error('Ошибка получения состояния:', error);
            return { success: false, error: error.message };
        }
    }

    // Предложить ничью
    async offerDraw() {
        if (!this.currentGameId) {
            return { success: false, error: 'Игра не выбрана' };
        }

        try {
            console.log('Предложение ничьи отправлено');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Сдаться
    async surrender() {
        if (!this.currentGameId) {
            return { success: false, error: 'Игра не выбрана' };
        }

        try {
            console.log('Игрок сдался');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

const chessAPI = new ChessAPI();