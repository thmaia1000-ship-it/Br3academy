import fs from 'fs';
import { PNG } from 'pngjs';

const originalPath = '/Users/thiagomaia/.gemini/antigravity/brain/90852713-9db0-4b47-a13e-291d302d2abb/.user_uploaded/media_1791948589904.png';
const srcData = fs.readFileSync(originalPath);
const srcPng = PNG.sync.read(srcData);

// Global crop coordinates in media_1791948589904.png
const startX = 399;
const endX = 612;
const startY = 194;
const endY = 356;

const W = endX - startX + 1; // 214
const H = endY - startY + 1; // 163

// Read RGB
const rgb = new Uint8Array(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const sIdx = (srcPng.width * (startY + y) + (startX + x)) << 2;
    const dIdx = (W * y + x) * 3;
    rgb[dIdx] = srcPng.data[sIdx];
    rgb[dIdx+1] = srcPng.data[sIdx+1];
    rgb[dIdx+2] = srcPng.data[sIdx+2];
  }
}

// 1. Identify solid barrier pixels (microscope, bezel, typography)
const isBarrier = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (W * y + x) * 3;
    const r = rgb[idx];
    const g = rgb[idx+1];
    const b = rgb[idx+2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    const isGreen = (g >= 42 && (g - r) >= 9 && (g - b) >= 9) || (g >= 60 && g > r && g > b);
    const isSilver = lum >= 48 && Math.abs(r - g) <= 24 && Math.abs(g - b) <= 24 && Math.max(r, g, b) >= 50;
    const isBright = lum >= 65;

    // Microscope base stage
    const inStage = x >= 56 && x <= 92 && y >= 107 && y <= 147;
    const isStage = inStage && (isGreen || (lum > 32 && g >= r));

    if (isGreen || isSilver || isBright || isStage) {
      isBarrier[y * W + x] = 1;
    }
  }
}

// 2. Flood-fill from borders through non-barrier pixels to find true background
const isBg = new Uint8Array(W * H);
const queue = [];

// Seed borders
for (let x = 0; x < W; x++) {
  if (!isBarrier[0 * W + x]) { isBg[0 * W + x] = 1; queue.push([x, 0]); }
  if (!isBarrier[(H - 1) * W + x]) { isBg[(H - 1) * W + x] = 1; queue.push([x, H - 1]); }
}
for (let y = 0; y < H; y++) {
  if (!isBarrier[y * W + 0]) { isBg[y * W + 0] = 1; queue.push([0, y]); }
  if (!isBarrier[y * W + (W - 1)]) { isBg[y * W + (W - 1)] = 1; queue.push([W - 1, y]); }
}

let head = 0;
while (head < queue.length) {
  const [cx, cy] = queue[head++];
  const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
      const nIdx = ny * W + nx;
      if (!isBg[nIdx] && !isBarrier[nIdx]) {
        isBg[nIdx] = 1;
        queue.push([nx, ny]);
      }
    }
  }
}

// 3. Foreground mask: anything NOT reached by the flood fill is foreground
const mask = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  mask[i] = isBg[i] ? 0.0 : 1.0;
}

// 4. Smooth anti-aliased edge (1.2px box blur)
const smoothMask = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let sum = 0;
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const w = (dx === 0 && dy === 0) ? 4 : (dx === 0 || dy === 0) ? 2 : 1;
          sum += mask[ny * W + nx] * w;
          count += w;
        }
      }
    }
    smoothMask[y * W + x] = sum / count;
  }
}

// 5. Construct final PNG
const outPng = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const sIdx = (W * y + x) * 3;
    const dIdx = (W * y + x) << 2;
    const a = smoothMask[y * W + x];

    if (a < 0.08) {
      outPng.data[dIdx] = 0;
      outPng.data[dIdx+1] = 0;
      outPng.data[dIdx+2] = 0;
      outPng.data[dIdx+3] = 0;
    } else {
      let r = rgb[sIdx];
      let g = rgb[sIdx+1];
      let b = rgb[sIdx+2];

      const inPhoneInner = x >= 5 && x <= 50 && y >= 80 && y <= 144;
      const isCircuitGreen = g >= 48 && (g - r) >= 14;

      if (inPhoneInner) {
        if (isCircuitGreen) {
          // Vibrant cyber neon green circuit
          r = Math.round(r * 0.85);
          g = Math.min(255, Math.round(g * 1.3));
          b = Math.round(b * 0.85);
        } else {
          // Deep clean tech OLED glass
          r = 7;
          g = 16;
          b = 10;
        }
      }

      outPng.data[dIdx] = r;
      outPng.data[dIdx+1] = g;
      outPng.data[dIdx+2] = b;
      outPng.data[dIdx+3] = Math.min(255, Math.round(a * 255));
    }
  }
}

fs.writeFileSync('public/images/logo.png', PNG.sync.write(outPng));
console.log(`Saved flood-filled transparent logo: ${W}x${H}`);
