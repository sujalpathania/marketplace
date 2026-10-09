const jwt = require('jsonwebtoken');
const http = require('http');
const token = jwt.sign({ id: '32ff3a22-f4f3-4a25-8e3b-a200b2a81055', email: 'test@example.com', fullName: 'sujal' }, 'campus_marketplace_super_secret_jwt_key_2026');

const req = http.request('http://localhost:5000/api/photos/my-requests', {
  headers: { 'Authorization': 'Bearer ' + token }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(res.statusCode, data));
});
req.end();
