class NFLPredictionTracker {
    constructor() {
        this.predictions = this.loadPredictions();
        this.preseasonPredictions = this.loadPreseasonPredictions();
        this.teamRecordPredictions = this.loadTeamRecordPredictions();
        this.filteredGames = [...nflSchedule.games];
        this.bulkPredictions = {};
        this.currentTab = 'weekly';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateFilters();
        this.populatePreseasonDropdowns();
        this.populateResultsFilters();
        this.renderGames();
        this.updateStats();
        this.loadPreseasonUI();
        this.loadTeamRecordUI();
        this.renderComparison();
        this.renderStandings();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Weekly predictions filters
        document.getElementById('week-filter').addEventListener('change', (e) => {
            this.filterGames();
        });

        document.getElementById('team-filter').addEventListener('change', (e) => {
            this.filterGames();
        });

        // Results tab filters
        document.getElementById('results-week-filter').addEventListener('change', (e) => {
            this.renderResults();
        });

        document.getElementById('results-status-filter').addEventListener('change', (e) => {
            this.renderResults();
        });

        // Button event listeners
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

        // Team record prediction event listeners
        Object.keys(nflSchedule.teams).forEach(teamCode => {
            const winsInput = document.getElementById(`record-${teamCode}-wins`);
            const lossesInput = document.getElementById(`record-${teamCode}-losses`);
            
            if (winsInput && lossesInput) {
                winsInput.addEventListener('change', (e) => {
                    this.updateTeamRecordPrediction(teamCode, 'wins', parseInt(e.target.value) || 0);
                    this.validateRecordInputs(teamCode);
                });
                
                lossesInput.addEventListener('change', (e) => {
                    this.updateTeamRecordPrediction(teamCode, 'losses', parseInt(e.target.value) || 0);
                    this.validateRecordInputs(teamCode);
                });
            }
        });

        // Export buttons
        document.getElementById('export-predictions-csv').addEventListener('click', () => {
            this.exportPredictionsToCSV();
        });

        document.getElementById('export-preseason-csv').addEventListener('click', () => {
            this.exportPreseasonToCSV();
        });

        // Standings comparison button
        document.getElementById('view-standings-comparison').addEventListener('click', () => {
            this.renderStandingsComparison();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bulk-prediction-modal');
            if (e.target === modal) {
                this.closeBulkPredictionModal();
            }
        });
    }

