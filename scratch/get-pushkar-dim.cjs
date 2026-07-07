const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', 'assets', 'pushkar.png');

try {
  const buf = fs.readFileSync(imgPath);
  const width = buf.readInt32BE(16);
  const height = buf.readInt32BE(20);
  console.log('pushkar.png dimensions:', width, 'x', height);
} catch (err) {
  console.error('Error:', err);
}
