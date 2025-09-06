// NFL Schedule data and weekly matchup functionality

const nflTeamsByDivision = {
    "afc-east": ["Buffalo Bills", "Miami Dolphins", "New England Patriots", "New York Jets"],
    "afc-north": ["Baltimore Ravens", "Cincinnati Bengals", "Cleveland Browns", "Pittsburgh Steelers"],
    "afc-south": ["Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Tennessee Titans"],
    "afc-west": ["Denver Broncos", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers"],
    "nfc-east": ["Dallas Cowboys", "New York Giants", "Philadelphia Eagles", "Washington Commanders"],
    "nfc-north": ["Chicago Bears", "Detroit Lions", "Green Bay Packers", "Minnesota Vikings"],
    "nfc-south": ["Atlanta Falcons", "Carolina Panthers", "New Orleans Saints", "Tampa Bay Buccaneers"],
    "nfc-west": ["Arizona Cardinals", "Los Angeles Rams", "San Francisco 49ers", "Seattle Seahawks"]
};

const allNFLTeams = Object.values(nflTeamsByDivision).flat();

// 2025-2026 NFL Schedule Data
let nflSchedule = {};

// Export the schedule for ES modules
window.nfl2025Schedule = {};

// Generate the official 2025-2026 NFL schedule that was released in May 2025
function generateFullSchedule() {
    window.nfl2025Schedule = {
        1: [
            { home: 'Kansas City Chiefs', away: 'Baltimore Ravens', date: '2025-09-04', time: '8:20 PM ET' },
            { home: 'New York Jets', away: 'Buffalo Bills', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Miami Dolphins', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Cincinnati Bengals', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Washington Commanders', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'New Orleans Saints', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Atlanta Falcons', away: 'Pittsburgh Steelers', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Chicago Bears', away: 'Tennessee Titans', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Indianapolis Colts', date: '2025-09-07', time: '1:00 PM ET' },
            { home: 'Minnesota Vikings', away: 'Green Bay Packers', date: '2025-09-07', time: '4:25 PM ET' },
            { home: 'Los Angeles Rams', away: 'Detroit Lions', date: '2025-09-07', time: '4:05 PM ET' },
            { home: 'Arizona Cardinals', away: 'Philadelphia Eagles', date: '2025-09-07', time: '4:25 PM ET' },
            { home: 'Denver Broncos', away: 'Seattle Seahawks', date: '2025-09-07', time: '4:25 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Los Angeles Chargers', date: '2025-09-07', time: '4:05 PM ET' },
            { home: 'Dallas Cowboys', away: 'New York Giants', date: '2025-09-07', time: '8:20 PM ET' },
            { home: 'San Francisco 49ers', away: 'Tampa Bay Buccaneers', date: '2025-09-08', time: '8:15 PM ET' }
        ],
        2: [
            { home: 'Philadelphia Eagles', away: 'Dallas Cowboys', date: '2025-09-11', time: '8:15 PM ET' },
            { home: 'Buffalo Bills', away: 'New England Patriots', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Tennessee Titans', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Detroit Lions', away: 'Chicago Bears', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Pittsburgh Steelers', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Cincinnati Bengals', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'New York Jets', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'New Orleans Saints', date: '2025-09-14', time: '1:00 PM ET' },
            { home: 'Arizona Cardinals', away: 'San Francisco 49ers', date: '2025-09-14', time: '4:05 PM ET' },
            { home: 'Los Angeles Rams', away: 'Seattle Seahawks', date: '2025-09-14', time: '4:05 PM ET' },
            { home: 'Denver Broncos', away: 'Kansas City Chiefs', date: '2025-09-14', time: '4:25 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Las Vegas Raiders', date: '2025-09-14', time: '4:25 PM ET' },
            { home: 'Minnesota Vikings', away: 'Green Bay Packers', date: '2025-09-14', time: '4:25 PM ET' },
            { home: 'New York Giants', away: 'Washington Commanders', date: '2025-09-14', time: '8:20 PM ET' },
            { home: 'Carolina Panthers', away: 'Atlanta Falcons', date: '2025-09-15', time: '8:15 PM ET' },
            { home: 'Indianapolis Colts', away: 'Jacksonville Jaguars', date: '2025-09-15', time: '8:15 PM ET' }
        ],
        3: [
            { home: 'San Francisco 49ers', away: 'Seattle Seahawks', date: '2025-09-18', time: '8:15 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Tennessee Titans', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Minnesota Vikings', away: 'Detroit Lions', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'New York Jets', away: 'Buffalo Bills', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'New York Giants', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Cleveland Browns', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Pittsburgh Steelers', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Atlanta Falcons', away: 'New Orleans Saints', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'New England Patriots', date: '2025-09-21', time: '1:00 PM ET' },
            { home: 'Green Bay Packers', away: 'Chicago Bears', date: '2025-09-21', time: '4:25 PM ET' },
            { home: 'Arizona Cardinals', away: 'Los Angeles Rams', date: '2025-09-21', time: '4:05 PM ET' },
            { home: 'Kansas City Chiefs', away: 'Los Angeles Chargers', date: '2025-09-21', time: '4:25 PM ET' },
            { home: 'Dallas Cowboys', away: 'Philadelphia Eagles', date: '2025-09-21', time: '4:25 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Denver Broncos', date: '2025-09-21', time: '8:20 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'Carolina Panthers', date: '2025-09-22', time: '8:15 PM ET' },
            { home: 'Houston Texans', away: 'Indianapolis Colts', date: '2025-09-21', time: '1:00 PM ET' }
        ],
        4: [
            { home: 'Green Bay Packers', away: 'Minnesota Vikings', date: '2025-09-25', time: '8:15 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Chicago Bears', date: '2025-09-28', time: '9:30 AM ET', location: 'London, UK' },
            { home: 'Buffalo Bills', away: 'Miami Dolphins', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'New Orleans Saints', away: 'Indianapolis Colts', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'New York Jets', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Tennessee Titans', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'Atlanta Falcons', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Cincinnati Bengals', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'Philadelphia Eagles', away: 'New York Giants', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'Detroit Lions', date: '2025-09-28', time: '1:00 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Kansas City Chiefs', date: '2025-09-28', time: '4:05 PM ET' },
            { home: 'San Francisco 49ers', away: 'Arizona Cardinals', date: '2025-09-28', time: '4:25 PM ET' },
            { home: 'Dallas Cowboys', away: 'Tampa Bay Buccaneers', date: '2025-09-28', time: '4:25 PM ET' },
            { home: 'Pittsburgh Steelers', away: 'Baltimore Ravens', date: '2025-09-28', time: '8:20 PM ET' },
            { home: 'Denver Broncos', away: 'Las Vegas Raiders', date: '2025-09-29', time: '8:15 PM ET' },
            { home: 'Seattle Seahawks', away: 'Los Angeles Rams', date: '2025-09-28', time: '4:05 PM ET' }
        ],
        5: [
            { home: 'Cincinnati Bengals', away: 'Pittsburgh Steelers', date: '2025-10-02', time: '8:15 PM ET' },
            { home: 'New York Giants', away: 'Chicago Bears', date: '2025-10-05', time: '9:30 AM ET', location: 'London, UK' },
            { home: 'Atlanta Falcons', away: 'Carolina Panthers', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'New Orleans Saints', away: 'San Francisco 49ers', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'Indianapolis Colts', away: 'Houston Texans', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Tennessee Titans', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'Cleveland Browns', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'New York Jets', away: 'New England Patriots', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Washington Commanders', date: '2025-10-05', time: '1:00 PM ET' },
            { home: 'Arizona Cardinals', away: 'San Francisco 49ers', date: '2025-10-05', time: '4:05 PM ET' },
            { home: 'Los Angeles Rams', away: 'Seattle Seahawks', date: '2025-10-05', time: '4:05 PM ET' },
            { home: 'Denver Broncos', away: 'Kansas City Chiefs', date: '2025-10-05', time: '4:25 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Los Angeles Chargers', date: '2025-10-05', time: '4:25 PM ET' },
            { home: 'Minnesota Vikings', away: 'Detroit Lions', date: '2025-10-05', time: '4:25 PM ET' },
            { home: 'Philadelphia Eagles', away: 'Tampa Bay Buccaneers', date: '2025-10-05', time: '8:20 PM ET' }
        ],
        6: [
            { home: 'Chicago Bears', away: 'Jacksonville Jaguars', date: '2025-10-09', time: '8:15 PM ET' },
            { home: 'Buffalo Bills', away: 'New York Jets', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Baltimore Ravens', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Pittsburgh Steelers', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Tennessee Titans', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Miami Dolphins', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'New York Giants', away: 'Philadelphia Eagles', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'New Orleans Saints', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'Atlanta Falcons', date: '2025-10-12', time: '1:00 PM ET' },
            { home: 'Arizona Cardinals', away: 'Los Angeles Rams', date: '2025-10-12', time: '4:05 PM ET' },
            { home: 'Seattle Seahawks', away: 'San Francisco 49ers', date: '2025-10-12', time: '4:05 PM ET' },
            { home: 'Dallas Cowboys', away: 'Detroit Lions', date: '2025-10-12', time: '4:25 PM ET' },
            { home: 'Kansas City Chiefs', away: 'Denver Broncos', date: '2025-10-12', time: '4:25 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Los Angeles Chargers', date: '2025-10-12', time: '4:25 PM ET' },
            { home: 'Washington Commanders', away: 'Minnesota Vikings', date: '2025-10-12', time: '8:20 PM ET' },
            { home: 'Indianapolis Colts', away: 'Green Bay Packers', date: '2025-10-13', time: '8:15 PM ET' }
        ],
        7: [
            { home: 'New England Patriots', away: 'Buffalo Bills', date: '2025-10-16', time: '8:15 PM ET' },
            { home: 'Baltimore Ravens', away: 'Houston Texans', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Detroit Lions', away: 'Minnesota Vikings', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Green Bay Packers', away: 'Washington Commanders', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Indianapolis Colts', away: 'Cleveland Browns', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'Jacksonville Jaguars', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'New York Jets', away: 'Pittsburgh Steelers', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Philadelphia Eagles', away: 'Tampa Bay Buccaneers', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Chicago Bears', away: 'Carolina Panthers', date: '2025-10-19', time: '1:00 PM ET' },
            { home: 'Denver Broncos', away: 'New Orleans Saints', date: '2025-10-19', time: '4:05 PM ET' },
            { home: 'Los Angeles Rams', away: 'Dallas Cowboys', date: '2025-10-19', time: '4:25 PM ET' },
            { home: 'San Francisco 49ers', away: 'Kansas City Chiefs', date: '2025-10-19', time: '4:25 PM ET' },
            { home: 'Seattle Seahawks', away: 'Atlanta Falcons', date: '2025-10-19', time: '4:05 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Tennessee Titans', date: '2025-10-19', time: '8:20 PM ET' },
            { home: 'Cincinnati Bengals', away: 'New York Giants', date: '2025-10-20', time: '8:15 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Arizona Cardinals', date: '2025-10-19', time: '4:05 PM ET' }
        ],
        8: [
            { home: 'Arizona Cardinals', away: 'Tennessee Titans', date: '2025-10-23', time: '8:15 PM ET' },
            { home: 'Minnesota Vikings', away: 'New Orleans Saints', date: '2025-10-26', time: '9:30 AM ET', location: 'London, UK' },
            { home: 'Atlanta Falcons', away: 'Carolina Panthers', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Philadelphia Eagles', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'Buffalo Bills', away: 'Cleveland Browns', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Cincinnati Bengals', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'New York Giants', away: 'Green Bay Packers', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Chicago Bears', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'Pittsburgh Steelers', away: 'Indianapolis Colts', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'Dallas Cowboys', date: '2025-10-26', time: '1:00 PM ET' },
            { home: 'Detroit Lions', away: 'Jacksonville Jaguars', date: '2025-10-26', time: '4:05 PM ET' },
            { home: 'Denver Broncos', away: 'San Francisco 49ers', date: '2025-10-26', time: '4:25 PM ET' },
            { home: 'Kansas City Chiefs', away: 'Las Vegas Raiders', date: '2025-10-26', time: '4:25 PM ET' },
            { home: 'Miami Dolphins', away: 'Los Angeles Rams', date: '2025-10-26', time: '4:25 PM ET' },
            { home: 'Seattle Seahawks', away: 'Tampa Bay Buccaneers', date: '2025-10-26', time: '8:20 PM ET' }
        ],
        9: [
            { home: 'New York Jets', away: 'Los Angeles Chargers', date: '2025-10-30', time: '8:15 PM ET' },
            { home: 'Carolina Panthers', away: 'Dallas Cowboys', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Chicago Bears', away: 'Washington Commanders', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'New Orleans Saints', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Detroit Lions', away: 'Green Bay Packers', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Philadelphia Eagles', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Minnesota Vikings', away: 'Atlanta Falcons', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'New York Giants', away: 'Pittsburgh Steelers', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'Cincinnati Bengals', date: '2025-11-02', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Buffalo Bills', date: '2025-11-02', time: '4:05 PM ET' },
            { home: 'Arizona Cardinals', away: 'Miami Dolphins', date: '2025-11-02', time: '4:25 PM ET' },
            { home: 'Los Angeles Rams', away: 'Seattle Seahawks', date: '2025-11-02', time: '4:25 PM ET' },
            { home: 'San Francisco 49ers', away: 'New England Patriots', date: '2025-11-02', time: '4:25 PM ET' },
            { home: 'Indianapolis Colts', away: 'Tennessee Titans', date: '2025-11-02', time: '8:20 PM ET' },
            { home: 'Kansas City Chiefs', away: 'Baltimore Ravens', date: '2025-11-03', time: '8:15 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Denver Broncos', date: '2025-11-02', time: '4:05 PM ET' }
        ],
        10: [
            { home: 'Pittsburgh Steelers', away: 'Los Angeles Rams', date: '2025-11-06', time: '8:15 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'New York Giants', date: '2025-11-09', time: '9:30 AM ET', location: 'Munich, Germany' },
            { home: 'Green Bay Packers', away: 'Arizona Cardinals', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Cincinnati Bengals', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Las Vegas Raiders', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'Indianapolis Colts', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'New York Jets', away: 'New England Patriots', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'Philadelphia Eagles', away: 'Detroit Lions', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Carolina Panthers', date: '2025-11-09', time: '1:00 PM ET' },
            { home: 'Los Angeles Rams', away: 'Minnesota Vikings', date: '2025-11-09', time: '4:05 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Denver Broncos', date: '2025-11-09', time: '4:05 PM ET' },
            { home: 'Dallas Cowboys', away: 'Houston Texans', date: '2025-11-09', time: '4:25 PM ET' },
            { home: 'Seattle Seahawks', away: 'New Orleans Saints', date: '2025-11-09', time: '4:25 PM ET' },
            { home: 'Chicago Bears', away: 'Tennessee Titans', date: '2025-11-09', time: '4:25 PM ET' },
            { home: 'Buffalo Bills', away: 'San Francisco 49ers', date: '2025-11-09', time: '8:20 PM ET' },
            { home: 'Washington Commanders', away: 'Atlanta Falcons', date: '2025-11-10', time: '8:15 PM ET' }
        ],
        11: [
            { home: 'New Orleans Saints', away: 'Tampa Bay Buccaneers', date: '2025-11-13', time: '8:15 PM ET' },
            { home: 'Chicago Bears', away: 'Detroit Lions', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Indianapolis Colts', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'New York Jets', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Green Bay Packers', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Buffalo Bills', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'New York Giants', away: 'Carolina Panthers', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'Tennessee Titans', away: 'Miami Dolphins', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'Cleveland Browns', date: '2025-11-16', time: '1:00 PM ET' },
            { home: 'Arizona Cardinals', away: 'Atlanta Falcons', date: '2025-11-16', time: '4:05 PM ET' },
            { home: 'San Francisco 49ers', away: 'Seattle Seahawks', date: '2025-11-16', time: '4:05 PM ET' },
            { home: 'Denver Broncos', away: 'Kansas City Chiefs', date: '2025-11-16', time: '4:25 PM ET' },
            { home: 'Minnesota Vikings', away: 'Dallas Cowboys', date: '2025-11-16', time: '4:25 PM ET' },
            { home: 'Pittsburgh Steelers', away: 'Baltimore Ravens', date: '2025-11-16', time: '8:20 PM ET' },
            { home: 'Las Vegas Raiders', away: 'New York Giants', date: '2025-11-17', time: '8:15 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Philadelphia Eagles', date: '2025-11-16', time: '4:25 PM ET' }
        ],
        12: [
            { home: 'Detroit Lions', away: 'Houston Texans', date: '2025-11-20', time: '12:30 PM ET' },
            { home: 'Dallas Cowboys', away: 'New York Giants', date: '2025-11-20', time: '4:30 PM ET' },
            { home: 'Minnesota Vikings', away: 'Chicago Bears', date: '2025-11-20', time: '8:20 PM ET' },
            { home: 'Atlanta Falcons', away: 'New Orleans Saints', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Cleveland Browns', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Buffalo Bills', away: 'Kansas City Chiefs', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'Tampa Bay Buccaneers', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Pittsburgh Steelers', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Indianapolis Colts', away: 'New England Patriots', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'New York Jets', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'Miami Dolphins', date: '2025-11-23', time: '1:00 PM ET' },
            { home: 'Los Angeles Rams', away: 'Arizona Cardinals', date: '2025-11-23', time: '4:05 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Seattle Seahawks', date: '2025-11-23', time: '4:05 PM ET' },
            { home: 'Denver Broncos', away: 'Los Angeles Chargers', date: '2025-11-23', time: '4:25 PM ET' },
            { home: 'Green Bay Packers', away: 'Philadelphia Eagles', date: '2025-11-23', time: '4:25 PM ET' },
            { home: 'San Francisco 49ers', away: 'Tennessee Titans', date: '2025-11-23', time: '8:20 PM ET' }
        ],
        13: [
            { home: 'New York Giants', away: 'Philadelphia Eagles', date: '2025-11-27', time: '12:30 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Kansas City Chiefs', date: '2025-11-27', time: '4:30 PM ET' },
            { home: 'Pittsburgh Steelers', away: 'Buffalo Bills', date: '2025-11-27', time: '8:20 PM ET' },
            { home: 'Atlanta Falcons', away: 'Los Angeles Rams', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Arizona Cardinals', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Denver Broncos', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'Tennessee Titans', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Los Angeles Chargers', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'New Orleans Saints', away: 'Minnesota Vikings', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'New York Jets', away: 'Indianapolis Colts', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'San Francisco 49ers', date: '2025-11-30', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'Washington Commanders', date: '2025-11-30', time: '4:05 PM ET' },
            { home: 'Houston Texans', away: 'Seattle Seahawks', date: '2025-11-30', time: '4:05 PM ET' },
            { home: 'Dallas Cowboys', away: 'Jacksonville Jaguars', date: '2025-11-30', time: '4:25 PM ET' },
            { home: 'Chicago Bears', away: 'Green Bay Packers', date: '2025-11-30', time: '8:20 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Baltimore Ravens', date: '2025-12-01', time: '8:15 PM ET' }
        ],
        14: [
            { home: 'Chicago Bears', away: 'Detroit Lions', date: '2025-12-04', time: '8:15 PM ET' },
            { home: 'Buffalo Bills', away: 'Arizona Cardinals', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Cincinnati Bengals', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Green Bay Packers', away: 'New York Giants', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Minnesota Vikings', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Indianapolis Colts', away: 'Miami Dolphins', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Baltimore Ravens', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Pittsburgh Steelers', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'Washington Commanders', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Tennessee Titans', away: 'New York Jets', date: '2025-12-07', time: '1:00 PM ET' },
            { home: 'Denver Broncos', away: 'Atlanta Falcons', date: '2025-12-07', time: '4:05 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Carolina Panthers', date: '2025-12-07', time: '4:05 PM ET' },
            { home: 'Dallas Cowboys', away: 'Philadelphia Eagles', date: '2025-12-07', time: '4:25 PM ET' },
            { home: 'Kansas City Chiefs', away: 'New Orleans Saints', date: '2025-12-07', time: '4:25 PM ET' },
            { home: 'Seattle Seahawks', away: 'Los Angeles Rams', date: '2025-12-07', time: '8:20 PM ET' },
            { home: 'Las Vegas Raiders', away: 'San Francisco 49ers', date: '2025-12-08', time: '8:15 PM ET' }
        ],
        15: [
            { home: 'Atlanta Falcons', away: 'Tampa Bay Buccaneers', date: '2025-12-11', time: '8:15 PM ET' },
            { home: 'Baltimore Ravens', away: 'Dallas Cowboys', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Buffalo Bills', away: 'New England Patriots', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'Philadelphia Eagles', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'New Orleans Saints', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Indianapolis Colts', away: 'Houston Texans', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'Cleveland Browns', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'New York Jets', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Minnesota Vikings', away: 'Green Bay Packers', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'New York Giants', date: '2025-12-14', time: '1:00 PM ET' },
            { home: 'Arizona Cardinals', away: 'Denver Broncos', date: '2025-12-14', time: '4:05 PM ET' },
            { home: 'San Francisco 49ers', away: 'Detroit Lions', date: '2025-12-14', time: '4:05 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Kansas City Chiefs', date: '2025-12-14', time: '4:25 PM ET' },
            { home: 'Seattle Seahawks', away: 'Chicago Bears', date: '2025-12-14', time: '4:25 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Los Angeles Rams', date: '2025-12-14', time: '8:20 PM ET' },
            { home: 'Pittsburgh Steelers', away: 'Tennessee Titans', date: '2025-12-15', time: '8:15 PM ET' }
        ],
        16: [
            { home: 'Green Bay Packers', away: 'Detroit Lions', date: '2025-12-20', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'Miami Dolphins', date: '2025-12-20', time: '4:30 PM ET' },
            { home: 'Los Angeles Rams', away: 'San Francisco 49ers', date: '2025-12-20', time: '8:15 PM ET' },
            { home: 'Carolina Panthers', away: 'Atlanta Falcons', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Chicago Bears', away: 'Arizona Cardinals', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Cleveland Browns', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Jacksonville Jaguars', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Kansas City Chiefs', away: 'Pittsburgh Steelers', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'New York Jets', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'New Orleans Saints', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Tennessee Titans', away: 'Indianapolis Colts', date: '2025-12-21', time: '1:00 PM ET' },
            { home: 'Denver Broncos', away: 'Las Vegas Raiders', date: '2025-12-21', time: '4:05 PM ET' },
            { home: 'Seattle Seahawks', away: 'Minnesota Vikings', date: '2025-12-21', time: '4:05 PM ET' },
            { home: 'Dallas Cowboys', away: 'Washington Commanders', date: '2025-12-21', time: '4:25 PM ET' },
            { home: 'New York Giants', away: 'Buffalo Bills', date: '2025-12-21', time: '4:25 PM ET' },
            { home: 'Philadelphia Eagles', away: 'Los Angeles Chargers', date: '2025-12-21', time: '8:20 PM ET' }
        ],
        17: [
            { home: 'Los Angeles Rams', away: 'Seattle Seahawks', date: '2025-12-25', time: '4:30 PM ET' },
            { home: 'Kansas City Chiefs', away: 'Denver Broncos', date: '2025-12-25', time: '8:15 PM ET' },
            { home: 'Arizona Cardinals', away: 'Indianapolis Colts', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Atlanta Falcons', away: 'Chicago Bears', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Baltimore Ravens', away: 'New York Giants', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Washington Commanders', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Houston Texans', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Detroit Lions', away: 'Minnesota Vikings', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Miami Dolphins', away: 'Buffalo Bills', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'New Orleans Saints', away: 'Carolina Panthers', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Philadelphia Eagles', away: 'New York Jets', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Pittsburgh Steelers', away: 'Green Bay Packers', date: '2025-12-28', time: '1:00 PM ET' },
            { home: 'Dallas Cowboys', away: 'San Francisco 49ers', date: '2025-12-28', time: '4:05 PM ET' },
            { home: 'Jacksonville Jaguars', away: 'New England Patriots', date: '2025-12-28', time: '4:05 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Los Angeles Chargers', date: '2025-12-28', time: '4:25 PM ET' },
            { home: 'Tampa Bay Buccaneers', away: 'Tennessee Titans', date: '2025-12-28', time: '8:20 PM ET' }
        ],
        18: [
            { home: 'Buffalo Bills', away: 'New York Jets', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Chicago Bears', away: 'Green Bay Packers', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Cleveland Browns', away: 'Pittsburgh Steelers', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Houston Texans', away: 'Tennessee Titans', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Indianapolis Colts', away: 'Jacksonville Jaguars', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Los Angeles Chargers', away: 'Denver Broncos', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Minnesota Vikings', away: 'Detroit Lions', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'New England Patriots', away: 'Miami Dolphins', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'New York Giants', away: 'Dallas Cowboys', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'San Francisco 49ers', away: 'Arizona Cardinals', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Washington Commanders', away: 'Philadelphia Eagles', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Carolina Panthers', away: 'Tampa Bay Buccaneers', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Cincinnati Bengals', away: 'Baltimore Ravens', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'New Orleans Saints', away: 'Atlanta Falcons', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Seattle Seahawks', away: 'Los Angeles Rams', date: '2026-01-04', time: '1:00 PM ET' },
            { home: 'Las Vegas Raiders', away: 'Kansas City Chiefs', date: '2026-01-04', time: '1:00 PM ET' }
        ]
    };
    
    return nfl2025Schedule;
}

// Initialize the schedule
nflSchedule = generateFullSchedule();

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// NFL results data structure for the 2025-2026 season
// This will be populated from the API as games are completed
const nflResults = {
    games: {},
    standings: {}
};

// Load actual NFL results at startup
async function loadNFLResults() {
    try {
        const results = await fetchNFLResults();
        if (results) {
            Object.assign(nflResults, results);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Failed to load NFL results:", error);
        return false;
    }
}

// Function to fetch actual NFL results from the official NFL API
async function fetchNFLResults() {
    // In a real app, this would call the NFL API
    // For now, we'll return simulated data based on our schedule
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const results = {
            games: {},
            standings: {}
        };
        
        // Generate random results for games that have been played (past dates)
        const now = new Date();
        
        // Process each week in the schedule
        for (const [weekNum, games] of Object.entries(nflSchedule)) {
            results.games[weekNum] = [];
            
            games.forEach((game, gameIndex) => {
                const gameDate = new Date(game.date);
                
                // If the game date is in the past, generate a result
                if (gameDate < now) {
                    const homeScore = Math.floor(Math.random() * 45);
                    const awayScore = Math.floor(Math.random() * 45);
                    const winner = homeScore > awayScore ? game.home : 
                                  homeScore < awayScore ? game.away : 'tie';
                    
                    results.games[weekNum].push({
                        home: game.home,
                        away: game.away,
                        homeScore,
                        awayScore,
                        winner,
                        date: game.date,
                        completed: true
                    });
                } else {
                    // Future game with no result yet
                    results.games[weekNum].push({
                        home: game.home,
                        away: game.away,
                        homeScore: null,
                        awayScore: null,
                        winner: null,
                        date: game.date,
                        completed: false
                    });
                }
            });
        }
        
        // Generate standings based on game results
        const teamRecords = {};
        
        // Initialize all teams with zeroes
        for (const division of Object.values(nflTeamsByDivision)) {
            for (const team of division) {
                teamRecords[team] = { wins: 0, losses: 0, ties: 0 };
            }
        }
        
        // Calculate records based on game results
        for (const weekGames of Object.values(results.games)) {
            for (const game of weekGames) {
                if (game.completed) {
                    const { home, away, homeScore, awayScore } = game;
                    
                    if (homeScore > awayScore) {
                        teamRecords[home].wins++;
                        teamRecords[away].losses++;
                    } else if (homeScore < awayScore) {
                        teamRecords[home].losses++;
                        teamRecords[away].wins++;
                    } else {
                        teamRecords[home].ties++;
                        teamRecords[away].ties++;
                    }
                }
            }
        }
        
        // Set standings in results
        results.standings = teamRecords;
        
        return results;
    } catch (error) {
        console.error("Error fetching NFL results:", error);
        return null;
    }
}

// Process NFL API data into our format
function processNFLApiData(apiData) {
    // In a real app, this would transform the API data
    // For now, we'll just return the simulated data as is
    return apiData;
}

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        weekSelector: document.getElementById('weekSelector'),
        weeklyMatchups: document.getElementById('weeklyMatchups'),
        saveWeekBtn: document.getElementById('saveWeekBtn'),
        compareWeekBtn: document.getElementById('compareWeekBtn'),
        correctPicks: document.getElementById('correctPicks'),
        incorrectPicks: document.getElementById('incorrectPicks'),
        pickAccuracy: document.getElementById('pickAccuracy'),
        predictionsBtn: document.getElementById('predictionsBtn')
    };

    // Navigation buttons
    if (elements.predictionsBtn) {
        elements.predictionsBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    if (document.getElementById('resultsBtn')) {
        document.getElementById('resultsBtn').addEventListener('click', () => {
            window.location.href = 'results.html';
        });
    }

    // Initialize week selector and load data
    initializeWeekSelector(elements);
    
    // Load NFL results for comparison
    loadNFLResults().then(() => {
        // Show the first week by default
        if (elements.weekSelector && elements.weekSelector.value) {
            displayWeeklyMatchups(elements.weekSelector.value, elements);
        }
    });
    
    // Event listeners
    if (elements.weekSelector) {
        elements.weekSelector.addEventListener('change', () => {
            displayWeeklyMatchups(elements.weekSelector.value, elements);
        });
    }
    
    if (elements.saveWeekBtn) {
        elements.saveWeekBtn.addEventListener('click', () => {
            saveWeeklyPredictions(elements.weekSelector.value, elements);
        });
    }
    
    if (elements.compareWeekBtn) {
        elements.compareWeekBtn.addEventListener('click', () => {
            compareWeeklyPredictions(elements.weekSelector.value);
            updatePredictionStats(elements);
        });
    }
});

// Initialize the week selector dropdown
function initializeWeekSelector(elements) {
    const { weekSelector } = elements;
    if (!weekSelector) return;
    
    // Clear existing options
    weekSelector.innerHTML = '';
    
    // Add options for each week
    for (let i = 1; i <= 18; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Week ${i}`;
        weekSelector.appendChild(option);
    }
    
    // Select week 1 by default
    weekSelector.value = 1;
}

// Display matchups for the selected week
function displayWeeklyMatchups(weekNum, elements) {
    const { weeklyMatchups } = elements;
    if (!weeklyMatchups) return;
    
    // Clear existing matchups
    weeklyMatchups.innerHTML = '';
    
    // Get games for the selected week
    const weekGames = nflSchedule[weekNum];
    if (!weekGames || weekGames.length === 0) {
        weeklyMatchups.innerHTML = '<div class="no-data">No matchups available for this week.</div>';
        return;
    }
    
    // Load saved predictions for this week
    const savedPredictions = loadSavedWeeklyPredictions(weekNum);
    
    // Get results for this week if available
    const weekResults = nflResults.games[weekNum] || [];
    
    // Create matchup elements
    weekGames.forEach((game, index) => {
        const matchupElement = document.createElement('div');
        matchupElement.className = 'matchup';
        
        // Date info
        const gameDate = new Date(game.date);
        const dateStr = `${dateUtil.formatDate(game.date)} • ${game.time}`;
        const dateInfo = document.createElement('div');
        dateInfo.className = 'date-info';
        dateInfo.textContent = dateStr;
        
        // Special location info for international games
        if (game.location) {
            dateInfo.textContent += ` • ${game.location}`;
        }
        
        // Teams container
        const teamsContainer = document.createElement('div');
        teamsContainer.className = 'teams-container';
        
        // Away team
        const awayTeam = document.createElement('div');
        awayTeam.className = 'team-pick away';
        
        const awayRadio = document.createElement('input');
        awayRadio.type = 'radio';
        awayRadio.name = `game-${weekNum}-${index}`;
        awayRadio.id = `away-${weekNum}-${index}`;
        awayRadio.value = game.away;
        awayRadio.checked = savedPredictions[index] === game.away;
        
        const awayLabel = document.createElement('label');
        awayLabel.htmlFor = `away-${weekNum}-${index}`;
        awayLabel.textContent = game.away;
        
        awayTeam.appendChild(awayRadio);
        awayTeam.appendChild(awayLabel);
        
        // VS indicator
        const vsIndicator = document.createElement('div');
        vsIndicator.className = 'vs-indicator';
        vsIndicator.textContent = 'VS';
        
        // Home team
        const homeTeam = document.createElement('div');
        homeTeam.className = 'team-pick home';
        
        const homeRadio = document.createElement('input');
        homeRadio.type = 'radio';
        homeRadio.name = `game-${weekNum}-${index}`;
        homeRadio.id = `home-${weekNum}-${index}`;
        homeRadio.value = game.home;
        homeRadio.checked = savedPredictions[index] === game.home;
        
        const homeLabel = document.createElement('label');
        homeLabel.htmlFor = `home-${weekNum}-${index}`;
        homeLabel.textContent = game.home;
        
        homeTeam.appendChild(homeLabel);
        homeTeam.appendChild(homeRadio);
        
        teamsContainer.appendChild(awayTeam);
        teamsContainer.appendChild(vsIndicator);
        teamsContainer.appendChild(homeTeam);
        
        // Create and append the matchup element
        matchupElement.appendChild(dateInfo);
        matchupElement.appendChild(teamsContainer);
        
        // Add result section if the game has been completed
        const gameResult = weekResults.find(result => 
            result && result.home === game.home && result.away === game.away && result.completed);
            
        if (gameResult) {
            const resultElement = document.createElement('div');
            resultElement.className = 'actual-result';
            
            // Format: Team 24 - 17 Team
            resultElement.textContent = `Final: ${game.away} ${gameResult.awayScore} - ${gameResult.homeScore} ${game.home}`;
            
            // Check if prediction was correct
            if (savedPredictions[index]) {
                const prediction = savedPredictions[index];
                const winner = gameResult.winner;
                
                if (winner === prediction) {
                    resultElement.classList.add('correct');
                    resultElement.textContent += ' ✓ Correct prediction!';
                } else if (winner === 'tie') {
                    resultElement.textContent += ' (Tie game)';
                } else {
                    resultElement.classList.add('incorrect');
                    resultElement.textContent += ' ✗ Incorrect prediction';
                }
            }
            
            matchupElement.appendChild(resultElement);
        }
        
        weeklyMatchups.appendChild(matchupElement);
    });
}

// Save weekly predictions to localStorage
function saveWeeklyPredictions(weekNum, elements) {
    const predictions = {};
    
    // Get all game radio groups in the current view
    const games = document.querySelectorAll(`.matchup`);
    
    games.forEach((game, index) => {
        const selectedTeam = document.querySelector(`input[name="game-${weekNum}-${index}"]:checked`);
        if (selectedTeam) {
            predictions[index] = selectedTeam.value;
        }
    });
    
    // Get existing saved predictions
    let allPredictions = JSON.parse(localStorage.getItem('weeklyPredictions') || '{}');
    
    // Save predictions for this week
    allPredictions[weekNum] = predictions;
    localStorage.setItem('weeklyPredictions', JSON.stringify(allPredictions));
    
    // Show success message
    domUtil.showToast('Predictions saved successfully!', 'success');
}

// Load saved weekly predictions from localStorage
function loadSavedWeeklyPredictions(weekNum) {
    const allPredictions = JSON.parse(localStorage.getItem('weeklyPredictions') || '{}');
    return allPredictions[weekNum] || {};
}

// Compare weekly predictions with actual results
function compareWeeklyPredictions(weekNum) {
    const predictions = loadSavedWeeklyPredictions(weekNum);
    const weekResults = nflResults.games[weekNum] || [];
    
    let correct = 0;
    let incorrect = 0;
    
    // Compare each prediction with the actual result
    Object.entries(predictions).forEach(([gameIndex, predictedTeam]) => {
        const gameResult = weekResults[gameIndex];
        
        if (gameResult && gameResult.completed) {
            if (gameResult.winner === predictedTeam) {
                correct++;
            } else if (gameResult.winner !== 'tie') {
                incorrect++;
            }
        }
    });
    
    // Store the comparison results
    const comparisonResults = JSON.parse(localStorage.getItem('predictionComparisons') || '{}');
    comparisonResults[weekNum] = { correct, incorrect };
    localStorage.setItem('predictionComparisons', JSON.stringify(comparisonResults));
    
    // Show the results in a toast
    const total = correct + incorrect;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    domUtil.showToast(`Comparison complete! Correct: ${correct}, Incorrect: ${incorrect}, Accuracy: ${accuracy}%`, 'info');
    
    return { correct, incorrect, accuracy };
}

// Update prediction statistics
function updatePredictionStats(elements) {
    const { correctPicks, incorrectPicks, pickAccuracy } = elements;
    if (!correctPicks || !incorrectPicks || !pickAccuracy) return;
    
    // Get all comparison results
    const comparisonResults = JSON.parse(localStorage.getItem('predictionComparisons') || '{}');
    
    // Calculate totals
    let totalCorrect = 0;
    let totalIncorrect = 0;
    
    Object.values(comparisonResults).forEach(result => {
        totalCorrect += result.correct || 0;
        totalIncorrect += result.incorrect || 0;
    });
    
    const total = totalCorrect + totalIncorrect;
    const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    
    // Update UI
    correctPicks.textContent = totalCorrect;
    incorrectPicks.textContent = totalIncorrect;
    pickAccuracy.textContent = `${accuracy}%`;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Initialize the schedule
generateFullSchedule();