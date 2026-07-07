const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'assets', 'cards.glb');

try {
  const buf = fs.readFileSync(glbPath);
  const chunkLength = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonStr);

  // Print keys
  console.log('GLTF Keys:', Object.keys(gltf));
  if (gltf.images) {
    console.log('Images:', JSON.stringify(gltf.images, null, 2));
  }
} catch (err) {
  console.error('Error:', err);
}
