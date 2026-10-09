const http = require('http');

const data = JSON.stringify({
  email: 'sujal1518.be23@chitkarauniversity.edu.in',
  password: 'password' // I don't know the password...
});

const req = http.request('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(res.statusCode, body);
  });
});
req.write(data);
req.end();
