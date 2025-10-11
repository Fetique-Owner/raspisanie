class ChessAPI {
    constructor() {
        this.baseUrl = 'https://api.telegram.org/bot';
        this.currentGameId = null;
        this.userId = null;
        this.pollingInterval = null;
    }

 async sendToBot(command, data = {}) {
        try {
            if (window.Telegram && Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    command: command,
                    ...data,
                    userId: this.userId
                }));
                return { success: true };
            }
            return { success: false, error: 'Telegram WebApp not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    init() {
        if (window.Telegram && Telegram.WebApp) {
            this.userId = Telegram.WebApp.initDataUnsafe?.user?.id;
            return true;
        }
        return false;
    }

    async createGame() {
        return await this.sendToBot('create_chess_game');
    }

    // Присоединение к игре
    async joinGame(gameId) {
        return await this.sendToBot('join_chess_game', { gameId });
    }

    // Отправка хода
    async sendMove(from, to) {
        return await this.sendToBot('chess_move', {
            gameId: this.currentGameId,
            from: from,
            to: to
        });
    }

    // Получение состояния игры
    async getGameState() {
        return await this.sendToBot('get_chess_state', {
            gameId: this.currentGameId
        });
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
