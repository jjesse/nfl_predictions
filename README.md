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
  - **Standings Comparison**: Compare your predicted records against actual standings with accuracy metrics
- **Season Comparison**: Compare your pre-season predictions with weekly picks and actual results
- **Automated Score Updates**: GitHub Actions automatically updates scores every Tuesday
- **Track Accuracy**: Monitor your prediction success rate with detailed statistics
- **Filter Games**: Filter by week or team to focus on specific matchups
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Local Storage**: Your predictions are saved in your browser
- **Cloud Storage**: Backup and sync predictions using GitHub Gists (and other providers in future)

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
   - Set your predicted win-loss record for each team (wins + losses should equal 17)
   - Save your predictions before the season starts
5. **View Standings Comparison**:
   - Click "View Standings Comparison" button in Pre-season tab, or
   - Navigate to the dedicated "Season Comparison" tab
   - Filter by conference (AFC/NFC) or view all teams
   - See accuracy percentages and win differences for each team prediction
6. **Track Results**: Once games are completed and scores are updated, see if your predictions were correct
7. **Monitor Stats**: Check your overall prediction accuracy in the header stats
8. **Manage Data**: Use the Settings tab to backup, export, or sync your predictions

## Cloud Storage & Backup

### Local Storage (Default)

- All predictions automatically saved to browser localStorage
- Fast and works offline
- Limited to single browser/device

### GitHub Gists Integration

- Go to Settings tab → Cloud Storage
- Enter your GitHub token and click "Connect"
- Predictions are backed up to a private GitHub Gist
- Supports daily, weekly, or manual backup
- Data can be restored from cloud backup on any device

### Export/Import

- Export all predictions to CSV or JSON
- Import previous backups to restore your data

## Deployment to GitHub Pages

1. Create a new repository on GitHub (e.g., `nfl_prediction_tracker`)
2. Upload all files from this project
3. Enable GitHub Pages in repository settings (Source: main branch, root folder)
4. Enable GitHub Actions for automated score updates
5. Access your app at `https://yourusername.github.io/nfl_prediction_tracker`

## Automated Score Updates

- Scores are updated automatically every Tuesday via GitHub Actions
- The workflow fetches scores from ESPN's NFL API and updates `nfl-schedule.js`
- You can manually trigger the workflow from the Actions tab

## Manual Game Result Updates

- You can manually update game results by editing the game objects in the `games` array in `nfl-schedule.js`
- Set `homeScore`, `awayScore`, `status: 'final'`, and `winner` for each game

## Files Structure

- `index.html` - Main application page
- `styles.css` - Application styling
- `app.js` - Main application logic
- `nfl-schedule.js` - NFL schedule and team data
- `cloud-storage.js` - Cloud storage logic (GitHub Gists, future providers)
- `.github/workflows/update-scores.yml` - GitHub Actions workflow for automated score updates
- `.github/scripts/update-scores.js` - Node.js script for fetching scores
- `README.md` - This documentation

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

This project is open source and available under the MIT License.
