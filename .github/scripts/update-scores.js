const fs = require('fs');
const path = require('path');

// ESPN NFL API endpoint for scores
const NFL_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

async function fetchNFLScores() {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(NFL_API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching NFL scores:', error);
        return null;
    }
}

function parseESPNData(espnData) {
    const games = [];
    
    if (!espnData || !espnData.events) {
        return games;
    }
    
    espnData.events.forEach(event => {
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
        const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
        
        // Map ESPN team abbreviations to our team codes
        const homeTeamCode = mapESPNTeamCode(homeTeam.team.abbreviation);
        const awayTeamCode = mapESPNTeamCode(awayTeam.team.abbreviation);
        
        if (!homeTeamCode || !awayTeamCode) {
            console.log(`Skipping game - couldn't map team codes: ${awayTeam.team.abbreviation} @ ${homeTeam.team.abbreviation}`);
            return;
        }
        
        const game = {
            homeTeam: homeTeamCode,
            awayTeam: awayTeamCode,
            homeScore: parseInt(homeTeam.score) || null,
            awayScore: parseInt(awayTeam.score) || null,
            status: mapGameStatus(competition.status.type.name),
            date: event.date.split('T')[0], // Get just the date part
            completed: competition.status.type.completed
        };
        
        // Determine winner if game is completed
        if (game.completed && game.homeScore !== null && game.awayScore !== null) {
            game.winner = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam;
        }
        
        games.push(game);
    });
    
    return games;
}

function mapESPNTeamCode(espnCode) {
    const teamMap = {
        'ARI': 'ARI', 'ATL': 'ATL', 'BAL': 'BAL', 'BUF': 'BUF',
        'CAR': 'CAR', 'CHI': 'CHI', 'CIN': 'CIN', 'CLE': 'CLE',
        'DAL': 'DAL', 'DEN': 'DEN', 'DET': 'DET', 'GB': 'GB',
        'HOU': 'HOU', 'IND': 'IND', 'JAX': 'JAX', 'KC': 'KC',
        'LV': 'LV', 'LAC': 'LAC', 'LAR': 'LAR', 'MIA': 'MIA',
        'MIN': 'MIN', 'NE': 'NE', 'NO': 'NO', 'NYG': 'NYG',
        'NYJ': 'NYJ', 'PHI': 'PHI', 'PIT': 'PIT', 'SF': 'SF',
        'SEA': 'SEA', 'TB': 'TB', 'TEN': 'TEN', 'WSH': 'WAS'
    };
    
    return teamMap[espnCode] || null;
}

function mapGameStatus(espnStatus) {
    const statusMap = {
        'STATUS_SCHEDULED': 'upcoming',
        'STATUS_IN_PROGRESS': 'live',
        'STATUS_FINAL': 'final',
        'STATUS_FINAL_OVERTIME': 'final'
    };
    
    return statusMap[espnStatus] || 'upcoming';
}

function updateScheduleFile(newGames) {
    const scheduleFilePath = path.join(__dirname, '../../nfl-schedule.js');
    
    try {
        let scheduleContent = fs.readFileSync(scheduleFilePath, 'utf8');
        
        // Parse the existing schedule to get the current games array
        const gamesMatch = scheduleContent.match(/games:\s*\[([\s\S]*?)\]\s*}/);
        if (!gamesMatch) {
            console.error('Could not find games array in schedule file');
            return false;
        }
        
        // Load the current schedule data
        const nflScheduleMatch = scheduleContent.match(/const nflSchedule = ({[\s\S]*?});/);
        if (!nflScheduleMatch) {
            console.error('Could not parse nflSchedule object');
            return false;
        }
        
        // Use eval to parse the schedule (in a controlled environment)
        const scheduleCode = nflScheduleMatch[1];
        let nflSchedule;
        try {
            eval(`nflSchedule = ${scheduleCode}`);
        } catch (error) {
            console.error('Error parsing schedule object:', error);
            return false;
        }
        
        let updatedCount = 0;
        
        // Update existing games with new data
        newGames.forEach(newGame => {
            const existingGame = nflSchedule.games.find(game => 
                game.homeTeam === newGame.homeTeam && 
                game.awayTeam === newGame.awayTeam &&
                game.date === newGame.date
            );
            
            if (existingGame) {
                let updated = false;
                
                if (existingGame.homeScore !== newGame.homeScore) {
                    existingGame.homeScore = newGame.homeScore;
                    updated = true;
                }
                
                if (existingGame.awayScore !== newGame.awayScore) {
                    existingGame.awayScore = newGame.awayScore;
                    updated = true;
                }
                
                if (existingGame.status !== newGame.status) {
                    existingGame.status = newGame.status;
                    updated = true;
                }
                
                if (newGame.winner && existingGame.winner !== newGame.winner) {
                    existingGame.winner = newGame.winner;
                    updated = true;
                }
                
                if (updated) {
                    updatedCount++;
                    console.log(`Updated: ${newGame.awayTeam} @ ${newGame.homeTeam} - ${newGame.awayScore}-${newGame.homeScore} (${newGame.status})`);
                }
            }
        });
        
        if (updatedCount > 0) {
            // Update team records
            updateTeamRecords(nflSchedule);
            
            // Write the updated schedule back to the file
            const newScheduleContent = `// NFL 2025-2026 Season Schedule Data
const nflSchedule = ${JSON.stringify(nflSchedule, null, 4)};

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
}`;
            
            fs.writeFileSync(scheduleFilePath, newScheduleContent, 'utf8');
            console.log(`Successfully updated ${updatedCount} games in the schedule file.`);
            return true;
        } else {
            console.log('No games needed updating.');
            return false;
        }
        
    } catch (error) {
        console.error('Error updating schedule file:', error);
        return false;
    }
}

function updateTeamRecords(schedule) {
    // Reset all records
    Object.values(schedule.teams).forEach(team => {
        team.record.wins = 0;
        team.record.losses = 0;
    });
    
    // Calculate records from completed games
    schedule.games.forEach(game => {
        if (game.status === 'final' && game.winner) {
            const winningTeam = game.winner;
            const losingTeam = game.winner === game.homeTeam ? game.awayTeam : game.homeTeam;
            
            if (schedule.teams[winningTeam]) {
                schedule.teams[winningTeam].record.wins++;
            }
            if (schedule.teams[losingTeam]) {
                schedule.teams[losingTeam].record.losses++;
            }
        }
    });
}

async function main() {
    console.log('Fetching NFL scores...');
    const espnData = await fetchNFLScores();
    
    if (!espnData) {
        console.error('Failed to fetch NFL data');
        process.exit(1);
    }
    
    console.log('Parsing game data...');
    const games = parseESPNData(espnData);
    console.log(`Found ${games.length} games from ESPN API`);
    
    if (games.length > 0) {
        console.log('Updating schedule file...');
        const updated = updateScheduleFile(games);
        
        if (updated) {
            console.log('Schedule file updated successfully!');
        } else {
            console.log('No updates were necessary.');
        }
    } else {
        console.log('No games to update.');
    }
}

if (require.main === module) {
    main().catch(console.error);
}