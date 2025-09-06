// modules/main.js

console.log('Main module loaded');
document.title = 'NFL Predictions - Loaded';

import { loadNFCTeams, loadAFCTeams, loadNFCResults, loadAFCResults, showTab, addErrorExportButton, showUserFriendlyError, showNetworkError, hideNetworkError, loadSavedPostseasonPredictions, loadAutomatedResults, loadAutomatedAccuracy, displayAutomatedComparison, logError } from './ui.js';
import { loadExternalData, savePrediction, savePostseasonPrediction } from './api.js';
import { setupRealTimeValidation } from './validation.js';

// Global State (minimize usage)
window.criticalDataLoadFailed = false;

// Error Handling
window.onerror = function(message, source, lineno, colno, error) {
    logError({
        type: 'Global unhandled error',
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        error: error ? error.stack : null
    });
    addErrorExportButton();
    showUserFriendlyError('An unexpected error occurred. Please try refreshing the page.');
    return true; 
};

window.onunhandledrejection = function(event) {
    logError({
        type: 'Unhandled promise rejection',
        reason: event.reason ? (event.reason.stack || JSON.stringify(event.reason)) : 'No reason provided'
    });
    addErrorExportButton();
    showUserFriendlyError('An operation failed in the background. Please check your connection or try again.');
};

// Data Management
export function exportPredictions() {
    const dataToExport = {
        predictions: JSON.parse(localStorage.getItem('predictions')) || {},
        results: JSON.parse(localStorage.getItem('results')) || {},
        postseasonPredictions: JSON.parse(localStorage.getItem('postseasonPredictions')) || {},
        postseasonResults: JSON.parse(localStorage.getItem('postseasonResults')) || {},
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nfl-predictions-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importPredictions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = readerEvent => {
            try {
                const content = readerEvent.target.result;
                const data = JSON.parse(content);
                
                // Basic validation - check if predictions property exists
                if (data.predictions !== undefined) {
                    localStorage.setItem('predictions', JSON.stringify(data.predictions));
                    localStorage.setItem('results', JSON.stringify(data.results || {}));
                    localStorage.setItem('postseasonPredictions', JSON.stringify(data.postseasonPredictions || {}));
                    localStorage.setItem('postseasonResults', JSON.stringify(data.postseasonResults || {}));
                    
                    alert('Data imported successfully! The page will now reload.');
                    location.reload();
                } else {
                    throw new Error('Invalid backup file format: missing predictions data.');
                }
            } catch (error) {
                showUserFriendlyError(`Import failed: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Network Status
window.addEventListener('online', hideNetworkError);
window.addEventListener('offline', showNetworkError);

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) {
        console.error("Fatal Error: #app-container not found.");
        return;
    }

    // Attach event listeners to buttons
    document.querySelector('.export-btn').addEventListener('click', exportPredictions);
    document.querySelector('.import-btn').addEventListener('click', importPredictions);
    
    document.querySelector('.tabs').addEventListener('click', async (e) => {
        if (e.target.matches('.tab-button')) {
            const tabName = e.target.dataset.tab;
            showTab(tabName, e.target);
            
            // Refresh automated comparison when comparison tab is clicked
            if (tabName === 'comparison') {
                await displayAutomatedComparison();
            }
        }
    });

    // Event delegation for save buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.save-button')) {
            const team = e.target.dataset.team;
            const type = e.target.dataset.type;
            const conference = e.target.dataset.conference;
            const round = e.target.dataset.round;
            const slot = e.target.dataset.slot;
            
            if (type === 'pred') {
                savePrediction(team);
            } else if (round) {
                // Handle postseason predictions
                const selectId = round === 'Super Bowl' ? 
                    `super-bowl-${slot}` : 
                    `${conference.toLowerCase()}-${round.toLowerCase().replace(' ', '-')}-${slot}`;
                const selectedTeam = document.getElementById(selectId).value;
                
                if (selectedTeam) {
                    savePostseasonPrediction(round, selectedTeam, conference, slot);
                } else {
                    alert('Please select a team first');
                }
            }
        }
    });

    // Load initial data
    const nflTeamsData = await loadExternalData('nfl-teams.json', 'nflTeams');
    const postseasonData = await loadExternalData('postseason-structure.json', 'postseasonStructure');
    
    // Load automated results and accuracy data
    await loadAutomatedResults();
    await loadAutomatedAccuracy();

    if (!window.criticalDataLoadFailed) {
        loadNFCTeams();
        loadAFCTeams();
        loadNFCResults();
        loadAFCResults();
        setupRealTimeValidation();
        
        // Load automated comparison data
        await displayAutomatedComparison();
        
        // Show default tab without relying on a click event
        showTab('nfc', document.querySelector('.tab-button[data-tab="nfc"]')); 
    } else {
        // Handle the case where critical data failed to load
        appContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #dc2626;">
                <h2>Application Failed to Load</h2>
                <p>Could not retrieve essential data. Please check your network connection and refresh the page.</p>
            </div>
        `;
    }

    // Check network status on load
    if (!navigator.onLine) {
        showNetworkError();
    }
});
