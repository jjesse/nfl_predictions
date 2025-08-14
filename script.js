// NFL Teams data
const nflTeams = {
    "afc-east": ["Buffalo Bills", "Miami Dolphins", "New England Patriots", "New York Jets"],
    "afc-north": ["Baltimore Ravens", "Cincinnati Bengals", "Cleveland Browns", "Pittsburgh Steelers"],
    "afc-south": ["Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Tennessee Titans"],
    "afc-west": ["Denver Broncos", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers"],
    "nfc-east": ["Dallas Cowboys", "New York Giants", "Philadelphia Eagles", "Washington Commanders"],
    "nfc-north": ["Chicago Bears", "Detroit Lions", "Green Bay Packers", "Minnesota Vikings"],
    "nfc-south": ["Atlanta Falcons", "Carolina Panthers", "New Orleans Saints", "Tampa Bay Buccaneers"],
    "nfc-west": ["Arizona Cardinals", "Los Angeles Rams", "San Francisco 49ers", "Seattle Seahawks"]
};

// We'll use the NFL schedule from schedules.js

// Initialize the application
function init() {
    populateDivisions();
    populateWildcardSelections();
    populateChampionshipSelections();
    setupEventListeners();
}

// Populate divisions with teams
function populateDivisions() {
    for (const [division, teams] of Object.entries(nflTeams)) {
        const divisionElement = document.getElementById(division);
        teams.forEach(team => {
            const teamElement = document.createElement('div');
            teamElement.classList.add('team');
            
            const nameElement = document.createElement('span');
            nameElement.classList.add('team-name');
            nameElement.textContent = team;
            
            const recordElement = document.createElement('span');
            recordElement.classList.add('team-record');
            recordElement.textContent = '0-0';
            
            const predictedElement = document.createElement('input');
            predictedElement.setAttribute('type', 'number');
            predictedElement.classList.add('predicted-wins');
            predictedElement.setAttribute('min', '0');
            predictedElement.setAttribute('max', '17');
            predictedElement.setAttribute('placeholder', 'Wins');
            predictedElement.dataset.team = team;
            
            teamElement.appendChild(nameElement);
            teamElement.appendChild(recordElement);
            teamElement.appendChild(predictedElement);
            divisionElement.appendChild(teamElement);
        });
    }
}

// Populate wildcard selection dropdowns
function populateWildcardSelections() {
    const afcTeams = [...nflTeams["afc-east"], ...nflTeams["afc-north"], 
                      ...nflTeams["afc-south"], ...nflTeams["afc-west"]];
    const nfcTeams = [...nflTeams["nfc-east"], ...nflTeams["nfc-north"], 
                      ...nflTeams["nfc-south"], ...nflTeams["nfc-west"]];
    
    // Populate AFC wildcards
    for (let i = 1; i <= 3; i++) {
        const select = document.getElementById(`afc-wildcard-${i}`);
        populateTeamSelect(select, afcTeams);
    }
    
    // Populate NFC wildcards
    for (let i = 1; i <= 3; i++) {
        const select = document.getElementById(`nfc-wildcard-${i}`);
        populateTeamSelect(select, nfcTeams);
    }
}

// Populate championship selections
function populateChampionshipSelections() {
    const afcTeams = [...nflTeams["afc-east"], ...nflTeams["afc-north"], 
                      ...nflTeams["afc-south"], ...nflTeams["afc-west"]];
    const nfcTeams = [...nflTeams["nfc-east"], ...nflTeams["nfc-north"], 
                      ...nflTeams["nfc-south"], ...nflTeams["nfc-west"]];
    const allTeams = [...afcTeams, ...nfcTeams];
    
    // AFC Champion
    populateTeamSelect(document.getElementById('afc-champion'), afcTeams);
    
    // NFC Champion
    populateTeamSelect(document.getElementById('nfc-champion'), nfcTeams);
    
    // Super Bowl Champion
    populateTeamSelect(document.getElementById('superbowl-champion'), allTeams);
}

// Helper to populate a select element with team options
function populateTeamSelect(selectElement, teams) {
    // Add placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";
    placeholderOption.textContent = "-- Select Team --";
    placeholderOption.selected = true;
    placeholderOption.disabled = true;
    selectElement.appendChild(placeholderOption);
    
    // Add team options
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        selectElement.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', savePredictions);
    
    // Compare button
    document.getElementById('compareBtn').addEventListener('click', compareWithActual);
    
    // Results button
    document.getElementById('resultsBtn').addEventListener('click', viewRealResults);
    
    // Weekly button
    document.getElementById('weeklyBtn').addEventListener('click', showWeeklyMatchups);
}

// Save user predictions
function savePredictions() {
    const predictions = {
        divisions: {},
        wildcards: {
            afc: [],
            nfc: []
        },
        champions: {
            afc: document.getElementById('afc-champion').value,
            nfc: document.getElementById('nfc-champion').value,
            superBowl: document.getElementById('superbowl-champion').value
        },
        weeklyPicks: {}
    };
    
    // Save division predictions
    for (const division in nflTeams) {
        const teams = document.querySelectorAll(`#${division} .team`);
        predictions.divisions[division] = Array.from(teams).map(team => {
            return {
                name: team.querySelector('.team-name').textContent,
                predictedWins: team.querySelector('.predicted-wins').value || 0
            };
        });
    }
    
    // Save wildcard predictions
    for (let i = 1; i <= 3; i++) {
        const afcWildcard = document.getElementById(`afc-wildcard-${i}`).value;
        const nfcWildcard = document.getElementById(`nfc-wildcard-${i}`).value;
        
        if (afcWildcard) predictions.wildcards.afc.push(afcWildcard);
        if (nfcWildcard) predictions.wildcards.nfc.push(nfcWildcard);
    }
    
    // Store predictions in localStorage
    localStorage.setItem('nflPredictions', JSON.stringify(predictions));
    
    alert('Predictions saved successfully!');
}

// Compare predictions with actual results
function compareWithActual() {
    // This would fetch the actual results and compare with predictions
    alert('Comparison feature will be available once the season progresses');
}

// View real results
function viewRealResults() {
    // Navigate to the results page
    window.location.href = 'results.html';
}

// Show weekly matchups
function showWeeklyMatchups() {
    // Navigate to the weekly.html page
    window.location.href = 'weekly.html';
}

// Display games for a specific week
function displayWeekGames(weekNumber, container) {
    container.innerHTML = '';
    
    let games;
    let weekTitle;
    
    // Determine which games to show based on week number
    if (weekNumber <= 18) {
        games = nflSchedule.regularSeason[weekNumber - 1].games;
        weekTitle = `Regular Season - Week ${weekNumber}`;
    } else {
        switch (weekNumber) {
            case 19:
                games = nflSchedule.postSeason.wildCard.games;
                weekTitle = 'Wild Card Round';
                break;
            case 20:
                games = nflSchedule.postSeason.divisionalRound.games;
                weekTitle = 'Divisional Round';
                break;
            case 21:
                games = nflSchedule.postSeason.conferenceChampionships.games;
                weekTitle = 'Conference Championships';
                break;
            case 22:
                games = nflSchedule.postSeason.superBowl.games;
                weekTitle = 'Super Bowl';
                break;
        }
    }
    
    // Week title
    const titleElement = document.createElement('h3');
    titleElement.textContent = weekTitle;
    container.appendChild(titleElement);
    
    // Display each game
    games.forEach((game, index) => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game-matchup');
        
        const matchupText = document.createElement('div');
        matchupText.classList.add('matchup-text');
        matchupText.textContent = `${game.awayTeam} @ ${game.homeTeam}`;
        
        const predictionSelect = document.createElement('select');
        predictionSelect.classList.add('prediction-select');
        predictionSelect.dataset.week = weekNumber;
        predictionSelect.dataset.gameIndex = index;
        
        // Add options for prediction
        const options = [
            { value: "", text: "-- Select Winner --" },
            { value: game.homeTeam, text: game.homeTeam },
            { value: game.awayTeam, text: game.awayTeam }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === "") {
                optionElement.selected = true;
                optionElement.disabled = true;
            }
            predictionSelect.appendChild(optionElement);
        });
        
        // Load saved prediction if exists
        const savedPredictions = JSON.parse(localStorage.getItem('nflPredictions') || '{}');
        if (savedPredictions.weeklyPicks && 
            savedPredictions.weeklyPicks[weekNumber] && 
            savedPredictions.weeklyPicks[weekNumber][index]) {
            predictionSelect.value = savedPredictions.weeklyPicks[weekNumber][index];
        }
        
        // Save prediction on change
        predictionSelect.addEventListener('change', function() {
            const week = this.dataset.week;
            const gameIdx = this.dataset.gameIndex;
            const winner = this.value;
            
            // Get existing predictions or initialize
            const savedPredictions = JSON.parse(localStorage.getItem('nflPredictions') || '{}');
            if (!savedPredictions.weeklyPicks) savedPredictions.weeklyPicks = {};
            if (!savedPredictions.weeklyPicks[week]) savedPredictions.weeklyPicks[week] = {};
            
            // Save prediction
            savedPredictions.weeklyPicks[week][gameIdx] = winner;
            localStorage.setItem('nflPredictions', JSON.stringify(savedPredictions));
        });
        
        gameElement.appendChild(matchupText);
        gameElement.appendChild(predictionSelect);
        container.appendChild(gameElement);
    });
}

// Call init when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);