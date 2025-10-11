async function loadLeaderboard() {
    const leadersList = document.getElementById('leadersList');
    if (!leadersList) return;
    
    leadersList.innerHTML = '<div class="leader-item">Загрузка...</div>';
    
    try {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                command: 'get_tetris_leaderboard'
            }));
        }
        
        setTimeout(() => {
            const leaders = [
                { name: "Игрок 1", score: 1500, lines: 45 },
                { name: "Игрок 2", score: 1200, lines: 38 },
                { name: "Вы", score: gameState.score || 0, lines: gameState.linesCleared || 0 },
                { name: "Игрок 3", score: 800, lines: 25 },
                { name: "Игрок 4", score: 500, lines: 18 }
            ];
            
            displayLeaders(leaders);
        }, 1000);
        
    } catch (error) {
        leadersList.innerHTML = '<div class="leader-item">Ошибка загрузки</div>';
    }
}

function displayLeaders(leaders) {
    const leadersList = document.getElementById('leadersList');
    if (!leadersList) return;
    
    leadersList.innerHTML = '';
    
    leaders.sort((a, b) => b.score - a.score).forEach((leader, index) => {
        const leaderItem = document.createElement('div');
        leaderItem.className = 'leader-item';
        leaderItem.innerHTML = `
            <div class="leader-rank">${index + 1}</div>
            <div class="leader-info">
                <div class="leader-name">${leader.name}</div>
                <div class="leader-stats">
                    <span class="leader-score">${leader.score} очков</span>
                    <span class="leader-lines">${leader.lines} линий</span>
                </div>
            </div>
        `;
        leadersList.appendChild(leaderItem);
    });
}

const leaderboardStyles = `
.leaders-container {
    width: 100%;
    max-width: 320px;
    max-height: 60vh;
    overflow-y: auto;
}

.leader-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    margin-bottom: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.leader-rank {
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 12px;
    font-size: 14px;
}

.leader-info {
    flex: 1;
}

.leader-name {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 4px;
}

.leader-stats {
    display: flex;
    gap: 12px;
    font-size: 12px;
    opacity: 0.8;
}

.leader-score, .leader-lines {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = leaderboardStyles;
document.head.appendChild(styleSheet);

