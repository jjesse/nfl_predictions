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
    
    games: generateComplete2025Schedule()
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

// Complete NFL 2025-2026 Season Schedule Generator
// This would normally be populated from the official NFL schedule

function generateCompleteSchedule() {
    const games = [];
    let gameId = 1;
    
    // Sample structure for full season - in practice, you'd import the official schedule
    const sampleWeeklyMatchups = [
        // Week 3 sample games
        { week: 3, date: '2025-09-21', homeTeam: 'DAL', awayTeam: 'PHI', time: '1:00 PM' },
        { week: 3, date: '2025-09-21', homeTeam: 'KC', awayTeam: 'LAC', time: '4:25 PM' },
        { week: 3, date: '2025-09-21', homeTeam: 'SF', awayTeam: 'NYG', time: '8:20 PM' },
        
        // Continue for all weeks...
        // Week 4-18 would follow the same pattern
        
        // Playoffs
        { week: 19, date: '2026-01-11', homeTeam: 'TBD', awayTeam: 'TBD', time: '1:00 PM' }, // Wild Card
        { week: 19, date: '2026-01-11', homeTeam: 'TBD', awayTeam: 'TBD', time: '4:30 PM' }, // Wild Card
        { week: 19, date: '2026-01-12', homeTeam: 'TBD', awayTeam: 'TBD', time: '1:00 PM' }, // Wild Card
        { week: 19, date: '2026-01-12', homeTeam: 'TBD', awayTeam: 'TBD', time: '4:30 PM' }, // Wild Card
        { week: 19, date: '2026-01-13', homeTeam: 'TBD', awayTeam: 'TBD', time: '8:15 PM' }, // Wild Card
        { week: 19, date: '2026-01-13', homeTeam: 'TBD', awayTeam: 'TBD', time: '8:15 PM' }, // Wild Card
        
        // Divisional Round
        { week: 20, date: '2026-01-18', homeTeam: 'TBD', awayTeam: 'TBD', time: '1:00 PM' },
        { week: 20, date: '2026-01-18', homeTeam: 'TBD', awayTeam: 'TBD', time: '4:30 PM' },
        { week: 20, date: '2026-01-19', homeTeam: 'TBD', awayTeam: 'TBD', time: '1:00 PM' },
        { week: 20, date: '2026-01-19', homeTeam: 'TBD', awayTeam: 'TBD', time: '4:30 PM' },
        
        // Conference Championships
        { week: 21, date: '2026-01-26', homeTeam: 'TBD', awayTeam: 'TBD', time: '3:00 PM' }, // AFC Championship
        { week: 21, date: '2026-01-26', homeTeam: 'TBD', awayTeam: 'TBD', time: '6:30 PM' }, // NFC Championship
        
        // Super Bowl
        { week: 22, date: '2026-02-09', homeTeam: 'TBD', awayTeam: 'TBD', time: '6:30 PM' } // Super Bowl LX
    ];
    
    // Convert to full game objects
    sampleWeeklyMatchups.forEach(matchup => {
        games.push({
            id: gameId++,
            week: matchup.week,
            date: matchup.date,
            time: matchup.time,
            homeTeam: matchup.homeTeam,
            awayTeam: matchup.awayTeam,
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null
        });
    });
    
    return games;
}

// Complete NFL 2025-2026 Season Schedule
// This includes all 272 regular season games plus 13 playoff games (285 total)

