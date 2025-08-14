document.addEventListener('DOMContentLoaded', () => {
    // Setup navigation
    document.getElementById('predictionsBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
        fetchNFLData();
    });
    
    document.getElementById('weeklyBtn').addEventListener('click', () => {
        window.location.href = 'weekly.html';
    });

    // Fetch NFL data on load
    fetchNFLData();
});

// NFL teams organized by conference and division - same as in script.js
const nflTeams = {
    afc: {
        east: [
            { name: 'Buffalo Bills' },
            { name: 'Miami Dolphins' },
            { name: 'New England Patriots' },
            { name: 'New York Jets' }
        ],
        north: [
            { name: 'Baltimore Ravens' },
            { name: 'Cincinnati Bengals' },
            { name: 'Cleveland Browns' },
            { name: 'Pittsburgh Steelers' }
        ],
        south: [
            { name: 'Houston Texans' },
            { name: 'Indianapolis Colts' },
            { name: 'Jacksonville Jaguars' },
            { name: 'Tennessee Titans' }
        ],
        west: [
            { name: 'Denver Broncos' },
            { name: 'Kansas City Chiefs' },
            { name: 'Las Vegas Raiders' },
            { name: 'Los Angeles Chargers' }
        ]
    },
    nfc: {
        east: [
            { name: 'Dallas Cowboys' },
            { name: 'New York Giants' },
            { name: 'Philadelphia Eagles' },
            { name: 'Washington Commanders' }
        ],
        north: [
            { name: 'Chicago Bears' },
            { name: 'Detroit Lions' },
            { name: 'Green Bay Packers' },
            { name: 'Minnesota Vikings' }
        ],
        south: [
            { name: 'Atlanta Falcons' },
            { name: 'Carolina Panthers' },
            { name: 'New Orleans Saints' },
            { name: 'Tampa Bay Buccaneers' }
        ],
        west: [
            { name: 'Arizona Cardinals' },
            { name: 'Los Angeles Rams' },
            { name: 'San Francisco 49ers' },
            { name: 'Seattle Seahawks' }
        ]
    }
};

// Team name mapping for API response (if needed)
const teamNameMapping = {
    'BUF': 'Buffalo Bills',
    'MIA': 'Miami Dolphins',
    'NE': 'New England Patriots',
    'NYJ': 'New York Jets',
    'BAL': 'Baltimore Ravens',
    'CIN': 'Cincinnati Bengals',
    'CLE': 'Cleveland Browns',
    'PIT': 'Pittsburgh Steelers',
    'HOU': 'Houston Texans',
    'IND': 'Indianapolis Colts',
    'JAX': 'Jacksonville Jaguars',
    'TEN': 'Tennessee Titans',
    'DEN': 'Denver Broncos',
    'KC': 'Kansas City Chiefs',
    'LV': 'Las Vegas Raiders',
    'LAC': 'Los Angeles Chargers',
    'DAL': 'Dallas Cowboys',
    'NYG': 'New York Giants',
    'PHI': 'Philadelphia Eagles',
    'WAS': 'Washington Commanders',
    'CHI': 'Chicago Bears',
    'DET': 'Detroit Lions',
    'GB': 'Green Bay Packers',
    'MIN': 'Minnesota Vikings',
    'ATL': 'Atlanta Falcons',
    'CAR': 'Carolina Panthers',
    'NO': 'New Orleans Saints',
    'TB': 'Tampa Bay Buccaneers',
    'ARI': 'Arizona Cardinals',
    'LA': 'Los Angeles Rams',
    'SF': 'San Francisco 49ers',
    'SEA': 'Seattle Seahawks'
};

// Fetch NFL data from ESPN API
async function fetchNFLData() {
    showLoading(true);
    
    try {
        // Using ESPN API for NFL standings
        const response = await fetch('https://site.api.espn.com/apis/v2/sports/football/nfl/standings');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        processNFLData(data);
        
        // Update last updated time
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        
        // Save the data to localStorage with timestamp
        localStorage.setItem('nflData', JSON.stringify({
            timestamp: new Date().getTime(),
            data: data
        }));
        
        showLoading(false);
        showResults(true);
    } catch (error) {
        console.error('Error fetching NFL data:', error);
        showLoading(false);
        showError(true);
    }
}

// Process NFL data and update UI
function processNFLData(data) {
    // Clear existing team elements
    document.querySelectorAll('.teams').forEach(div => div.innerHTML = '');
    
    // Track all team records to sort within divisions
    const teamRecords = {};
    
    // Process standings data
    data.children.forEach(conference => {
        const confName = conference.abbreviation.toLowerCase();
        
        conference.children.forEach(division => {
            const divName = division.name.split(' ').pop().toLowerCase();
            const divisionTeams = [];
            
            // Process each team in the division
            division.standings.entries.forEach(entry => {
                const team = entry.team;
                const stats = entry.stats;
                
                // Find win-loss record
                let wins = 0;
                let losses = 0;
                let winPct = 0;
                
                stats.forEach(stat => {
                    if (stat.name === 'wins') wins = parseInt(stat.value);
                    if (stat.name === 'losses') losses = parseInt(stat.value);
                    if (stat.name === 'winPercent') winPct = parseFloat(stat.value);
                });
                
                // Store team data
                const teamName = team.displayName;
                const teamData = {
                    name: teamName,
                    wins: wins,
                    losses: losses,
                    winPct: winPct,
                    rank: entry.standings.rank
                };
                
                teamRecords[teamName] = teamData;
                divisionTeams.push(teamData);
            });
            
            // Sort teams by rank and render
            divisionTeams.sort((a, b) => a.rank - b.rank);
            
            const divisionEl = document.getElementById(`${confName}-${divName}`);
            if (divisionEl) {
                divisionTeams.forEach(team => {
                    divisionEl.appendChild(createTeamResultElement(team));
                });
            }
        });
    });
    
    // Store team records in localStorage for comparison
    localStorage.setItem('nflActualRecords', JSON.stringify(teamRecords));
    
    // Process playoff data as well
    processPlayoffData(data);
}

