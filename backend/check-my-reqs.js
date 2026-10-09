const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/campus_marketplace.db');
const sql = "SELECT pr.id, pr.listing_id, pr.buyer_id, pr.message, pr.status, pr.created_at, u.full_name as buyer_name, u.email as buyer_email, l.title as listing_title, l.image_url as listing_image, l.seller_id FROM photo_requests pr JOIN users u ON pr.buyer_id = u.id JOIN listings l ON pr.listing_id = l.id";
db.all(sql, (err, rows) => {
  if (err) console.error(err);
  else console.log('MY_REQUESTS:', rows);
});
