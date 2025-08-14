class NFLPredictionTracker {
    constructor() {
        this.teamRecordPredictions = this.loadTeamRecordPredictions();
        this.predictions = this.loadPredictions();
        this.preseasonPredictions = this.loadPreseasonPredictions();
        this.currentTab = 'standings';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTeamRecordUI();
        this.renderStandings();
        this.populateFilters();
        this.updateStats();
        this.renderGames();
        console.log('App initialized successfully');
    }

    // Storage methods
    loadTeamRecordPredictions() {
        const saved = localStorage.getItem('nfl-team-record-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    saveTeamRecordPredictions() {
        localStorage.setItem('nfl-team-record-predictions', JSON.stringify(this.teamRecordPredictions));
    }

    loadPredictions() {
        const saved = localStorage.getItem('nfl-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    savePredictions() {
        localStorage.setItem('nfl-predictions', JSON.stringify(this.predictions || {}));
    }

    loadPreseasonPredictions() {
        const saved = localStorage.getItem('nfl-preseason-predictions');
        return saved ? JSON.parse(saved) : {};
    }

    savePreseasonPredictionsToStorage() {
        localStorage.setItem('nfl-preseason-predictions', JSON.stringify(this.preseasonPredictions || {}));
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Weekly predictions filters
        const weekFilter = document.getElementById('week-filter');
        if (weekFilter) {
            weekFilter.addEventListener('change', (e) => {
                this.filterGames();
            });
        }

        const teamFilter = document.getElementById('team-filter');
        if (teamFilter) {
            teamFilter.addEventListener('change', (e) => {
                this.filterGames();
            });
        }

        // Button event listeners
        const clearAllBtn = document.getElementById('clear-all-predictions');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all predictions? This cannot be undone.')) {
                    this.clearAllPredictions();
                }
            });
        }

        const bulkPredictBtn = document.getElementById('bulk-predict-btn');
        if (bulkPredictBtn) {
            bulkPredictBtn.addEventListener('click', () => {
                this.showBulkPredictionModal();
            });
        }

        // Modal event listeners
        const modal = document.getElementById('bulk-prediction-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeBulkPredictionModal();
                });
            }

            const cancelBtn = document.getElementById('cancel-week-predictions');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeBulkPredictionModal();
                });
            }

            const saveBtn = document.getElementById('save-week-predictions');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveWeekPredictions();
                });
            }

            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeBulkPredictionModal();
                }
            });
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
        
        if (tab === 'standings') {
            this.renderStandings();
        } else if (tab === 'preseason') {
            this.loadTeamRecordUI();
        } else if (tab === 'weekly') {
            this.renderGames();
        }
    }

    // Game filtering and rendering
    filterGames() {
        const weekFilter = document.getElementById('week-filter');
        const teamFilter = document.getElementById('team-filter');
        
        if (!weekFilter || !teamFilter) return;
        
        const selectedWeek = weekFilter.value;
        const selectedTeam = teamFilter.value;
        
        let filteredGames = window.nflSchedule?.games || [];
        
        if (selectedWeek) {
            filteredGames = filteredGames.filter(game => game.week == selectedWeek);
        }
        
        if (selectedTeam) {
            filteredGames = filteredGames.filter(game => 
                game.homeTeam === selectedTeam || game.awayTeam === selectedTeam
            );
        }
        
        this.renderGames(filteredGames);
    }

    renderGames(games = null) {
        const gamesContainer = document.getElementById('games-list');
        if (!gamesContainer) return;
        
        const gamesToRender = games || window.nflSchedule?.games || [];
        
        if (gamesToRender.length === 0) {
            gamesContainer.innerHTML = '<p>No games found.</p>';
            return;
        }
        
        gamesContainer.innerHTML = gamesToRender.map(game => this.createGameCard(game)).join('');
        this.attachGameEventListeners();
    }

    createGameCard(game) {
        const prediction = this.predictions[game.id];
        const homeTeamName = getTeamName(game.homeTeam);
        const awayTeamName = getTeamName(game.awayTeam);
        
        return `
            <div class="game-card" data-game-id="${game.id}">
                <div class="game-header">
                    <div class="game-info">
                        <span class="week-badge">Week ${game.week}</span>
                        <span>${game.date || 'TBD'}</span>
                        <span>${game.time || 'TBD'}</span>
                    </div>
                    <div class="game-status status-${game.status || 'upcoming'}">
                        ${this.getStatusText(game.status || 'upcoming')}
                    </div>
                </div>
                
                <div class="teams-container">
                    <div class="team away-team ${game.winner === game.awayTeam ? 'winner' : ''}">
                        <div class="team-name">${awayTeamName}</div>
                        <div class="team-score">${game.awayScore !== null ? game.awayScore : '-'}</div>
                    </div>
                    
                    <div class="vs">@</div>
                    
                    <div class="team home-team ${game.winner === game.homeTeam ? 'winner' : ''}">
                        <div class="team-name">${homeTeamName}</div>
                        <div class="team-score">${game.homeScore !== null ? game.homeScore : '-'}</div>
                    </div>
                </div>
                
                <div class="prediction-section">
                    <div class="prediction-controls">
                        <label>My Prediction:</label>
                        <select class="prediction-select" data-game-id="${game.id}">
                            <option value="">Select Winner</option>
                            <option value="${game.awayTeam}" ${prediction === game.awayTeam ? 'selected' : ''}>${awayTeamName}</option>
                            <option value="${game.homeTeam}" ${prediction === game.homeTeam ? 'selected' : ''}>${homeTeamName}</option>
                        </select>
                    </div>
                    ${this.getPredictionResult(game, prediction)}
                </div>
            </div>
        `;
    }

    getPredictionResult(game, prediction) {
        if (!prediction) return '';
        
        if (game.status === 'final' && game.winner) {
            const isCorrect = prediction === game.winner;
            return `<div class="prediction-result ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'} - Predicted: ${getTeamName(prediction)}
            </div>`;
        } else {
            return `<div class="prediction-result pending">
                Predicted: ${getTeamName(prediction)}
            </div>`;
        }
    }

    attachGameEventListeners() {
        document.querySelectorAll('.prediction-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const gameId = e.target.dataset.gameId;
                const prediction = e.target.value;
                
                if (prediction) {
                    this.predictions[gameId] = prediction;
                } else {
                    delete this.predictions[gameId];
                }
                
                this.savePredictions();
                this.updateStats();
                
                // Update the prediction result display
                const gameCard = e.target.closest('.game-card');
                const game = window.nflSchedule?.games?.find(g => g.id === gameId);
                if (game) {
                    const resultDiv = gameCard.querySelector('.prediction-result');
                    if (resultDiv) {
                        resultDiv.outerHTML = this.getPredictionResult(game, prediction);
                    }
                }
            });
        });
    }

    getStatusText(status) {
        switch(status) {
            case 'upcoming': return 'Upcoming';
            case 'live': return 'Live';
            case 'final': return 'Final';
            default: return status;
        }
    }

    // Bulk prediction modal
    showBulkPredictionModal() {
        const weekFilter = document.getElementById('week-filter');
        if (!weekFilter || !weekFilter.value) {
            alert('Please select a week first');
            return;
        }
        
        const selectedWeek = weekFilter.value;
        const weekGames = (window.nflSchedule?.games || []).filter(game => game.week == selectedWeek);
        
        if (weekGames.length === 0) {
            alert('No games found for selected week');
            return;
        }
        
        const modal = document.getElementById('bulk-prediction-modal');
        const weekNumber = document.getElementById('modal-week-number');
        const gamesList = document.getElementById('week-games-list');
        
        if (!modal || !weekNumber || !gamesList) {
            alert('Modal elements not found');
            return;
        }
        
        weekNumber.textContent = selectedWeek;
        
        gamesList.innerHTML = weekGames.map(game => `
            <div class="bulk-game-item">
                <div class="bulk-game-teams">
                    <span>${getTeamName(game.awayTeam)}</span>
                    <span class="vs">@</span>
                    <span>${getTeamName(game.homeTeam)}</span>
                </div>
                <div class="bulk-prediction">
                    <select data-game-id="${game.id}">
                        <option value="">Select Winner</option>
                        <option value="${game.awayTeam}" ${this.predictions[game.id] === game.awayTeam ? 'selected' : ''}>${getTeamName(game.awayTeam)}</option>
                        <option value="${game.homeTeam}" ${this.predictions[game.id] === game.homeTeam ? 'selected' : ''}>${getTeamName(game.homeTeam)}</option>
                    </select>
                </div>
            </div>
        `).join('');
        
        modal.style.display = 'block';
    }

    saveWeekPredictions() {
        const gamesList = document.getElementById('week-games-list');
        if (!gamesList) return;
        
        const selects = gamesList.querySelectorAll('select');
        let saved = 0;
        
        selects.forEach(select => {
            const gameId = select.dataset.gameId;
            const prediction = select.value;
            
            if (prediction) {
                this.predictions[gameId] = prediction;
                saved++;
            }
        });
        
        this.savePredictions();
        this.updateStats();
        this.renderGames();
        this.closeBulkPredictionModal();
        
        alert(`Saved ${saved} predictions!`);
    }

    closeBulkPredictionModal() {
        const modal = document.getElementById('bulk-prediction-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Statistics and other functions
    updateStats() {
        const totalGames = window.nflSchedule?.games?.length || 0;
        const predictionsMade = Object.keys(this.predictions || {}).length;
        
        let correctPredictions = 0;
        const completedGames = (window.nflSchedule?.games || []).filter(game => game.status === 'final' && game.winner);
        
        completedGames.forEach(game => {
            if (this.predictions[game.id] === game.winner) {
                correctPredictions++;
            }
        });
        
        const accuracy = completedGames.length > 0 ? Math.round((correctPredictions / completedGames.length) * 100) : 0;
        
        // Update header stats
        const totalGamesEl = document.getElementById('total-games');
        const predictionsMadeEl = document.getElementById('predictions-made');
        const correctPredictionsEl = document.getElementById('correct-predictions');
        const accuracyEl = document.getElementById('accuracy');
        
        if (totalGamesEl) totalGamesEl.textContent = totalGames;
        if (predictionsMadeEl) predictionsMadeEl.textContent = predictionsMade;
        if (correctPredictionsEl) correctPredictionsEl.textContent = correctPredictions;
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';
    }

    clearAllPredictions() {
        this.predictions = {};
        this.savePredictions();
        this.updateStats();
        this.renderGames();
        this.showNotification('All predictions cleared', 'info');
    }

    populateFilters() {
        const weekFilter = document.getElementById('week-filter');
        const teamFilter = document.getElementById('team-filter');
        
        if (weekFilter) {
            const weeks = getWeeksList();
            weeks.forEach(week => {
                const option = document.createElement('option');
                option.value = week;
                option.textContent = `Week ${week}`;
                weekFilter.appendChild(option);
            });
        }
        
        if (teamFilter) {
            const teams = getTeamList();
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.code;
                option.textContent = team.name;
                teamFilter.appendChild(option);
            });
        }
    }

    loadTeamRecordUI() {
        const preseasonTab = document.getElementById('preseason-tab');
        if (!preseasonTab) return;

        // Create the team record predictions section
        const recordSection = preseasonTab.querySelector('.preseason-section');
        if (!recordSection) return;

        const container = recordSection.querySelector('.conference-records');
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Group teams by conference and division
        const teams = window.nflSchedule?.teams || {};
        const conferences = { AFC: {}, NFC: {} };
        Object.keys(teams).forEach(code => {
            const team = teams[code];
            if (!conferences[team.conference][team.division]) {
                conferences[team.conference][team.division] = [];
            }
            conferences[team.conference][team.division].push({ code, ...team });
        });

        // Render each conference
        ['AFC', 'NFC'].forEach(conf => {
            const confDiv = document.createElement('div');
            confDiv.className = 'conference';
            confDiv.innerHTML = `<h4>${conf} Teams</h4>`;
            Object.keys(conferences[conf]).forEach(division => {
                const divDiv = document.createElement('div');
                divDiv.className = 'division';
                divDiv.innerHTML = `<h5>${division} Division</h5><div class="team-records-grid" id="${conf.toLowerCase()}-${division.toLowerCase()}-records"></div>`;
                confDiv.appendChild(divDiv);
                this.createTeamRecordInputs(divDiv.querySelector('.team-records-grid'), conferences[conf][division]);
            });
            container.appendChild(confDiv);
        });
    }

    createTeamRecordInputs(container, teams) {
        teams.forEach(team => {
            const prediction = this.teamRecordPredictions[team.code] || { wins: 0, losses: 0 };
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'record-prediction-item';
            itemDiv.innerHTML = `
                <label>${team.name}</label>
                <input type="number" id="record-${team.code}-wins" min="0" max="17" value="${prediction.wins}" placeholder="W">
                <span>-</span>
                <input type="number" id="record-${team.code}-losses" min="0" max="17" value="${prediction.losses}" placeholder="L">
                <span>(${prediction.wins + prediction.losses}/17)</span>
            `;
            
            container.appendChild(itemDiv);

            // Add event listeners
            const winsInput = itemDiv.querySelector(`#record-${team.code}-wins`);
            const lossesInput = itemDiv.querySelector(`#record-${team.code}-losses`);
            
            winsInput.addEventListener('change', () => {
                this.updateTeamRecordPrediction(team.code, 'wins', parseInt(winsInput.value) || 0);
                this.updateRecordDisplay(team.code);
            });
            
            lossesInput.addEventListener('change', () => {
                this.updateTeamRecordPrediction(team.code, 'losses', parseInt(lossesInput.value) || 0);
                this.updateRecordDisplay(team.code);
            });
        });
    }

    updateTeamRecordPrediction(teamCode, type, value) {
        if (!this.teamRecordPredictions[teamCode]) {
            this.teamRecordPredictions[teamCode] = { wins: 0, losses: 0 };
        }
        this.teamRecordPredictions[teamCode][type] = value;
        this.saveTeamRecordPredictions();
    }

    updateRecordDisplay(teamCode) {
        const prediction = this.teamRecordPredictions[teamCode] || { wins: 0, losses: 0 };
        const total = prediction.wins + prediction.losses;
        const displaySpan = document.querySelector(`#record-${teamCode}-wins`).parentElement.querySelector('span:last-child');
        if (displaySpan) {
            displaySpan.textContent = `(${total}/17)`;
            displaySpan.style.color = total === 17 ? '#28a745' : '#dc3545';
        }
    }

    renderStandings() {
        const standingsTab = document.getElementById('standings-tab');
        if (!standingsTab) return;

        const teams = window.nflSchedule?.teams || {};
        
        standingsTab.innerHTML = `
            <div class="standings-container">
                <h3>Current NFL Standings</h3>
                <div class="conference-standings">
                    <div class="conference">
                        <h3>AFC</h3>
                        <div id="afc-standings"></div>
                    </div>
                    <div class="conference">
                        <h3>NFC</h3>
                        <div id="nfc-standings"></div>
                    </div>
                </div>
            </div>
        `;

        const afcStandings = document.getElementById('afc-standings');
        const nfcStandings = document.getElementById('nfc-standings');

        // Get teams by conference
        const afcTeams = [];
        const nfcTeams = [];

        Object.keys(teams).forEach(code => {
            const team = teams[code];
            if (team.conference === 'AFC') {
                afcTeams.push({ code, ...team });
            } else if (team.conference === 'NFC') {
                nfcTeams.push({ code, ...team });
            }
        });

        // Sort by wins/losses
        afcTeams.sort((a, b) => (b.record?.wins || 0) - (a.record?.wins || 0));
        nfcTeams.sort((a, b) => (b.record?.wins || 0) - (a.record?.wins || 0));

        this.renderConferenceStandings(afcStandings, afcTeams);
        this.renderConferenceStandings(nfcStandings, nfcTeams);
    }

    renderConferenceStandings(container, teams) {
        const standingsHTML = teams.map((team, index) => {
            const record = team.record || { wins: 0, losses: 0 };
            const prediction = this.teamRecordPredictions[team.code];
            const predictionText = prediction ? `Predicted: ${prediction.wins}-${prediction.losses}` : 'No prediction';
            
            return `
                <div class="standings-row">
                    <div class="team-column">
                        <span class="team-rank">${index + 1}.</span>
                        <span class="team-name">${team.name}</span>
                    </div>
                    <div class="record-column">${record.wins}-${record.losses}</div>
                    <div class="prediction-column">${predictionText}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="standings-header">
                <div class="team-column">Team</div>
                <div>Record</div>
                <div>Prediction</div>
            </div>
            ${standingsHTML}
        `;
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NFLPredictionTracker();
});

function getTeamName(teamCode) {
    // Try nflSchedule.teams first, then fall back to window.teams
    if (window.nflSchedule && window.nflSchedule.teams && window.nflSchedule.teams[teamCode]) {
        return window.nflSchedule.teams[teamCode].name;
    }
    return `[Unknown: ${teamCode}]`;
}

function getTeamRecord(teamCode) {
    // Try nflSchedule.teams first, then fall back to window.teams
    if (window.nflSchedule && window.nflSchedule.teams && window.nflSchedule.teams[teamCode] && window.nflSchedule.teams[teamCode].record) {
        const record = window.nflSchedule.teams[teamCode].record;
        return `${record.wins || 0}-${record.losses || 0}`;
    }
    return '0-0';
}