// Create a team element for displaying results
function createTeamResultElement(team) {
    const teamEl = document.createElement('div');
    teamEl.className = 'team';
    teamEl.dataset.team = team.name;
    
    // Team rank
    const rankEl = document.createElement('div');
    rankEl.className = 'team-rank';
    rankEl.textContent = team.rank;
    teamEl.appendChild(rankEl);
    
    // Team name
    const nameEl = document.createElement('div');
    nameEl.className = 'team-name';
    nameEl.textContent = team.name;
    teamEl.appendChild(nameEl);
    
    // Team record
    const recordEl = document.createElement('div');
    recordEl.className = 'team-record';
    
    const winsEl = document.createElement('span');
    winsEl.textContent = team.wins;
    
    const dashEl = document.createElement('span');
    dashEl.textContent = '-';
    
    const lossesEl = document.createElement('span');
    lossesEl.textContent = team.losses;
    
    recordEl.appendChild(winsEl);
    recordEl.appendChild(dashEl);
    recordEl.appendChild(lossesEl);
    
    // Add win percentage
    const winPctEl = document.createElement('span');
    winPctEl.className = 'win-percentage';
    winPctEl.textContent = `(${(team.winPct * 100).toFixed(1)}%)`;
    recordEl.appendChild(winPctEl);
    
    teamEl.appendChild(recordEl);
    
    return teamEl;
}

// Process playoff data and display it
function processPlayoffData(data) {
    // In a real app, this would use data from an API
    // For now, we'll show placeholder data
    
    // Mock data for AFC wild cards
    const afcWildcards = [
        "Las Vegas Raiders",
        "Miami Dolphins",
        "Pittsburgh Steelers"
    ];
    
    // Mock data for NFC wild cards
    const nfcWildcards = [
        "Philadelphia Eagles",
        "San Francisco 49ers",
        "Arizona Cardinals"
    ];
    
    // Mock conference champions
    const afcChampion = "Kansas City Chiefs";
    const nfcChampion = "Tampa Bay Buccaneers";
    
    // Mock Super Bowl champion
    const superBowlChampion = "Tampa Bay Buccaneers";
    
    // Display AFC wild cards
    const afcWildcardEl = document.getElementById('afc-wildcard-results');
    afcWildcardEl.innerHTML = '';
    afcWildcards.forEach((team, index) => {
        const wildCardEl = document.createElement('div');
        wildCardEl.className = 'team';
        wildCardEl.innerHTML = `<span class="team-rank">${index + 1}</span><div class="team-name">${team}</div>`;
        afcWildcardEl.appendChild(wildCardEl);
    });
    
    // Display NFC wild cards
    const nfcWildcardEl = document.getElementById('nfc-wildcard-results');
    nfcWildcardEl.innerHTML = '';
    nfcWildcards.forEach((team, index) => {
        const wildCardEl = document.createElement('div');
        wildCardEl.className = 'team';
        wildCardEl.innerHTML = `<span class="team-rank">${index + 1}</span><div class="team-name">${team}</div>`;
        nfcWildcardEl.appendChild(wildCardEl);
    });
    
    // Display conference champions
    const championsEl = document.getElementById('conference-champions-results');
    championsEl.innerHTML = '';
    
    const afcChampEl = document.createElement('div');
    afcChampEl.className = 'team';
    afcChampEl.innerHTML = `<div class="champion-conference">AFC</div><div class="team-name">${afcChampion}</div>`;
    championsEl.appendChild(afcChampEl);
    
    const nfcChampEl = document.createElement('div');
    nfcChampEl.className = 'team';
    nfcChampEl.innerHTML = `<div class="champion-conference">NFC</div><div class="team-name">${nfcChampion}</div>`;
    championsEl.appendChild(nfcChampEl);
    
    // Display Super Bowl champion
    const superBowlEl = document.getElementById('superbowl-result');
    superBowlEl.innerHTML = '';
    
    const superBowlChampEl = document.createElement('div');
    superBowlChampEl.className = 'team champion';
    superBowlChampEl.innerHTML = `<div class="team-name">${superBowlChampion}</div><div class="champion-trophy">🏆</div>`;
    superBowlEl.appendChild(superBowlChampEl);
    
    // Store playoff results for comparison with predictions
    const playoffResults = {
        afcWildcards,
        nfcWildcards,
        afcChampion,
        nfcChampion,
        superBowlChampion
    };
    
    localStorage.setItem('nflPlayoffResults', JSON.stringify(playoffResults));
}

// Helper functions for UI state
function showLoading(show) {
    document.getElementById('loadingContainer').style.display = show ? 'flex' : 'none';
}

function showError(show) {
    document.getElementById('errorContainer').style.display = show ? 'block' : 'none';
    document.getElementById('resultsContainer').style.display = show ? 'none' : 'block';
}

function showResults(show) {
    document.getElementById('resultsContainer').style.display = show ? 'block' : 'none';
    document.getElementById('errorContainer').style.display = show ? 'none' : 'block';
}