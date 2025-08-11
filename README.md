# NFL Prediction Tracker 2025-2026

A web application for tracking your NFL game predictions throughout the 2025-2026 season. Built with vanilla HTML, CSS, and JavaScript, designed to be deployed on GitHub Pages.

## Features

- **Complete NFL Schedule**: View all games for the 2025-2026 season
- **Team Information**: See team records and game details
- **Individual Game Predictions**: Select your predicted winner for each game
- **Bulk Weekly Predictions**: Make all predictions for a week at once using the modal interface
- **Pre-season Predictions**: 
  - Make championship and playoff predictions before the season
  - **Predict Team Records**: Set your predicted win-loss record for each team
  - **Standings Comparison**: Compare your predicted records against actual standings
- **Season Comparison**: Compare your pre-season predictions with weekly picks and actual results
- **Automated Score Updates**: GitHub Actions automatically updates scores every Tuesday
- **Track Accuracy**: Monitor your prediction success rate with detailed statistics
- **Filter Games**: Filter by week or team to focus on specific matchups
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Local Storage**: Your predictions are saved in your browser

## How to Use

1. **View Games**: Browse the NFL schedule organized by weeks
2. **Make Individual Predictions**: Use the dropdown on each game card to select your predicted winner
3. **Make Bulk Weekly Predictions**:
   - Select a week from the week filter
   - Click "Make Week Predictions" button
   - Fill out all predictions for that week in the modal
   - Save all predictions at once
4. **Make Pre-season Record Predictions**:
   - Click "Pre-season Predictions" tab
   - Set your predicted win-loss record for each team
   - Save your predictions before the season starts
5. **View Standings Comparison**:
   - Access through the "Pre-season Predictions" tab
   - Compare your predicted records with actual team standings
   - See accuracy of your record predictions
6. **Track Results**: Once games are completed and scores are updated, see if your predictions were correct
7. **Monitor Stats**: Check your overall prediction accuracy in the header stats
8. **Manage Data**: Use the Settings tab to backup, export, or sync your predictions

## Game Information Displayed

- Home and Away teams
- Team records (wins-losses)
- Game date and time
- Final scores (when available)
- Game status (Upcoming/Live/Final)
- Winner indication

## Navigation Tabs

- **Weekly Predictions**: Make individual and bulk predictions for games
- **Weekly Results**: View completed games and prediction accuracy
- **Team Standings**: See current NFL standings by division
- **Pre-Season Predictions**: Make championship and record predictions
- **Season Comparison**: Compare pre-season vs weekly predictions
- **Settings**: Manage data storage, backups, and app preferences

## Filters

- **Week Filter**: Show games from a specific week
- **Team Filter**: Show games involving a specific team
- **Make Week Predictions**: Bulk prediction interface for selected week
- **Clear All Predictions**: Reset all your predictions

## Data Management & Storage

### Local Storage (Default)
- All predictions automatically saved to browser localStorage
- Fast and works offline
- Limited to single browser/device

### Cloud Storage Options (Future)
Access through the **Settings** tab to configure:

1. **GitHub Gists**: Backup to private GitHub repositories
2. **Export/Import**: Manual backup via JSON/CSV files
3. **Data Management**: Clear or reset specific prediction types

### Export Options
- Export all predictions to CSV format
- Export pre-season predictions separately
- Full data backup in JSON format

## Deployment to GitHub Pages

### Step 1: Create GitHub Repository

1. Create a new repository on GitHub (e.g., `nfl_prediction_tracker`)
2. Initialize it as public (required for free GitHub Pages)

### Step 2: Upload Files

1. Clone or download this repository
2. Push all files to your GitHub repository:

   ```bash
   git clone https://github.com/yourusername/nfl_prediction_tracker.git
   cd nfl_prediction_tracker
   # Copy all files from this project into the directory
   git add .
   git commit -m "Initial NFL Prediction Tracker setup"
   git push origin main
   ```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### Step 4: Enable GitHub Actions (for automatic score updates)

1. Go to **Actions** tab in your repository
2. Click **I understand my workflows and want to enable them**
3. The workflow will run automatically every Tuesday at 6 AM UTC

### Step 5: Access Your App

- Your app will be available at: `https://yourusername.github.io/nfl_prediction_tracker`
- It may take a few minutes for the initial deployment

### Step 6: Test the Setup

1. Visit your deployed site
2. Test making predictions
3. Manually trigger the score update workflow:
   - Go to **Actions** tab
   - Click **Update NFL Scores**
   - Click **Run workflow** → **Run workflow**

## Local Development

1. Clone the repository
2. Open `index.html` in your web browser
3. No build process required - it's pure HTML, CSS, and JavaScript

## Data Updates

The schedule data is stored in `nfl-schedule.js`. Game scores are automatically updated via GitHub Actions.

### 2025-2026 NFL Schedule

The app now includes the complete 2025-2026 NFL schedule:

- **Regular Season**: 18 weeks (September 4, 2025 - January 5, 2026)
- **Wild Card Round**: 6 games (January 11-13, 2026)  
- **Divisional Round**: 4 games (January 18-19, 2026)
- **Conference Championships**: 2 games (January 26, 2026)
- **Super Bowl LX**: February 9, 2026 in New Orleans
- **Total Games**: ~285 games for complete season tracking

### Schedule Features

- All regular season matchups with accurate dates and times
- Playoff bracket structure (teams TBD based on regular season results)
- Proper week numbering for easy filtering and bulk predictions
- Ready for automated score updates via ESPN API integration

### Automated Score Updates

This repository includes a GitHub Actions workflow that automatically updates NFL game scores:

