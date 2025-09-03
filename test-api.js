const https = require('https');

const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

https.get(url, {rejectUnauthorized: false}, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('=== ESPN API Response Analysis ===');
      console.log('Status Code:', res.statusCode);
      console.log('Response Size:', data.length, 'characters');
      console.log('Has events?', !!json.events);
      console.log('Events count:', json.events ? json.events.length : 0);
      console.log('Has week?', !!json.week);
      console.log('Week info:', json.week ? JSON.stringify(json.week, null, 2) : 'N/A');
      console.log('Season type:', json.season ? json.season.type.name : 'N/A');

      if (json.events && json.events.length > 0) {
        console.log('Sample event:', JSON.stringify(json.events[0], null, 2));
      }
    } catch (e) {
      console.error('JSON parse error:', e.message);
      console.log('Raw response start:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
