// modules/validation.js
import { debounce } from './utils.js';
import appState from './state.js';

export function showValidationError(element, message) {
    const feedbackDiv = element.parentElement.querySelector('.validation-feedback');
    if (feedbackDiv) {
        feedbackDiv.textContent = message;
        feedbackDiv.style.display = 'block';
    }
    element.classList.add('is-invalid');
}

export function clearValidationError(element) {
    const feedbackDiv = element.parentElement.querySelector('.validation-feedback');
    if (feedbackDiv) {
        feedbackDiv.textContent = '';
        feedbackDiv.style.display = 'none';
    }
    element.classList.remove('is-invalid');
}

function validateRecord(winsInput, lossesInput) {
    const wins = parseInt(winsInput.value, 10);
    const losses = parseInt(lossesInput.value, 10);

    if (isNaN(wins) || isNaN(losses)) {
        return; // Do nothing if inputs are not numbers yet
    }

    if (wins + losses !== 17) {
        showValidationError(winsInput, 'W + L must equal 17');
        showValidationError(lossesInput, 'W + L must equal 17');
    } else {
        clearValidationError(winsInput);
        clearValidationError(lossesInput);
    }
}

// Debounced validation function to improve performance
const debouncedValidateRecord = debounce((winsInput, lossesInput) => {
    validateRecord(winsInput, lossesInput);
}, 300);

export function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('.team-inputs input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const teamDiv = e.target.closest('.team-inputs');
            const winsInput = teamDiv.querySelector('input[id*="-wins-"]');
            const lossesInput = teamDiv.querySelector('input[id*="-losses-"]');
            
            // Use debounced validation for better performance
            debouncedValidateRecord(winsInput, lossesInput);
        });
    });
}

export function getValidTeamsForPostseason(conference) {
    const predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    const validTeams = [];

    for (const team in predictions) {
        // This is a simplified logic. A real implementation would need to know
        // which conference each team belongs to from the nflTeams object.
        // We'll assume for now we can determine conference from team name (not robust).
        if (team.startsWith(conference)) { // This is a placeholder logic
            validTeams.push(team);
        }
    }
    return validTeams;
}

export function updateChampionshipDropdowns() {
    // This function needs access to the DOM and the current predictions.
    // It's a candidate for refactoring to reduce dependencies.
    console.log("updateChampionshipDropdowns needs refactoring.");
}
