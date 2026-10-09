const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/campus_marketplace.db');

db.all("SELECT * FROM listings;", (err, rows) => {
    if (err) console.error(err);
    else console.log('LISTINGS:', rows);
});
db.all("SELECT * FROM photo_requests;", (err, rows) => {
    if (err) console.error(err);
    else console.log('PHOTO_REQUESTS:', rows);
});
