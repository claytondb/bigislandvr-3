/**
 * Create segmentation masks locally using color analysis
 * No API calls needed - runs instantly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PANORAMAS = [
    { file: 'alii-drive.jpg', name: "Ali'i Drive" },
    { file: 'hilo-bayfront.jpg', name: "Hilo Bayfront" },
    { file: 'punaluu-beach.jpg', name: "Punalu'u Beach" },
    { file: 'keaau.jpg', name: "Keaʻau" }
];

// Color detection functions
function isSkyColor(r, g, b, y, height) {
    // Sky: blue-ish colors in upper portion
    const isBlue = b > r && b > g * 0.8;
    const isLight = (r + g + b) > 300;
    const isUpperHalf = y < height * 0.55;
    const isBlueSky = b > 120 && b > r * 1.1;
    
    return (isBlue || isLight || isBlueSky) && isUpperHalf;
}

function isWaterColor(r, g, b, y, height) {
    // Water: blue-green colors, often in lower portion for beach scenes
    const isBlueGreen = (b > 80 && g > 80) && (b + g > r * 1.5);
    const isCyan = b > 100 && g > 100 && r < 150;
    const isDeepBlue = b > 120 && b > r * 1.3 && b > g * 0.9;
    const notSky = y > height * 0.35; // Water usually below horizon
    
    return (isBlueGreen || isCyan || isDeepBlue) && notSky;
}

function isVegetationColor(r, g, b) {
    // Vegetation: green dominant
    const isGreen = g > r * 1.1 && g > b * 0.9;
    const isDarkGreen = g > 50 && g > r && g > b && (r + g + b) < 400;
    const isTropicalGreen = g > 80 && g > r * 1.05;
    
    return isGreen || isDarkGreen || isTropicalGreen;
}

async function createMasks(imagePath, outputDir, basename) {
    console.log(`\n🎨 Processing: ${basename}`);
    
    const img = await loadImage(imagePath);
    const width = img.width;
    const height = img.height;
    
    console.log(`   Size: ${width}x${height}`);
    
    // Create canvases for masks
    const skyCanvas = createCanvas(width, height);
    const waterCanvas = createCanvas(width, height);
    const vegCanvas = createCanvas(width, height);
    
    const skyCtx = skyCanvas.getContext('2d');
    const waterCtx = waterCanvas.getContext('2d');
    const vegCtx = vegCanvas.getContext('2d');
    
    // Fill with black (no effect)
    skyCtx.fillStyle = 'black';
    skyCtx.fillRect(0, 0, width, height);
    waterCtx.fillStyle = 'black';
    waterCtx.fillRect(0, 0, width, height);
    vegCtx.fillStyle = 'black';
    vegCtx.fillRect(0, 0, width, height);
    
    // Read source image pixels
    const srcCanvas = createCanvas(width, height);
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx.drawImage(img, 0, 0);
    const imageData = srcCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    // Analyze each pixel
    let skyCount = 0, waterCount = 0, vegCount = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            if (isSkyColor(r, g, b, y, height)) {
                skyCtx.fillStyle = 'white';
                skyCtx.fillRect(x, y, 1, 1);
                skyCount++;
            }
            
            if (isWaterColor(r, g, b, y, height)) {
                waterCtx.fillStyle = 'white';
                waterCtx.fillRect(x, y, 1, 1);
                waterCount++;
            }
            
            if (isVegetationColor(r, g, b)) {
                vegCtx.fillStyle = 'white';
                vegCtx.fillRect(x, y, 1, 1);
                vegCount++;
            }
        }
    }
    
    const total = width * height;
    console.log(`   Sky: ${(skyCount/total*100).toFixed(1)}%`);
    console.log(`   Water: ${(waterCount/total*100).toFixed(1)}%`);
    console.log(`   Vegetation: ${(vegCount/total*100).toFixed(1)}%`);
    
    // Save masks
    const skyPath = path.join(outputDir, `${basename}-sky.png`);
    const waterPath = path.join(outputDir, `${basename}-water.png`);
    const vegPath = path.join(outputDir, `${basename}-veg.png`);
    
    fs.writeFileSync(skyPath, skyCanvas.toBuffer('image/png'));
    fs.writeFileSync(waterPath, waterCanvas.toBuffer('image/png'));
    fs.writeFileSync(vegPath, vegCanvas.toBuffer('image/png'));
    
    console.log(`   ✅ Saved masks`);
    
    return { sky: skyPath, water: waterPath, vegetation: vegPath };
}

async function main() {
    console.log('═'.repeat(50));
    console.log('  Creating Color-Based Segmentation Masks');
    console.log('═'.repeat(50));
    
    const panoDir = path.join(__dirname, 'panoramas');
    const maskDir = path.join(__dirname, 'masks');
    
    if (!fs.existsSync(maskDir)) {
        fs.mkdirSync(maskDir, { recursive: true });
    }
    
    for (const pano of PANORAMAS) {
        const imagePath = path.join(panoDir, pano.file);
        const basename = path.basename(pano.file, '.jpg');
        
        if (fs.existsSync(imagePath)) {
            await createMasks(imagePath, maskDir, basename);
        } else {
            console.log(`\n⚠️ Missing: ${pano.file}`);
        }
    }
    
    console.log('\n✅ Done! Masks saved to:', maskDir);
}

main().catch(console.error);
