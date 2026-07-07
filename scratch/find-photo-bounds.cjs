const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const pngPath = path.join(__dirname, 'extracted_0.png');

try {
  const buf = fs.readFileSync(pngPath);
  let offset = 8;
  let idatBuffers = [];
  let width = 0;
  let height = 0;

  while (offset < buf.length) {
    const length = buf.readInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    
    if (type === 'IHDR') {
      width = buf.readInt32BE(offset + 8);
      height = buf.readInt32BE(offset + 12);
    } else if (type === 'IDAT') {
      idatBuffers.push(buf.slice(offset + 8, offset + 8 + length));
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  const idatBuf = Buffer.concat(idatBuffers);
  const inflated = zlib.inflateSync(idatBuf);

  const bpp = 4;
  const rowSize = 1 + width * bpp;

  let minX = width, maxX = 0;
  let minY = height, maxY = 0;

  let prevRow = Buffer.alloc(width * bpp);
  let currRow = Buffer.alloc(width * bpp);

  // Scan for photo pixels:
  // The background of the card is white/light-grey. 
  // Let's scan for pixels that are NOT transparent and NOT white (R < 220 or G < 220 or B < 220).
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    const filter = inflated[rowOffset];
    const rawPixels = inflated.slice(rowOffset + 1, rowOffset + rowSize);

    for (let x = 0; x < width; x++) {
      const idx = x * bpp;
      let r = rawPixels[idx];
      let g = rawPixels[idx+1];
      let b = rawPixels[idx+2];
      let a = rawPixels[idx+3];

      if (filter === 1) {
        if (x > 0) {
          r = (r + currRow[idx - bpp]) % 256;
          g = (g + currRow[idx - bpp + 1]) % 256;
          b = (b + currRow[idx - bpp + 2]) % 256;
          a = (a + currRow[idx - bpp + 3]) % 256;
        }
      } else if (filter === 2) {
        r = (r + prevRow[idx]) % 256;
        g = (g + prevRow[idx+1]) % 256;
        b = (b + prevRow[idx+2]) % 256;
        a = (a + prevRow[idx+3]) % 256;
      } else if (filter === 3) {
        const leftR = x > 0 ? currRow[idx - bpp] : 0;
        const leftG = x > 0 ? currRow[idx - bpp + 1] : 0;
        const leftB = x > 0 ? currRow[idx - bpp + 2] : 0;
        const leftA = x > 0 ? currRow[idx - bpp + 3] : 0;

        r = (r + Math.floor((leftR + prevRow[idx]) / 2)) % 256;
        g = (g + Math.floor((leftG + prevRow[idx+1]) / 2)) % 256;
        b = (b + Math.floor((leftB + prevRow[idx+2]) / 2)) % 256;
        a = (a + Math.floor((leftA + prevRow[idx+3]) / 2)) % 256;
      } else if (filter === 4) {
        const leftR = x > 0 ? currRow[idx - bpp] : 0;
        const leftG = x > 0 ? currRow[idx - bpp + 1] : 0;
        const leftB = x > 0 ? currRow[idx - bpp + 2] : 0;
        const leftA = x > 0 ? currRow[idx - bpp + 3] : 0;

        const upR = prevRow[idx];
        const upG = prevRow[idx+1];
        const upB = prevRow[idx+2];
        const upA = prevRow[idx+3];

        const diagR = x > 0 ? prevRow[idx - bpp] : 0;
        const diagG = x > 0 ? prevRow[idx - bpp + 1] : 0;
        const diagB = x > 0 ? prevRow[idx - bpp + 2] : 0;
        const diagA = x > 0 ? prevRow[idx - bpp + 3] : 0;

        function paeth(a, b, c) {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          if (pa <= pb && pa <= pc) return a;
          if (pb <= pc) return b;
          return c;
        }

        r = (r + paeth(leftR, upR, diagR)) % 256;
        g = (g + paeth(leftG, upG, diagG)) % 256;
        b = (b + paeth(leftB, upB, diagB)) % 256;
        a = (a + paeth(leftA, upA, diagA)) % 256;
      }

      currRow[idx] = r;
      currRow[idx+1] = g;
      currRow[idx+2] = b;
      currRow[idx+3] = a;

      // Check if it is a photo pixel: visible and not white/grey background
      const isCardBg = r > 240 && g > 240 && b > 240;
      const isVisible = a > 50;

      if (isVisible && !isCardBg) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    for (let i = 0; i < currRow.length; i++) {
      prevRow[i] = currRow[i];
    }
  }

  console.log('Photo / content bounding box:');
  console.log('X:', minX, 'to', maxX, '(width:', maxX - minX + 1, ')');
  console.log('Y:', minY, 'to', maxY, '(height:', maxY - minY + 1, ')');

} catch (err) {
  console.error('Error:', err);
}
