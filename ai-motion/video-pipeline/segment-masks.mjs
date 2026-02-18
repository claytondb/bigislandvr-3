/**
 * Generate segmentation masks for water/sky using SAM2 on Replicate
 * Creates masks that can be loaded alongside panoramas for shader effects
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

const PANORAMAS = [
    { file: 'alii-drive.jpg', name: "Ali'i Drive" },
    { file: 'hilo-bayfront.jpg', name: "Hilo Bayfront" },
    { file: 'punaluu-beach.jpg', name: "Punalu'u Beach" },
    { file: 'keaau.jpg', name: "Keaʻau" }
];

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function segmentImage(imagePath, name) {
    console.log(`\n🎯 Segmenting: ${name}`);
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    
    // Use SAM2 to segment - we'll ask for sky and water regions
    // SAM2 can auto-segment or use point prompts
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: 'fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83',
            input: {
                image: dataUri,
                use_m2m: true,
                points_per_side: 32,
                pred_iou_thresh: 0.88,
                stability_score_thresh: 0.95
            }
        })
    });
    
    const prediction = await response.json();
    
    if (prediction.error || prediction.detail) {
        console.log(`   ❌ Error: ${prediction.error || prediction.detail}`);
        return null;
    }
    
    console.log(`   ID: ${prediction.id}`);
    
    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
        await sleep(3000);
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
        });
        result = await pollRes.json();
        process.stdout.write(`\r   Status: ${result.status}...    `);
    }
    console.log();
    
    if (result.status === 'succeeded') {
        console.log(`   ✅ Segmentation complete`);
        console.log(`   Output:`, typeof result.output === 'string' ? result.output.substring(0, 100) : result.output);
        return result.output;
    } else {
        console.log(`   ❌ Failed: ${result.error || result.status}`);
        return null;
    }
}

// Alternative: Use a simpler color-based segmentation for sky/water
// This is faster and doesn't require AI
function createColorBasedMasks(imagePath, outputDir, basename) {
    // This would analyze the image colors to detect:
    // - Blue regions in upper half = sky
    // - Blue/cyan regions in lower half = water
    // - Green regions = vegetation
    
    // For now, we'll use a gradient-based approach that can be refined
    console.log(`   Creating gradient-based masks for ${basename}`);
    
    // These would be replaced with actual color analysis
    return {
        sky: `${basename}-sky-mask.png`,
        water: `${basename}-water-mask.png`,
        vegetation: `${basename}-veg-mask.png`
    };
}

async function main() {
    if (!REPLICATE_API_TOKEN) {
        console.log('❌ Set REPLICATE_API_TOKEN environment variable');
        process.exit(1);
    }
    
    console.log('═'.repeat(50));
    console.log('  Generating Segmentation Masks');
    console.log('═'.repeat(50));
    
    const panoDir = path.join(__dirname, 'panoramas');
    const maskDir = path.join(__dirname, 'masks');
    
    if (!fs.existsSync(maskDir)) {
        fs.mkdirSync(maskDir, { recursive: true });
    }
    
    for (const pano of PANORAMAS) {
        const imagePath = path.join(panoDir, pano.file);
        if (fs.existsSync(imagePath)) {
            const result = await segmentImage(imagePath, pano.name);
            
            if (result) {
                // Download mask images
                const basename = path.basename(pano.file, '.jpg');
                
                if (typeof result === 'string') {
                    // Single mask URL
                    const maskRes = await fetch(result);
                    const maskBuffer = Buffer.from(await maskRes.arrayBuffer());
                    fs.writeFileSync(path.join(maskDir, `${basename}-mask.png`), maskBuffer);
                    console.log(`   Saved: ${basename}-mask.png`);
                } else if (Array.isArray(result)) {
                    // Multiple masks
                    for (let i = 0; i < result.length; i++) {
                        const maskRes = await fetch(result[i]);
                        const maskBuffer = Buffer.from(await maskRes.arrayBuffer());
                        fs.writeFileSync(path.join(maskDir, `${basename}-mask-${i}.png`), maskBuffer);
                        console.log(`   Saved: ${basename}-mask-${i}.png`);
                    }
                }
            }
        }
    }
    
    console.log('\n✅ Done! Masks saved to:', maskDir);
}

main().catch(console.error);
