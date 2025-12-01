// modules/state.js
// State management module for the NFL Predictions application

const appState = {
    currentTab: 'nfc',

    setCurrentTab(tabName) {
        this.currentTab = tabName;
    },

    savePrediction(team, wins, losses) {
        const predictions = JSON.parse(localStorage.getItem('predictions')) || {};
        predictions[team] = {
            wins: parseInt(wins) || 0,
            losses: parseInt(losses) || 0
        };
        localStorage.setItem('predictions', JSON.stringify(predictions));
    },

    savePostseasonPrediction(round, team, conference, slot) {
        const predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};
        
        if (round === 'Super Bowl') {
            if (!predictions['Super Bowl']) {
                predictions['Super Bowl'] = [];
            }
            predictions['Super Bowl'][slot] = team;
        } else {
            if (!predictions[conference]) {
                predictions[conference] = {};
            }
            if (!predictions[conference][round]) {
                predictions[conference][round] = [];
            }
            predictions[conference][round][slot] = team;
        }
        
        localStorage.setItem('postseasonPredictions', JSON.stringify(predictions));
    },

    getPredictions() {
        return JSON.parse(localStorage.getItem('predictions')) || {};
    },

    getPostseasonPredictions() {
        return JSON.parse(localStorage.getItem('postseasonPredictions')) || {};
    }
};

export default appState;
