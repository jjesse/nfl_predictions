// Critical App Fixes - Apply these changes for stability
// Run this in browser console to immediately fix major issues

console.log('🔧 Applying critical fixes...');

// 1. Fix duplicate navigation tabs permanently
function fixDuplicateTabs() {
    // Remove all existing navigation
    document.querySelectorAll('nav.prediction-tabs').forEach(nav => nav.remove());
    
    // Create single clean navigation
    const mainContainer = document.querySelector('main.container');
    const h1 = mainContainer.querySelector('h1');
    
    const nav = document.createElement('nav');
    nav.className = 'prediction-tabs';
    nav.innerHTML = `
        <button class="tab-btn active" data-tab="weekly">Weekly Predictions</button>
        <button class="tab-btn" data-tab="results">Weekly Results</button>
        <button class="tab-btn" data-tab="standings">Team Standings</button>
        <button class="tab-btn" data-tab="preseason">Pre-Season Predictions</button>
        <button class="tab-btn" data-tab="settings">Settings</button>
    `;
    
    h1.insertAdjacentElement('afterend', nav);
    console.log('✅ Fixed navigation tabs');
}

// 2. Add missing CSS for better mobile support
function addResponsiveCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Mobile responsive fixes */
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .prediction-tabs { flex-wrap: wrap; }
            .tab-btn { font-size: 12px; padding: 8px 12px; }
            .game-card { margin: 5px 0; }
            .settings-container { padding: 10px; }
            .github-connection { flex-direction: column; gap: 10px; }
            .token-input { width: 100%; }
        }
        
        /* Loading states */
        .loading { 
            opacity: 0.6; 
            pointer-events: none; 
        }
        
        .loading::after {
            content: '...';
            animation: dots 1s infinite;
        }
        
        @keyframes dots {
            0%, 20% { opacity: 0; }
            40% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        /* Error states */
        .error-message {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        /* Success states */
        .success-message {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Added responsive CSS');
}

// 3. Add error boundary wrapper
function addErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('App Error:', e.error);
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <strong>Something went wrong:</strong> ${e.error.message}<br>
            <small>Check the console for details. Try refreshing the page.</small>
        `;
        
        document.body.insertBefore(errorDiv, document.body.firstChild);
        
        // Auto-remove after 10 seconds
        setTimeout(() => errorDiv.remove(), 10000);
    });
    
    console.log('✅ Added error handling');
}

// 4. Improve cloud storage status
function addStorageStatus() {
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'storage-status';
        statusDiv.className = 'storage-status';
        statusDiv.innerHTML = `
            <div class="settings-section">
                <h3>Storage Status</h3>
                <div id="connection-status">
                    <span class="status-indicator">●</span>
                    <span class="status-text">Checking connection...</span>
                </div>
            </div>
        `;
        
        settingsContainer.insertBefore(statusDiv, settingsContainer.firstChild);
        
        // Update status based on cloud storage state
        function updateStatus() {
            const indicator = document.querySelector('.status-indicator');
            const text = document.querySelector('.status-text');
            
            if (window.cloudStorage && window.cloudStorage.currentProvider) {
                indicator.style.color = '#28a745';
                text.textContent = `Connected to ${window.cloudStorage.config.provider}`;
            } else {
                indicator.style.color = '#6c757d';
                text.textContent = 'Local storage only';
            }
        }
        
        updateStatus();
        setInterval(updateStatus, 5000); // Check every 5 seconds
    }
    
    console.log('✅ Added storage status');
}

// 5. Fix tab switching functionality
function fixTabSwitching() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            e.preventDefault();
            
            // Remove active from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active to clicked tab
            e.target.classList.add('active');
            
            // Show corresponding content
            const tabId = e.target.dataset.tab;
            const content = document.getElementById(tabId);
            if (content) {
                content.classList.add('active');
            }
            
            console.log('Switched to tab:', tabId);
        }
    });
    
    console.log('✅ Fixed tab switching');
}

// Apply all fixes
try {
    fixDuplicateTabs();
    addResponsiveCSS();
    addErrorHandling();
    addStorageStatus();
    fixTabSwitching();
    
    console.log('🎉 All critical fixes applied successfully!');
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = '✅ App fixes applied! Navigation should now work properly.';
    document.body.insertBefore(successDiv, document.body.firstChild);
    setTimeout(() => successDiv.remove(), 5000);
    
} catch (error) {
    console.error('❌ Error applying fixes:', error);
}