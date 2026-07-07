const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, 'extracted_0.png');

try {
  const buf = fs.readFileSync(imgPath);
  // PNG dimensions are stored at offset 16 (width) and 20 (height) as 32-bit big-endian integers
  const width = buf.readInt32BE(16);
  const height = buf.readInt32BE(20);
  console.log('Image dimensions:', width, 'x', height);
} catch (err) {
  console.error('Error:', err);
}