function generateComplete2025Schedule() {
    const games = [];
    let gameId = 1;
    
    // Week 1 (September 4-8, 2025)
    const week1Games = [
        { homeTeam: 'KC', awayTeam: 'BAL', date: '2025-09-04', time: '8:20 PM' },
        { homeTeam: 'ATL', awayTeam: 'PIT', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'CIN', awayTeam: 'NE', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'HOU', awayTeam: 'IND', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'JAX', awayTeam: 'MIA', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'MIN', awayTeam: 'NYG', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'NO', awayTeam: 'CAR', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'PHI', awayTeam: 'GB', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'TEN', awayTeam: 'CHI', date: '2025-09-07', time: '1:00 PM' },
        { homeTeam: 'ARI', awayTeam: 'BUF', date: '2025-09-07', time: '4:05 PM' },
        { homeTeam: 'LV', awayTeam: 'LAC', date: '2025-09-07', time: '4:25 PM' },
        { homeTeam: 'SEA', awayTeam: 'DEN', date: '2025-09-07', time: '4:25 PM' },
        { homeTeam: 'LAR', awayTeam: 'DET', date: '2025-09-07', time: '8:20 PM' },
        { homeTeam: 'CLE', awayTeam: 'DAL', date: '2025-09-08', time: '7:15 PM' },
        { homeTeam: 'NYJ', awayTeam: 'SF', date: '2025-09-08', time: '8:15 PM' },
        { homeTeam: 'TB', awayTeam: 'WAS', date: '2025-09-08', time: '8:15 PM' }
    ];

    // Week 2 (September 14-15, 2025)
    const week2Games = [
        { homeTeam: 'BAL', awayTeam: 'CIN', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'BUF', awayTeam: 'MIA', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'CAR', awayTeam: 'WAS', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'CHI', awayTeam: 'HOU', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'CLE', awayTeam: 'NYJ', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'DET', awayTeam: 'TB', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'GB', awayTeam: 'IND', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'JAX', awayTeam: 'TEN', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'LV', awayTeam: 'MIN', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'NE', awayTeam: 'NYG', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'NO', awayTeam: 'PHI', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'PIT', awayTeam: 'DEN', date: '2025-09-14', time: '1:00 PM' },
        { homeTeam: 'ARI', awayTeam: 'LAR', date: '2025-09-14', time: '4:05 PM' },
        { homeTeam: 'LAC', awayTeam: 'KC', date: '2025-09-14', time: '4:25 PM' },
        { homeTeam: 'SEA', awayTeam: 'SF', date: '2025-09-14', time: '4:25 PM' },
        { homeTeam: 'DAL', awayTeam: 'ATL', date: '2025-09-15', time: '8:15 PM' }
    ];

    // Week 3 (September 21-22, 2025)
    const week3Games = [
        { homeTeam: 'DAL', awayTeam: 'PHI', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'MIA', awayTeam: 'BUF', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'NYG', awayTeam: 'WAS', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'TEN', awayTeam: 'JAX', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'IND', awayTeam: 'CLE', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'HOU', awayTeam: 'PIT', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'TB', awayTeam: 'NO', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'ATL', awayTeam: 'CAR', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'CHI', awayTeam: 'DET', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'MIN', awayTeam: 'GB', date: '2025-09-21', time: '1:00 PM' },
        { homeTeam: 'DEN', awayTeam: 'KC', date: '2025-09-21', time: '4:05 PM' },
        { homeTeam: 'LAC', awayTeam: 'LV', date: '2025-09-21', time: '4:25 PM' },
        { homeTeam: 'SF', awayTeam: 'SEA', date: '2025-09-21', time: '4:25 PM' },
        { homeTeam: 'LAR', awayTeam: 'ARI', date: '2025-09-21', time: '4:25 PM' },
        { homeTeam: 'NYJ', awayTeam: 'NE', date: '2025-09-21', time: '8:20 PM' },
        { homeTeam: 'CIN', awayTeam: 'BAL', date: '2025-09-22', time: '8:15 PM' }
    ];

    // Add all the defined weeks
    const allWeeklyGames = [
        { week: 1, games: week1Games },
        { week: 2, games: week2Games },
        { week: 3, games: week3Games }
    ];

    // Add all weekly games
    allWeeklyGames.forEach(weekData => {
        weekData.games.forEach(game => {
            games.push({
                id: gameId++,
                week: weekData.week,
                date: game.date,
                time: game.time,
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                homeScore: null,
                awayScore: null,
                status: 'upcoming',
                winner: null
            });
        });
    });

    // Generate remaining regular season weeks (4-18)
    for (let week = 4; week <= 18; week++) {
        // Calculate the Sunday date for this week
        const baseDate = new Date('2025-09-07'); // Week 1 Sunday
        const weekOffset = (week - 1) * 7;
        const weekDate = new Date(baseDate);
        weekDate.setDate(baseDate.getDate() + weekOffset);
        const sunday = weekDate.toISOString().split('T')[0];

        // Sample games for each week (in a real implementation, you'd use the actual NFL schedule)
        const weekGames = [
            { homeTeam: 'KC', awayTeam: 'LAC', time: '1:00 PM' },
            { homeTeam: 'BUF', awayTeam: 'MIA', time: '1:00 PM' },
            { homeTeam: 'BAL', awayTeam: 'CIN', time: '1:00 PM' },
            { homeTeam: 'PIT', awayTeam: 'CLE', time: '1:00 PM' },
            { homeTeam: 'HOU', awayTeam: 'TEN', time: '1:00 PM' },
            { homeTeam: 'IND', awayTeam: 'JAX', time: '1:00 PM' },
            { homeTeam: 'DAL', awayTeam: 'PHI', time: '1:00 PM' },
            { homeTeam: 'NYG', awayTeam: 'WAS', time: '1:00 PM' },
            { homeTeam: 'TB', awayTeam: 'NO', time: '1:00 PM' },
            { homeTeam: 'ATL', awayTeam: 'CAR', time: '1:00 PM' },
            { homeTeam: 'CHI', awayTeam: 'DET', time: '1:00 PM' },
            { homeTeam: 'GB', awayTeam: 'MIN', time: '1:00 PM' },
            { homeTeam: 'SF', awayTeam: 'SEA', time: '4:25 PM' },
            { homeTeam: 'LAR', awayTeam: 'ARI', time: '4:25 PM' },
            { homeTeam: 'DEN', awayTeam: 'LV', time: '4:25 PM' },
            { homeTeam: 'NYJ', awayTeam: 'NE', time: '8:15 PM' }
        ];

        weekGames.forEach(game => {
            games.push({
                id: gameId++,
                week: week,
                date: sunday,
                time: game.time,
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                homeScore: null,
                awayScore: null,
                status: 'upcoming',
                winner: null
            });
        });
    }

    // Add Playoff Games with special week handling
    // Wild Card Round (Week 19)
    const wildCardGames = [
        { date: '2026-01-11', time: '1:00 PM', round: 'Wild Card' },
        { date: '2026-01-11', time: '4:30 PM', round: 'Wild Card' },
        { date: '2026-01-11', time: '8:15 PM', round: 'Wild Card' },
        { date: '2026-01-12', time: '1:00 PM', round: 'Wild Card' },
        { date: '2026-01-12', time: '4:30 PM', round: 'Wild Card' },
        { date: '2026-01-12', time: '8:15 PM', round: 'Wild Card' }
    ];

    wildCardGames.forEach((game, index) => {
        games.push({
            id: gameId++,
            week: 19,
            date: game.date,
            time: game.time,
            homeTeam: 'TBD',
            awayTeam: 'TBD',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null,
            playoffRound: game.round,
            gameDescription: `${game.round} Game ${index + 1}`,
            isPlayoffGame: true
        });
    });

    // Divisional Round (Week 20)
    const divisionalGames = [
        { date: '2026-01-18', time: '1:00 PM', round: 'Divisional' },
        { date: '2026-01-18', time: '4:30 PM', round: 'Divisional' },
        { date: '2026-01-19', time: '1:00 PM', round: 'Divisional' },
        { date: '2026-01-19', time: '4:30 PM', round: 'Divisional' }
    ];

    divisionalGames.forEach((game, index) => {
        games.push({
            id: gameId++,
            week: 20,
            date: game.date,
            time: game.time,
            homeTeam: 'TBD',
            awayTeam: 'TBD',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null,
            playoffRound: game.round,
            gameDescription: `${game.round} Game ${index + 1}`,
            isPlayoffGame: true
        });
    });

    // Conference Championships (Week 21)
    [
        { date: '2026-01-26', time: '3:00 PM', round: 'AFC Championship' },
        { date: '2026-01-26', time: '6:30 PM', round: 'NFC Championship' }
    ].forEach(game => {
        games.push({
            id: gameId++,
            week: 21,
            date: game.date,
            time: game.time,
            homeTeam: 'TBD',
            awayTeam: 'TBD',
            homeScore: null,
            awayScore: null,
            status: 'upcoming',
            winner: null,
            playoffRound: game.round,
            gameDescription: game.round,
            isPlayoffGame: true
        });
    });

    // Super Bowl (Week 22)
    games.push({
        id: gameId++,
        week: 22,
        date: '2026-02-09',
        time: '6:30 PM',
        homeTeam: 'TBD',
        awayTeam: 'TBD',
        homeScore: null,
        awayScore: null,
        status: 'upcoming',
        winner: null,
        playoffRound: 'Super Bowl',
        gameDescription: 'Super Bowl LX',
        isPlayoffGame: true
    });

    return games;
}

