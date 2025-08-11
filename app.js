class NFLPredictionTracker {
    constructor() {
        this.predictions = this.loadPredictions();
        this.preseasonPredictions = this.loadPreseasonPredictions();
        this.teamRecordPredictions = this.loadTeamRecordPredictions();
        this.appPreferences = this.loadAppPreferences();
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
        this.loadAppPreferencesUI();
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

        // Settings tab event listeners
        document.getElementById('connect-github')?.addEventListener('click', () => {
            this.connectGitHub();
        });

        document.getElementById('connect-firebase')?.addEventListener('click', () => {
            this.connectFirebase();
        });

        document.getElementById('export-all-data')?.addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('export-predictions-backup')?.addEventListener('click', () => {
            this.exportPredictionsToCSV();
        });

        document.getElementById('import-data')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
            }
        });

        document.getElementById('clear-all-data')?.addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('reset-predictions')?.addEventListener('click', () => {
            this.resetPredictionsOnly();
        });

        document.getElementById('reset-preseason')?.addEventListener('click', () => {
            this.resetPreseasonOnly();
        });

        document.getElementById('force-sync')?.addEventListener('click', () => {
            this.forceSyncNow();
        });

        // Storage type radio buttons
        document.querySelectorAll('input[name="storage-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateStorageType(e.target.value);
            });
        });

        // App preferences event listeners
        document.getElementById('default-view')?.addEventListener('change', (e) => {
            this.updatePreference('defaultView', e.target.value);
        });

        document.getElementById('show-team-logos')?.addEventListener('change', (e) => {
            this.updatePreference('showTeamLogos', e.target.checked);
        });

        document.getElementById('auto-save')?.addEventListener('change', (e) => {
            this.updatePreference('autoSave', e.target.checked);
        });

        document.getElementById('app-theme')?.addEventListener('change', (e) => {
            this.updatePreference('theme', e.target.value);
            this.applyTheme(e.target.value);
        });

        // Privacy preferences event listeners
        document.getElementById('public-predictions')?.addEventListener('change', (e) => {
            this.updatePreference('publicPredictions', e.target.checked);
        });

        document.getElementById('allow-analytics')?.addEventListener('change', (e) => {
            this.updatePreference('allowAnalytics', e.target.checked);
        });

        document.getElementById('share-accuracy')?.addEventListener('change', (e) => {
            this.updatePreference('shareAccuracy', e.target.checked);
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
        
        if (this.appPreferences.autoSave) {
            this.savePredictions();
            this.updateStats();
        } else {
            // Show save indicator if auto-save is off
            this.showSaveIndicator();
        }
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

    // App Preferences methods
    loadAppPreferences() {
        const saved = localStorage.getItem('nfl-app-preferences');
        const defaults = {
            defaultView: 'weekly',
            showTeamLogos: false,
            autoSave: true,
            theme: 'light',
            publicPredictions: false,
            allowAnalytics: false,
            shareAccuracy: false
        };
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveAppPreferences() {
        localStorage.setItem('nfl-app-preferences', JSON.stringify(this.appPreferences));
    }

    updatePreference(key, value) {
        this.appPreferences[key] = value;
        this.saveAppPreferences();
        this.showNotification(`Preference "${key}" saved`, 'success');
    }

    loadAppPreferencesUI() {
        // Load app preferences into UI
        const defaultViewSelect = document.getElementById('default-view');
        if (defaultViewSelect) {
            defaultViewSelect.value = this.appPreferences.defaultView;
        }

        const showTeamLogosCheckbox = document.getElementById('show-team-logos');
        if (showTeamLogosCheckbox) {
            showTeamLogosCheckbox.checked = this.appPreferences.showTeamLogos;
        }

        const autoSaveCheckbox = document.getElementById('auto-save');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.checked = this.appPreferences.autoSave;
        }

        const themeSelect = document.getElementById('app-theme');
        if (themeSelect) {
            themeSelect.value = this.appPreferences.theme;
            this.applyTheme(this.appPreferences.theme);
        }

        // Load privacy preferences into UI
        const publicPredictionsCheckbox = document.getElementById('public-predictions');
        if (publicPredictionsCheckbox) {
            publicPredictionsCheckbox.checked = this.appPreferences.publicPredictions;
        }

        const allowAnalyticsCheckbox = document.getElementById('allow-analytics');
        if (allowAnalyticsCheckbox) {
            allowAnalyticsCheckbox.checked = this.appPreferences.allowAnalytics;
        }

        const shareAccuracyCheckbox = document.getElementById('share-accuracy');
        if (shareAccuracyCheckbox) {
            shareAccuracyCheckbox.checked = this.appPreferences.shareAccuracy;
        }

        // Apply default view if specified
        if (this.appPreferences.defaultView !== 'weekly') {
            setTimeout(() => {
                this.switchTab(this.appPreferences.defaultView);
            }, 100);
        }
    }

    applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'dark') {
            body.classList.add('theme-dark');
        } else if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add('theme-light');
        }
    }

    clearAllPredictions() {
        this.predictions = {};
        this.savePredictions();
        this.updateStats();
        this.renderGames();
    }

    clearAllData() {
        const modal = this.createSettingsModal('Clear All Data', `
            <p style="color: #dc3545; font-weight: bold;">⚠️ Warning: This will permanently delete ALL your data!</p>
            <p>This includes:</p>
            <ul>
                <li>All weekly predictions</li>
                <li>All pre-season predictions</li>
                <li>All team record predictions</li>
                <li>All settings and preferences</li>
            </ul>
            <p>Are you absolutely sure you want to continue?</p>
        `, [
            { text: 'Delete Everything', action: 'delete' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'delete') {
                this.predictions = {};
                this.preseasonPredictions = {};
                this.teamRecordPredictions = {};
                this.appPreferences = this.loadAppPreferences(); // Reset to defaults
                localStorage.clear();
                this.refreshUI();
                this.showNotification('All data cleared', 'success');
            }
            modal.remove();
        });
    }

    resetPredictionsOnly() {
        if (confirm('Clear all weekly game predictions? This cannot be undone.')) {
            this.predictions = {};
            this.savePredictions();
            this.updateStats();
            this.renderGames();
            this.showNotification('Weekly predictions cleared', 'success');
        }
    }

    resetPreseasonOnly() {
        if (confirm('Clear all pre-season predictions? This cannot be undone.')) {
            this.clearPreseasonPredictions();
            this.showNotification('Pre-season predictions cleared', 'success');
        }
    }

    forceSyncNow() {
        // For now, just update the display
        this.updateSyncStatus();
        this.showNotification('Sync status updated', 'info');
    }

    updateStorageType(type) {
        const currentStorage = document.getElementById('current-storage');
        if (currentStorage) {
            currentStorage.textContent = type === 'local' ? 'Local Storage' : 
                                       type === 'github' ? 'GitHub Gists' : 
                                       'Firebase';
        }
        this.updateSyncStatus();
    }

    // Helper methods
    saveGitHubToken(token) {
        localStorage.setItem('github-token', token);
        document.getElementById('storage-github').checked = true;
        this.updateStorageType('github');
    }

    saveFirebaseConfig(config) {
        localStorage.setItem('firebase-config', JSON.stringify(config));
        document.getElementById('storage-firebase').checked = true;
        this.updateStorageType('firebase');
    }

    saveAllData() {
        this.savePredictions();
        this.savePreseasonPredictionsToStorage();
        this.saveTeamRecordPredictions();
        this.saveAppPreferences();
    }

    refreshUI() {
        this.updateStats();
        this.renderGames();
        this.loadPreseasonUI();
        this.loadTeamRecordUI();
        this.loadAppPreferencesUI();
        this.renderComparison();
        this.renderStandings();
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

    // Settings functionality methods
    connectGitHub() {
        const modal = this.createSettingsModal('Connect to GitHub', `
            <p>To backup your predictions to GitHub Gists, you'll need to:</p>
            <ol>
                <li>Create a GitHub Personal Access Token</li>
                <li>Grant "gist" permissions to the token</li>
                <li>Paste the token below</li>
            </ol>
            <div style="margin: 15px 0;">
                <label for="github-token">GitHub Token:</label>
                <input type="password" id="github-token" placeholder="Enter your GitHub token" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                <a href="https://github.com/settings/tokens" target="_blank">Create a token here</a> 
                (select "gist" scope only)
            </p>
        `, [
            { text: 'Connect', action: 'connect' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'connect') {
                const token = modal.querySelector('#github-token').value.trim();
                if (token) {
                    this.saveGitHubToken(token);
                    this.showNotification('GitHub connected successfully!', 'success');
                    modal.remove();
                } else {
                    this.showNotification('Please enter a valid GitHub token', 'error');
                }
            } else {
                modal.remove();
            }
        });
    }

    connectFirebase() {
        const modal = this.createSettingsModal('Connect to Firebase', `
            <p>To sync with Firebase, you'll need your Firebase project configuration:</p>
            <div style="margin: 15px 0;">
                <label for="firebase-config">Firebase Config (JSON):</label>
                <textarea id="firebase-config" placeholder='{"apiKey": "...", "authDomain": "...", ...}' 
                         style="width: 100%; height: 120px; padding: 8px; margin-top: 5px; font-family: monospace;"></textarea>
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                Get your config from the Firebase Console → Project Settings → General tab
            </p>
        `, [
            { text: 'Connect', action: 'connect' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'connect') {
                const config = modal.querySelector('#firebase-config').value.trim();
                try {
                    const firebaseConfig = JSON.parse(config);
                    this.saveFirebaseConfig(firebaseConfig);
                    this.showNotification('Firebase configuration saved!', 'success');
                    modal.remove();
                } catch (error) {
                    this.showNotification('Invalid Firebase configuration JSON', 'error');
                }
            } else {
                modal.remove();
            }
        });
    }

    exportAllData() {
        const data = {
            predictions: this.predictions,
            preseasonPredictions: this.preseasonPredictions,
            teamRecordPredictions: this.teamRecordPredictions,
            appPreferences: this.appPreferences,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
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

        this.showNotification('Data exported successfully!', 'success');
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.version || !data.exportDate) {
                throw new Error('Invalid backup file format');
            }

            const modal = this.createSettingsModal('Import Data', `
                <p>Import backup from ${new Date(data.exportDate).toLocaleDateString()}?</p>
                <p><strong>Contains:</strong></p>
                <ul>
                    <li>Weekly predictions: ${Object.keys(data.predictions || {}).length}</li>
                    <li>Pre-season predictions: ${Object.keys(data.preseasonPredictions || {}).length > 0 ? 'Yes' : 'No'}</li>
                    <li>Team record predictions: ${Object.keys(data.teamRecordPredictions || {}).length}</li>
                    <li>App preferences: ${data.appPreferences ? 'Yes' : 'No'}</li>
                </ul>
                <p>How would you like to import?</p>
            `, [
                { text: 'Replace All', action: 'replace' },
                { text: 'Merge', action: 'merge' },
                { text: 'Cancel', action: 'cancel' }
            ]);

            modal.addEventListener('settings-action', (e) => {
                if (e.detail === 'replace') {
                    this.predictions = data.predictions || {};
                    this.preseasonPredictions = data.preseasonPredictions || {};
                    this.teamRecordPredictions = data.teamRecordPredictions || {};
                    if (data.appPreferences) {
                        this.appPreferences = { ...this.appPreferences, ...data.appPreferences };
                    }
                    this.saveAllData();
                    this.refreshUI();
                    this.showNotification('Data imported and replaced!', 'success');
                } else if (e.detail === 'merge') {
                    this.predictions = { ...this.predictions, ...data.predictions };
                    this.preseasonPredictions = { ...this.preseasonPredictions, ...data.preseasonPredictions };
                    this.teamRecordPredictions = { ...this.teamRecordPredictions, ...data.teamRecordPredictions };
                    if (data.appPreferences) {
                        this.appPreferences = { ...this.appPreferences, ...data.appPreferences };
                    }
                    this.saveAllData();
                    this.refreshUI();
                    this.showNotification('Data merged successfully!', 'success');
                }
                modal.remove();
            });

        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification('Failed to import backup file', 'error');
        }
    }

    showSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = 'Unsaved changes - remember to save!';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 15px;
            background-color: #ffc107;
            color: #000;
            border-radius: 4px;
            font-weight: bold;
            z-index: 1000;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
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

    // Settings functionality methods
    connectGitHub() {
        const modal = this.createSettingsModal('Connect to GitHub', `
            <p>To backup your predictions to GitHub Gists, you'll need to:</p>
            <ol>
                <li>Create a GitHub Personal Access Token</li>
                <li>Grant "gist" permissions to the token</li>
                <li>Paste the token below</li>
            </ol>
            <div style="margin: 15px 0;">
                <label for="github-token">GitHub Token:</label>
                <input type="password" id="github-token" placeholder="Enter your GitHub token" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                <a href="https://github.com/settings/tokens" target="_blank">Create a token here</a> 
                (select "gist" scope only)
            </p>
        `, [
            { text: 'Connect', action: 'connect' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'connect') {
                const token = modal.querySelector('#github-token').value.trim();
                if (token) {
                    this.saveGitHubToken(token);
                    this.showNotification('GitHub connected successfully!', 'success');
                    modal.remove();
                } else {
                    this.showNotification('Please enter a valid GitHub token', 'error');
                }
            } else {
                modal.remove();
            }
        });
    }

    connectFirebase() {
        const modal = this.createSettingsModal('Connect to Firebase', `
            <p>To sync with Firebase, you'll need your Firebase project configuration:</p>
            <div style="margin: 15px 0;">
                <label for="firebase-config">Firebase Config (JSON):</label>
                <textarea id="firebase-config" placeholder='{"apiKey": "...", "authDomain": "...", ...}' 
                         style="width: 100%; height: 120px; padding: 8px; margin-top: 5px; font-family: monospace;"></textarea>
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                Get your config from the Firebase Console → Project Settings → General tab
            </p>
        `, [
            { text: 'Connect', action: 'connect' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'connect') {
                const config = modal.querySelector('#firebase-config').value.trim();
                try {
                    const firebaseConfig = JSON.parse(config);
                    this.saveFirebaseConfig(firebaseConfig);
                    this.showNotification('Firebase configuration saved!', 'success');
                    modal.remove();
                } catch (error) {
                    this.showNotification('Invalid Firebase configuration JSON', 'error');
                }
            } else {
                modal.remove();
            }
        });
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

    // Settings functionality methods
    connectGitHub() {
        const modal = this.createSettingsModal('Connect to GitHub', `
            <p>To backup your predictions to GitHub Gists, you'll need to:</p>
            <ol>
                <li>Create a GitHub Personal Access Token</li>
                <li>Grant "gist" permissions to the token</li>
                <li>Paste the token below</li>
            </ol>
            <div style="margin: 15px 0;">
                <label for="github-token">GitHub Token:</label>
                <input type="password" id="github-token" placeholder="Enter your GitHub token" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                <a href="https://github.com/settings/tokens" target="_blank">Create a token here</a> 
                (select "gist" scope only)
            </p>
        `, [
            { text: 'Connect', action: 'connect' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'connect') {
                const token = modal.querySelector('#github-token').value.trim();
                if (token) {
                    this.saveGitHubToken(token);
                    this.showNotification('GitHub connected successfully!', 'success');
                    modal.remove();
                } else {
                    this.showNotification('Please enter a valid GitHub token', 'error');
                }
            } else {
                modal.remove();
            }
        });
    }

    connectFirebase() {
        const modal = this.createSettingsModal('Connect to Firebase', `
            <p>To sync with Firebase, you'll need your Firebase project configuration:</p>
            <div style="margin: 15px 0;">
                <label for="firebase-config">Firebase Config (JSON):</label>
                <textarea id="firebase-config" placeholder='{"apiKey": "...", "authDomain": "...", ...}' 
                         style="width: 100%; height: 120px; padding: 8px; margin-top: 5px; font-family: monospace;"></textarea>
            </div>
            <p style="font-size: 0.9rem; color: #666;">
                Get your config from the Firebase Console → Project Settings → General tab
            </p>
        `, [
            { text: 'Connect', action: 'connect' },
            { text: 'Cancel', action: 'cancel' }
        ]);

        modal.addEventListener('settings-action', (e) => {
            if (e.detail === 'connect') {
                const config = modal.querySelector('#firebase-config').value.trim();
                try {
                    const firebaseConfig = JSON.parse(config);
                    this.saveFirebaseConfig(firebaseConfig);
                    this.showNotification('Firebase configuration saved!', 'success');
                    modal.remove();
                } catch (error) {
                    this.showNotification('Invalid Firebase configuration JSON', 'error');
                }
            } else {
                modal.remove();
            }
        });
    }

    // Helper methods
    saveGitHubToken(token) {
        localStorage.setItem('github-token', token);
        document.getElementById('storage-github').checked = true;
        this.updateStorageType('github');
    }

    saveFirebaseConfig(config) {
        localStorage.setItem('firebase-config', JSON.stringify(config));
        document.getElementById('storage-firebase').checked = true;
        this.updateStorageType('firebase');
    }

    // Notification method
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
                        `<button class="btn ${btn.action === 'delete' ? 'btn-danger' : 
                                            btn.action === 'connect' ? 'btn-primary' : 'btn-secondary'}" 
                                data-action="${btn.action}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        modal.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const event = new CustomEvent('settings-action', { 
                    detail: btn.dataset.action 
                });
                modal.dispatchEvent(event);
            });
        });

        document.body.appendChild(modal);
        return modal;
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NFLPredictionTracker();
});