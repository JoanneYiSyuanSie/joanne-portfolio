// Pre-build script: generates public/og-image.png (1200x630) with zero
// dependencies (Node built-ins only: zlib + a table CRC32). The design
// mirrors joanne-logo.svg: paper background, ink frames, a geometric J
// mark and one accent square. No text is drawn, so no font rasterizer
// is needed. Runs before `astro build` so the file lands in dist/.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const W = 1200;
const H = 630;

const PAPER = [0xff, 0xfd, 0xf9];
const INK = [0x0a, 0x0a, 0x0a];
const ACCENT = [0xa0, 0x65, 0x40];

// RGB pixel buffer, row-major.
const px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = PAPER[0];
  px[i * 3 + 1] = PAPER[1];
  px[i * 3 + 2] = PAPER[2];
}

function rect(x0, y0, x1, y1, color) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 3;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
    }
  }
}

function frame(x0, y0, x1, y1, t, color) {
  rect(x0, y0, x1, y0 + t, color);
  rect(x0, y1 - t, x1, y1, color);
  rect(x0, y0, x0 + t, y1, color);
  rect(x1 - t, y0, x1, y1, color);
}

function dashedFrame(x0, y0, x1, y1, t, dash, gap, color) {
  // Top and bottom edges.
  for (let x = x0; x < x1; x += dash + gap) {
    const xe = Math.min(x + dash, x1);
    rect(x, y0, xe, y0 + t, color);
    rect(x, y1 - t, xe, y1, color);
  }
  // Left and right edges.
  for (let y = y0; y < y1; y += dash + gap) {
    const ye = Math.min(y + dash, y1);
    rect(x0, y, x0 + t, ye, color);
    rect(x1 - t, y, x1, ye, color);
  }
}

// Outer ink frame.
frame(0, 0, W, H, 14, INK);
// Inner dashed frame.
dashedFrame(56, 56, W - 56, H - 56, 6, 28, 20, INK);

// Geometric J mark (blocky, brutalist): stem + bottom bar + left tick.
rect(566, 148, 634, 428, INK); // stem
rect(478, 428, 634, 496, INK); // bottom bar
rect(478, 360, 546, 428, INK); // left tick

// Accent square with ink border, upper right of the J.
frame(678, 148, 730, 200, 6, INK);
rect(684, 154, 724, 194, ACCENT);

// ---- Minimal PNG encoder (truecolor, filter 0 per row) ----

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter: none
  px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor RGB

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const outDir = path.resolve('public');
const outFile = path.join(outDir, 'og-image.png');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, png);
console.log(`[make-og] Wrote ${outFile} (${png.length} bytes, ${W}x${H})`);
