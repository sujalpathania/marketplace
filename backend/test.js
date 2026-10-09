const http = require('http');
const req = http.request('http://localhost:5000/api/photos/seller/pending', {
  headers: { 'Authorization': 'Bearer test' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(res.statusCode, data));
});
req.end();
