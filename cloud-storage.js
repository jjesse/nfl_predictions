class CloudStorageManager {
    constructor() {
        this.providers = {
            github: new GitHubGistsProvider(),
            firebase: new FirebaseProvider(),
            supabase: new SupabaseProvider()
        };
        this.currentProvider = null;
        this.config = this.loadConfig();
        this.init();
    }

    init() {
        this.loadProvider();
        this.setupAutoBackup();
    }

    loadConfig() {
        const saved = localStorage.getItem('cloud-storage-config');
        return saved ? JSON.parse(saved) : {
            provider: 'local',
            autoBackup: true,
            backupFrequency: 'daily',
            lastBackup: null,
            syncEnabled: false
        };
    }

    saveConfig() {
        localStorage.setItem('cloud-storage-config', JSON.stringify(this.config));
    }

    async setProvider(providerName, config = {}) {
        try {
            this.showNotification('Connecting to GitHub Gists...', 'info');
            this.config.provider = providerName;
            this.config = { ...this.config, ...config };
            this.saveConfig();

            if (providerName !== 'local') {
                this.currentProvider = this.providers[providerName];
                if (this.currentProvider) {
                    const result = await this.currentProvider.configure(this.config);
                    if (result && result.gistId) {
                        this.config.gistId = result.gistId;
                        this.saveConfig();
                        localStorage.setItem('cloud-storage-config', JSON.stringify(this.config));
                        this.showNotification(`Connected to GitHub Gists as ${result.username}`, 'success');
                    } else {
                        this.showNotification('GitHub Gist connection failed: gistId not found', 'error');
                        throw new Error('gistId not found');
                    }
                }
            } else {
                this.currentProvider = null;
            }

            return true;
        } catch (error) {
            console.error('Failed to set provider:', error);
            this.showNotification(error.message || 'Failed to connect to storage provider', 'error');
            return false;
        }
    }

    async loadProvider() {
        if (this.config.provider !== 'local') {
            try {
                this.currentProvider = this.providers[this.config.provider];
                const result = await this.currentProvider.configure(this.config);
                if (result && result.gistId) {
                    this.config.gistId = result.gistId;
                    this.saveConfig();
                    localStorage.setItem('cloud-storage-config', JSON.stringify(this.config));
                    this.showNotification(`Connected to GitHub Gists as ${result.username}`, 'success');
                }
                if (this.config.syncEnabled) {
                    await this.syncFromCloud();
                }
            } catch (error) {
                console.error('Failed to load provider:', error);
                this.showNotification('Failed to connect to cloud storage', 'warning');
            }
        }
    }

    async saveToCloud(data, type = 'predictions') {
        if (!this.currentProvider) {
            this.showNotification('No cloud provider configured', 'error');
            return false;
        }
        if (!this.config.gistId && this.config.provider === 'github') {
            this.showNotification('No GitHub Gist ID found. Please connect first.', 'error');
            return false;
        }
        try {
            const success = await this.currentProvider.save(data, type);
            if (success) {
                this.config.lastBackup = new Date().toISOString();
                this.saveConfig();
                this.showNotification('Data backed up to cloud', 'success');
            } else {
                this.showNotification('Failed to backup to cloud', 'error');
            }
            return success;
        } catch (error) {
            console.error('Cloud save failed:', error);
            this.showNotification('Failed to backup to cloud', 'error');
            return false;
        }
    }

    async loadFromCloud(type = 'predictions') {
        if (!this.currentProvider) {
            this.showNotification('No cloud provider configured', 'error');
            return null;
        }
        if (!this.config.gistId && this.config.provider === 'github') {
            this.showNotification('No GitHub Gist ID found. Please connect first.', 'error');
            return null;
        }
        try {
            const data = await this.currentProvider.load(type);
            if (!data) {
                this.showNotification('No backup found in cloud', 'warning');
            }
            return data;
        } catch (error) {
            console.error('Cloud load failed:', error);
            this.showNotification('Failed to load from cloud', 'error');
            return null;
        }
    }

    async syncToCloud() {
        if (!this.currentProvider || !this.config.syncEnabled) return;

        const predictions = app.predictions;
        const preseasonPredictions = app.preseasonPredictions;
        const teamRecordPredictions = app.teamRecordPredictions;

        const data = {
            predictions,
            preseasonPredictions,
            teamRecordPredictions,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        return await this.saveToCloud(data, 'full-backup');
    }

    async syncFromCloud() {
        if (!this.currentProvider) return false;

        try {
            const cloudData = await this.loadFromCloud('full-backup');
            if (!cloudData) return false;

            // Merge strategy: cloud wins for newer data
            const localTimestamp = localStorage.getItem('last-update-timestamp');
            const cloudTimestamp = cloudData.timestamp;

            if (!localTimestamp || new Date(cloudTimestamp) > new Date(localTimestamp)) {
                // Apply cloud data
                if (cloudData.predictions) {
                    app.predictions = { ...app.predictions, ...cloudData.predictions };
                    app.savePredictions();
                }
                
                if (cloudData.preseasonPredictions) {
                    app.preseasonPredictions = cloudData.preseasonPredictions;
                    app.savePreseasonPredictionsToStorage();
                }
                
                if (cloudData.teamRecordPredictions) {
                    app.teamRecordPredictions = cloudData.teamRecordPredictions;
                    app.saveTeamRecordPredictions();
                }

                localStorage.setItem('last-update-timestamp', cloudTimestamp);
                app.updateStats();
                app.renderGames();
                
                this.showNotification('Data synchronized from cloud');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Sync from cloud failed:', error);
            this.showNotification('Failed to sync from cloud', 'error');
            return false;
        }
    }

    async initialSync() {
        // First try to load from cloud
        const cloudData = await this.loadFromCloud('full-backup');
        
        if (cloudData && Object.keys(cloudData.predictions || {}).length > 0) {
            // Cloud has data, ask user what to do
            const choice = await this.showSyncDialog(cloudData);
            
            switch (choice) {
                case 'use-cloud':
                    await this.syncFromCloud();
                    break;
                case 'use-local':
                    await this.syncToCloud();
                    break;
                case 'merge':
                    await this.mergePredictions(cloudData);
                    break;
            }
        } else {
            // No cloud data, upload local data
            await this.syncToCloud();
        }
    }

    async mergePredictions(cloudData) {
        // Smart merge: keep most recent predictions for each game
        const localPredictions = app.predictions;
        const cloudPredictions = cloudData.predictions || {};
        
        const merged = { ...localPredictions };
        
        // Add cloud predictions that don't exist locally
        Object.keys(cloudPredictions).forEach(gameId => {
            if (!merged[gameId]) {
                merged[gameId] = cloudPredictions[gameId];
            }
        });

        app.predictions = merged;
        app.savePredictions();
        await this.syncToCloud();
        
        this.showNotification('Predictions merged successfully');
    }

    setupAutoBackup() {
        if (!this.config.autoBackup) return;

        const frequency = this.config.backupFrequency;
        let interval;

        switch (frequency) {
            case 'realtime':
                // Backup on every change
                return; // Handled by individual save operations
            case 'hourly':
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case 'daily':
                interval = 24 * 60 * 60 * 1000; // 24 hours
                break;
            case 'weekly':
                interval = 7 * 24 * 60 * 60 * 1000; // 1 week
                break;
            default:
                return;
        }

        setInterval(() => {
            this.syncToCloud();
        }, interval);

        // Also backup when page is about to unload
        window.addEventListener('beforeunload', () => {
            if (this.config.autoBackup && this.currentProvider) {
                this.syncToCloud();
            }
        });
    }

    async exportFullBackup() {
        const data = {
            predictions: app.predictions,
            preseasonPredictions: app.preseasonPredictions,
            teamRecordPredictions: app.teamRecordPredictions,
            config: this.config,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nfl-predictions-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async importFullBackup(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data structure
            if (!data.version || !data.exportDate) {
                throw new Error('Invalid backup file format');
            }

            // Ask user about merge strategy
            const choice = await this.showImportDialog(data);
            
            switch (choice) {
                case 'replace':
                    app.predictions = data.predictions || {};
                    app.preseasonPredictions = data.preseasonPredictions || {};
                    app.teamRecordPredictions = data.teamRecordPredictions || {};
                    break;
                case 'merge':
                    app.predictions = { ...app.predictions, ...data.predictions };
                    app.preseasonPredictions = { ...app.preseasonPredictions, ...data.preseasonPredictions };
                    app.teamRecordPredictions = { ...app.teamRecordPredictions, ...data.teamRecordPredictions };
                    break;
                default:
                    return false;
            }

            // Save all data
            app.savePredictions();
            app.savePreseasonPredictionsToStorage();
            app.saveTeamRecordPredictions();
            
            // Update UI
            app.updateStats();
            app.renderGames();
            app.loadPreseasonUI();
            app.loadTeamRecordUI();

            // Sync to cloud if enabled
            if (this.currentProvider) {
                await this.syncToCloud();
            }

            this.showNotification('Backup imported successfully');
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification('Failed to import backup file', 'error');
            return false;
        }
    }

    showSyncDialog(cloudData) {
        return new Promise((resolve) => {
            const modal = this.createModal('Data Sync Required', `
                <p>Found existing predictions in cloud storage.</p>
                <p><strong>Cloud:</strong> ${Object.keys(cloudData.predictions || {}).length} predictions</p>
                <p><strong>Local:</strong> ${Object.keys(app.predictions || {}).length} predictions</p>
                <p>How would you like to proceed?</p>
            `, [
                { text: 'Use Cloud Data', value: 'use-cloud', class: 'btn-primary' },
                { text: 'Use Local Data', value: 'use-local', class: 'btn-secondary' },
                { text: 'Merge Both', value: 'merge', class: 'btn-success' }
            ]);

            modal.addEventListener('modal-choice', (e) => {
                resolve(e.detail);
                modal.remove();
            });
        });
    }

    showImportDialog(data) {
        return new Promise((resolve) => {
            const modal = this.createModal('Import Backup', `
                <p>Import backup from ${new Date(data.exportDate).toLocaleDateString()}?</p>
                <p><strong>Backup contains:</strong> ${Object.keys(data.predictions || {}).length} predictions</p>
                <p>How would you like to import?</p>
            `, [
                { text: 'Replace All', value: 'replace', class: 'btn-danger' },
                { text: 'Merge', value: 'merge', class: 'btn-primary' },
                { text: 'Cancel', value: 'cancel', class: 'btn-secondary' }
            ]);

            modal.addEventListener('modal-choice', (e) => {
                resolve(e.detail);
                modal.remove();
            });
        });
    }

    createModal(title, content, buttons) {
        const modal = document.createElement('div');
        modal.className = 'modal storage-modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-actions">
                    ${buttons.map(btn => 
                        `<button class="btn ${btn.class}" data-value="${btn.value}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        modal.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const event = new CustomEvent('modal-choice', { 
                    detail: btn.dataset.value 
                });
                modal.dispatchEvent(event);
            });
        });

        document.body.appendChild(modal);
        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#000';
                break;
            default:
                notification.style.backgroundColor = '#007bff';
        }

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Cloud Storage Providers
class GitHubGistsProvider {
    constructor() {
        this.token = null;
        this.gistId = null;
    }

    async configure(config) {
        this.token = config.githubToken;
        this.gistId = config.gistId;
        if (!this.token) {
            throw new Error('GitHub token is required');
        }
        
        // Check if token looks like a valid GitHub token (starts with ghp_, gho_, or ghu_)
        if (!this.token.match(/^(ghp_|gho_|ghu_)/)) {
            console.warn('Token does not match expected GitHub token format');
        }
        
        // Test the token by making a simple API call
        try {
            console.log('Testing GitHub token...');
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('GitHub API error:', response.status, errorText);
                throw new Error(`Invalid GitHub token (${response.status})`);
            }
            
            const user = await response.json();
            console.log('GitHub user authenticated:', user.login);
            
            // If gistId is not set, create a new gist to get one
            if (!this.gistId) {
                console.log('Creating new gist for backup storage...');
                const gistData = {
                    description: 'NFL Predictions Cloud Backup',
                    public: false,
                    files: { 
                        'nfl-predictions-init.txt': { 
                            content: 'NFL Prediction Tracker Cloud Storage Initialized at ' + new Date().toISOString()
                        } 
                    }
                };
                
                const gistResponse = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    body: JSON.stringify(gistData)
                });
                
                if (!gistResponse.ok) {
                    const errorText = await gistResponse.text();
                    console.error('Gist creation error:', gistResponse.status, errorText);
                    throw new Error('Failed to create GitHub Gist');
                }
                
                const gistResult = await gistResponse.json();
                this.gistId = gistResult.id;
                console.log('Created new gist with ID:', this.gistId);
            }
            
            return { username: user.login, gistId: this.gistId };
        } catch (error) {
            console.error('GitHub configuration error:', error);
            throw new Error('Failed to connect to GitHub: ' + error.message);
        }
    }

    async save(data, type) {
        try {
            const gistData = {
                description: `NFL Predictions Backup - ${new Date().toISOString()}`,
                public: false,
                files: {
                    [`${type}-${Date.now()}.json`]: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            };

            const url = this.gistId 
                ? `https://api.github.com/gists/${this.gistId}`
                : 'https://api.github.com/gists';
            const method = this.gistId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });

            if (!response.ok) {
                throw new Error('Failed to save to GitHub Gist');
            }

            const result = await response.json();
            this.gistId = result.id;
            // Save gistId to config/localStorage for future use
            const config = JSON.parse(localStorage.getItem('cloud-storage-config') || '{}');
            config.gistId = this.gistId;
            localStorage.setItem('cloud-storage-config', JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('GitHub Gist save failed:', error);
            return false;
        }
    }

    async load(type) {
        // Always get latest gistId from config/localStorage
        const config = JSON.parse(localStorage.getItem('cloud-storage-config') || '{}');
        this.gistId = config.gistId || this.gistId;
        if (!this.gistId) return null;

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load from GitHub Gist');
            }

            const gist = await response.json();
            const files = Object.values(gist.files)
                .filter(file => file.filename.includes(type))
                .sort((a, b) => b.filename.localeCompare(a.filename));

            if (files.length === 0) return null;

            return JSON.parse(files[0].content);
        } catch (error) {
            console.error('GitHub Gist load failed:', error);
            return null;
        }
    }
}

class FirebaseProvider {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.user = null;
    }

    async configure(config) {
        // Firebase implementation would go here
        // This is a placeholder for the Firebase SDK integration
        throw new Error('Firebase provider not yet implemented');
    }

    async save(data, type) {
        // Firebase save implementation
        return false;
    }

    async load(type) {
        // Firebase load implementation
        return null;
    }
}

