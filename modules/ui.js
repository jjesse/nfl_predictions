// modules/ui.js

import { savePrediction, savePostseasonPrediction } from './api.js';
import { setupRealTimeValidation } from './validation.js';
import appState from './state.js';
import { debounce } from './utils.js';

// Global State (minimize usage)
let errorLogs = [];

export function logError(errorDetails) {
    console.error("Logged Error:", errorDetails);
    errorLogs.push({
        timestamp: new Date().toISOString(),
        ...errorDetails
    });
}

export function exportErrorLogs() {
    const blob = new Blob([JSON.stringify(errorLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nfl-predictions-error-logs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// UI Helper Functions
export function showUserFriendlyError(message, isRetryable = false) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'global-error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 400px;
        font-size: 0.9rem;
    `;
    
    errorDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <strong>Error:</strong> ${message}
                ${isRetryable ? `<br><button id="retry-last-action" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: white; color: #dc2626; border: none; border-radius: 4px; cursor: pointer;">Retry</button>` : ''}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-left: 0.5rem;">×</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 10000);
}

export function showNetworkError() {
    const networkDiv = document.createElement('div');
    networkDiv.id = 'network-error-message';
    networkDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #f59e0b;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
        font-size: 0.9rem;
    `;
    
    networkDiv.innerHTML = `
        <div>
            <strong>⚠️ Offline</strong><br>
            You're currently offline. Some features may not work properly.
        </div>
    `;
    
    document.body.appendChild(networkDiv);
}

export function hideNetworkError() {
    const networkDiv = document.getElementById('network-error-message');
    if (networkDiv) {
        networkDiv.remove();
    }
}

export function showNetworkStatus(message, type = 'info') {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: ${type === 'success' ? '#059669' : '#6b7280'};
        color: white;
        padding: 0.75rem;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 0.85rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    statusDiv.textContent = message;
    document.body.appendChild(statusDiv);
    
    setTimeout(() => statusDiv.style.opacity = '1', 10);
    
    setTimeout(() => {
        statusDiv.style.opacity = '0';
        setTimeout(() => statusDiv.remove(), 300);
    }, 3000);
}

export function displayOverallAccuracy(accuracyData) {
    if (accuracyData.accuracy !== undefined) {
        const accuracyDiv = document.createElement('div');
        accuracyDiv.id = 'overall-accuracy';
        accuracyDiv.innerHTML = `
            <div style="background: #f0f9ff; border: 2px solid #1e3a8a; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; text-align: center;">
                <h3 style="color: #1e3a8a; margin-bottom: 0.5rem;">Overall Prediction Accuracy</h3>
                <div style="font-size: 2rem; font-weight: bold; color: #059669;">${accuracyData.accuracy.toFixed(1)}%</div>
                <div style="color: #6b7280;">${accuracyData.correctPredictions} of ${accuracyData.totalTeams} teams predicted within 2 games</div>
            </div>
        `;
        
        const comparisonTab = document.getElementById('comparison-tab');
        const firstChild = comparisonTab.firstChild;
        comparisonTab.insertBefore(accuracyDiv, firstChild);
    }
}

export function showTab(tabName, buttonElement = null) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    if (buttonElement) {
        buttonElement.classList.add('active');
    }

    if (tabName === 'comparison') {
        loadComparison();
    } else if (tabName === 'postseason' || tabName === 'results') {
        loadPostseasonPredictions();
        loadSavedPostseasonPredictions();
    }
}

function createTeamHTML(team, type) {
    const teamKey = team.replace(/\s+/g, '-').toLowerCase();
    const idPrefix = type === 'pred' ? 'pred' : 'actual';

    // Get saved prediction data for this team
    let savedWins = '';
    let savedLosses = '';
    
    if (type === 'pred') {
        // Load saved predictions from localStorage
        const predictions = JSON.parse(localStorage.getItem('predictions')) || {};
        if (predictions[team]) {
            savedWins = predictions[team].wins || '';
            savedLosses = predictions[team].losses || '';
        }
    }

    return `
        <div class="team-name">${team}</div>
        <div class="team-inputs">
            <input type="number" id="${idPrefix}-wins-${teamKey}" placeholder="W" min="0" max="17" value="${savedWins}">
            <input type="number" id="${idPrefix}-losses-${teamKey}" placeholder="L" min="0" max="17" value="${savedLosses}">
            <button class="save-button" data-team="${team}" data-type="${type}">Save</button>
            <div class="validation-feedback"></div>
        </div>
    `;
}

function loadConferenceTeams(containerId, conference, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    // Get teams data from localStorage (loaded from JSON file)
    const nflTeamsDataString = localStorage.getItem('nflTeams');
    if (!nflTeamsDataString) {
        console.error('No nflTeams data found in localStorage');
        return;
    }
    
    let nflTeamsData;
    try {
        nflTeamsData = JSON.parse(nflTeamsDataString);
    } catch (error) {
        console.error('Error parsing nflTeams data:', error);
        return;
    }
    
    if (!nflTeamsData || !nflTeamsData[conference]) {
        console.error(`No team data found for ${conference}`);
        return;
    }

    const divisions = nflTeamsData[conference];

    for (const [division, teams] of Object.entries(divisions)) {
        const divisionSection = document.createElement('section');
        divisionSection.className = 'conference';
        divisionSection.innerHTML = `<div class="conference-header">${conference} ${division} Division</div>`;

        teams.forEach(team => {
            const teamArticle = document.createElement('article');
            teamArticle.className = 'team';
            teamArticle.innerHTML = createTeamHTML(team, type);
            divisionSection.appendChild(teamArticle);
        });

        container.appendChild(divisionSection);
    }
}

export function loadNFCTeams() {
    loadConferenceTeams('nfc-teams-container', 'NFC', 'pred');
    setupRealTimeValidation();
}

export function loadAFCTeams() {
    loadConferenceTeams('afc-teams-container', 'AFC', 'pred');
    setupRealTimeValidation();
}

export function loadNFCResults() {
    loadConferenceTeams('nfc-results-container', 'NFC', 'actual');
    setupRealTimeValidation();
}

export function loadAFCResults() {
    loadConferenceTeams('afc-results-container', 'AFC', 'actual');
    setupRealTimeValidation();
}

// New functions for automated results
export async function loadAutomatedResults() {
    try {
        const response = await fetch('results.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultsData = await response.json();
        localStorage.setItem('automatedResults', JSON.stringify(resultsData));
        return resultsData;
    } catch (error) {
        console.error('Error loading automated results:', error);
        return {};
    }
}

export async function loadAutomatedAccuracy() {
    try {
        const response = await fetch('accuracy.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const accuracyData = await response.json();
        localStorage.setItem('automatedAccuracy', JSON.stringify(accuracyData));
        return accuracyData;
    } catch (error) {
        console.error('Error loading automated accuracy:', error);
        return {};
    }
}

export async function displayAutomatedComparison() {
    const resultsData = await loadAutomatedResults();
    const accuracyData = await loadAutomatedAccuracy();
    
    const comparisonContainer = document.getElementById('comparison-container');
    if (!comparisonContainer) return;
    
    comparisonContainer.innerHTML = '';
    
    // Display overall accuracy
    if (accuracyData.accuracy !== undefined) {
        const accuracyDiv = document.createElement('div');
        accuracyDiv.className = 'accuracy-summary';
        accuracyDiv.innerHTML = `
            <h3>Overall Prediction Accuracy</h3>
            <div class="accuracy-stats">
                <div class="accuracy-percentage">${accuracyData.accuracy.toFixed(1)}%</div>
                <div class="accuracy-details">
                    ${accuracyData.correctPredictions} of ${accuracyData.totalTeams} teams predicted within 2 games
                </div>
                <div class="last-updated">Last updated: ${new Date().toLocaleDateString()}</div>
            </div>
        `;
        comparisonContainer.appendChild(accuracyDiv);
    }
    
    // Get teams data
    const nflTeamsDataString = localStorage.getItem('nflTeams');
    if (!nflTeamsDataString) return;
    
    let nflTeamsData;
    try {
        nflTeamsData = JSON.parse(nflTeamsDataString);
    } catch (error) {
        console.error('Error parsing nflTeams data:', error);
        return;
    }
    
    // Display team-by-team comparison
    const teamsContainer = document.createElement('div');
    teamsContainer.className = 'teams-comparison';
    
    ['NFC', 'AFC'].forEach(conference => {
        if (!nflTeamsData[conference]) return;
        
        const conferenceDiv = document.createElement('div');
        conferenceDiv.className = 'conference-comparison';
        conferenceDiv.innerHTML = `<h3>${conference} Conference</h3>`;
        
        for (const [division, teams] of Object.entries(nflTeamsData[conference])) {
            const divisionDiv = document.createElement('div');
            divisionDiv.className = 'division-comparison';
            divisionDiv.innerHTML = `<h4>${division} Division</h4>`;
            
            teams.forEach(team => {
                const teamDiv = document.createElement('div');
                teamDiv.className = 'team-comparison';
                
                // Get stored predictions
                const predictions = JSON.parse(localStorage.getItem('predictions')) || {};
                const predicted = predictions[team];
                
                // Get automated results
                const actual = resultsData[team];
                
                if (predicted && actual) {
                    const predictedWins = parseInt(predicted.wins) || 0;
                    const actualWins = parseInt(actual.wins) || 0;
                    const difference = Math.abs(predictedWins - actualWins);
                    
                    teamDiv.innerHTML = `
                        <div class="team-name">${team}</div>
                        <div class="comparison-data">
                            <div class="predicted">Predicted: ${predictedWins}-${predicted.losses}</div>
                            <div class="actual">Actual: ${actualWins}-${actual.losses}</div>
                            <div class="difference ${difference <= 2 ? 'good' : difference <= 4 ? 'okay' : 'poor'}">
                                Difference: ${difference} game${difference !== 1 ? 's' : ''}
                            </div>
                        </div>
                    `;
                } else if (predicted) {
                    teamDiv.innerHTML = `
                        <div class="team-name">${team}</div>
                        <div class="comparison-data">
                            <div class="predicted">Predicted: ${predicted.wins}-${predicted.losses}</div>
                            <div class="actual">Actual: Results pending</div>
                        </div>
                    `;
                } else {
                    teamDiv.innerHTML = `
                        <div class="team-name">${team}</div>
                        <div class="comparison-data">
                            <div class="predicted">No prediction entered</div>
                            <div class="actual">Actual: ${actual ? `${actual.wins}-${actual.losses}` : 'Results pending'}</div>
                        </div>
                    `;
                }
                
                divisionDiv.appendChild(teamDiv);
            });
            
            conferenceDiv.appendChild(divisionDiv);
        }
        
        teamsContainer.appendChild(conferenceDiv);
    });
    
    comparisonContainer.appendChild(teamsContainer);
}

export function addErrorExportButton() {
    const header = document.querySelector('header');
    if (header) {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Export Error Logs';
        debugButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            font-size: 12px;
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        debugButton.onclick = exportErrorLogs;
        header.style.position = 'relative';
        header.appendChild(debugButton);
    }
}

export function loadComparison() {
    // This function has dependencies on global state which should be refactored.
    // For now, we'll keep it but it's a candidate for improvement.
    console.log("loadComparison needs refactoring to remove global state dependency.");
}

// Helper functions for postseason predictions
function getAvailableTeams(conference, round, slotIndex) {
    if (round === 'Wild Card') {
        // All teams from conference
        const nflTeamsDataString = localStorage.getItem('nflTeams');
        if (!nflTeamsDataString) return [];

        let nflTeamsData;
        try {
            nflTeamsData = JSON.parse(nflTeamsDataString);
        } catch (error) {
            return [];
        }

        const teams = [];
        if (nflTeamsData[conference]) {
            for (const [division, teamList] of Object.entries(nflTeamsData[conference])) {
                if (Array.isArray(teamList)) {
                    teams.push(...teamList);
                }
            }
        }
        return teams;
    } else if (round === 'Divisional') {
        // Only teams selected in Wild Card
        const predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};
        const wildCardTeams = predictions[conference]?.['Wild Card'] || [];
        return Array.isArray(wildCardTeams) ? wildCardTeams.filter(team => team) : []; // Remove empty strings
    } else if (round === 'Championship') {
        // Only teams selected in Divisional
        const predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};
        const divisionalTeams = predictions[conference]?.['Divisional'] || [];
        return Array.isArray(divisionalTeams) ? divisionalTeams.filter(team => team) : []; // Remove empty strings
    }
    return [];
}

function updateDependentDropdowns(changedConference, changedRound) {
    const predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};

    if (changedRound === 'Wild Card') {
        // Update Divisional dropdowns
        const divisionalTeams = predictions[changedConference]?.['Divisional'] || [];
        if (Array.isArray(divisionalTeams)) {
            divisionalTeams.forEach((_, index) => {
                const selectId = `${changedConference.toLowerCase()}-divisional-${index}`;
                const select = document.getElementById(selectId);
                if (select) {
                    updateDropdownOptions(select, changedConference, 'Divisional', index);
                }
            });
        }
    }

    if (changedRound === 'Wild Card' || changedRound === 'Divisional') {
        // Update Championship dropdowns
        const championshipTeams = predictions[changedConference]?.['Championship'] || [];
        if (Array.isArray(championshipTeams)) {
            championshipTeams.forEach((_, index) => {
                const selectId = `${changedConference.toLowerCase()}-championship-${index}`;
                const select = document.getElementById(selectId);
                if (select) {
                    updateDropdownOptions(select, changedConference, 'Championship', index);
                }
            });
        }
    }

    // Update Super Bowl dropdown
    const superBowlSelect = document.getElementById('super-bowl-0');
    if (superBowlSelect) {
        updateSuperBowlOptions(superBowlSelect);
    }
}

function updateDropdownOptions(select, conference, round, slotIndex) {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Team</option>';

    const availableTeams = getAvailableTeams(conference, round, slotIndex);
    availableTeams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        select.appendChild(option);
    });

    // Restore previous selection if it's still available
    if (currentValue && availableTeams.includes(currentValue)) {
        select.value = currentValue;
    } else {
        select.value = '';
    }
}

function updateSuperBowlOptions(select) {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Team</option>';

    const predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};
    const availableTeams = [];

    // Get championship winners from both conferences
    ['NFC', 'AFC'].forEach(conf => {
        const champTeams = predictions[conf]?.['Championship'] || [];
        if (Array.isArray(champTeams)) {
            availableTeams.push(...champTeams.filter(team => team));
        }
    });

    availableTeams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        select.appendChild(option);
    });

    // Restore previous selection if it's still available
    if (currentValue && availableTeams.includes(currentValue)) {
        select.value = currentValue;
    } else {
        select.value = '';
    }
}

export function loadPostseasonPredictions() {
    const container = document.getElementById('postseason-container');
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    // Get postseason structure from localStorage
    const postseasonDataString = localStorage.getItem('postseasonStructure');
    if (!postseasonDataString) {
        console.error('No postseason structure data found in localStorage');
        return;
    }

    let postseasonStructure;
    try {
        postseasonStructure = JSON.parse(postseasonDataString);
    } catch (error) {
        console.error('Error parsing postseason structure data:', error);
        return;
    }

    // Get teams data for dropdown options
    const nflTeamsDataString = localStorage.getItem('nflTeams');
    if (!nflTeamsDataString) {
        console.error('No teams data found for postseason predictions');
        return;
    }

    let nflTeamsData;
    try {
        nflTeamsData = JSON.parse(nflTeamsDataString);
    } catch (error) {
        console.error('Error parsing teams data:', error);
        return;
    }

    // Create postseason prediction interface
    for (const [conference, rounds] of Object.entries(postseasonStructure)) {
        if (conference === 'Super Bowl') continue; // Handle Super Bowl separately

        const conferenceSection = document.createElement('section');
        conferenceSection.className = 'conference';
        conferenceSection.innerHTML = `<div class="conference-header">${conference} Conference</div>`;

        for (const [round, slots] of Object.entries(rounds)) {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            roundDiv.innerHTML = `<h4>${round} Round</h4>`;

            // Ensure slots is an array before calling forEach
            if (Array.isArray(slots)) {
                slots.forEach((_, index) => {
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'postseason-slot';

                    // Create dropdown
                    const select = document.createElement('select');
                    select.id = `${conference.toLowerCase()}-${round.toLowerCase().replace(' ', '-')}-${index}`;
                    select.innerHTML = '<option value="">Select Team</option>';

                    // Add event listener to update dependent dropdowns
                    select.addEventListener('change', () => {
                        updateDependentDropdowns(conference, round);
                    });

                    // Populate initial options
                    updateDropdownOptions(select, conference, round, index);

                    const saveButton = document.createElement('button');
                    saveButton.className = 'save-button';
                    saveButton.textContent = 'Save';
                    saveButton.dataset.conference = conference;
                    saveButton.dataset.round = round;
                    saveButton.dataset.slot = index;

                    slotDiv.appendChild(select);
                    slotDiv.appendChild(saveButton);
                    roundDiv.appendChild(slotDiv);
                });
            } else {
                console.warn(`Slots for ${conference} ${round} is not an array:`, slots);
            }

            conferenceSection.appendChild(roundDiv);
        }

        container.appendChild(conferenceSection);
    }

    // Handle Super Bowl
    const superBowlSection = document.createElement('section');
    superBowlSection.className = 'conference';
    superBowlSection.innerHTML = `<div class="conference-header">Super Bowl</div>`;

    const superBowlDiv = document.createElement('div');
    superBowlDiv.className = 'round';
    superBowlDiv.innerHTML = '<h4>Super Bowl Champion</h4>';

    const slotDiv = document.createElement('div');
    slotDiv.className = 'postseason-slot';

    const select = document.createElement('select');
    select.id = `super-bowl-0`;
    select.innerHTML = '<option value="">Select Team</option>';

    // Populate Super Bowl options
    updateSuperBowlOptions(select);

    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.textContent = 'Save';
    saveButton.dataset.round = 'Super Bowl';
    saveButton.dataset.slot = 0;

    slotDiv.appendChild(select);
    slotDiv.appendChild(saveButton);
    superBowlDiv.appendChild(slotDiv);

    superBowlSection.appendChild(superBowlDiv);
    container.appendChild(superBowlSection);
}

export function loadSavedPostseasonPredictions() {
    const predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};

    // Load predictions for each conference and round
    for (const [conference, rounds] of Object.entries(predictions)) {
        for (const [round, slots] of Object.entries(rounds)) {
            // Ensure slots is an array before calling forEach
            if (Array.isArray(slots)) {
                slots.forEach((team, index) => {
                    if (team) {
                        const selectId = round === 'Super Bowl'
                            ? `super-bowl-${index}`
                            : `${conference.toLowerCase()}-${round.toLowerCase().replace(' ', '-')}-${index}`;
                        const select = document.getElementById(selectId);
                        if (select) {
                            select.value = team;
                        }
                    }
                });
            } else {
                // Handle case where slots is not an array (fallback)
                console.warn(`Slots for ${conference} ${round} is not an array:`, slots);
            }
        }
    }

    // After loading all predictions, update dependent dropdowns to reflect the loaded state
    setTimeout(() => {
        // Update all dependent dropdowns
        ['NFC', 'AFC'].forEach(conf => {
            updateDependentDropdowns(conf, 'Wild Card');
            updateDependentDropdowns(conf, 'Divisional');
        });

        // Update Super Bowl options
        const superBowlSelect = document.getElementById('super-bowl-0');
        if (superBowlSelect) {
            updateSuperBowlOptions(superBowlSelect);
        }
    }, 100); // Small delay to ensure DOM is ready
}