import fs from 'fs';
import { PNG } from 'pngjs';

const originalPath = '/Users/thiagomaia/.gemini/antigravity/brain/90852713-9db0-4b47-a13e-291d302d2abb/.user_uploaded/media_1791948589904.png';
const srcData = fs.readFileSync(originalPath);
const srcPng = PNG.sync.read(srcData);

// Bounding box tightly framing the emblem and lettering
const startX = 396; // starts right at phone's left edge
const endX = 612;
const startY = 194;
const endY = 356;

const W = endX - startX + 1; // 217
const H = endY - startY + 1; // 163

// Read cropped sub-image
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

// Alpha mask
const mask = new Float32Array(W * H);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (W * y + x) * 3;
    const r = rgb[idx];
    const g = rgb[idx+1];
    const b = rgb[idx+2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Green elements (microscope, number 3, phone bezel, circuit)
    const isGreen = (g >= 44 && (g - r) >= 12 && (g - b) >= 12) || (g >= 60 && g > r && g > b);

    // 3D Silver/White typography (Br, Tech)
    const isSilver = lum >= 48 && Math.abs(r - g) <= 22 && Math.abs(g - b) <= 22 && Math.max(r, g, b) >= 50;
    const isBright = lum >= 65;

    // Inside the phone boundaries: relative x: 2 to 52, y: 74 to 150
    const inPhone = x >= 2 && x <= 52 && y >= 74 && y <= 150;

    // Microscope base stage: relative x: 55 to 102, y: 110 to 148
    const inStage = x >= 55 && x <= 102 && y >= 110 && y <= 148;

    if (isGreen || isBright || isSilver) {
      mask[y * W + x] = 1.0;
    } else if (inPhone) {
      // Keep phone screen intact without black hole
      mask[y * W + x] = lum > 14 ? 1.0 : 0.85;
    } else if (inStage && lum > 25 && g >= r) {
      mask[y * W + x] = 1.0;
    } else {
      mask[y * W + x] = 0.0;
    }
  }
}

// Filter out isolated stray noise pixels (despeckle)
const cleanMask = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (mask[y * W + x] > 0) {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
            if (mask[ny * W + nx] > 0) neighbors++;
          }
        }
      }
      if (neighbors >= 3) {
        cleanMask[y * W + x] = mask[y * W + x];
      }
    }
  }
}

// Smooth anti-aliased edge (1.2px)
const finalMask = new Float32Array(W * H);
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
          sum += cleanMask[ny * W + nx] * w;
          count += w;
        }
      }
    }
    finalMask[y * W + x] = sum / count;
  }
}

// Build output PNG
const outPng = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const sIdx = (W * y + x) * 3;
    const dIdx = (W * y + x) << 2;
    const a = finalMask[y * W + x];

    if (a < 0.06) {
      outPng.data[dIdx] = 0;
      outPng.data[dIdx+1] = 0;
      outPng.data[dIdx+2] = 0;
      outPng.data[dIdx+3] = 0;
    } else {
      let r = rgb[sIdx];
      let g = rgb[sIdx+1];
      let b = rgb[sIdx+2];

      const inPhone = x >= 2 && x <= 52 && y >= 74 && y <= 150;
      const isGreen = (g >= 44 && (g - r) >= 12);
      if (inPhone && !isGreen && (0.299 * r + 0.587 * g + 0.114 * b) < 30) {
        // High-tech dark emerald OLED glass screen inside the phone
        r = 10;
        g = 22;
        b = 15;
      }

      outPng.data[dIdx] = r;
      outPng.data[dIdx+1] = g;
      outPng.data[dIdx+2] = b;
      outPng.data[dIdx+3] = Math.min(255, Math.round(a * 255));
    }
  }
}

fs.writeFileSync('public/images/logo.png', PNG.sync.write(outPng));
console.log(`Saved pristine transparent logo: ${W}x${H}`);