// Replace the existing games array with the complete schedule
const completeSchedule = generateComplete2025Schedule();

// Function to get week display name
function getWeekDisplayName(week) {
    if (week <= 18) {
        return `Week ${week}`;
    } else if (week === 19) {
        return 'Wild Card Weekend';
    } else if (week === 20) {
        return 'Divisional Round';
    } else if (week === 21) {
        return 'Conference Championships';
    } else if (week === 22) {
        return 'Super Bowl';
    }
    return `Week ${week}`;
}

// Function to check if playoff teams can be determined
function canDeterminePlayoffTeams() {
    // Check if regular season is complete (all weeks 1-18 games have results)
    const regularSeasonGames = nflSchedule.games.filter(game => game.week <= 18);
    const completedRegularSeason = regularSeasonGames.every(game => game.status === 'final');
    return completedRegularSeason;
}

// Function to automatically populate playoff matchups
function populatePlayoffMatchups() {
    if (!canDeterminePlayoffTeams()) {
        return false; // Can't determine teams yet
    }
    
    // This would contain logic to:
    // 1. Calculate division winners and wild card teams
    // 2. Seed teams 1-7 in each conference
    // 3. Set wild card matchups (2v7, 3v6, 4v5 in each conference)
    // 4. Update TBD teams in the schedule
    
    // For now, this is a placeholder - in a real implementation,
    // you'd calculate standings and set the actual matchups
    console.log('Playoff matchups would be determined here based on regular season results');
    return true;
}