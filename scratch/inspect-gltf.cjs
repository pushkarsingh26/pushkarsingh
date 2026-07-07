const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'assets', 'cards.glb');

try {
  const buf = fs.readFileSync(glbPath);
  const magic = buf.toString('ascii', 0, 4);
  console.log('Magic:', magic);
  
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);
  console.log('GLB Version:', version, 'Length:', length);

  const chunkLength = buf.readUInt32LE(12);
  const chunkType = buf.readUInt32LE(16);
  console.log('Chunk Type:', chunkType.toString(16), 'Length:', chunkLength);

  const jsonStr = buf.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonStr);

  console.log('Materials:');
  console.log(JSON.stringify(gltf.materials, null, 2));

  console.log('Textures:');
  console.log(JSON.stringify(gltf.textures, null, 2));

} catch (err) {
  console.error('Error:', err);
}
