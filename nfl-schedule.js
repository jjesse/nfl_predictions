// NFL 2025-2026 Season Schedule Data
const nflSchedule = {
    teams: {
        'ARI': { name: 'Arizona Cardinals', record: { wins: 0, losses: 0 } },
        'ATL': { name: 'Atlanta Falcons', record: { wins: 0, losses: 0 } },
        'BAL': { name: 'Baltimore Ravens', record: { wins: 0, losses: 0 } },
        'BUF': { name: 'Buffalo Bills', record: { wins: 0, losses: 0 } },
        'CAR': { name: 'Carolina Panthers', record: { wins: 0, losses: 0 } },
        'CHI': { name: 'Chicago Bears', record: { wins: 0, losses: 0 } },
        'CIN': { name: 'Cincinnati Bengals', record: { wins: 0, losses: 0 } },
        'CLE': { name: 'Cleveland Browns', record: { wins: 0, losses: 0 } },
        'DAL': { name: 'Dallas Cowboys', record: { wins: 0, losses: 0 } },
        'DEN': { name: 'Denver Broncos', record: { wins: 0, losses: 0 } },
        'DET': { name: 'Detroit Lions', record: { wins: 0, losses: 0 } },
        'GB': { name: 'Green Bay Packers', record: { wins: 0, losses: 0 } },
        'HOU': { name: 'Houston Texans', record: { wins: 0, losses: 0 } },
        'IND': { name: 'Indianapolis Colts', record: { wins: 0, losses: 0 } },
        'JAX': { name: 'Jacksonville Jaguars', record: { wins: 0, losses: 0 } },
        'KC': { name: 'Kansas City Chiefs', record: { wins: 0, losses: 0 } },
        'LV': { name: 'Las Vegas Raiders', record: { wins: 0, losses: 0 } },
        'LAC': { name: 'Los Angeles Chargers', record: { wins: 0, losses: 0 } },
        'LAR': { name: 'Los Angeles Rams', record: { wins: 0, losses: 0 } },
        'MIA': { name: 'Miami Dolphins', record: { wins: 0, losses: 0 } },
        'MIN': { name: 'Minnesota Vikings', record: { wins: 0, losses: 0 } },
        'NE': { name: 'New England Patriots', record: { wins: 0, losses: 0 } },
        'NO': { name: 'New Orleans Saints', record: { wins: 0, losses: 0 } },
        'NYG': { name: 'New York Giants', record: { wins: 0, losses: 0 } },
        'NYJ': { name: 'New York Jets', record: { wins: 0, losses: 0 } },
        'PHI': { name: 'Philadelphia Eagles', record: { wins: 0, losses: 0 } },
        'PIT': { name: 'Pittsburgh Steelers', record: { wins: 0, losses: 0 } },
        'SF': { name: 'San Francisco 49ers', record: { wins: 0, losses: 0 } },
        'SEA': { name: 'Seattle Seahawks', record: { wins: 0, losses: 0 } },
        'TB': { name: 'Tampa Bay Buccaneers', record: { wins: 0, losses: 0 } },
        'TEN': { name: 'Tennessee Titans', record: { wins: 0, losses: 0 } },
        'WAS': { name: 'Washington Commanders', record: { wins: 0, losses: 0 } }
    },
    
    games: [
        // Week 1
        {
            id: 1,
            week: 1,
            date: '2025-09-04',
            time: '8:20 PM',
            homeTeam: 'KC',
            awayTeam: 'BAL',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 2,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'ATL',
            awayTeam: 'PIT',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 3,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'CIN',
            awayTeam: 'NE',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 4,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'HOU',
            awayTeam: 'IND',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 5,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'JAX',
            awayTeam: 'MIA',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 6,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'MIN',
            awayTeam: 'NYG',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 7,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'NO',
            awayTeam: 'CAR',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 8,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'PHI',
            awayTeam: 'GB',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 9,
            week: 1,
            date: '2025-09-07',
            time: '1:00 PM',
            homeTeam: 'TEN',
            awayTeam: 'CHI',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 10,
            week: 1,
            date: '2025-09-07',
            time: '4:05 PM',
            homeTeam: 'ARI',
            awayTeam: 'BUF',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 11,
            week: 1,
            date: '2025-09-07',
            time: '4:25 PM',
            homeTeam: 'LV',
            awayTeam: 'LAC',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 12,
            week: 1,
            date: '2025-09-07',
            time: '4:25 PM',
            homeTeam: 'SEA',
            awayTeam: 'DEN',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 13,
            week: 1,
            date: '2025-09-07',
            time: '8:20 PM',
            homeTeam: 'LAR',
            awayTeam: 'DET',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 14,
            week: 1,
            date: '2025-09-08',
            time: '7:15 PM',
            homeTeam: 'CLE',
            awayTeam: 'DAL',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 15,
            week: 1,
            date: '2025-09-08',
            time: '8:15 PM',
            homeTeam: 'NYJ',
            awayTeam: 'SF',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 16,
            week: 1,
            date: '2025-09-08',
            time: '8:15 PM',
            homeTeam: 'TB',
            awayTeam: 'WAS',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        
        // Week 2 - Sample games
        {
            id: 17,
            week: 2,
            date: '2025-09-14',
            time: '1:00 PM',
            homeTeam: 'BAL',
            awayTeam: 'CIN',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 18,
            week: 2,
            date: '2025-09-14',
            time: '1:00 PM',
            homeTeam: 'BUF',
            awayTeam: 'MIA',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 19,
            week: 2,
            date: '2025-09-14',
            time: '1:00 PM',
            homeTeam: 'CAR',
            awayTeam: 'WAS',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        },
        {
            id: 20,
            week: 2,
            date: '2025-09-14',
            time: '1:00 PM',
            homeTeam: 'CHI',
            awayTeam: 'HOU',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        }
        // Additional weeks would continue here...
        // For brevity, I'm including a representative sample
        // In a real implementation, you'd want all 18 weeks of regular season games
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
    const weeks = [...new Set(nflSchedule.games.map(game => game.week))].sort((a, b) => a - b);
    return weeks;
}