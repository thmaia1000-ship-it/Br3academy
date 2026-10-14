import fs from 'fs';
import { PNG } from 'pngjs';

const originalPath = '/Users/thiagomaia/.gemini/antigravity/brain/90852713-9db0-4b47-a13e-291d302d2abb/.user_uploaded/media_1791948589904.png';
const srcData = fs.readFileSync(originalPath);
const srcPng = PNG.sync.read(srcData);

// Global crop coordinates in media_1791948589904.png
const startX = 399; // exactly at the left green border of the phone
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

// Clean alpha mask
const mask = new Float32Array(W * H);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (W * y + x) * 3;
    const r = rgb[idx];
    const g = rgb[idx+1];
    const b = rgb[idx+2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Region definitions
    const inPhone = x >= 0 && x <= 55 && y >= 77 && y <= 150;
    const inMicroscopeTube = x >= 24 && x <= 100 && y >= 0 && y <= 110;
    const inStage = x >= 56 && x <= 92 && y >= 107 && y <= 147;
    const inTextBr3 = x >= 102 && x <= 208 && y >= 46 && y <= 104;
    const inTextTech = x >= 102 && x <= 208 && y >= 104 && y <= 148;

    // Green color detection
    const isGreen = (g >= 44 && (g - r) >= 10 && (g - b) >= 10) || (g >= 65 && g > r && g > b);

    // Silver/White metallic typography
    const isSilver = lum >= 50 && Math.abs(r - g) <= 22 && Math.abs(g - b) <= 22 && Math.max(r, g, b) >= 54;
    const isBright = lum >= 65;

    let isFg = false;

    // Strict exclusion of the area above the phone
    if (x <= 23 && y <= 76) {
      isFg = false;
    } else if (inPhone) {
      isFg = true;
    } else if (inMicroscopeTube && (isGreen || isBright)) {
      isFg = true;
    } else if (inStage && (isGreen || (lum > 30 && g >= r))) {
      // Exclude stray speck at x >= 82, y <= 130
      if (x >= 82 && y <= 130 && lum < 35) {
        isFg = false;
      } else {
        isFg = true;
      }
    } else if ((inTextBr3 || inTextTech) && (isSilver || isBright || isGreen)) {
      isFg = true;
    }

    mask[y * W + x] = isFg ? 1.0 : 0.0;
  }
}

// Anti-aliased smooth edges
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

      const inPhone = x >= 0 && x <= 55 && y >= 77 && y <= 150;
      const inPhoneInner = x >= 6 && x <= 49 && y >= 82 && y <= 143;
      const isCircuitGreen = g >= 50 && (g - r) >= 15;

      if (inPhoneInner) {
        if (isCircuitGreen) {
          // Boost green circuit intensity
          r = Math.round(r * 0.9);
          g = Math.min(255, Math.round(g * 1.25));
          b = Math.round(b * 0.9);
        } else {
          // Elegant dark cybernetic screen glass
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
console.log(`Saved pristine logo.png: ${W}x${H}`);
