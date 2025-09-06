# NFL Season Predictions Tracker

A sophisticated web app to track your NFL season predictions against actual results with automated weekly updates.

## ✨ Key Features

- **Conference-Based Predictions**: Organized by NFC and AFC with divisions within each
- **Postseason Predictions**: Predict divisional winners, conference champions, and Super Bowl winner
- **Automated Results**: GitHub Actions automatically fetch and update actual results every Tuesday at 4am
- **Real-time Accuracy**: See your prediction accuracy updated automatically for both regular season and postseason
- **Local Storage**: Your predictions are saved locally in your browser - no upload required!
- **Responsive Design**: Works on desktop and mobile devices
- **100% Free**: No API keys or paid services required!

## Automated Updates

The app uses GitHub Actions to automatically:
- Fetch NFL game results every Tuesday at 4:00 AM UTC
- Update team records based on completed games
- Calculate your prediction accuracy
- Commit changes back to the repository

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Development Tools

This project uses several development tools to maintain code quality:

- **ESLint** - For code linting and identifying potential errors
- **Prettier** - For consistent code formatting
- **http-server** - For local development server

### Available Scripts

- `npm run start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run build` - Build the project for production
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and automatically fix issues
- `npm run format` - Format code with Prettier
- `npm run validate` - Run linting and formatting checks
- `npm run update` - Update game results manually

## Setup Instructions

### 1. Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/nfl_predictions.git
   cd nfl_predictions
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8000`

### 2. Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from this project
3. Go to Settings → Pages → Deploy from branch → Select your main branch
4. Your site will be available at `https://yourusername.github.io/repository-name/`

### 2. Make Your Predictions

**No upload required!** Just enter your predictions directly in the web app:

1. **NFC Predictions Tab**: Enter win/loss predictions for all NFC teams (East, North, South, West divisions)
2. **AFC Predictions Tab**: Enter win/loss predictions for all AFC teams (East, North, South, West divisions)  
3. **Postseason Tab**: Predict playoff winners and Super Bowl champion
4. **All predictions are automatically saved** in your browser

### 3. Track Results

- **Enter Results Tab**: Input actual game results as they happen
- **View Comparison Tab**: See how your predictions compare to reality
- **Accuracy tracking** happens automatically

## How It Works

1. **Make Predictions**: Enter your predictions directly in the web app (NFC → AFC → Postseason flow)
2. **Automation**: Every Tuesday, GitHub Actions fetches NFL results and updates your accuracy
3. **Track Progress**: View your predictions vs. actual results with real-time accuracy

## License

This project is available under the MIT License. See the [LICENSE](LICENSE) file for details.

When using this code in your own projects, please provide attribution by including the following:

```
Based on NFL Predictions Tracker - https://github.com/yourusername/nfl_predictions
```

## Data Storage

- **Local**: All predictions stored in browser localStorage (no upload needed!)
- **Remote**: Results and accuracy updated via GitHub Actions
- **Backup**: Export functionality available if you want to backup your predictions

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `script.js` - Application logic and data handling
- `update-results.js` - GitHub Actions script for fetching NFL data
- `results.json` - Automatically updated with actual team records
- `predictions.json` - Optional: Your prediction data (created when you export)
- `postseason-predictions.json` - Optional: Your postseason prediction data
- `postseason-results.json` - Actual postseason results
- `accuracy.json` - Your prediction accuracy statistics
- `.github/workflows/update-results.yml` - GitHub Actions workflow

## Data Storage

- **Local**: Predictions stored in browser localStorage
- **Remote**: Results and accuracy updated via GitHub Actions
- **Export**: Use "Export Predictions" to download predictions for automation

## API Usage

The automation uses **ESPN's public API endpoints** - completely free with no API key required!

- **No authentication needed**
- **No rate limits** for basic usage
- **Official NFL data** from ESPN
- **Reliable and up-to-date**

### Alternative Data Sources

If ESPN's API changes, the script includes fallbacks:
- Free sports data APIs
- Multiple data source options
- Automatic error handling and retries

### Data Reliability

- Uses official ESPN NFL data
- Automatic error handling
- Fallback calculations if API is unavailable
- Comprehensive logging for troubleshooting

## Customization

You can modify:
- `script.js` - Team data or UI behavior
- `styles.css` - Appearance and styling
- `update-results.js` - Data fetching logic
- `.github/workflows/update-results.yml` - Update schedule

## Troubleshooting

**Automation not working?**
- Ensure `predictions.json` is uploaded to the repository
- Check Actions tab for error logs
- Verify ESPN API is accessible (may change endpoints occasionally)

**API issues?**
- The script has automatic fallbacks
- Check the Action logs for specific error messages
- ESPN occasionally changes their API structure

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage
- fetch API
