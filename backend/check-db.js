const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./marketplace.db');
db.all('SELECT * FROM photo_requests', (err, rows) => {
  if (err) console.error('ERROR1:', err);
  else console.log('PHOTO REQUESTS:', rows.length);
});
