const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Simple CRC32 implementation
function makeCRCTable() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCRCTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

function generatePNG(width, height, renderPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 before each row
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // No filter

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = renderPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(outDir, { recursive: true });

// App Icon (1024x1024) - Dark sleek gradient background with electric blue/purple circle
console.log('Generating icon.png...');
const iconPng = generatePNG(512, 512, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  const maxR = w / 2;

  // Outer dark background
  if (dist > maxR - 10) {
    return [10, 10, 15, 255];
  }

  // Ring/glow effect
  const ringDist = Math.abs(dist - 160);
  if (ringDist < 20) {
    const t = 1 - ringDist / 20;
    return [Math.floor(10 + 200 * t), Math.floor(132 + 100 * t), 255, 255];
  }

  // Inner circle
  if (dist < 140) {
    // Gradient from electric blue to purple
    const t = (x + y) / (w + h);
    const r = Math.floor(10 * (1 - t) + 107 * t);
    const g = Math.floor(132 * (1 - t) + 47 * t);
    const b = Math.floor(255 * (1 - t) + 232 * t);
    return [r, g, b, 255];
  }

  return [15, 15, 25, 255];
});
fs.writeFileSync(path.join(outDir, 'icon.png'), iconPng);

// Adaptive Icon (Foreground)
console.log('Generating adaptive-icon.png...');
const adaptivePng = generatePNG(512, 512, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);

  if (dist < 130) {
    const t = (x + y) / (w + h);
    const r = Math.floor(10 * (1 - t) + 107 * t);
    const g = Math.floor(132 * (1 - t) + 47 * t);
    const b = Math.floor(255 * (1 - t) + 232 * t);
    return [r, g, b, 255];
  }
  return [0, 0, 0, 0]; // transparent
});
fs.writeFileSync(path.join(outDir, 'adaptive-icon.png'), adaptivePng);

// Splash (Dark gradient with center branding)
console.log('Generating splash.png...');
const splashPng = generatePNG(400, 800, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);

  // Soft glowing orb in center
  if (dist < 120) {
    const alpha = (1 - dist / 120) * 0.4;
    return [Math.floor(10 * alpha), Math.floor(132 * alpha), Math.floor(255 * alpha), 255];
  }

  return [0, 0, 0, 255];
});
fs.writeFileSync(path.join(outDir, 'splash.png'), splashPng);

// Favicon (48x48)
console.log('Generating favicon.png...');
const faviconPng = generatePNG(48, 48, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist < 20) {
    return [10, 132, 255, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(outDir, 'favicon.png'), faviconPng);

console.log('All placeholder assets generated successfully.');
