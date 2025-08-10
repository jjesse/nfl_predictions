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

        // Existing event listeners
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
        ['preseason-afc-east-winner', 'preseason-afc-north-winner', 'preseason-afc-south-winner', 'preseason-afc-west-winner',
         'preseason-nfc-east-winner', 'preseason-nfc-north-winner', 'preseason-nfc-south-winner', 'preseason-nfc-west-winner',
         'preseason-afc-wildcard-1', 'preseason-afc-wildcard-2', 'preseason-afc-wildcard-3',
         'preseason-nfc-wildcard-1', 'preseason-nfc-wildcard-2', 'preseason-nfc-wildcard-3'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updatePreseasonConstraints();
                });
            }
        });

        // Update Super Bowl when championship winners change
        ['preseason-afc-champion', 'preseason-nfc-champion'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateSuperBowlOptions();
                });
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bulk-prediction-modal');
            if (e.target === modal) {
                this.closeBulkPredictionModal();
            }
        });

        // CSV Export event listeners
        document.getElementById('export-predictions-csv').addEventListener('click', () => {
            this.exportPredictionsToCSV();
        });

        document.getElementById('export-preseason-csv').addEventListener('click', () => {
            this.exportPreseasonToCSV();
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

        // Standings comparison button
        document.getElementById('view-standings-comparison').addEventListener('click', () => {
            this.renderStandingsComparison();
        });
    }

    populateFilters() {
        // Populate week filter
        const weekFilter = document.getElementById('week-filter');
        const weeks = getWeeksList();
        weeks.forEach(week => {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = getWeekDisplayName(week);
            weekFilter.appendChild(option);
        });

        // Populate team filter
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
        // Populate results week filter
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

    renderStandings() {
        // Calculate team records from game results
        const teamRecords = this.calculateTeamRecords();
        
        // AFC Divisions
        this.renderDivisionStandings('AFC East', ['BUF', 'MIA', 'NE', 'NYJ'], teamRecords, 'afc-east-standings');
        this.renderDivisionStandings('AFC North', ['BAL', 'CIN', 'CLE', 'PIT'], teamRecords, 'afc-north-standings');
        this.renderDivisionStandings('AFC South', ['HOU', 'IND', 'JAX', 'TEN'], teamRecords, 'afc-south-standings');
        this.renderDivisionStandings('AFC West', ['DEN', 'KC', 'LV', 'LAC'], teamRecords, 'afc-west-standings');
        
        // NFC Divisions
        this.renderDivisionStandings('NFC East', ['DAL', 'NYG', 'PHI', 'WAS'], teamRecords, 'nfc-east-standings');
        this.renderDivisionStandings('NFC North', ['CHI', 'DET', 'GB', 'MIN'], teamRecords, 'nfc-north-standings');
        this.renderDivisionStandings('NFC South', ['ATL', 'CAR', 'NO', 'TB'], teamRecords, 'nfc-south-standings');
        this.renderDivisionStandings('NFC West', ['ARI', 'LAR', 'SF', 'SEA'], teamRecords, 'nfc-west-standings');
    }

    renderDivisionStandings(divisionName, teamCodes, teamRecords, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Sort teams by wins (descending), then by losses (ascending)
        const sortedTeams = teamCodes.sort((a, b) => {
            const recordA = teamRecords[a] || { wins: 0, losses: 0 };
            const recordB = teamRecords[b] || { wins: 0, losses: 0 };
            
            if (recordA.wins !== recordB.wins) {
                return recordB.wins - recordA.wins; // More wins = higher
            }
            return recordA.losses - recordB.losses; // Fewer losses = higher
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
            
            // Add position styling (1st place gets different styling)
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
        
        // Initialize all teams with 0-0 record
        Object.keys(nflSchedule.teams).forEach(teamCode => {
            records[teamCode] = { wins: 0, losses: 0 };
        });

        // Count wins/losses from completed games
        nflSchedule.games.forEach(game => {
            if (game.status === 'final' && game.winner) {
                // Winner gets a win
                if (records[game.winner]) {
                    records[game.winner].wins++;
                }
                
                // Loser gets a loss
                const loser = game.winner === game.homeTeam ? game.awayTeam : game.homeTeam;
                if (records[loser]) {
                    records[loser].losses++;
                }
            }
        });

        return records;
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
        } else if (tab === 'results') {
            this.renderResults();
        } else if (tab === 'standings') {
            this.renderStandings();
        } else if (tab === 'standings-comparison') {
            this.renderStandingsComparison();
        }
    }

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
            
            // Set initial bulk prediction if one exists
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
        // Apply all bulk predictions to the main predictions object
        Object.assign(this.predictions, this.bulkPredictions);
        this.savePredictions();
        this.updateStats();
        this.renderGames();
        this.closeBulkPredictionModal();
        
        const weekCount = Object.keys(this.bulkPredictions).length;
        alert(`Successfully saved ${weekCount} predictions!`);
    }

    populatePreseasonDropdowns() {
        const afcTeams = ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN'];
        const nfcTeams = ['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LAR', 'MIN', 'NO', 'NYG', 'PHI', 'SF', 'SEA', 'TB', 'WAS'];

        // Populate wild card dropdowns
        this.populateTeamDropdown('preseason-afc-wildcard-1', afcTeams);
        this.populateTeamDropdown('preseason-afc-wildcard-2', afcTeams);
        this.populateTeamDropdown('preseason-afc-wildcard-3', afcTeams);
        this.populateTeamDropdown('preseason-nfc-wildcard-1', nfcTeams);
        this.populateTeamDropdown('preseason-nfc-wildcard-2', nfcTeams);
        this.populateTeamDropdown('preseason-nfc-wildcard-3', nfcTeams);

        // Populate championship dropdowns
        this.populateTeamDropdown('preseason-afc-champion', afcTeams);
        this.populateTeamDropdown('preseason-nfc-champion', nfcTeams);
        this.populateTeamDropdown('preseason-super-bowl-champion', [...afcTeams, ...nfcTeams]);
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

    updatePreseasonConstraints() {
        this.updateWildCardConstraints();
        this.updateChampionshipConstraints();
        this.updateSuperBowlOptions();
    }

    updateWildCardConstraints() {
        // Get all selected playoff teams
        const afcDivisionWinners = [
            document.getElementById('preseason-afc-east-winner').value,
            document.getElementById('preseason-afc-north-winner').value,
            document.getElementById('preseason-afc-south-winner').value,
            document.getElementById('preseason-afc-west-winner').value
        ].filter(team => team);

        const nfcDivisionWinners = [
            document.getElementById('preseason-nfc-east-winner').value,
            document.getElementById('preseason-nfc-north-winner').value,
            document.getElementById('preseason-nfc-south-winner').value,
            document.getElementById('preseason-nfc-west-winner').value
        ].filter(team => team);

        // Update AFC wild card options
        this.updateWildCardDropdown('preseason-afc-wildcard-1', 'AFC', afcDivisionWinners);
        this.updateWildCardDropdown('preseason-afc-wildcard-2', 'AFC', afcDivisionWinners);
        this.updateWildCardDropdown('preseason-afc-wildcard-3', 'AFC', afcDivisionWinners);

        // Update NFC wild card options
        this.updateWildCardDropdown('preseason-nfc-wildcard-1', 'NFC', nfcDivisionWinners);
        this.updateWildCardDropdown('preseason-nfc-wildcard-2', 'NFC', nfcDivisionWinners);
        this.updateWildCardDropdown('preseason-nfc-wildcard-3', 'NFC', nfcDivisionWinners);
    }

    updateWildCardDropdown(dropdownId, conference, divisionWinners) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const currentValue = dropdown.value;
        
        // Get all selected wild cards for this conference
        const wildcardIds = conference === 'AFC' 
            ? ['preseason-afc-wildcard-1', 'preseason-afc-wildcard-2', 'preseason-afc-wildcard-3']
            : ['preseason-nfc-wildcard-1', 'preseason-nfc-wildcard-2', 'preseason-nfc-wildcard-3'];
        
        const selectedWildCards = wildcardIds
            .filter(id => id !== dropdownId)
            .map(id => document.getElementById(id).value)
            .filter(value => value);

        // Get available teams (conference teams - division winners - other selected wild cards)
        const conferenceTeams = conference === 'AFC' 
            ? ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN']
            : ['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LAR', 'MIN', 'NO', 'NYG', 'PHI', 'SF', 'SEA', 'TB', 'WAS'];

        const unavailableTeams = [...divisionWinners, ...selectedWildCards];
        const availableTeams = conferenceTeams.filter(team => !unavailableTeams.includes(team));

        // Rebuild dropdown options
        dropdown.innerHTML = `<option value="">${conference} Wild Card</option>`;
        availableTeams.forEach(teamCode => {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = nflSchedule.teams[teamCode].name;
            if (teamCode === currentValue) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    }

    updateChampionshipConstraints() {
        // Get all AFC playoff teams (division winners + wild cards)
        const afcPlayoffTeams = [
            document.getElementById('preseason-afc-east-winner').value,
            document.getElementById('preseason-afc-north-winner').value,
            document.getElementById('preseason-afc-south-winner').value,
            document.getElementById('preseason-afc-west-winner').value,
            document.getElementById('preseason-afc-wildcard-1').value,
            document.getElementById('preseason-afc-wildcard-2').value,
            document.getElementById('preseason-afc-wildcard-3').value
        ].filter(team => team);

        // Get all NFC playoff teams (division winners + wild cards)
        const nfcPlayoffTeams = [
            document.getElementById('preseason-nfc-east-winner').value,
            document.getElementById('preseason-nfc-north-winner').value,
            document.getElementById('preseason-nfc-south-winner').value,
            document.getElementById('preseason-nfc-west-winner').value,
            document.getElementById('preseason-nfc-wildcard-1').value,
            document.getElementById('preseason-nfc-wildcard-2').value,
            document.getElementById('preseason-nfc-wildcard-3').value
        ].filter(team => team);

        // Update AFC Championship dropdown
        this.updateChampionshipDropdown('preseason-afc-champion', afcPlayoffTeams, 'AFC');
        
        // Update NFC Championship dropdown
        this.updateChampionshipDropdown('preseason-nfc-champion', nfcPlayoffTeams, 'NFC');
    }

    updateChampionshipDropdown(dropdownId, availableTeams, conference) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const currentValue = dropdown.value;
        
        // Rebuild dropdown options
        dropdown.innerHTML = `<option value="">Select ${conference} Champion</option>`;
        availableTeams.forEach(teamCode => {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = nflSchedule.teams[teamCode].name;
            if (teamCode === currentValue && availableTeams.includes(currentValue)) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });

        // Clear selection if current team is no longer available
        if (currentValue && !availableTeams.includes(currentValue)) {
            dropdown.value = '';
        }
    }

    updateSuperBowlOptions() {
        const afcChamp = document.getElementById('preseason-afc-champion').value;
        const nfcChamp = document.getElementById('preseason-nfc-champion').value;
        const superBowlDropdown = document.getElementById('preseason-super-bowl-champion');
        
        if (!superBowlDropdown) return;

        const currentValue = superBowlDropdown.value;
        const availableChamps = [afcChamp, nfcChamp].filter(team => team);

        // Rebuild Super Bowl dropdown
        superBowlDropdown.innerHTML = '<option value="">Select Super Bowl Champion</option>';
        availableChamps.forEach(teamCode => {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = nflSchedule.teams[teamCode].name;
            if (teamCode === currentValue) {
                option.selected = true;
            }
            superBowlDropdown.appendChild(option);
        });

        // Clear selection if current team is no longer available
        if (currentValue && !availableChamps.includes(currentValue)) {
            superBowlDropdown.value = '';
        }
    }

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
        
        // Reset styling
        winsInput.style.borderColor = '';
        lossesInput.style.borderColor = '';
        
        if (total > 17) {
            // Too many games - highlight in red
            winsInput.style.borderColor = '#dc3545';
            lossesInput.style.borderColor = '#dc3545';
            winsInput.title = 'Total games cannot exceed 17';
            lossesInput.title = 'Total games cannot exceed 17';
        } else if (total === 17) {
            // Perfect - highlight in green
            winsInput.style.borderColor = '#28a745';
            lossesInput.style.borderColor = '#28a745';
            winsInput.title = 'Record complete (17 games)';
            lossesInput.title = 'Record complete (17 games)';
        } else if (total > 0) {
            // Partial - highlight in yellow
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

    savePreseasonPredictions() {
        // Validate predictions before saving
        const validation = this.validatePreseasonPredictions();
        if (!validation.isValid) {
            alert(`Please fix the following issues:\n\n${validation.errors.join('\n')}`);
            return;
        }

        const predictions = {
            divisionWinners: {
                'afc-east': document.getElementById('preseason-afc-east-winner').value,
                'afc-north': document.getElementById('preseason-afc-north-winner').value,
                'afc-south': document.getElementById('preseason-afc-south-winner').value,
                'afc-west': document.getElementById('preseason-afc-west-winner').value,
                'nfc-east': document.getElementById('preseason-nfc-east-winner').value,
                'nfc-north': document.getElementById('preseason-nfc-north-winner').value,
                'nfc-south': document.getElementById('preseason-nfc-south-winner').value,
                'nfc-west': document.getElementById('preseason-nfc-west-winner').value
            },
            wildCards: {
                'afc-1': document.getElementById('preseason-afc-wildcard-1').value,
                'afc-2': document.getElementById('preseason-afc-wildcard-2').value,
                'afc-3': document.getElementById('preseason-afc-wildcard-3').value,
                'nfc-1': document.getElementById('preseason-nfc-wildcard-1').value,
                'nfc-2': document.getElementById('preseason-nfc-wildcard-2').value,
                'nfc-3': document.getElementById('preseason-nfc-wildcard-3').value
            },
            championships: {
                'afc-champion': document.getElementById('preseason-afc-champion').value,
                'nfc-champion': document.getElementById('preseason-nfc-champion').value,
                'super-bowl': document.getElementById('preseason-super-bowl-champion').value
            },
            teamRecords: { ...this.teamRecordPredictions },
            timestamp: new Date().toISOString()
        };

        this.preseasonPredictions = predictions;
        this.savePreseasonPredictionsToStorage();
        alert('Pre-season predictions saved successfully!');
        this.renderComparison();
    }

    validatePreseasonPredictions() {
        const errors = [];

        // Check for duplicate AFC wild cards
        const afcWildCards = [
            document.getElementById('preseason-afc-wildcard-1').value,
            document.getElementById('preseason-afc-wildcard-2').value,
            document.getElementById('preseason-afc-wildcard-3').value
        ].filter(team => team);

        const afcWildCardDuplicates = afcWildCards.filter((team, index) => afcWildCards.indexOf(team) !== index);
        if (afcWildCardDuplicates.length > 0) {
            errors.push('AFC Wild Card teams cannot be duplicated');
        }

        // Check for duplicate NFC wild cards
        const nfcWildCards = [
            document.getElementById('preseason-nfc-wildcard-1').value,
            document.getElementById('preseason-nfc-wildcard-2').value,
            document.getElementById('preseason-nfc-wildcard-3').value
        ].filter(team => team);

        const nfcWildCardDuplicates = nfcWildCards.filter((team, index) => nfcWildCards.indexOf(team) !== index);
        if (nfcWildCardDuplicates.length > 0) {
            errors.push('NFC Wild Card teams cannot be duplicated');
        }

        // Check AFC Championship winner is from AFC playoff teams
        const afcChampion = document.getElementById('preseason-afc-champion').value;
        if (afcChampion) {
            const afcPlayoffTeams = [
                document.getElementById('preseason-afc-east-winner').value,
                document.getElementById('preseason-afc-north-winner').value,
                document.getElementById('preseason-afc-south-winner').value,
                document.getElementById('preseason-afc-west-winner').value,
                ...afcWildCards
            ].filter(team => team);

            if (!afcPlayoffTeams.includes(afcChampion)) {
                errors.push('AFC Champion must be selected from your AFC playoff teams');
            }
        }

        // Check NFC Championship winner is from NFC playoff teams
        const nfcChampion = document.getElementById('preseason-nfc-champion').value;
        if (nfcChampion) {
            const nfcPlayoffTeams = [
                document.getElementById('preseason-nfc-east-winner').value,
                document.getElementById('preseason-nfc-north-winner').value,
                document.getElementById('preseason-nfc-south-winner').value,
                document.getElementById('preseason-nfc-west-winner').value,
                ...nfcWildCards
            ].filter(team => team);

            if (!nfcPlayoffTeams.includes(nfcChampion)) {
                errors.push('NFC Champion must be selected from your NFC playoff teams');
            }
        }

        // Check Super Bowl winner is from championship winners
        const superBowlWinner = document.getElementById('preseason-super-bowl-champion').value;
        if (superBowlWinner) {
            const championshipWinners = [afcChampion, nfcChampion].filter(team => team);
            if (!championshipWinners.includes(superBowlWinner)) {
                errors.push('Super Bowl Champion must be either your AFC or NFC Champion');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    loadPreseasonUI() {
        if (!this.preseasonPredictions.divisionWinners) return;

        // Load division winners
        Object.entries(this.preseasonPredictions.divisionWinners).forEach(([division, team]) => {
            const select = document.getElementById(`preseason-${division}-winner`);
            if (select && team) {
                select.value = team;
            }
        });

        // Load wild cards
        Object.entries(this.preseasonPredictions.wildCards).forEach(([slot, team]) => {
            const select = document.getElementById(`preseason-${slot.replace('-', '-wildcard-')}`);
            if (select && team) {
                select.value = team;
            }
        });

        // Load championships
        Object.entries(this.preseasonPredictions.championships).forEach(([type, team]) => {
            const select = document.getElementById(`preseason-${type.replace('super-bowl', 'super-bowl-champion')}`);
            if (select && team) {
                select.value = team;
            }
        });

        // Update constraints after loading all values
        this.updatePreseasonConstraints();
    }

    clearPreseasonPredictions() {
        this.preseasonPredictions = {};
        this.teamRecordPredictions = {};
        localStorage.removeItem('nfl-preseason-predictions');
        localStorage.removeItem('nfl-team-record-predictions');
        
        // Clear UI
        document.querySelectorAll('#preseason-tab select').forEach(select => {
            select.value = '';
        });
        
        // Clear team record inputs
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

    renderStandingsComparison() {
        // Switch to a new tab or modal for standings comparison
        this.switchTab('standings-comparison');
        
        const container = document.getElementById('standings-comparison-content');
        if (!container) return;

        const actualRecords = this.calculateTeamRecords();
        const divisions = getTeamsByDivision();
        
        let html = '';
        let totalTeamsPredicted = 0;
        let exactMatches = 0;
        let closeMatches = 0;
        let totalAccuracyScore = 0;

        // Add header
        html += `
            <div class="comparison-header">
                <div class="comparison-team-row">
                    <div>Team</div>
                    <div>Predicted</div>
                    <div>Actual</div>
                    <div>Accuracy</div>
                </div>
            </div>
        `;

        // Process each conference and division
        ['afc', 'nfc'].forEach(conference => {
            ['east', 'north', 'south', 'west'].forEach(division => {
                const divisionName = `${conference.toUpperCase()} ${division.charAt(0).toUpperCase() + division.slice(1)}`;
                const teams = divisions[conference][division];
                
                html += `
                    <div class="comparison-division">
                        <h4>${divisionName}</h4>
                `;

                teams.forEach(teamCode => {
                    const predictedRecord = this.teamRecordPredictions[teamCode];
                    const actualRecord = actualRecords[teamCode] || { wins: 0, losses: 0 };
                    
                    let predictedDisplay = 'Not predicted';
                    let accuracyDisplay = '-';
                    let accuracyClass = '';

                    if (predictedRecord && (predictedRecord.wins > 0 || predictedRecord.losses > 0)) {
                        totalTeamsPredicted++;
                        predictedDisplay = `${predictedRecord.wins || 0}-${predictedRecord.losses || 0}`;
                        
                        if (predictedRecord.wins + predictedRecord.losses === 17) {
                            const accuracy = calculateRecordAccuracy(
                                predictedRecord.wins, 
                                predictedRecord.losses, 
                                actualRecord.wins, 
                                actualRecord.losses
                            );
                            
                            accuracyDisplay = accuracy.message;
                            accuracyClass = `${accuracy.type}-match`;
                            
                            if (accuracy.type === 'exact') exactMatches++;
                            if (accuracy.type === 'close' || accuracy.type === 'exact') closeMatches++;
                            if (accuracy.score !== undefined) totalAccuracyScore += accuracy.score;
                        }
                    }

                    const actualDisplay = `${actualRecord.wins}-${actualRecord.losses}`;

                    html += `
                        <div class="comparison-team-row">
                            <div class="comparison-team-name">${nflSchedule.teams[teamCode].name}</div>
                            <div class="predicted-record">${predictedDisplay}</div>
                            <div class="actual-record">${actualDisplay}</div>
                            <div class="record-accuracy ${accuracyClass}">${accuracyDisplay}</div>
                        </div>
                    `;
                });

                html += '</div>';
            });
        });

        // Add summary statistics
        const averageAccuracy = totalTeamsPredicted > 0 ? Math.round(totalAccuracyScore / totalTeamsPredicted) : 0;
        const exactPercentage = totalTeamsPredicted > 0 ? Math.round((exactMatches / totalTeamsPredicted) * 100) : 0;
        const closePercentage = totalTeamsPredicted > 0 ? Math.round((closeMatches / totalTeamsPredicted)