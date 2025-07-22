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
        this.populateResultsFilters();
        this.renderGames();
        this.updateStats();
        this.loadPreseasonUI();
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
        this.renderConferenceStandings('AFC', 'afc-standings');
        this.renderConferenceStandings('NFC', 'nfc-standings');
    }

    renderConferenceStandings(conference, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Get teams for this conference
        const conferenceTeams = Object.keys(nflSchedule.teams).filter(teamCode => {
            if (conference === 'AFC') {
                return ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN'].includes(teamCode);
            } else {
                return ['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LAR', 'MIN', 'NO', 'NYG', 'PHI', 'SF', 'SEA', 'TB', 'WAS'].includes(teamCode);
            }
        });

        // Sort teams by record (wins descending, then losses ascending)
        conferenceTeams.sort((a, b) => {
            const teamA = nflSchedule.teams[a];
            const teamB = nflSchedule.teams[b];
            
            if (teamA.record.wins !== teamB.record.wins) {
                return teamB.record.wins - teamA.record.wins; // More wins first
            }
            return teamA.record.losses - teamB.record.losses; // Fewer losses first
        });

        // Group by divisions
        const divisions = {
            'AFC': {
                'East': ['BUF', 'MIA', 'NE', 'NYJ'],
                'North': ['BAL', 'CIN', 'CLE', 'PIT'],
                'South': ['HOU', 'IND', 'JAX', 'TEN'],
                'West': ['DEN', 'KC', 'LV', 'LAC']
            },
            'NFC': {
                'East': ['DAL', 'NYG', 'PHI', 'WAS'],
                'North': ['CHI', 'DET', 'GB', 'MIN'],
                'South': ['ATL', 'CAR', 'NO', 'TB'],
                'West': ['ARI', 'LAR', 'SF', 'SEA']
            }
        };

        let html = '<div class="divisions-grid">';
        
        Object.entries(divisions[conference]).forEach(([divisionName, divisionTeams]) => {
            // Sort division teams by record
            const sortedDivisionTeams = divisionTeams.sort((a, b) => {
                const teamA = nflSchedule.teams[a];
                const teamB = nflSchedule.teams[b];
                
                if (teamA.record.wins !== teamB.record.wins) {
                    return teamB.record.wins - teamA.record.wins;
                }
                return teamA.record.losses - teamB.record.losses;
            });

            html += `
                <div class="division-standings">
                    <h4>${conference} ${divisionName}</h4>
                    <div class="standings-list">
            `;

            sortedDivisionTeams.forEach((teamCode, index) => {
                const team = nflSchedule.teams[teamCode];
                const winPercentage = team.record.wins + team.record.losses > 0 
                    ? (team.record.wins / (team.record.wins + team.record.losses) * 100).toFixed(1)
                    : '0.0';

                html += `
                    <div class="standing-item ${index === 0 ? 'division-leader' : ''}">
                        <span class="team-name">${team.name}</span>
                        <span class="record">${team.record.wins}-${team.record.losses}</span>
                        <span class="win-pct">${winPercentage}%</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
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
        
        // Add special styling for playoff games
        if (game.isPlayoffGame) {
            gameDiv.classList.add('playoff-game');
        }
        
        const weekDisplay = game.isPlayoffGame ? game.gameDescription : `Week ${game.week}`;
        
        gameDiv.innerHTML = `
            <div class="game-header">
                <div class="game-info">
                    <span class="week-info">${weekDisplay}</span>
                    <span>${game.date}</span>
                    <span>${game.time}</span>
                    ${game.isPlayoffGame ? `<span class="playoff-badge">${game.playoffRound}</span>` : ''}
                </div>
                <div class="game-status status-${game.status}">
                    ${this.getStatusText(game.status)}
                </div>
            </div>
            
            <div class="teams-container">
                <div class="team away-team">
                    <div class="team-name">
                        ${game.awayTeam === 'TBD' ? 'TBD' : nflSchedule.teams[game.awayTeam].name}
                        ${game.winner === game.awayTeam ? '<span class="winner-badge">Winner</span>' : ''}
                    </div>
                    <div class="team-record">
                        ${game.awayTeam === 'TBD' ? '' : this.getTeamRecord(game.awayTeam)}
                    </div>
                    <div class="team-score">
                        ${game.awayScore !== null ? game.awayScore : '-'}
                    </div>
                </div>
                
                <div class="vs">@</div>
                
                <div class="team home-team">
                    <div class="team-name">
                        ${game.homeTeam === 'TBD' ? 'TBD' : nflSchedule.teams[game.homeTeam].name}
                        ${game.winner === game.homeTeam ? '<span class="winner-badge">Winner</span>' : ''}
                    </div>
                    <div class="team-record">
                        ${game.homeTeam === 'TBD' ? '' : this.getTeamRecord(game.homeTeam)}
                    </div>
                    <div class="team-score">
                        ${game.homeScore !== null ? game.homeScore : '-'}
                    </div>
                </div>
            </div>
            
            <div class="prediction-section">
                ${this.renderPredictionControls(game)}
                ${this.renderPredictionResult(game)}
                ${this.renderPreseasonComparison(game)}
            </div>
        `;

        return gameDiv;
    }

    renderPredictionControls(game) {
        // Don't show prediction controls for TBD games
        if (game.homeTeam === 'TBD' || game.awayTeam === 'TBD') {
            return `
                <div class="prediction-controls disabled">
                    <label>Prediction:</label>
                    <span class="tbd-notice">Teams will be determined after ${game.week <= 19 ? 'regular season' : 'previous playoff round'} completes</span>
                </div>
            `;
        }

        return `
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
        `;
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