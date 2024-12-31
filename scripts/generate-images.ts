import fs from 'fs';
import sharp from 'sharp';

interface Canvas {
  createCanvas: (width: number, height: number) => any;
  loadImage: (path: string) => Promise<any>;
}

let canvas: Canvas | null = null;
try {
  const { createCanvas, loadImage } = require('canvas');
  canvas = { createCanvas, loadImage };
} catch (e) {
  console.warn('Canvas module not available, some image generation features may be limited');
}

async function generateImages() {
  if (!canvas) {
    console.warn('Skipping image generation - canvas module not available');
    return;
  }
  
  const publicDir = './public';
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Convert SVGs to PNGs
  const images = ['car-icon', 'carpool-illustration', 'benefits-illustration'];
  
  for (const image of images) {
    const svg = fs.readFileSync(`${publicDir}/${image}.svg`);
    await sharp(svg)
      .png()
      .toFile(`${publicDir}/${image}.png`);
  }
}

export default generateImages; 