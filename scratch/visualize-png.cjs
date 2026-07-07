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

  // Let's decode the raw pixels into a 2D array of RGBA values
  const pixels = Array.from({ length: 540 }, () => Array(width).fill(null));

  let prevRow = Buffer.alloc(width * bpp);
  let currRow = Buffer.alloc(width * bpp);

  for (let y = 0; y < 540; y++) {
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

      pixels[y][x] = { r, g, b, a };
    }

    for (let i = 0; i < currRow.length; i++) {
      prevRow[i] = currRow[i];
    }
  }

  // We have the top 540 rows.
  // Let's divide into 16 columns and 8 rows.
  const gridRows = 8;
  const gridCols = 16;
  const cellW = Math.floor(width / gridCols);
  const cellH = Math.floor(540 / gridRows);

  console.log('Grid visualization of extracted_0.png:');
  console.log('W=White/Grey bg, P=Photo/Other colors, T=Transparent/Black');

  for (let gy = 0; gy < gridRows; gy++) {
    let line = '';
    for (let gx = 0; gx < gridCols; gx++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      let count = 0;

      for (let y = gy * cellH; y < (gy + 1) * cellH; y++) {
        for (let x = gx * cellW; x < (gx + 1) * cellW; x++) {
          const p = pixels[y][x];
          if (p) {
            rSum += p.r;
            gSum += p.g;
            bSum += p.b;
            aSum += p.a;
            count++;
          }
        }
      }

      const rAvg = rSum / count;
      const gAvg = gSum / count;
      const bAvg = bSum / count;
      const aAvg = aSum / count;

      if (aAvg < 50) {
        line += ' . '; // Transparent
      } else if (rAvg > 240 && gAvg > 240 && bAvg > 240) {
        line += ' # '; // Bright White Background
      } else if (rAvg > 200 && gAvg > 200 && bAvg > 200) {
        line += ' = '; // Light grey background
      } else {
        line += ' O '; // Photo / Dark text / colorful
      }
    }
    console.log(line);
  }

} catch (err) {
  console.error('Error:', err);
}
