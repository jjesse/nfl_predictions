// Debug script to find missing team codes
// Run this in your browser console to identify which team codes are missing

function debugMissingTeams() {
    console.log('=== NFL Teams Debug ===');
    
    // Check if teams object exists
    if (typeof teams === 'undefined') {
        console.error('❌ teams object is undefined - check if nfl-schedule.js is loaded');
        return;
    }
    
    console.log('✅ teams object found with', Object.keys(teams).length, 'teams');
    console.log('Available team codes:', Object.keys(teams).sort());
    
    // Check if games array exists
    if (typeof games === 'undefined') {
        console.error('❌ games array is undefined - check if nfl-schedule.js is loaded');
        return;
    }
    
    console.log('✅ games array found with', games.length, 'games');
    
    // Find all unique team codes used in games
    const gameTeamCodes = new Set();
    const missingTeams = [];
    
    games.forEach((game, index) => {
        if (!game) {
            console.warn(`⚠️ Game at index ${index} is null/undefined`);
            return;
        }
        
        // Check different possible property names for team codes
        const homeTeam = game.home || game.homeTeam || game.home_team;
        const awayTeam = game.away || game.awayTeam || game.away_team;
        
        if (homeTeam) {
            gameTeamCodes.add(homeTeam);
            if (!teams[homeTeam]) {
                missingTeams.push({
                    code: homeTeam,
                    gameIndex: index,
                    position: 'home',
                    game: game
                });
            }
        } else {
            console.warn(`⚠️ Game at index ${index} missing home team:`, game);
        }
        
        if (awayTeam) {
            gameTeamCodes.add(awayTeam);
            if (!teams[awayTeam]) {
                missingTeams.push({
                    code: awayTeam,
                    gameIndex: index,
                    position: 'away',
                    game: game
                });
            }
        } else {
            console.warn(`⚠️ Game at index ${index} missing away team:`, game);
        }
    });
    
    console.log('Team codes used in games:', Array.from(gameTeamCodes).sort());
    
    if (missingTeams.length > 0) {
        console.error('❌ Missing team codes found:');
        missingTeams.forEach(missing => {
            console.error(`  - "${missing.code}" (${missing.position} team in game ${missing.gameIndex})`);
        });
        
        // Show unique missing codes
        const uniqueMissing = [...new Set(missingTeams.map(m => m.code))];
        console.error('Unique missing team codes:', uniqueMissing);
        
        // Generate team object entries for missing codes
        console.log('\n=== Suggested team entries to add ===');
        uniqueMissing.forEach(code => {
            console.log(`"${code}": { "name": "Team ${code}", "city": "City" },`);
        });
        
    } else {
        console.log('✅ All team codes in games are present in teams object');
    }
    
    // Check for extra teams not used in games
    const unusedTeams = Object.keys(teams).filter(code => !gameTeamCodes.has(code));
    if (unusedTeams.length > 0) {
        console.log('ℹ️ Team codes in teams object but not used in games:', unusedTeams);
    }
    
    return {
        totalTeams: Object.keys(teams).length,
        totalGames: games.length,
        gameTeamCodes: Array.from(gameTeamCodes),
        missingTeams: missingTeams,
        unusedTeams: unusedTeams
    };
}

// Function to temporarily fix missing teams error
function fixMissingTeams() {
    console.log('🔧 Applying temporary fix for missing teams...');
    
    if (typeof teams === 'undefined') {
        console.error('❌ Cannot fix: teams object is undefined');
        return false;
    }
    
    if (typeof games === 'undefined') {
        console.error('❌ Cannot fix: games array is undefined');
        return false;
    }
    
    let addedTeams = 0;
    
    games.forEach((game, index) => {
        if (!game) return;
        
        const homeTeam = game.home || game.homeTeam || game.home_team;
        const awayTeam = game.away || game.awayTeam || game.away_team;
        
        if (homeTeam && !teams[homeTeam]) {
            teams[homeTeam] = { 
                name: `Team ${homeTeam}`, 
                city: homeTeam,
                abbreviation: homeTeam 
            };
            addedTeams++;
            console.log(`➕ Added missing team: ${homeTeam}`);
        }
        
        if (awayTeam && !teams[awayTeam]) {
            teams[awayTeam] = { 
                name: `Team ${awayTeam}`, 
                city: awayTeam,
                abbreviation: awayTeam 
            };
            addedTeams++;
            console.log(`➕ Added missing team: ${awayTeam}`);
        }
    });
    
    console.log(`✅ Fixed ${addedTeams} missing teams`);
    
    // Try to re-render the games if app exists
    if (typeof app !== 'undefined' && app.renderGames) {
        try {
            app.renderGames();
            console.log('✅ Re-rendered games successfully');
        } catch (error) {
            console.error('❌ Failed to re-render games:', error);
        }
    }
    
    return addedTeams > 0;
}

// Auto-run when script loads
if (typeof window !== 'undefined') {
    window.debugMissingTeams = debugMissingTeams;
    window.fixMissingTeams = fixMissingTeams;
    console.log('Debug functions loaded:');
    console.log('- Run debugMissingTeams() to check for missing teams');
    console.log('- Run fixMissingTeams() to temporarily fix missing teams');
    
    // Auto-fix on page load after a short delay
    setTimeout(() => {
        if (typeof teams !== 'undefined' && typeof games !== 'undefined') {
            console.log('🔄 Auto-running missing teams fix...');
            fixMissingTeams();
        }
    }, 2000);
}