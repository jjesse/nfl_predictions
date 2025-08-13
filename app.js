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
                        ${getTeamName(game.awayTeam)}
                        ${game.winner === game.awayTeam ? '<span class="winner-badge">W</span>' : ''}
                    </div>
                    <div class="team-score">
                        ${game.awayScore !== null ? game.awayScore : '-'}
                    </div>
                </div>
                
                <div class="vs">@</div>
                
                <div class="team home-team ${game.winner === game.homeTeam ? 'winner' : ''}">
                    <div class="team-name">
                        ${getTeamName(game.homeTeam)}
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
                    <div class="team-name">${getTeamName(game.awayTeam)}</div>
                    <div class="team-record">(${nflSchedule.teams[game.awayTeam].record.wins}-${nflSchedule.teams[game.awayTeam].record.losses})</div>
                    <div class="team-score">${game.awayScore !== null ? game.awayScore : '-'}</div>
                    ${game.winner === game.awayTeam ? '<span class="winner-badge">W</span>' : ''}
                </div>
                
                <div class="vs">@</div>
                
                <div class="team home-team">
                    <div class="team-name">${getTeamName(game.homeTeam)}</div>
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

    populatePreseasonDropdowns() {
        const conferenceSelect = document.getElementById('conference-select');
        const divisionSelect = document.getElementById('division-select');
        
        if (!conferenceSelect || !divisionSelect) {
            console.warn('Preseason dropdown elements not found');
            return;
        }

        // Clear existing options
        conferenceSelect.innerHTML = '<option value="">Select Conference</option>';
        divisionSelect.innerHTML = '<option value="">Select Division</option>';

        // Populate conferences
        const conferences = ['AFC', 'NFC'];
        conferences.forEach(conf => {
            const option = document.createElement('option');
            option.value = conf;
            option.textContent = conf;
            conferenceSelect.appendChild(option);
        });

        // Populate divisions
        const divisions = ['North', 'South', 'East', 'West'];
        divisions.forEach(div => {
            const option = document.createElement('option');
            option.value = div;
            option.textContent = div;
            divisionSelect.appendChild(option);
        });
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NFLPredictionTracker();
});

function getTeamName(teamCode) {
    if (window.teams && window.teams[teamCode] && window.teams[teamCode].name) {
        return window.teams[teamCode].name;
    }
    return `[Unknown: ${teamCode}]`;
}