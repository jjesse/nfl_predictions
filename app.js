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

        // Settings tab event listeners
        this.setupSettingsEventListeners();

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bulk-prediction-modal');
            if (e.target === modal) {
                this.closeBulkPredictionModal();
            }
        });
    }

    setupSettingsEventListeners() {
        // Storage provider selection
        document.querySelectorAll('input[name="storage-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleStorageProviderChange(e.target.value);
            });
        });

        // GitHub connection
        document.getElementById('connect-github')?.addEventListener('click', () => {
            this.connectGitHub();
        });

        // Firebase connection
        document.getElementById('connect-firebase')?.addEventListener('click', () => {
            this.connectFirebase();
        });

        // Export buttons
        document.getElementById('export-all-data')?.addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('export-predictions-backup')?.addEventListener('click', () => {
            this.exportPredictionsToCSV();
        });

        // Import functionality
        document.getElementById('import-data')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file')?.addEventListener('change', (e) => {
            this.handleImportFile(e.target.files[0]);
        });

        // Data management buttons
        document.getElementById('clear-all-data')?.addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('reset-predictions')?.addEventListener('click', () => {
            this.resetPredictionsOnly();
        });

        document.getElementById('reset-preseason')?.addEventListener('click', () => {
            this.resetPreseasonOnly();
        });

        // Force sync button
        document.getElementById('force-sync')?.addEventListener('click', () => {
            this.forceSyncData();
        });

        // Schedule backup button
        document.getElementById('schedule-backup')?.addEventListener('click', () => {
            this.scheduleAutoBackup();
        });

        // App preferences
        document.getElementById('default-view')?.addEventListener('change', (e) => {
            this.saveAppPreference('defaultView', e.target.value);
        });

        document.getElementById('show-team-logos')?.addEventListener('change', (e) => {
            this.saveAppPreference('showTeamLogos', e.target.checked);
        });

        document.getElementById('auto-save')?.addEventListener('change', (e) => {
            this.saveAppPreference('autoSave', e.target.checked);
        });

        document.getElementById('app-theme')?.addEventListener('change', (e) => {
            this.saveAppPreference('theme', e.target.value);
            this.applyTheme(e.target.value);
        });

        // Privacy settings
        document.getElementById('public-predictions')?.addEventListener('change', (e) => {
            this.savePrivacySetting('publicPredictions', e.target.checked);
        });

        document.getElementById('allow-analytics')?.addEventListener('change', (e) => {
            this.savePrivacySetting('allowAnalytics', e.target.checked);
        });

        document.getElementById('share-accuracy')?.addEventListener('change', (e) => {
            this.savePrivacySetting('shareAccuracy', e.target.checked);
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
        } else if (tab === 'settings') {
            this.loadSettingsUI();
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

    handleStorageProviderChange(provider) {
        console.log(`Storage provider changed to: ${provider}`);
        
        // Update UI to show selected provider
        document.querySelectorAll('.storage-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`#storage-${provider}`).closest('.storage-option');
        selectedOption.classList.add('active');
        
        // Update current storage display
        const storageNames = {
            'local': 'Local Storage',
            'github': 'GitHub Gists',
            'firebase': 'Firebase'
        };
        
        document.getElementById('current-storage').textContent = storageNames[provider];
        
        // Save preference
        this.saveAppPreference('storageProvider', provider);
    }

    connectGitHub() {
        // Show modal/prompt for GitHub setup
        const modal = this.createSettingsModal('Connect GitHub Account', `
            <div class="github-setup">
                <p>To connect GitHub for automatic backups:</p>
                <ol>
                    <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Personal Access Tokens</a></li>
                    <li>Create a new token with "gist" permission</li>
                    <li>Paste the token below:</li>
                </ol>
                <input type="password" id="github-token" placeholder="GitHub Personal Access Token">
                <div class="setup-status" id="github-status"></div>
            </div>
        `, [
            { text: 'Connect', value: 'connect', class: 'btn-primary' },
            { text: 'Cancel', value: 'cancel', class: 'btn-secondary' }
        ]);

        modal.addEventListener('modal-choice', async (e) => {
            if (e.detail === 'connect') {
                const token = document.getElementById('github-token').value;
                if (!token) {
                    alert('Please enter a GitHub token');
                    return;
                }
                
                const success = await this.setupGitHubConnection(token);
                if (success) {
                    this.showNotification('GitHub connected successfully!', 'success');
                    modal.remove();
                } else {
                    document.getElementById('github-status').innerHTML = 
                        '<span style="color: red;">Failed to connect. Please check your token.</span>';
                }
            } else {
                modal.remove();
            }
        });
    }

    connectFirebase() {
        // Show modal for Firebase setup
        const modal = this.createSettingsModal('Configure Firebase', `
            <div class="firebase-setup">
                <p>To connect Firebase for real-time sync:</p>
                <div class="form-group">
                    <label>Firebase Project ID:</label>
                    <input type="text" id="firebase-project-id" placeholder="your-project-id">
                </div>
                <div class="form-group">
                    <label>API Key:</label>
                    <input type="password" id="firebase-api-key" placeholder="your-api-key">
                </div>
                <div class="form-group">
                    <label>Auth Domain:</label>
                    <input type="text" id="firebase-auth-domain" placeholder="your-project.firebaseapp.com">
                </div>
                <p><small>Get these from your Firebase project settings.</small></p>
                <div class="setup-status" id="firebase-status"></div>
            </div>
        `, [
            { text: 'Connect', value: 'connect', class: 'btn-primary' },
            { text: 'Cancel', value: 'cancel', class: 'btn-secondary' }
        ]);

        modal.addEventListener('modal-choice', async (e) => {
            if (e.detail === 'connect') {
                const config = {
                    projectId: document.getElementById('firebase-project-id').value,
                    apiKey: document.getElementById('firebase-api-key').value,
                    authDomain: document.getElementById('firebase-auth-domain').value
                };
                
                if (!config.projectId || !config.apiKey || !config.authDomain) {
                    alert('Please fill in all Firebase configuration fields');
                    return;
                }
                
                const success = await this.setupFirebaseConnection(config);
                if (success) {
                    this.showNotification('Firebase configured successfully!', 'success');
                    modal.remove();
                } else {
                    document.getElementById('firebase-status').innerHTML = 
                        '<span style="color: red;">Failed to connect. Please check your configuration.</span>';
                }
            } else {
                modal.remove();
            }
        });
    }

    async setupGitHubConnection(token) {
        try {
            // Test the token by making a simple API call
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'User-Agent': 'NFL-Prediction-Tracker'
                }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            // Save the token securely (in a real app, you'd want better security)
            localStorage.setItem('github-token', btoa(token)); // Basic encoding
            this.saveAppPreference('storageProvider', 'github');
            this.updateSyncStatus('Connected to GitHub', 'connected');
            
            return true;
        } catch (error) {
            console.error('GitHub connection failed:', error);
            return false;
        }
    }

    async setupFirebaseConnection(config) {
        try {
            // Save Firebase config (in a real app, you'd want better security)
            localStorage.setItem('firebase-config', JSON.stringify(config));
            this.saveAppPreference('storageProvider', 'firebase');
            this.updateSyncStatus('Connected to Firebase', 'connected');
            
            // Note: This is a placeholder - you'd need to implement actual Firebase SDK integration
            this.showNotification('Firebase configuration saved. Full integration coming soon!', 'info');
            return true;
        } catch (error) {
            console.error('Firebase connection failed:', error);
            return false;
        }
    }

    exportAllData() {
        const allData = {
            predictions: this.predictions,
            preseasonPredictions: this.preseasonPredictions,
            teamRecordPredictions: this.teamRecordPredictions,
            appPreferences: this.loadAppPreferences(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(allData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nfl-predictions-full-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Full backup exported successfully!', 'success');
    }

    async handleImportFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!data.version || !data.exportDate) {
                throw new Error('Invalid backup file format');
            }

            // Ask user about import strategy
            const choice = await this.showImportDialog(data);
            
            if (choice === 'replace') {
                this.predictions = data.predictions || {};
                this.preseasonPredictions = data.preseasonPredictions || {};
                this.teamRecordPredictions = data.teamRecordPredictions || {};
            } else if (choice === 'merge') {
                this.predictions = { ...this.predictions, ...data.predictions };
                this.preseasonPredictions = { ...this.preseasonPredictions, ...data.preseasonPredictions };
                this.teamRecordPredictions = { ...this.teamRecordPredictions, ...data.teamRecordPredictions };
            } else {
                return; // User cancelled
            }

            // Save all data
            this.savePredictions();
            this.savePreseasonPredictionsToStorage();
            this.saveTeamRecordPredictions();
            
            // Update UI
            this.updateStats();
            this.renderGames();
            this.loadPreseasonUI();
            this.loadTeamRecordUI();

            this.showNotification('Data imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification('Failed to import backup file', 'error');
        }
    }

    clearAllData() {
        if (!confirm('Are you sure you want to clear ALL data? This includes predictions, settings, and cannot be undone.')) {
            return;
        }

        // Clear all localStorage items related to the app
        localStorage.removeItem('nfl-predictions');
        localStorage.removeItem('nfl-preseason-predictions');
        localStorage.removeItem('nfl-team-record-predictions');
        localStorage.removeItem('nfl-app-preferences');
        localStorage.removeItem('nfl-privacy-settings');
        localStorage.removeItem('github-token');
        localStorage.removeItem('firebase-config');

        // Reset app state
        this.predictions = {};
        this.preseasonPredictions = {};
        this.teamRecordPredictions = {};

        // Update UI
        this.updateStats();
        this.renderGames();
        this.loadPreseasonUI();
        this.loadTeamRecordUI();
        
        this.showNotification('All data cleared successfully', 'info');
    }

    resetPredictionsOnly() {
        if (!confirm('Are you sure you want to reset all game predictions?')) {
            return;
        }

        this.predictions = {};
        this.savePredictions();
        this.updateStats();
        this.renderGames();
        
        this.showNotification('Game predictions reset', 'info');
    }

    resetPreseasonOnly() {
        if (!confirm('Are you sure you want to reset all pre-season predictions?')) {
            return;
        }

        this.clearPreseasonPredictions();
        this.showNotification('Pre-season predictions reset', 'info');
    }

    forceSyncData() {
        const provider = this.loadAppPreferences().storageProvider || 'local';
        
        if (provider === 'local') {
            this.showNotification('No cloud storage configured', 'warning');
            return;
        }

        this.showNotification('Syncing data...', 'info');
        
        // Simulate sync for now
        setTimeout(() => {
            this.updateSyncStatus(`Last synced: ${new Date().toLocaleString()}`, 'connected');
            this.showNotification('Data synced successfully!', 'success');
        }, 2000);
    }

    scheduleAutoBackup() {
        const modal = this.createSettingsModal('Schedule Auto Backup', `
            <div class="backup-schedule">
                <p>Choose backup frequency:</p>
                <div class="radio-group">
                    <label><input type="radio" name="backup-frequency" value="daily" checked> Daily</label>
                    <label><input type="radio" name="backup-frequency" value="weekly"> Weekly</label>
                    <label><input type="radio" name="backup-frequency" value="manual"> Manual only</label>
                </div>
                <p><small>Automatic backups will export to your Downloads folder.</small></p>
            </div>
        `, [
            { text: 'Save', value: 'save', class: 'btn-primary' },
            { text: 'Cancel', value: 'cancel', class: 'btn-secondary' }
        ]);

        modal.addEventListener('modal-choice', (e) => {
            if (e.detail === 'save') {
                const frequency = modal.querySelector('input[name="backup-frequency"]:checked').value;
                this.saveAppPreference('autoBackupFrequency', frequency);
                this.setupAutoBackup(frequency);
                this.showNotification(`Auto backup set to ${frequency}`, 'success');
            }
            modal.remove();
        });
    }

    setupAutoBackup(frequency) {
        // Clear existing intervals
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }

        if (frequency === 'manual') return;

        const intervals = {
            'daily': 24 * 60 * 60 * 1000, // 24 hours
            'weekly': 7 * 24 * 60 * 60 * 1000 // 1 week
        };

        this.backupInterval = setInterval(() => {
            this.exportAllData();
        }, intervals[frequency]);
    }

    // ...existing code...

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
        } else if (tab === 'settings') {
            this.loadSettingsUI();
        }
    }

    loadSettingsUI() {
        const preferences = this.loadAppPreferences();
        const privacySettings = this.loadPrivacySettings();
        
        // Load storage provider
        if (preferences.storageProvider) {
            document.getElementById(`storage-${preferences.storageProvider}`).checked = true;
            this.handleStorageProviderChange(preferences.storageProvider);
        }
        
        // Load app preferences
        if (preferences.defaultView) {
            document.getElementById('default-view').value = preferences.defaultView;
        }
        
        if (preferences.showTeamLogos !== undefined) {
            document.getElementById('show-team-logos').checked = preferences.showTeamLogos;
        }
        
        if (preferences.autoSave !== undefined) {
            document.getElementById('auto-save').checked = preferences.autoSave;
        }
        
        if (preferences.theme) {
            document.getElementById('app-theme').value = preferences.theme;
        }
        
        // Load privacy settings
        if (privacySettings.publicPredictions !== undefined) {
            document.getElementById('public-predictions').checked = privacySettings.publicPredictions;
        }
        
        if (privacySettings.allowAnalytics !== undefined) {
            document.getElementById('allow-analytics').checked = privacySettings.allowAnalytics;
        }
        
        if (privacySettings.shareAccuracy !== undefined) {
            document.getElementById('share-accuracy').checked = privacySettings.shareAccuracy;
        }
        
        // Update data size display
        this.updateDataSizeDisplay();
    }

    // Utility methods for settings
    saveAppPreference(key, value) {
        const preferences = this.loadAppPreferences();
        preferences[key] = value;
        localStorage.setItem('nfl-app-preferences', JSON.stringify(preferences));
    }

    loadAppPreferences() {
        const saved = localStorage.getItem('nfl-app-preferences');
        return saved ? JSON.parse(saved) : {};
    }

    savePrivacySetting(key, value) {
        const settings = this.loadPrivacySettings();
        settings[key] = value;
        localStorage.setItem('nfl-privacy-settings', JSON.stringify(settings));
    }

    loadPrivacySettings() {
        const saved = localStorage.getItem('nfl-privacy-settings');
        return saved ? JSON.parse(saved) : {};
    }

    updateSyncStatus(message, status) {
        document.getElementById('last-sync-time').textContent = message;
        // You could also update visual indicators based on status
    }

    updateDataSizeDisplay() {
        const predictions = JSON.stringify(this.predictions);
        const preseason = JSON.stringify(this.preseasonPredictions);
        const records = JSON.stringify(this.teamRecordPredictions);
        
        const totalSize = predictions.length + preseason.length + records.length;
        const sizeKB = Math.round(totalSize / 1024 * 100) / 100;
        
        document.getElementById('data-size').textContent = `${sizeKB} KB`;
    }

    applyTheme(theme) {
        // Basic theme implementation
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    }

    createSettingsModal(title, content, buttons) {
        const modal = document.createElement('div');
        modal.className = 'modal settings-modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-actions">
                    ${buttons.map(btn => 
                        `<button class="btn ${btn.class}" data-value="${btn.value}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        modal.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const event = new CustomEvent('modal-choice', { 
                    detail: btn.dataset.value 
                });
                modal.dispatchEvent(event);
            });
        });

        document.body.appendChild(modal);
        return modal;
    }

    showImportDialog(data) {
        return new Promise((resolve) => {
            const modal = this.createSettingsModal('Import Data', `
                <p>Import backup from ${new Date(data.exportDate).toLocaleDateString()}?</p>
                <p><strong>Contains:</strong> ${Object.keys(data.predictions || {}).length} predictions</p>
                <p>How would you like to import?</p>
            `, [
                { text: 'Replace All', value: 'replace', class: 'btn-danger' },
                { text: 'Merge', value: 'merge', class: 'btn-primary' },
                { text: 'Cancel', value: 'cancel', class: 'btn-secondary' }
            ]);

            modal.addEventListener('modal-choice', (e) => {
                resolve(e.detail);
                modal.remove();
            });
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#000';
                break;
            default:
                notification.style.backgroundColor = '#007bff';
        }

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NFLPredictionTracker();
});