- **Schedule**: Runs every Tuesday at 6 AM UTC (midnight CT/1 AM ET)
- **Source**: Fetches real-time scores from ESPN's NFL API
- **Process**: Updates game scores, status, winners, and team records
- **Manual Trigger**: Can be manually triggered from the Actions tab

### Manual Game Result Updates

You can also manually update game results by editing the game objects in the `games` array:

1. Edit the game objects in the `games` array
2. Set `homeScore`, `awayScore`, `status: 'final'`, and `winner`
3. The app will automatically calculate prediction accuracy

### Example Game Result Update

```javascript
// In nfl-schedule.js, update a game like this:
{
    id: 1,
    week: 1,
    date: '2025-09-04',
    time: '8:20 PM',
    homeTeam: 'KC',
    awayTeam: 'BAL',
    homeScore: 27,
    awayScore: 20,
    status: 'final',
    winner: 'KC'
}
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Requires JavaScript enabled
- Uses localStorage for saving predictions

## Files Structure

- `index.html` - Main application page with all tabs and modals
- `styles.css` - Application styling and responsive design
- `app.js` - Main application logic with prediction functionality
- `nfl-schedule.js` - NFL schedule and team data
- `.github/workflows/update-scores.yml` - GitHub Actions workflow for automated score updates
- `.github/scripts/update-scores.js` - Node.js script that fetches scores from ESPN API
- `.gitignore` - Excludes temporary files and dependencies from version control
- `README.md` - This documentation

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

This project is open source and available under the MIT License.

## Cloud Storage & Long-Term Storage Options

The NFL Prediction Tracker offers multiple storage solutions to ensure your predictions are never lost and can be accessed across devices.

### Local Storage (Default)
- **Automatic**: All predictions saved to browser localStorage
- **Pros**: Fast, works offline, no setup required
- **Cons**: Limited to single browser/device, can be cleared

### Cloud Storage Options

#### 1. GitHub Gists Integration (Recommended)
- **Setup**: Connect your GitHub account for automatic backup
- **Features**: 
  - Version history of all predictionssu
  - Access from any device with GitHub login
  - Automatic daily backups
  - Free with GitHub account
- **Privacy**: Private gists keep your predictions secure

#### 2. Firebase/Firestore Integration
- **Setup**: Connect to Google Firebase for real-time sync
- **Features**:
  - Real-time synchronization across devices
  - User authentication system
  - Offline capability with sync when online
  - Team sharing and collaboration features
- **Cost**: Free tier available, paid plans for heavy usage

#### 3. Supabase Integration (Open Source)
- **Setup**: Self-hosted or managed Supabase instance
- **Features**:
  - PostgreSQL database backend
  - Real-time subscriptions
  - Row-level security
  - Open source alternative to Firebase
- **Cost**: Free tier available, competitive pricing

#### 4. Enhanced Export/Import System
- **Manual Backup**: Export all data to JSON/CSV files
- **Automated Backups**: Schedule automatic exports
- **Cross-Platform**: Import data between browsers/devices
- **Version Control**: Track changes over time

### Storage Configuration

Access storage settings through the **Settings** tab:

1. **Choose Storage Provider**: Select your preferred cloud service
2. **Authenticate**: Connect your account (GitHub/Google/Supabase)
3. **Configure Sync**: Set automatic backup frequency
4. **Privacy Settings**: Control data sharing and visibility
5. **Export Options**: Schedule automated backups

### Data Synchronization

- **Real-time Sync**: Changes sync instantly across devices (Firebase/Supabase)
- **Periodic Backup**: Automatic backups at configurable intervals
- **Manual Sync**: Force sync at any time
- **Conflict Resolution**: Smart merging of predictions from multiple devices

### Security & Privacy

- **Encryption**: All cloud data encrypted in transit and at rest
- **Access Control**: You control who can view your predictions
- **Data Ownership**: Your data remains yours, easy export/deletion
- **GDPR Compliant**: Full data portability and deletion rights

### Setup Instructions

#### GitHub Gists Setup (Easiest)
1. Go to Settings tab → Cloud Storage
2. Click "Connect GitHub Account"
3. Authorize the application
4. Choose backup frequency (daily recommended)
5. Your predictions automatically sync to private gists

#### Firebase Setup (Most Features)
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore and Authentication
3. Copy your Firebase config to Settings → Cloud Storage
4. Enable Google Authentication
5. All predictions sync in real-time

#### Supabase Setup (Open Source)
1. Create account at https://supabase.com or self-host
2. Create new project and database
3. Copy connection details to Settings → Cloud Storage
4. Configure authentication method
5. Real-time sync activated

### Migration & Backup

- **Import Existing Data**: Upload previous exports or migrate from localStorage
- **Bulk Operations**: Import/export entire seasons or specific date ranges
- **Data Validation**: Automatic validation during import process
- **Rollback**: Restore from any previous backup version

### Offline Capabilities

- **Local Cache**: All data cached locally for offline access
- **Sync on Reconnect**: Automatic sync when internet connection restored
- **Conflict Detection**: Smart handling of offline changes
- **Queue Management**: Pending changes queued until sync possible

### Team Features (Firebase/Supabase)

- **Group Predictions**: Create prediction leagues with friends
- **Leaderboards**: Compare accuracy across group members
- **Shared Pools**: Collaborative playoff brackets
- **Real-time Updates**: See friends' predictions in real-time
- **Discussion**: Comment on predictions and games

### Advanced Features

- **API Access**: RESTful API for custom integrations
- **Webhooks**: Get notified of prediction updates
- **Analytics**: Detailed statistics across multiple seasons
- **Machine Learning**: AI-powered prediction suggestions based on history
- **Third-party Integrations**: Connect to ESPN, Yahoo, or other sports platforms