    populateFilters() {
        const weekFilter = document.getElementById('week-filter');
        const weeks = getWeeksList();
        weeks.forEach(week => {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = getWeekDisplayName(week);
            weekFilter.appendChild(option);
        });

        const teamFilter = document.getElementById('team-filter');
        const teams = getTeamList();
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.code;
            option.textContent = team.name;
            teamFilter.appendChild(option);
        });
    }

    populateResultsFilters() {
        const resultsWeekFilter = document.getElementById('results-week-filter');
        const weeks = getWeeksList();
        weeks.forEach(week => {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = `Week ${week}`;
            resultsWeekFilter.appendChild(option);
        });
    }

    renderResults() {
        const weekFilter = document.getElementById('results-week-filter').value;
        const statusFilter = document.getElementById('results-status-filter').value;
        
        let filteredGames = nflSchedule.games.filter(game => {
            const weekMatch = !weekFilter || game.week == weekFilter;
            const statusMatch = !statusFilter || game.status === statusFilter;
            return weekMatch && statusMatch;
        });

        const resultsContainer = document.getElementById('results-list');
        resultsContainer.innerHTML = '';

        if (filteredGames.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #666;">No games match the selected filters.</p>';
            return;
        }

        filteredGames.forEach(game => {
            const gameElement = this.createResultsGameElement(game);
            resultsContainer.appendChild(gameElement);
        });
    }

    createResultsGameElement(game) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'results-game-card';
        
        const myPrediction = this.predictions[game.id];
        const predictionResult = this.getPredictionResultText(game, myPrediction);
        
        gameDiv.innerHTML = `
            <div class="game-header">
                <div class="game-info">
                    <span class="week-badge">Week ${game.week}</span>
                    <span>${game.date}</span>
                    <span>${game.time}</span>
                </div>
                <div class="game-status status-${game.status}">
                    ${this.getStatusText(game.status)}
                </div>
            </div>
            
            <div class="teams-container">
                <div class="team away-team ${game.winner === game.awayTeam ? 'winner' : ''}">
                    <div class="team-name">
                        ${nflSchedule.teams[game.awayTeam].name}
                        ${game.winner === game.awayTeam ? '<span class="winner-badge">W</span>' : ''}
                    </div>
                    <div class="team-score">
                        ${game.awayScore !== null ? game.awayScore : '-'}
                    </div>
                </div>
                
                <div class="vs">@</div>
                
                <div class="team home-team ${game.winner === game.homeTeam ? 'winner' : ''}">
                    <div class="team-name">
                        ${nflSchedule.teams[game.homeTeam].name}
                        ${game.winner === game.homeTeam ? '<span class="winner-badge">W</span>' : ''}
                    </div>
                    <div class="team-score">
                        ${game.homeScore !== null ? game.homeScore : '-'}
                    </div>
                </div>
            </div>
            
            ${predictionResult ? `<div class="prediction-result-summary">${predictionResult}</div>` : ''}
        `;

        return gameDiv;
    }

    getPredictionResultText(game, prediction) {
        if (!prediction) {
            return '';
        }

        if (game.status === 'upcoming') {
            return `<span class="prediction-pending">Predicted: ${nflSchedule.teams[prediction].name}</span>`;
        } else if (game.status === 'final' && game.winner) {
            const isCorrect = prediction === game.winner;
            return `<span class="prediction-${isCorrect ? 'correct' : 'incorrect'}">
                Predicted: ${nflSchedule.teams[prediction].name} | 
                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </span>`;
        }

        return '';
    }

    getStatusText(status) {
        switch(status) {
            case 'upcoming': return 'Upcoming';
            case 'live': return 'Live';
            case 'final': return 'Final';
            default: return status;
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        if (tab === 'comparison') {
            this.renderComparison();
        } else if (tab === 'results') {
            this.renderResults();
        } else if (tab === 'standings') {
            this.renderStandings();
        }
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

        if (this.filteredGames.length === 0) {
            gamesContainer.innerHTML = '<p style="text-align: center; color: #666;">No games match the selected filters.</p>';
            return;
        }

        this.filteredGames.forEach(game => {
            const gameElement = this.createGameElement(game);
            gamesContainer.appendChild(gameElement);
        });
    }

    createGameElement(game) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-card';
        
        const myPrediction = this.predictions[game.id];
        const predictionResult = this.getPredictionResult(game, myPrediction);
        
        gameDiv.innerHTML = `
            <div class="game-header">
                <div class="game-info">
                    <span class="week-info">Week ${game.week}</span>
                    <span>${game.date}</span>
                    <span>${game.time}</span>
                </div>
                <div class="game-status status-${game.status}">
                    ${this.getStatusText(game.status)}
                </div>
            </div>
            
            <div class="teams-container">
                <div class="team away-team">
                    <div class="team-name">${nflSchedule.teams[game.awayTeam].name}</div>
                    <div class="team-record">(${nflSchedule.teams[game.awayTeam].record.wins}-${nflSchedule.teams[game.awayTeam].record.losses})</div>
                    <div class="team-score">${game.awayScore !== null ? game.awayScore : '-'}</div>
                    ${game.winner === game.awayTeam ? '<span class="winner-badge">W</span>' : ''}
                </div>
                
                <div class="vs">@</div>
                
                <div class="team home-team">
                    <div class="team-name">${nflSchedule.teams[game.homeTeam].name}</div>
                    <div class="team-record">(${nflSchedule.teams[game.homeTeam].record.wins}-${nflSchedule.teams[game.homeTeam].record.losses})</div>
                    <div class="team-score">${game.homeScore !== null ? game.homeScore : '-'}</div>
                    ${game.winner === game.homeTeam ? '<span class="winner-badge">W</span>' : ''}
                </div>
            </div>
            
            <div class="prediction-section">
                <div class="prediction-controls">
                    <label for="prediction-${game.id}">Your Prediction:</label>
                    <select id="prediction-${game.id}" onchange="app.makePrediction(${game.id}, this.value)">
                        <option value="">Select Winner</option>
                        <option value="${game.awayTeam}" ${myPrediction === game.awayTeam ? 'selected' : ''}>
                            ${nflSchedule.teams[game.awayTeam].name}
                        </option>
                        <option value="${game.homeTeam}" ${myPrediction === game.homeTeam ? 'selected' : ''}>
                            ${nflSchedule.teams[game.homeTeam].name}
                        </option>
                    </select>
                </div>
                ${predictionResult ? `<div class="prediction-result ${predictionResult.class}">${predictionResult.text}</div>` : ''}
            </div>
        `;

        return gameDiv;
    }

    getPredictionResult(game, prediction) {
        if (!prediction) return null;

        if (game.status === 'upcoming') {
            return {
                class: 'pending',
                text: `You predicted: ${nflSchedule.teams[prediction].name}`
            };
        } else if (game.status === 'final' && game.winner) {
            const isCorrect = prediction === game.winner;
            return {
                class: isCorrect ? 'correct' : 'incorrect',
                text: `You predicted: ${nflSchedule.teams[prediction].name} - ${isCorrect ? 'Correct!' : 'Incorrect'}`
            };
        }

        return null;
    }

    makePrediction(gameId, teamCode) {
        if (teamCode) {
            this.predictions[gameId] = teamCode;
        } else {
            delete this.predictions[gameId];
        }
        this.savePredictions();
        this.updateStats();
    }

    // Storage methods
    loadPredictions() {
        const saved = localStorage.getItem('nfl-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    savePredictions() {
        localStorage.setItem('nfl-predictions', JSON.stringify(this.predictions));
    }

    loadPreseasonPredictions() {
        const saved = localStorage.getItem('nfl-preseason-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    savePreseasonPredictionsToStorage() {
        localStorage.setItem('nfl-preseason-predictions', JSON.stringify(this.preseasonPredictions));
    }

    loadTeamRecordPredictions() {
        const saved = localStorage.getItem('nfl-team-record-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    saveTeamRecordPredictions() {
        localStorage.setItem('nfl-team-record-predictions', JSON.stringify(this.teamRecordPredictions));
    }

    clearAllPredictions() {
        this.predictions = {};
        this.savePredictions();
        this.updateStats();
        this.renderGames();
    }

    updateStats() {
        const totalGames = nflSchedule.games.length;
        const predictionsMade = Object.keys(this.predictions).length;
        
        let correctPredictions = 0;
        let completedGames = 0;

        nflSchedule.games.forEach(game => {
            if (game.status === 'final' && game.winner) {
                completedGames++;
                if (this.predictions[game.id] === game.winner) {
                    correctPredictions++;
                }
            }
        });

        const accuracy = completedGames > 0 ? ((correctPredictions / completedGames) * 100).toFixed(1) : '0.0';

        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('predictions-made').textContent = predictionsMade;
        document.getElementById('correct-predictions').textContent = correctPredictions;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    // Bulk prediction methods
    showBulkPredictionModal() {
        const weekFilter = document.getElementById('week-filter');
        const selectedWeek = weekFilter.value;
        
        if (!selectedWeek) {
            alert('Please select a week first to make bulk predictions.');
            return;
        }

        document.getElementById('modal-week-number').textContent = selectedWeek;
        this.populateWeekGames(parseInt(selectedWeek));
        document.getElementById('bulk-prediction-modal').style.display = 'block';
    }

    closeBulkPredictionModal() {
        document.getElementById('bulk-prediction-modal').style.display = 'none';
        this.bulkPredictions = {};
    }

    populateWeekGames(week) {
        const weekGames = nflSchedule.games.filter(game => game.week === week);
        const container = document.getElementById('week-games-list');
        container.innerHTML = '';

        weekGames.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'bulk-game-item';
            gameDiv.innerHTML = `
                <div class="bulk-game-teams">
                    <span class="away-team">${nflSchedule.teams[game.awayTeam].name}</span>
                    <span class="vs">@</span>
                    <span class="home-team">${nflSchedule.teams[game.homeTeam].name}</span>
                </div>
                <div class="bulk-prediction">
                    <select id="bulk-prediction-${game.id}" onchange="app.setBulkPrediction(${game.id}, this.value)">
                        <option value="">Select Winner</option>
                        <option value="${game.awayTeam}" ${this.predictions[game.id] === game.awayTeam ? 'selected' : ''}>
                            ${nflSchedule.teams[game.awayTeam].name}
                        </option>
                        <option value="${game.homeTeam}" ${this.predictions[game.id] === game.homeTeam ? 'selected' : ''}>
                            ${nflSchedule.teams[game.homeTeam].name}
                        </option>
                    </select>
                </div>
            `;
            container.appendChild(gameDiv);
            
            if (this.predictions[game.id]) {
                this.bulkPredictions[game.id] = this.predictions[game.id];
            }
        });
    }

    setBulkPrediction(gameId, teamCode) {
        if (teamCode) {
            this.bulkPredictions[gameId] = teamCode;
        } else {
            delete this.bulkPredictions[gameId];
        }
    }

    saveWeekPredictions() {
        Object.assign(this.predictions, this.bulkPredictions);
        this.savePredictions();
        this.updateStats();
        this.renderGames();
        this.closeBulkPredictionModal();
        
        const weekCount = Object.keys(this.bulkPredictions).length;
        alert(`Successfully saved ${weekCount} predictions!`);
    }

    // Team record prediction methods
    updateTeamRecordPrediction(teamCode, type, value) {
        if (!this.teamRecordPredictions[teamCode]) {
            this.teamRecordPredictions[teamCode] = { wins: 0, losses: 0 };
        }
        
        this.teamRecordPredictions[teamCode][type] = value;
        this.saveTeamRecordPredictions();
    }

    validateRecordInputs(teamCode) {
        const winsInput = document.getElementById(`record-${teamCode}-wins`);
        const lossesInput = document.getElementById(`record-${teamCode}-losses`);
        
        if (!winsInput || !lossesInput) return;
        
        const wins = parseInt(winsInput.value) || 0;
        const losses = parseInt(lossesInput.value) || 0;
        const total = wins + losses;
        
        winsInput.style.borderColor = '';
        lossesInput.style.borderColor = '';
        
        if (total > 17) {
            winsInput.style.borderColor = '#dc3545';
            lossesInput.style.borderColor = '#dc3545';
            winsInput.title = 'Total games cannot exceed 17';
            lossesInput.title = 'Total games cannot exceed 17';
        } else if (total === 17) {
            winsInput.style.borderColor = '#28a745';
            lossesInput.style.borderColor = '#28a745';
            winsInput.title = 'Record complete (17 games)';
            lossesInput.title = 'Record complete (17 games)';
        } else if (total > 0) {
            winsInput.style.borderColor = '#ffc107';
            lossesInput.style.borderColor = '#ffc107';
            winsInput.title = `${17 - total} games remaining`;
            lossesInput.title = `${17 - total} games remaining`;
        }
    }

    loadTeamRecordUI() {
        Object.entries(this.teamRecordPredictions).forEach(([teamCode, record]) => {
            const winsInput = document.getElementById(`record-${teamCode}-wins`);
            const lossesInput = document.getElementById(`record-${teamCode}-losses`);
            
            if (winsInput && lossesInput) {
                winsInput.value = record.wins || '';
                lossesInput.value = record.losses || '';
                this.validateRecordInputs(teamCode);
            }
        });
    }

    // Pre-season prediction methods
    populatePreseasonDropdowns() {
        const afcTeams = ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN'];
        const nfcTeams = ['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LAR', 'MIN', 'NO', 'NYG', 'PHI', 'SF', 'SEA', 'TB', 'WAS'];

        this.populateTeamDropdown('preseason-afc-wildcard-1', afcTeams);
        this.populateTeamDropdown('preseason-afc-wildcard-2', afcTeams);
        this.populateTeamDropdown('preseason-afc-wildcard-3', afcTeams);
        this.populateTeamDropdown('preseason-nfc-wildcard-1', nfcTeams);
        this.populateTeamDropdown('preseason-nfc-wildcard-2', nfcTeams);
        this.populateTeamDropdown('preseason-nfc-wildcard-3', nfcTeams);

        this.populateTeamDropdown('preseason-afc-champion', afcTeams);
        this.populateTeamDropdown('preseason-nfc-champion', nfcTeams);
        this.populateTeamDropdown('preseason-super-bowl-champion', [...afcTeams, ...nfcTeams]);
    }

    populateTeamDropdown(elementId, teams) {
        const select = document.getElementById(elementId);
        if (!select) return;
        
        teams.forEach(teamCode => {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = nflSchedule.teams[teamCode].name;
            select.appendChild(option);
        });
    }

    savePreseasonPredictions() {
        const predictions = {
            divisionWinners: {
                'afc-east': document.getElementById('preseason-afc-east-winner')?.value || '',
                'afc-north': document.getElementById('preseason-afc-north-winner')?.value || '',
                'afc-south': document.getElementById('preseason-afc-south-winner')?.value || '',
                'afc-west': document.getElementById('preseason-afc-west-winner')?.value || '',
                'nfc-east': document.getElementById('preseason-nfc-east-winner')?.value || '',
                'nfc-north': document.getElementById('preseason-nfc-north-winner')?.value || '',
                'nfc-south': document.getElementById('preseason-nfc-south-winner')?.value || '',
                'nfc-west': document.getElementById('preseason-nfc-west-winner')?.value || ''
            },
            wildCards: {
                'afc-1': document.getElementById('preseason-afc-wildcard-1')?.value || '',
                'afc-2': document.getElementById('preseason-afc-wildcard-2')?.value || '',
                'afc-3': document.getElementById('preseason-afc-wildcard-3')?.value || '',
                'nfc-1': document.getElementById('preseason-nfc-wildcard-1')?.value || '',
                'nfc-2': document.getElementById('preseason-nfc-wildcard-2')?.value || '',
                'nfc-3': document.getElementById('preseason-nfc-wildcard-3')?.value || ''
            },
            championships: {
                'afc-champion': document.getElementById('preseason-afc-champion')?.value || '',
                'nfc-champion': document.getElementById('preseason-nfc-champion')?.value || '',
                'super-bowl': document.getElementById('preseason-super-bowl-champion')?.value || ''
            },
            teamRecords: { ...this.teamRecordPredictions },
            timestamp: new Date().toISOString()
        };

        this.preseasonPredictions = predictions;
        this.savePreseasonPredictionsToStorage();
        alert('Pre-season predictions saved successfully!');
        this.renderComparison();
    }

    loadPreseasonUI() {
        if (!this.preseasonPredictions.divisionWinners) return;

        Object.entries(this.preseasonPredictions.divisionWinners).forEach(([division, team]) => {
            const select = document.getElementById(`preseason-${division}-winner`);
            if (select && team) {
                select.value = team;
            }
        });

        if (this.preseasonPredictions.wildCards) {
            Object.entries(this.preseasonPredictions.wildCards).forEach(([slot, team]) => {
                const select = document.getElementById(`preseason-${slot.replace('-', '-wildcard-')}`);
                if (select && team) {
                    select.value = team;
                }
            });
        }

        if (this.preseasonPredictions.championships) {
            Object.entries(this.preseasonPredictions.championships).forEach(([type, team]) => {
                const select = document.getElementById(`preseason-${type.replace('super-bowl', 'super-bowl-champion')}`);
                if (select && team) {
                    select.value = team;
                }
            });
        }
    }

    clearPreseasonPredictions() {
        this.preseasonPredictions = {};
        this.teamRecordPredictions = {};
        localStorage.removeItem('nfl-preseason-predictions');
        localStorage.removeItem('nfl-team-record-predictions');
        
        document.querySelectorAll('#preseason-tab select').forEach(select => {
            select.value = '';
        });
        
        Object.keys(nflSchedule.teams).forEach(teamCode => {
            const winsInput = document.getElementById(`record-${teamCode}-wins`);
            const lossesInput = document.getElementById(`record-${teamCode}-losses`);
            
            if (winsInput && lossesInput) {
                winsInput.value = '';
                lossesInput.value = '';
                winsInput.style.borderColor = '';
                lossesInput.style.borderColor = '';
            }
        });
        
        this.renderComparison();
    }

    // Export methods
    exportPredictionsToCSV() {
        let csv = 'Week,Date,Away Team,Home Team,Prediction,Actual Winner,Correct\n';
        
        nflSchedule.games.forEach(game => {
            const prediction = this.predictions[game.id];
            const predictionName = prediction ? nflSchedule.teams[prediction].name : '';
            const winnerName = game.winner ? nflSchedule.teams[game.winner].name : '';
            const correct = prediction && game.winner ? (prediction === game.winner ? 'Yes' : 'No') : '';
            
            csv += `${game.week},"${game.date}","${nflSchedule.teams[game.awayTeam].name}","${nflSchedule.teams[game.homeTeam].name}","${predictionName}","${winnerName}","${correct}"\n`;
        });

        this.downloadCSV(csv, 'nfl-predictions.csv');
    }

    exportPreseasonToCSV() {
        let csv = 'Category,Prediction\n';
        
        if (this.preseasonPredictions.divisionWinners) {
            Object.entries(this.preseasonPredictions.divisionWinners).forEach(([division, team]) => {
                if (team) {
                    csv += `"${division.toUpperCase()} Winner","${nflSchedule.teams[team].name}"\n`;
                }
            });
        }

        if (this.teamRecordPredictions) {
            Object.entries(this.teamRecordPredictions).forEach(([teamCode, record]) => {
                if (record.wins || record.losses) {
                    csv += `"${nflSchedule.teams[teamCode].name} Record","${record.wins || 0}-${record.losses || 0}"\n`;
                }
            });
        }

        this.downloadCSV(csv, 'nfl-preseason-predictions.csv');
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Rendering methods
    renderStandings() {
        const teamRecords = this.calculateTeamRecords();
        
        this.renderDivisionStandings('AFC East', ['BUF', 'MIA', 'NE', 'NYJ'], teamRecords, 'afc-east-standings');
        this.renderDivisionStandings('AFC North', ['BAL', 'CIN', 'CLE', 'PIT'], teamRecords, 'afc-north-standings');
        this.renderDivisionStandings('AFC South', ['HOU', 'IND', 'JAX', 'TEN'], teamRecords, 'afc-south-standings');
        this.renderDivisionStandings('AFC West', ['DEN', 'KC', 'LV', 'LAC'], teamRecords, 'afc-west-standings');
        
        this.renderDivisionStandings('NFC East', ['DAL', 'NYG', 'PHI', 'WAS'], teamRecords, 'nfc-east-standings');
        this.renderDivisionStandings('NFC North', ['CHI', 'DET', 'GB', 'MIN'], teamRecords, 'nfc-north-standings');
        this.renderDivisionStandings('NFC South', ['ATL', 'CAR', 'NO', 'TB'], teamRecords, 'nfc-south-standings');
        this.renderDivisionStandings('NFC West', ['ARI', 'LAR', 'SF', 'SEA'], teamRecords, 'nfc-west-standings');
    }

    renderDivisionStandings(divisionName, teamCodes, teamRecords, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const sortedTeams = teamCodes.sort((a, b) => {
            const recordA = teamRecords[a] || { wins: 0, losses: 0 };
            const recordB = teamRecords[b] || { wins: 0, losses: 0 };
            
            if (recordA.wins !== recordB.wins) {
                return recordB.wins - recordA.wins;
            }
            return recordA.losses - recordB.losses;
        });

        let standingsHTML = `
            <div class="standings-header">
                <div class="team-column">Team</div>
                <div class="record-column">W</div>
                <div class="record-column">L</div>
                <div class="record-column">PCT</div>
            </div>
        `;

        sortedTeams.forEach((teamCode, index) => {
            const record = teamRecords[teamCode] || { wins: 0, losses: 0 };
            const totalGames = record.wins + record.losses;
            const winPercentage = totalGames > 0 ? (record.wins / totalGames).toFixed(3) : '.000';
            
            const positionClass = index === 0 ? 'division-leader' : '';
            
            standingsHTML += `
                <div class="standings-row ${positionClass}">
                    <div class="team-column">
                        <span class="team-rank">${index + 1}.</span>
                        <span class="team-name">${nflSchedule.teams[teamCode].name}</span>
                    </div>
                    <div class="record-column">${record.wins}</div>
                    <div class="record-column">${record.losses}</div>
                    <div class="record-column">${winPercentage}</div>
                </div>
            `;
        });

        container.innerHTML = standingsHTML;
    }

    calculateTeamRecords() {
        const records = {};
        
        Object.keys(nflSchedule.teams).forEach(teamCode => {
            records[teamCode] = { wins: 0, losses: 0 };
        });

        nflSchedule.games.forEach(game => {
            if (game.status === 'final' && game.winner) {
                if (records[game.winner]) {
                    records[game.winner].wins++;
                }
                
                const loser = game.winner === game.homeTeam ? game.awayTeam : game.homeTeam;
                if (records[loser]) {
                    records[loser].losses++;
                }
            }
        });

        return records;
    }

    renderComparison() {
        const container = document.getElementById('comparison-content');
        if (!container) return;

        container.innerHTML = '<p>Comparison feature coming soon...</p>';
    }

    renderStandingsComparison() {
        this.switchTab('standings-comparison');
        // Implementation coming soon
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NFLPredictionTracker();
});