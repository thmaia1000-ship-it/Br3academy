import fs from 'fs';
import { PNG } from 'pngjs';

const originalPath = '/Users/thiagomaia/.gemini/antigravity/brain/90852713-9db0-4b47-a13e-291d302d2abb/.user_uploaded/media_1791948589904.png';
const srcData = fs.readFileSync(originalPath);
const srcPng = PNG.sync.read(srcData);

// Bounding box with generous breathing room
const startX = 382;
const endX = 628;
const startY = 186;
const endY = 360;

const outW = endX - startX + 1; // 247
const outH = endY - startY + 1; // 175

const outPng = new PNG({ width: outW, height: outH });

const marginFade = 14;

for (let y = 0; y < outH; y++) {
  for (let x = 0; x < outW; x++) {
    const srcX = startX + x;
    const srcY = startY + y;
    const srcIdx = (srcPng.width * srcY + srcX) << 2;
    const outIdx = (outW * y + x) << 2;

    const r = srcPng.data[srcIdx];
    const g = srcPng.data[srcIdx + 1];
    const b = srcPng.data[srcIdx + 2];

    // Background estimate at this position:
    // In media_1791948589904.png, dark background is around RGB(12, 15, 13)
    const bgR = 12;
    const bgG = 15;
    const bgB = 12;

    const rDiff = Math.max(0, r - bgR);
    const gDiff = Math.max(0, g - bgG);
    const bDiff = Math.max(0, b - bgB);

    const maxVal = Math.max(rDiff, gDiff, bDiff);
    const lum = 0.299 * rDiff + 0.587 * gDiff + 0.114 * bDiff;
    const greenGlow = Math.max(0, gDiff - (rDiff + bDiff) / 2);

    // Foreground prominence
    const power = Math.max(maxVal, lum, greenGlow * 1.6);

    let alpha = 0;
    const minThresh = 8;
    const maxThresh = 48;

    if (power <= minThresh) {
      alpha = 0;
    } else if (power >= maxThresh) {
      alpha = 255;
    } else {
      const t = (power - minThresh) / (maxThresh - minThresh);
      const smooth = t * t * (3 - 2 * t);
      alpha = Math.round(smooth * 255);
    }

    // Outer edge feathering so it blends seamlessly into any page background
    const distLeft = x;
    const distRight = outW - 1 - x;
    const distTop = y;
    const distBottom = outH - 1 - y;
    const edgeDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (edgeDist < marginFade) {
      const edgeFactor = edgeDist / marginFade;
      const smoothEdge = edgeFactor * edgeFactor * (3 - 2 * edgeFactor);
      alpha = Math.round(alpha * smoothEdge);
    }

    if (alpha === 0) {
      outPng.data[outIdx] = 0;
      outPng.data[outIdx + 1] = 0;
      outPng.data[outIdx + 2] = 0;
      outPng.data[outIdx + 3] = 0;
    } else {
      // Un-premultiply to avoid dark fringe/halo
      const factor = 255 / Math.max(alpha, 60);
      let outR = Math.min(255, Math.round(rDiff * factor));
      let outG = Math.min(255, Math.round(gDiff * factor));
      let outB = Math.min(255, Math.round(bDiff * factor));

      // For solid elements (bright letters & microscope body), retain original crispness
      if (alpha >= 220) {
        outR = r;
        outG = g;
        outB = b;
      }

      // Slightly enhance neon green vibrancy on glowing areas
      if (gDiff > rDiff && gDiff > bDiff && alpha < 220) {
        outG = Math.min(255, Math.round(outG * 1.15));
      }

      outPng.data[outIdx] = outR;
      outPng.data[outIdx + 1] = outG;
      outPng.data[outIdx + 2] = outB;
      outPng.data[outIdx + 3] = alpha;
    }
  }
}

const buffer = PNG.sync.write(outPng);
fs.writeFileSync('public/images/logo.png', buffer);
console.log(`Saved transparent logo.png: ${outW}x${outH}`);
