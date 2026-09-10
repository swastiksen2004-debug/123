const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG encoder in pure Node.js
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makePng(width, height, drawPixel) {
  // raw scanlines: 1 byte filter (0) + width * 4 bytes (RGBA)
  const lineBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * lineBytes);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineBytes;
    rawData[lineOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pixelOffset = lineOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw StudyHub themed icon: Blue rounded card with open book geometry & gold ribbon
function drawStudyHubIcon(isMaskable) {
  return function(x, y, w, h) {
    const nx = x / w;
    const ny = y / h;

    // Corner radius for non-maskable
    if (!isMaskable) {
      const radius = 0.2;
      const dx = Math.max(0, Math.max(radius - nx, nx - (1 - radius)));
      const dy = Math.max(0, Math.max(radius - ny, ny - (1 - radius)));
      if (dx > 0 && dy > 0 && Math.sqrt(dx*dx + dy*dy) > radius) {
        return [0, 0, 0, 0]; // transparent outside rounded corner
      }
    }

    // Gradient background: Royal blue to deep indigo
    const grad = ny * 0.7 + nx * 0.3;
    const bgR = Math.round(37 + (29 - 37) * grad);
    const bgG = Math.round(99 + (78 - 99) * grad);
    const bgB = Math.round(235 + (216 - 235) * grad);

    // Book bounds in normalized coords [0..1]
    const scale = isMaskable ? 0.6 : 0.7;
    const bx = (nx - 0.5) / scale + 0.5;
    const by = (ny - 0.5) / scale + 0.5;

    // Inside book bounds
    if (bx >= 0.2 && bx <= 0.8 && by >= 0.25 && by <= 0.75) {
      // Golden bookmark ribbon in middle
      if (bx >= 0.47 && bx <= 0.53 && by <= 0.6) {
        return [245, 158, 11, 255]; // Amber gold ribbon
      }

      // Left page
      if (bx < 0.49) {
        // Page margin & text lines
        const lineY = by;
        if (by > 0.35 && by < 0.68 && ((lineY * 100) % 7 < 2) && bx > 0.26 && bx < 0.45) {
          return [148, 163, 184, 255]; // Slate text line
        }
        return [255, 255, 255, 255]; // White page
      }

      // Right page
      if (bx > 0.51) {
        const lineY = by;
        if (by > 0.35 && by < 0.68 && ((lineY * 100) % 7 < 2) && bx > 0.55 && bx < 0.74) {
          return [148, 163, 184, 255]; // Slate text line
        }
        return [241, 245, 249, 255]; // Off-white page
      }

      // Spine crease
      return [203, 213, 225, 255];
    }

    // Default background
    return [bgR, bgG, bgB, 255];
  };
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), makePng(192, 192, drawStudyHubIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), makePng(512, 512, drawStudyHubIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), makePng(512, 512, drawStudyHubIcon(true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), makePng(180, 180, drawStudyHubIcon(false)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), makePng(64, 64, drawStudyHubIcon(false)));

console.log('Successfully generated all PWA PNG icons!');
