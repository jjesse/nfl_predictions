# NFL Prediction Tracker 2025-2026

A web application for tracking your NFL game predictions throughout the 2025-2026 season. Built with vanilla HTML, CSS, and JavaScript, designed to be deployed on GitHub Pages.

## Features

- **Complete NFL Schedule**: View all games for the 2025-2026 season
- **Team Information**: See team records and game details
- **Individual Game Predictions**: Select your predicted winner for each game
- **Bulk Weekly Predictions**: Make all predictions for a week at once using the modal interface
- **Pre-season Predictions**: Make championship and playoff predictions before the season
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
4. **Track Results**: Once games are completed and scores are updated, see if your predictions were correct
5. **Monitor Stats**: Check your overall prediction accuracy in the header stats

## Game Information Displayed

- Home and Away teams
- Team records (wins-losses)
- Game date and time
- Final scores (when available)
- Game status (Upcoming/Live/Final)
- Winner indication

## Filters

- **Week Filter**: Show games from a specific week
- **Team Filter**: Show games involving a specific team
- **Make Week Predictions**: Bulk prediction interface for selected week
- **Clear All Predictions**: Reset all your predictions

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

- `index.html` - Main application page
- `styles.css` - Application styling  
- `app.js` - Main application logic with bulk prediction functionality
- `nfl-schedule.js` - NFL schedule and team data
- `.github/workflows/update-scores.yml` - GitHub Actions workflow for automated score updates
- `.github/scripts/update-scores.js` - Node.js script that fetches scores from ESPN API
- `.gitignore` - Excludes temporary files and dependencies from version control
- `README.md` - This documentation

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

This project is open source and available under the MIT License.