class SupabaseProvider {
    constructor() {
        this.client = null;
        this.user = null;
    }

    async configure(config) {
        // Supabase implementation would go here
        // This is a placeholder for the Supabase SDK integration
        throw new Error('Supabase provider not yet implemented');
    }

    async save(data, type) {
        // Supabase save implementation
        return false;
    }

    async load(type) {
        // Supabase load implementation
        return null;
    }
}

// Initialize cloud storage manager
window.cloudStorage = null;
// Flag to prevent app.js from handling GitHub connections
window.CLOUD_STORAGE_HANDLES_GITHUB = true;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing cloud storage manager...');
    window.cloudStorage = new CloudStorageManager();
    
    // Make it available globally for debugging
    window.cs = window.cloudStorage;

    // Disable any existing GitHub connection modals that might conflict
    const existingGitHubModal = document.getElementById('github-connection-modal');
    if (existingGitHubModal) {
        existingGitHubModal.style.display = 'none';
        existingGitHubModal.remove(); // Remove it completely
        console.log('Removed existing GitHub connection modal to prevent conflicts');
    }

    // Override any app.js GitHub functions to prevent conflicts
    if (window.app) {
        window.app.saveGitHubToken = function() {
            console.log('GitHub token saving handled by cloud storage system');
        };
        window.app.updateStorageType = function() {
            console.log('Storage type updates handled by cloud storage system');
        };
    }

    // Disable any conflicting event handlers from app.js
    const appConnectButtons = document.querySelectorAll('[data-action="connect-github"], .github-connect-btn, button[onclick*="GitHub"]');
    appConnectButtons.forEach(btn => {
        if (btn.id !== 'connect-github') {
            btn.style.display = 'none';
            btn.disabled = true;
            console.log('Disabled conflicting GitHub connect button:', btn);
        }
    });

    // Set up GitHub connection with multiple attempts
    function setupGitHubConnection() {
        const connectButton = document.getElementById('connect-github');
        // Support both possible input IDs for GitHub token
        let tokenInput = document.getElementById('github-token-input');
        if (!tokenInput) {
            tokenInput = document.getElementById('github-token');
        }
        if (!tokenInput) {
            console.warn('GitHub token input not found. Expected id="github-token-input" or id="github-token"');
        }
        
        console.log('Setup attempt - Connect button found:', !!connectButton);
        console.log('Setup attempt - Token input found:', !!tokenInput);
        
        if (connectButton && tokenInput) {
            // Completely replace the button to remove all event listeners
            const newConnectButton = connectButton.cloneNode(true);
            connectButton.parentNode.replaceChild(newConnectButton, connectButton);
            
            // Only add our event listener
            newConnectButton.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Cloud storage connect button clicked');
                
                const token = tokenInput.value.trim();
                console.log('Token length:', token.length);
                
                if (!token) {
                    window.cloudStorage.showNotification('Please enter your GitHub token', 'error');
                    return false;
                }
                
                // Only allow one connection attempt at a time
                if (newConnectButton.disabled) {
                    console.log('Connection already in progress, ignoring click');
                    return false;
                }
                
                // Disable the button during connection
                newConnectButton.disabled = true;
                newConnectButton.textContent = 'Connecting...';
                
                try {
                    console.log('Attempting to connect with token...');
                    const success = await window.cloudStorage.setProvider('github', { githubToken: token });
                    console.log('Connection result:', success);
                    
                    if (success) {
                        // Clear the token input for security
                        tokenInput.value = '';
                        newConnectButton.textContent = 'Connected ✓';
                        newConnectButton.style.backgroundColor = '#28a745';
                        newConnectButton.style.color = 'white';
                        // Keep disabled to prevent reconnection
                    } else {
                        newConnectButton.textContent = 'Connect to GitHub';
                        newConnectButton.disabled = false;
                    }
                } catch (error) {
                    console.error('Connection error:', error);
                    newConnectButton.textContent = 'Connect to GitHub';
                    newConnectButton.disabled = false;
                }
                
                return false;
            }, true);
            
            console.log('GitHub connection handler attached successfully');
            return true;
        }
        return false;
    }

    // Try to setup immediately
    if (!setupGitHubConnection()) {
        // If not found, try again after a delay
        setTimeout(() => {
            if (!setupGitHubConnection()) {
                console.warn('GitHub connect elements still not found after delay');
            }
        }, 1000);
    }
});
