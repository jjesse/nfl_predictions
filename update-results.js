/*
NFL Data Sources (All Free Options):

1. ESPN Public API (Currently Used)
   - No API key required
   - URL: https://site.api.espn.com/apis/site/v2/sports/football/nfl
   - Most reliable for current season data

2. SportsData.io Free Tier
   - Limited to 1000 requests/month
   - Requires free API key
   - Uncomment and set SPORTS_DATA_API_KEY environment variable

3. Alternative Free APIs
   - Various sports data providers
   - May require different parsing logic

To switch data sources, modify the getCurrentWeek() and getWeekGames() functions.
*/

const fs = require('fs');
const https = require('https');

// Alternative free APIs (uncomment to use)
// const FREE_API_BASE = 'https://api.sportsdata.io/v2/json';
// const FREE_API_KEY = process.env.SPORTS_DATA_API_KEY || '';

// Current season
const CURRENT_SEASON = 2025;

// ESPN API base URL
const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

// Function to make API requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      rejectUnauthorized: false  // Only for local testing - GitHub Actions will have proper certs
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Get current week from ESPN
async function getCurrentWeek() {
  try {
    console.log('Fetching current week from ESPN...');
    const response = await makeRequest(`${ESPN_BASE_URL}/scoreboard`);
    console.log('ESPN response received, size:', JSON.stringify(response).length);

    const currentWeek = response.week?.number || 1;
    console.log('Current week from ESPN:', currentWeek);
    return Math.min(Math.max(currentWeek, 1), 18);
  } catch (error) {
    console.log('Error getting current week from ESPN:', error.message);
    console.log('Using fallback calculation...');
    // Fallback: calculate week based on date
    const now = new Date();
    const seasonStart = new Date(2025, 8, 5); // September 5, 2025 (NFL season start)
    const diffTime = Math.abs(now - seasonStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const week = Math.ceil(diffDays / 7);
    const calculatedWeek = Math.min(Math.max(week, 1), 18);
    console.log('Calculated week based on date:', calculatedWeek);
    return calculatedWeek;
  }
}

// Get games for a specific week from ESPN
async function getWeekGames(season, week) {
  try {
    console.log(`Fetching games for season ${season}, week ${week}...`);
    const response = await makeRequest(`${ESPN_BASE_URL}/scoreboard?season=${season}&week=${week}`);
    console.log(`Response received for week ${week}, size:`, JSON.stringify(response).length);

    if (!response.events) {
      console.log(`No events property found in response for week ${week}`);
      console.log('Available properties:', Object.keys(response));
      return [];
    }

    console.log(`Found ${response.events.length} events for week ${week}`);
    return response.events.map(event => {
      const competition = event.competitions[0];
      const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
      const awayTeam = competition.competitors.find(team => team.homeAway === 'away');

      return {
        HomeTeam: homeTeam.team.displayName,
        AwayTeam: awayTeam.team.displayName,
        HomeScore: parseInt(homeTeam.score) || 0,
        AwayScore: parseInt(awayTeam.score) || 0,
        Status: competition.status.type.name,
        Date: event.date
      };
    });
  } catch (error) {
    console.error(`Error fetching games for week ${week}:`, error.message);

    // For testing: return mock data if API fails (remove this in production)
    if (process.env.NODE_ENV === 'test' || process.env.MOCK_DATA === 'true') {
      console.log('Using mock data for testing...');
      return getMockGamesForWeek(week);
    }

    return [];
  }
}

// Mock data for testing when ESPN API is unavailable
function getMockGamesForWeek(week) {
  const mockGames = [
    {
      HomeTeam: 'Kansas City Chiefs',
      AwayTeam: 'Detroit Lions',
      HomeScore: 27,
      AwayScore: 20,
      Status: 'Final',
      Date: '2025-09-07T20:20:00Z'
    },
    {
      HomeTeam: 'Buffalo Bills',
      AwayTeam: 'Arizona Cardinals',
      HomeScore: 31,
      AwayScore: 28,
      Status: 'Final',
      Date: '2025-09-08T17:00:00Z'
    }
  ];

  return week === 1 ? mockGames : [];
}// Alternative: Use free sports data API (if ESPN fails)
// Uncomment and configure if needed
/*
async function getWeekGamesAlt(season, week) {
  try {
    const response = await makeRequest(`${FREE_API_BASE}/GamesByWeek/${season}/${week}?key=${FREE_API_KEY}`);
    return response.map(game => ({
      HomeTeam: game.homeTeam,
      AwayTeam: game.awayTeam,
      HomeScore: game.homeScore,
      AwayScore: game.awayScore,
      Status: game.status
    }));
  } catch (error) {
    console.error('Alternative API failed:', error.message);
    return [];
  }
}
*/

// Load existing results
function loadExistingResults() {
  try {
    const data = fs.readFileSync('results.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing results file, creating new one');
    return {};
  }
}

// Load predictions
function loadPredictions() {
  try {
    const data = fs.readFileSync('predictions.json', 'utf8');
    const parsed = JSON.parse(data);
    
    // Handle both old format (direct predictions) and new format (with regularSeason/postseason)
    if (parsed.regularSeason) {
      return parsed.regularSeason;
    }
    
    return parsed;
  } catch (error) {
    console.log('No predictions file found or file is empty. This is normal if predictions are entered directly in the web app.');
    return {};
  }
}

// Save results
function saveResults(results) {
  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
}

// Calculate team records from games
function calculateTeamRecords(games) {
  const records = {};
  
  games.forEach(game => {
    if (game.Status === 'Final' || game.Status === 'F') {
      const homeTeam = game.HomeTeam;
      const awayTeam = game.AwayTeam;
      const homeScore = game.HomeScore;
      const awayScore = game.AwayScore;
      
      // Initialize records if not exists
      if (!records[homeTeam]) records[homeTeam] = { wins: 0, losses: 0 };
      if (!records[awayTeam]) records[awayTeam] = { wins: 0, losses: 0 };
      
      // Update records
      if (homeScore > awayScore) {
        records[homeTeam].wins++;
        records[awayTeam].losses++;
      } else if (awayScore > homeScore) {
        records[awayTeam].wins++;
        records[homeTeam].losses++;
      }
    }
  });
  
  return records;
}

// Calculate accuracy
function calculateAccuracy(predictions, actualResults) {
  const accuracy = {
    totalTeams: 0,
    correctPredictions: 0,
    totalGames: 0,
    accuracy: 0,
    teamAccuracy: {}
  };
  
  for (const [team, predicted] of Object.entries(predictions)) {
    accuracy.totalTeams++;
    
    if (actualResults[team]) {
      const actual = actualResults[team];
      const predictedWins = predicted.wins;
      const actualWins = actual.wins;
      
      accuracy.totalGames += predictedWins + predicted.losses;
      
      // Simple accuracy: how close the predicted wins are to actual
      const difference = Math.abs(predictedWins - actualWins);
      const maxDifference = 17; // Maximum possible games
      const teamAccuracy = Math.max(0, (maxDifference - difference) / maxDifference);
      
      accuracy.teamAccuracy[team] = {
        predicted: predicted,
        actual: actual,
        difference: difference,
        accuracy: teamAccuracy
      };
      
      // Count as correct if within 2 games
      if (difference <= 2) {
        accuracy.correctPredictions++;
      }
    }
  }
  
  if (accuracy.totalTeams > 0) {
    accuracy.accuracy = (accuracy.correctPredictions / accuracy.totalTeams) * 100;
  }
  
  return accuracy;
}

// Main update function
async function updateResults() {
  console.log('Starting NFL results update...');
  
  try {
    // Get current week
    const currentWeek = await getCurrentWeek();
    console.log(`Current week: ${currentWeek}`);
    
    // Get all games up to current week
    let allGames = [];
    for (let week = 1; week <= currentWeek; week++) {
      console.log(`Fetching games for week ${week}...`);
      const weekGames = await getWeekGames(CURRENT_SEASON, week);
      allGames = allGames.concat(weekGames);
    }
    
    // Calculate current records
    const currentRecords = calculateTeamRecords(allGames);
    console.log('Calculated records for', Object.keys(currentRecords).length, 'teams');
    
    // Load existing results and merge
    const existingResults = loadExistingResults();
    const updatedResults = { ...existingResults, ...currentRecords };
    
    // Save updated results
    saveResults(updatedResults);
    console.log('Results updated successfully');
    
    // Load predictions and calculate accuracy
    const predictions = loadPredictions();
    if (Object.keys(predictions).length > 0) {
        const accuracy = calculateAccuracy(predictions, updatedResults);
        
        // Save accuracy
        fs.writeFileSync('accuracy.json', JSON.stringify(accuracy, null, 2));
        console.log(`Accuracy calculated: ${accuracy.accuracy.toFixed(1)}%`);
    } else {
        console.log('No predictions found locally. Predictions should be entered directly in the web app.');
        // Create empty accuracy file
        const emptyAccuracy = {
            totalTeams: 0,
            correctPredictions: 0,
            totalGames: 0,
            accuracy: 0,
            teamAccuracy: {}
        };
        fs.writeFileSync('accuracy.json', JSON.stringify(emptyAccuracy, null, 2));
    }    console.log('Update completed successfully!');
    
  } catch (error) {
    console.error('Error updating results:', error);
    process.exit(1);
  }
}

// Run the update
updateResults();
