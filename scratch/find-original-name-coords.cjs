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

  let prevRow = Buffer.alloc(width * bpp);
  let currRow = Buffer.alloc(width * bpp);

  // We want to find the text "Name - Prince kumar" or "Profession - student".
  // These are printed in dark text on the white/grey card background.
  // The background is around R,G,B > 220. The text is dark: R,G,B < 100.
  // Let's print out all rows between y = 400 and y = 538 where we find dark pixels (R < 100, G < 100, B < 100, A > 200).
  
  let darkPixelRows = {};

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

      const isDark = a > 200 && r < 80 && g < 80 && b < 80;
      if (isDark && y > 400) {
        if (!darkPixelRows[y]) darkPixelRows[y] = { minX: x, maxX: x };
        else {
          if (x < darkPixelRows[y].minX) darkPixelRows[y].minX = x;
          if (x > darkPixelRows[y].maxX) darkPixelRows[y].maxX = x;
        }
      }
    }

    for (let i = 0; i < currRow.length; i++) {
      prevRow[i] = currRow[i];
    }
  }

  const rows = Object.keys(darkPixelRows).map(Number).sort((a,b) => a-b);
  if (rows.length > 0) {
    console.log('Dark text pixels found between y =', rows[0], 'and y =', rows[rows.length - 1]);
    // Group adjacent rows to find distinct lines
    let groups = [];
    let currentGroup = [rows[0]];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] === rows[i-1] + 1) {
        currentGroup.push(rows[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [rows[i]];
      }
    }
    groups.push(currentGroup);

    groups.forEach((g, idx) => {
      let minX = width;
      let maxX = 0;
      g.forEach(y => {
        if (darkPixelRows[y].minX < minX) minX = darkPixelRows[y].minX;
        if (darkPixelRows[y].maxX > maxX) maxX = darkPixelRows[y].maxX;
      });
      console.log(`Line ${idx}: rows ${g[0]}-${g[g.length-1]}, X: ${minX} to ${maxX}`);
    });
  } else {
    console.log('No dark text pixels found below y = 400.');
  }

} catch (err) {
  console.error('Error:', err);
}
