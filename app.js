class NFLPredictionTracker {
    constructor() {
        this.predictions = this.loadPredictions();
        this.preseasonPredictions = this.loadPreseasonPredictions();
        this.filteredGames = [...nflSchedule.games];
        this.bulkPredictions = {};
        this.currentTab = 'weekly';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateFilters();
        this.populatePreseasonDropdowns();
        this.renderGames();
        this.updateStats();
        this.loadPreseasonUI();
        this.renderComparison();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Existing event listeners
        document.getElementById('week-filter').addEventListener('change', (e) => {
            this.filterGames();
        });

        document.getElementById('team-filter').addEventListener('change', (e) => {
            this.filterGames();
        });

        document.getElementById('clear-all-predictions').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all predictions? This cannot be undone.')) {
                this.clearAllPredictions();
            }
        });

        document.getElementById('bulk-predict-btn').addEventListener('click', () => {
            this.showBulkPredictionModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeBulkPredictionModal();
        });

        document.getElementById('cancel-week-predictions').addEventListener('click', () => {
            this.closeBulkPredictionModal();
        });

        document.getElementById('save-week-predictions').addEventListener('click', () => {
            this.saveWeekPredictions();
        });

        // Pre-season prediction event listeners
        document.getElementById('save-preseason-predictions').addEventListener('click', () => {
            this.savePreseasonPredictions();
        });

        document.getElementById('clear-preseason-predictions').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all pre-season predictions?')) {
                this.clearPreseasonPredictions();
            }
        });

        // Update championship dropdowns when division winners change
        ['afc-east-winner', 'afc-north-winner', 'afc-south-winner', 'afc-west-winner',
         'nfc-east-winner', 'nfc-north-winner', 'nfc-south-winner', 'nfc-west-winner'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateChampionshipDropdowns();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bulk-prediction-modal');
            if (e.target === modal) {
                this.closeBulkPredictionModal();
            }
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Refresh content if needed
        if (tab === 'comparison') {
            this.renderComparison();
        }
    }

    populatePreseasonDropdowns() {
        const afcTeams = ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN'];
        const nfcTeams = ['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LAR', 'MIN', 'NO', 'NYG', 'PHI', 'SF', 'SEA', 'TB', 'WAS'];

        // Populate wild card dropdowns
        this.populateTeamDropdown('afc-wildcard-1', afcTeams);
        this.populateTeamDropdown('afc-wildcard-2', afcTeams);
        this.populateTeamDropdown('afc-wildcard-3', afcTeams);
        this.populateTeamDropdown('nfc-wildcard-1', nfcTeams);
        this.populateTeamDropdown('nfc-wildcard-2', nfcTeams);
        this.populateTeamDropdown('nfc-wildcard-3', nfcTeams);

        // Populate championship dropdowns
        this.populateTeamDropdown('afc-champion', afcTeams);
        this.populateTeamDropdown('nfc-champion', nfcTeams);
        this.populateTeamDropdown('super-bowl-champion', [...afcTeams, ...nfcTeams]);
    }

    populateTeamDropdown(elementId, teams) {
        const select = document.getElementById(elementId);
        teams.forEach(teamCode => {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = nflSchedule.teams[teamCode].name;
            select.appendChild(option);
        });
    }

    updateChampionshipDropdowns() {
        // This could be enhanced to only show division winners + wild cards
        // For now, keeping it simple with all teams
    }

    savePreseasonPredictions() {
        const predictions = {
            divisionWinners: {
                'afc-east': document.getElementById('afc-east-winner').value,
                'afc-north': document.getElementById('afc-north-winner').value,
                'afc-south': document.getElementById('afc-south-winner').value,
                'afc-west': document.getElementById('afc-west-winner').value,
                'nfc-east': document.getElementById('nfc-east-winner').value,
                'nfc-north': document.getElementById('nfc-north-winner').value,
                'nfc-south': document.getElementById('nfc-south-winner').value,
                'nfc-west': document.getElementById('nfc-west-winner').value
            },
            wildCards: {
                'afc-1': document.getElementById('afc-wildcard-1').value,
                'afc-2': document.getElementById('afc-wildcard-2').value,
                'afc-3': document.getElementById('afc-wildcard-3').value,
                'nfc-1': document.getElementById('nfc-wildcard-1').value,
                'nfc-2': document.getElementById('nfc-wildcard-2').value,
                'nfc-3': document.getElementById('nfc-wildcard-3').value
            },
            championships: {
                'afc-champion': document.getElementById('afc-champion').value,
                'nfc-champion': document.getElementById('nfc-champion').value,
                'super-bowl': document.getElementById('super-bowl-champion').value
            },
            timestamp: new Date().toISOString()
        };

        this.preseasonPredictions = predictions;
        this.savePreseasonPredictions();
        alert('Pre-season predictions saved successfully!');
        this.renderComparison();
    }

    loadPreseasonUI() {
        if (!this.preseasonPredictions.divisionWinners) return;

        // Load division winners
        Object.entries(this.preseasonPredictions.divisionWinners).forEach(([division, team]) => {
            const select = document.getElementById(`${division}-winner`);
            if (select && team) {
                select.value = team;
            }
        });

        // Load wild cards
        Object.entries(this.preseasonPredictions.wildCards).forEach(([slot, team]) => {
            const select = document.getElementById(`${slot.replace('-', '-wildcard-')}`);
            if (select && team) {
                select.value = team;
            }
        });

        // Load championships
        Object.entries(this.preseasonPredictions.championships).forEach(([type, team]) => {
            const select = document.getElementById(type.replace('super-bowl', 'super-bowl-champion'));
            if (select && team) {
                select.value = team;
            }
        });
    }

    clearPreseasonPredictions() {
        this.preseasonPredictions = {};
        localStorage.removeItem('nfl-preseason-predictions');
        
        // Clear UI
        document.querySelectorAll('#preseason-tab select').forEach(select => {
            select.value = '';
        });
        
        this.renderComparison();
    }

    renderComparison() {
        const container = document.getElementById('comparison-content');
        if (!container) return;

        if (!this.preseasonPredictions.divisionWinners) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Make your pre-season predictions first to see comparisons!</p>';
            return;
        }

        let html = `
            <div class="comparison-item comparison-header">
                <div>Category</div>
                <div>Pre-Season Pick</div>
                <div>Current Status</div>
                <div>Result</div>
            </div>
        `;

        // Add division comparisons
        Object.entries(this.preseasonPredictions.divisionWinners).forEach(([division, predictedTeam]) => {
            if (!predictedTeam) return;
            
            const divisionName = division.replace('-', ' ').toUpperCase() + ' Winner';
            const teamName = nflSchedule.teams[predictedTeam]?.name || predictedTeam;
            
            html += `
                <div class="comparison-item">
                    <div class="comparison-category">${divisionName}</div>
                    <div>${teamName}</div>
                    <div class="prediction-pending">Season in progress</div>
                    <div class="prediction-pending">TBD</div>
                </div>
            `;
        });

        // Add championship comparisons
        if (this.preseasonPredictions.championships['super-bowl']) {
            const superBowlPick = nflSchedule.teams[this.preseasonPredictions.championships['super-bowl']]?.name;
            html += `
                <div class="comparison-item">
                    <div class="comparison-category">Super Bowl Champion</div>
                    <div>${superBowlPick}</div>
                    <div class="prediction-pending">Season in progress</div>
                    <div class="prediction-pending">TBD</div>
                </div>
            `;
        }

        // Add some weekly prediction accuracy summary
        const totalPredictions = Object.keys(this.predictions).length;
        const completedGames = nflSchedule.games.filter(g => g.status === 'final' && g.winner);
        const correctWeekly = completedGames.filter(g => this.predictions[g.id] === g.winner).length;
        const weeklyAccuracy = completedGames.length > 0 ? Math.round((correctWeekly / completedGames.length) * 100) : 0;

        html += `
            <div class="comparison-item" style="border-top: 2px solid #007bff; margin-top: 20px; padding-top: 20px;">
                <div class="comparison-category">Weekly Predictions</div>
                <div>${totalPredictions} total picks</div>
                <div>${correctWeekly}/${completedGames.length} correct</div>
                <div class="${weeklyAccuracy >= 60 ? 'prediction-correct' : weeklyAccuracy >= 40 ? 'prediction-pending' : 'prediction-incorrect'}">${weeklyAccuracy}% accuracy</div>
            </div>
        `;

        container.innerHTML = html;
    }

    loadPreseasonPredictions() {
        const saved = localStorage.getItem('nfl-preseason-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    savePreseasonPredictionsToStorage() {
        localStorage.setItem('nfl-preseason-predictions', JSON.stringify(this.preseasonPredictions));
    }

    // Fix the method name conflict
    savePreseasonPredictions() {
        this.savePreseasonPredictionsToStorage();
    }

    getPreseasonTeamPrediction(game) {
        // Check if this team was predicted to be good/bad in preseason
        const homeTeam = game.homeTeam;
        const awayTeam = game.awayTeam;
        
        let preseasonFavorite = null;
        
        // Check Super Bowl winner
        if (this.preseasonPredictions['superbowl-winner'] === homeTeam) {
            preseasonFavorite = homeTeam;
        } else if (this.preseasonPredictions['superbowl-winner'] === awayTeam) {
            preseasonFavorite = awayTeam;
        }
        
        // Check conference champions
        if (!preseasonFavorite) {
            if (this.preseasonPredictions['afc-champion'] === homeTeam || this.preseasonPredictions['nfc-champion'] === homeTeam) {
                preseasonFavorite = homeTeam;
            } else if (this.preseasonPredictions['afc-champion'] === awayTeam || this.preseasonPredictions['nfc-champion'] === awayTeam) {
                preseasonFavorite = awayTeam;
            }
        }
        
        // Check division winners
        if (!preseasonFavorite) {
            const divisionWinners = [
                'afc-east-winner', 'afc-north-winner', 'afc-south-winner', 'afc-west-winner',
                'nfc-east-winner', 'nfc-north-winner', 'nfc-south-winner', 'nfc-west-winner'
            ];
            
            for (const division of divisionWinners) {
                if (this.preseasonPredictions[division] === homeTeam) {
                    preseasonFavorite = homeTeam;
                    break;
                } else if (this.preseasonPredictions[division] === awayTeam) {
                    preseasonFavorite = awayTeam;
                    break;
                }
            }
        }
        
        return preseasonFavorite;
    }

    filterGames() {
        const weekFilter = document.getElementById('week-filter').value;
        const teamFilter = document.getElementById('team-filter').value;

        this.filteredGames = nflSchedule.games.filter(game => {
            const weekMatch = !weekFilter || game.week == weekFilter;
            const teamMatch = !teamFilter || game.homeTeam === teamFilter || game.awayTeam === teamFilter;
            return weekMatch && teamMatch;
        });

        this.renderGames();
    }

    renderGames() {
        const gamesContainer = document.getElementById('games-list');
        gamesContainer.innerHTML = '';

        this.filteredGames.forEach(game => {
            const gameElement = this.createGameElement(game);
            gamesContainer.appendChild(gameElement);
        });
    }

    createGameElement(game) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card';
        gameDiv.innerHTML = `
            <div class="game-header">
                <div class="game-info">
                    <span>Week ${game.week}</span>
                    <span>${game.date}</span>
                    <span>${game.time}</span>
                </div>
                <div class="game-status status-${game.status}">
                    ${this.getStatusText(game.status)}
                </div>
            </div>
            
            <div class="teams-container">
                <div class="team away-team">
                    <div class="team-name">
                        ${nflSchedule.teams[game.awayTeam].name}
                        ${game.winner === game.awayTeam ? '<span class="winner-badge">Winner</span>' : ''}
                    </div>
                    <div class="team-record">
                        ${this.getTeamRecord(game.awayTeam)}
                    </div>
                    <div class="team-score">
                        ${game.awayScore !== null ? game.awayScore : '-'}
                    </div>
                </div>
                
                <div class="vs">@</div>
                
                <div class="team home-team">
                    <div class="team-name">
                        ${nflSchedule.teams[game.homeTeam].name}
                        ${game.winner === game.homeTeam ? '<span class="winner-badge">Winner</span>' : ''}
                    </div>
                    <div class="team-record">
                        ${this.getTeamRecord(game.homeTeam)}
                    </div>
                    <div class="team-score">
                        ${game.homeScore !== null ? game.homeScore : '-'}
                    </div>
                </div>
            </div>
            
            <div class="prediction-section">
                <div class="prediction-controls">
                    <label for="prediction-${game.id}">My Prediction:</label>
                    <select id="prediction-${game.id}" onchange="app.makePrediction(${game.id}, this.value)">
                        <option value="">Select Winner</option>
                        <option value="${game.awayTeam}" ${this.predictions[game.id] === game.awayTeam ? 'selected' : ''}>
                            ${nflSchedule.teams[game.awayTeam].name}
                        </option>
                        <option value="${game.homeTeam}" ${this.predictions[game.id] === game.homeTeam ? 'selected' : ''}>
                            ${nflSchedule.teams[game.homeTeam].name}
                        </option>
                    </select>
                </div>
                ${this.renderPredictionResult(game)}
                ${this.renderPreseasonComparison(game)}
            </div>
        `;

        return gameDiv;
    }

    renderPredictionResult(game) {
        const prediction = this.predictions[game.id];
        
        if (!prediction) {
            return '';
        }

        if (game.status === 'upcoming') {
            return `
                <div class="prediction-result pending">
                    Predicted: ${nflSchedule.teams[prediction].name}
                </div>
            `;
        } else if (game.status === 'final' && game.winner) {
            const isCorrect = prediction === game.winner;
            return `
                <div class="prediction-result ${isCorrect ? 'correct' : 'incorrect'}">
                    Predicted: ${nflSchedule.teams[prediction].name} | 
                    Actual: ${nflSchedule.teams[game.winner].name} | 
                    ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
            `;
        }

        return '';
    }

    renderPreseasonComparison(game) {
        const preseasonFavorite = this.getPreseasonTeamPrediction(game);
        const weeklyPrediction = this.predictions[game.id];
        
        if (!preseasonFavorite && !weeklyPrediction) {
            return '';
        }

        let comparisonText = '';
        let comparisonClass = '';

        if (preseasonFavorite && weeklyPrediction) {
            if (preseasonFavorite === weeklyPrediction) {
                comparisonText = `Preseason & Weekly: Both picked ${nflSchedule.teams[preseasonFavorite].name}`;
                comparisonClass = 'preseason-match';
            } else {
                comparisonText = `Preseason: ${nflSchedule.teams[preseasonFavorite].name} | Weekly: ${nflSchedule.teams[weeklyPrediction].name}`;
                comparisonClass = 'preseason-different';
            }
        } else if (preseasonFavorite) {
            comparisonText = `Preseason pick: ${nflSchedule.teams[preseasonFavorite].name}`;
            comparisonClass = 'preseason-only';
        }

        // If game is final, show how both predictions did
        if (game.status === 'final' && game.winner) {
            const preseasonCorrect = preseasonFavorite === game.winner;
            const weeklyCorrect = weeklyPrediction === game.winner;
            
            let resultText = '';
            if (preseasonFavorite && weeklyPrediction) {
                resultText = ` | Preseason: ${preseasonCorrect ? '✓' : '✗'} | Weekly: ${weeklyCorrect ? '✓' : '✗'}`;
            } else if (preseasonFavorite) {
                resultText = ` | Preseason: ${preseasonCorrect ? '✓' : '✗'}`;
            }
            comparisonText += resultText;
        }

        return comparisonText ? `
            <div class="preseason-comparison ${comparisonClass}">
                ${comparisonText}
            </div>
        ` : '';
    }

    getStatusText(status) {
        switch (status) {
            case 'upcoming': return 'Upcoming';
            case 'live': return 'Live';
            case 'final': return 'Final';
            default: return status;
        }
    }

    getTeamRecord(teamCode) {
        const record = nflSchedule.teams[teamCode].record;
        return `${record.wins}-${record.losses}`;
    }

    makePrediction(gameId, teamCode) {
        if (teamCode) {
            this.predictions[gameId] = teamCode;
        } else {
            delete this.predictions[gameId];
        }
        
        this.savePredictions();
        this.updateStats();
        
        // Re-render only the prediction result for this game
        const game = nflSchedule.games.find(g => g.id === gameId);
        if (game) {
            const gameCard = document.querySelector(`#prediction-${gameId}`).closest('.game-card');
            const predictionSection = gameCard.querySelector('.prediction-section');
            const resultDiv = predictionSection.querySelector('.prediction-result');
            
            if (resultDiv) {
                resultDiv.remove();
            }
            
            const newResultHTML = this.renderPredictionResult(game);
            if (newResultHTML) {
                predictionSection.insertAdjacentHTML('beforeend', newResultHTML);
            }
        }
    }

    updateStats() {
        const totalGames = nflSchedule.games.length;
        const predictionsMade = Object.keys(this.predictions).length;
        
        const finalGames = nflSchedule.games.filter(game => game.status === 'final' && game.winner);
        const correctPredictions = finalGames.filter(game => 
            this.predictions[game.id] === game.winner
        ).length;
        
        const predictedFinalGames = finalGames.filter(game => this.predictions[game.id]);
        const accuracy = predictedFinalGames.length > 0 
            ? Math.round((correctPredictions / predictedFinalGames.length) * 100)
            : 0;

        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('predictions-made').textContent = predictionsMade;
        document.getElementById('correct-predictions').textContent = correctPredictions;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    clearAllPredictions() {
        this.predictions = {};
        this.savePredictions();
        this.renderGames();
        this.updateStats();
    }

    loadPredictions() {
        const saved = localStorage.getItem('nfl-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    savePredictions() {
        localStorage.setItem('nfl-predictions', JSON.stringify(this.predictions));
    }

    // Method to update game results (for testing or manual updates)
    updateGameResult(gameId, homeScore, awayScore) {
        const game = nflSchedule.games.find(g => g.id === gameId);
        if (game) {
            game.homeScore = homeScore;
            game.awayScore = awayScore;
            game.status = 'final';
            game.winner = homeScore > awayScore ? game.homeTeam : game.awayTeam;
            
            // Update team records
            const winningTeam = game.winner;
            const losingTeam = game.winner === game.homeTeam ? game.awayTeam : game.homeTeam;
            
            nflSchedule.teams[winningTeam].record.wins++;
            nflSchedule.teams[losingTeam].record.losses++;
            
            this.renderGames();
            this.updateStats();
        }
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NFLPredictionTracker();
});

// Example function to simulate game results (for testing)
function simulateGameResult(gameId, homeScore, awayScore) {
    if (app) {
        app.updateGameResult(gameId, homeScore, awayScore);
    }
}