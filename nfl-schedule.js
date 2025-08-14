// NFL 2025-2026 Season Schedule Data
const nflSchedule = {
    teams: {
        // AFC East
        "BUF": { name: "Buffalo Bills", conference: "AFC", division: "East", record: { wins: 0, losses: 0 } },
        "MIA": { name: "Miami Dolphins", conference: "AFC", division: "East", record: { wins: 0, losses: 0 } },
        "NE": { name: "New England Patriots", conference: "AFC", division: "East", record: { wins: 0, losses: 0 } },
        "NYJ": { name: "New York Jets", conference: "AFC", division: "East", record: { wins: 0, losses: 0 } },
        
        // AFC North
        "BAL": { name: "Baltimore Ravens", conference: "AFC", division: "North", record: { wins: 0, losses: 0 } },
        "CIN": { name: "Cincinnati Bengals", conference: "AFC", division: "North", record: { wins: 0, losses: 0 } },
        "CLE": { name: "Cleveland Browns", conference: "AFC", division: "North", record: { wins: 0, losses: 0 } },
        "PIT": { name: "Pittsburgh Steelers", conference: "AFC", division: "North", record: { wins: 0, losses: 0 } },
        
        // AFC South
        "HOU": { name: "Houston Texans", conference: "AFC", division: "South", record: { wins: 0, losses: 0 } },
        "IND": { name: "Indianapolis Colts", conference: "AFC", division: "South", record: { wins: 0, losses: 0 } },
        "JAX": { name: "Jacksonville Jaguars", conference: "AFC", division: "South", record: { wins: 0, losses: 0 } },
        "TEN": { name: "Tennessee Titans", conference: "AFC", division: "South", record: { wins: 0, losses: 0 } },
        
        // AFC West
        "DEN": { name: "Denver Broncos", conference: "AFC", division: "West", record: { wins: 0, losses: 0 } },
        "KC": { name: "Kansas City Chiefs", conference: "AFC", division: "West", record: { wins: 0, losses: 0 } },
        "LV": { name: "Las Vegas Raiders", conference: "AFC", division: "West", record: { wins: 0, losses: 0 } },
        "LAC": { name: "Los Angeles Chargers", conference: "AFC", division: "West", record: { wins: 0, losses: 0 } },
        
        // NFC East
        "DAL": { name: "Dallas Cowboys", conference: "NFC", division: "East", record: { wins: 0, losses: 0 } },
        "NYG": { name: "New York Giants", conference: "NFC", division: "East", record: { wins: 0, losses: 0 } },
        "PHI": { name: "Philadelphia Eagles", conference: "NFC", division: "East", record: { wins: 0, losses: 0 } },
        "WAS": { name: "Washington Commanders", conference: "NFC", division: "East", record: { wins: 0, losses: 0 } },
        
        // NFC North
        "CHI": { name: "Chicago Bears", conference: "NFC", division: "North", record: { wins: 0, losses: 0 } },
        "DET": { name: "Detroit Lions", conference: "NFC", division: "North", record: { wins: 0, losses: 0 } },
        "GB": { name: "Green Bay Packers", conference: "NFC", division: "North", record: { wins: 0, losses: 0 } },
        "MIN": { name: "Minnesota Vikings", conference: "NFC", division: "North", record: { wins: 0, losses: 0 } },
        
        // NFC South
        "ATL": { name: "Atlanta Falcons", conference: "NFC", division: "South", record: { wins: 0, losses: 0 } },
        "CAR": { name: "Carolina Panthers", conference: "NFC", division: "South", record: { wins: 0, losses: 0 } },
        "NO": { name: "New Orleans Saints", conference: "NFC", division: "South", record: { wins: 0, losses: 0 } },
        "TB": { name: "Tampa Bay Buccaneers", conference: "NFC", division: "South", record: { wins: 0, losses: 0 } },
        
        // NFC West
        "ARI": { name: "Arizona Cardinals", conference: "NFC", division: "West", record: { wins: 0, losses: 0 } },
        "LAR": { name: "Los Angeles Rams", conference: "NFC", division: "West", record: { wins: 0, losses: 0 } },
        "SF": { name: "San Francisco 49ers", conference: "NFC", division: "West", record: { wins: 0, losses: 0 } },
        "SEA": { name: "Seattle Seahawks", conference: "NFC", division: "West", record: { wins: 0, losses: 0 } }
    },
    
    games: [
        {
            id: "week1_buf_mia",
            week: 1,
            homeTeam: "MIA",
            awayTeam: "BUF",
            date: "2025-09-07",
            time: "1:00 PM",
            status: "upcoming",
            homeScore: null,
            awayScore: null,
            winner: null
        },
        {
            id: "week1_kc_cin",
            week: 1,
            homeTeam: "CIN",
            awayTeam: "KC",
            date: "2025-09-07",
            time: "4:25 PM",
            status: "upcoming",
            homeScore: null,
            awayScore: null,
            winner: null
        },
        {
            id: "week1_dal_nyg",
            week: 1,
            homeTeam: "NYG",
            awayTeam: "DAL",
            date: "2025-09-08",
            time: "8:20 PM",
            status: "upcoming",
            homeScore: null,
            awayScore: null,
            winner: null
        },
        {
            id: "week2_sf_gb",
            week: 2,
            homeTeam: "GB",
            awayTeam: "SF",
            date: "2025-09-14",
            time: "1:00 PM",
            status: "upcoming",
            homeScore: null,
            awayScore: null,
            winner: null
        },
        {
            id: "week2_tb_det",
            week: 2,
            homeTeam: "DET",
            awayTeam: "TB",
            date: "2025-09-14",
            time: "4:25 PM",
            status: "upcoming",
            homeScore: null,
            awayScore: null,
            winner: null
        }
    ]
};

// Function to get team list for filters
function getTeamList() {
    return Object.keys(nflSchedule.teams).sort().map(code => ({
        code,
        name: nflSchedule.teams[code].name
    }));
}

// Function to get weeks list for filters
function getWeeksList() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
}

function getWeekDisplayName(week) {
    return `Week ${week}`;
}