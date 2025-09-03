// modules/api.js

import { showUserFriendlyError, showNetworkStatus } from './ui.js';

const API_REQUEST_TIMEOUT = 5000; // 5 seconds

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = API_REQUEST_TIMEOUT } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    } finally {
        clearTimeout(id);
    }
}

export async function loadExternalData(url, key) {
    try {
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        localStorage.setItem(key, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(`Unable to load external data from ${url}. Error:`, error);
        showUserFriendlyError(`Failed to load required data from the server (${url}). Please check your connection and try again.`, true);
        // Set a global flag or state to indicate critical data load failure
        window.criticalDataLoadFailed = true; 
        return null;
    }
}

export function savePrediction(team) {
    const wins = document.getElementById(`pred-wins-${team.replace(/\s+/g, '-').toLowerCase()}`).value;
    const losses = document.getElementById(`pred-losses-${team.replace(/\s+/g, '-').toLowerCase()}`).value;
    
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    predictions[team] = { wins, losses };
    localStorage.setItem('predictions', JSON.stringify(predictions));
    showNetworkStatus('Prediction saved!', 'success');
}

export function savePostseasonPrediction(round, team, conference, slot) {
    let predictions = JSON.parse(localStorage.getItem('postseasonPredictions')) || {};
    
    // Initialize structure if it doesn't exist
    if (!predictions[conference]) {
        predictions[conference] = {};
    }
    if (!predictions[conference][round]) {
        predictions[conference][round] = [];
    }
    
    // Ensure we have enough slots
    while (predictions[conference][round].length <= parseInt(slot)) {
        predictions[conference][round].push('');
    }
    
    // Save the team in the correct slot
    predictions[conference][round][parseInt(slot)] = team;
    
    localStorage.setItem('postseasonPredictions', JSON.stringify(predictions));
    showNetworkStatus('Postseason prediction saved!', 'success');
}
