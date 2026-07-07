const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'assets', 'cards.glb');
const outDir = __dirname;

try {
  const buffer = fs.readFileSync(glbPath);
  console.log('Read GLB file, size:', buffer.length, 'bytes');

  let imageCount = 0;

  for (let i = 0; i < buffer.length - 8; i++) {
    // Check for PNG
    if (
      buffer[i] === 0x89 &&
      buffer[i+1] === 0x50 &&
      buffer[i+2] === 0x4E &&
      buffer[i+3] === 0x47 &&
      buffer[i+4] === 0x0D &&
      buffer[i+5] === 0x0A &&
      buffer[i+6] === 0x1A &&
      buffer[i+7] === 0x0A
    ) {
      console.log('Found PNG at offset:', i);
      let endOffset = -1;
      for (let j = i; j < buffer.length - 4; j++) {
        if (
          buffer[j] === 0x49 &&
          buffer[j+1] === 0x45 &&
          buffer[j+2] === 0x4E &&
          buffer[j+3] === 0x44
        ) {
          endOffset = j + 8; // Include chunk CRC
          break;
        }
      }
      if (endOffset !== -1) {
        const pngBuf = buffer.slice(i, endOffset);
        const outPath = path.join(outDir, `extracted_${imageCount}.png`);
        fs.writeFileSync(outPath, pngBuf);
        console.log('Saved PNG to:', outPath, 'size:', pngBuf.length, 'bytes');
        imageCount++;
        i = endOffset; // skip
      }
    }

    // Check for JPEG (FF D8 FF)
    if (
      buffer[i] === 0xFF &&
      buffer[i+1] === 0xD8 &&
      buffer[i+2] === 0xFF
    ) {
      console.log('Found JPEG start at offset:', i);
      let endOffset = -1;
      for (let j = i + 2; j < buffer.length - 2; j++) {
        if (
          buffer[j] === 0xFF &&
          buffer[j+1] === 0xD9
        ) {
          endOffset = j + 2;
          break;
        }
      }
      if (endOffset !== -1) {
        const jpgBuf = buffer.slice(i, endOffset);
        const outPath = path.join(outDir, `extracted_${imageCount}.jpg`);
        fs.writeFileSync(outPath, jpgBuf);
        console.log('Saved JPEG to:', outPath, 'size:', jpgBuf.length, 'bytes');
        imageCount++;
        i = endOffset; // skip
      }
    }
  }

  console.log('Extraction finished, total images found:', imageCount);
} catch (err) {
  console.error('Error:', err);
}
