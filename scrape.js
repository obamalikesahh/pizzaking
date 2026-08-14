const fs = require('fs');
const https = require('https');

const options = {
  hostname: 'www.pizzaking-schleswig.com',
  path: '/order/index/14',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Cookie': 'my_area=0'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scraped_data.html', data);
    console.log('Done fetching, size:', data.length);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
