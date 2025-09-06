// modules/api.js

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
    console.log('Loading external data from:', url);
    try {
        const response = await fetchWithTimeout(url);
        console.log('Fetch response:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data loaded:', data);
        localStorage.setItem(key, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(`Unable to load external data from ${url}. Error:`, error);
        // Set a global flag or state to indicate critical data load failure
        window.criticalDataLoadFailed = true; 
        return null;
    }
}

import appState from './state.js';

export function savePrediction(team) {
    const wins = document.getElementById(`pred-wins-${team.replace(/\s+/g, '-').toLowerCase()}`).value;
    const losses = document.getElementById(`pred-losses-${team.replace(/\s+/g, '-').toLowerCase()}`).value;
    
    // Use state management to save the prediction
    appState.savePrediction(team, wins, losses);
    console.log('Prediction saved!');
}

export function savePostseasonPrediction(round, team, conference, slot) {
    // Use state management to save the postseason prediction
    appState.savePostseasonPrediction(round, team, conference, slot);
    console.log('Postseason prediction saved!');
}
