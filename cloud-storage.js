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
            this.config.provider = providerName;
            this.config = { ...this.config, ...config };
            this.saveConfig();

            if (providerName !== 'local') {
                this.currentProvider = this.providers[providerName];
                if (this.currentProvider) {
                    await this.currentProvider.configure(config);
                }
            } else {
                this.currentProvider = null;
            }

            this.showNotification('Storage provider updated successfully');
            return true;
        } catch (error) {
            console.error('Failed to set provider:', error);
            this.showNotification('Failed to connect to storage provider', 'error');
            return false;
        }
    }

    async loadProvider() {
        if (this.config.provider !== 'local') {
            try {
                this.currentProvider = this.providers[this.config.provider];
                await this.currentProvider.configure(this.config);
                
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
        if (!this.currentProvider) return false;

        try {
            const success = await this.currentProvider.save(data, type);
            if (success) {
                this.config.lastBackup = new Date().toISOString();
                this.saveConfig();
                this.showNotification('Data backed up to cloud');
            }
            return success;
        } catch (error) {
            console.error('Cloud save failed:', error);
            this.showNotification('Failed to backup to cloud', 'error');
            return false;
        }
    }

    async loadFromCloud(type = 'predictions') {
        if (!this.currentProvider) return null;

        try {
            return await this.currentProvider.load(type);
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
        // Optionally, test the token by making a simple API call
        // ...could add a fetch to https://api.github.com/user with the token...
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
            
            return true;
        } catch (error) {
            console.error('GitHub Gist save failed:', error);
            return false;
        }
    }

    async load(type) {
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
            
            // Find the most recent file of the requested type
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
let cloudStorage;
document.addEventListener('DOMContentLoaded', () => {
    cloudStorage = new CloudStorageManager();

    // Add event listener for the Connect button in settings tab
    // This should be in the DOMContentLoaded or settings tab UI logic
    // Example:
    document.getElementById('connect-github')?.addEventListener('click', async () => {
        const tokenInput = document.getElementById('github-token-input');
        const token = tokenInput ? tokenInput.value.trim() : '';
        if (!token) {
            cloudStorage.showNotification('Please enter your GitHub token', 'error');
            return;
        }
        await cloudStorage.setProvider('github', { githubToken: token });
    });
});
