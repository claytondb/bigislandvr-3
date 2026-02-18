import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Real Street View panoramas - VERY LOW motion for subtle effect, NO camera movement
const LOCATIONS = [
    { file: 'keaau.jpg', name: "Keaʻau Town Center", motion: 15 },      // Was 45, now 15
    { file: 'alii-drive.jpg', name: "Aliʻi Drive", motion: 20 },        // Was 55, now 20
    { file: 'hilo-bayfront.jpg', name: "Hilo Bayfront", motion: 18 },   // Was 50, now 18
    { file: 'punaluu-beach.jpg', name: "Punalu'u Beach", motion: 25 }   // Was 60, now 25
];

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function generateVideo(imagePath, name, motionBucket) {
    console.log(`\n🎬 ${name} (motion: ${motionBucket})`);
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    
    console.log(`   Submitting with LOW motion (${motionBucket}) for subtle effect...`);
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
            input: {
                input_image: dataUri,
                motion_bucket_id: motionBucket,  // Lower = less motion
                fps: 8,
                cond_aug: 0.01,   // Lower conditioning augmentation for stability
                decoding_t: 10,   // Higher decoding steps for quality
                seed: 42         // Fixed seed for consistency
            }
        })
    });
    
    const prediction = await response.json();
    
    if (prediction.error || prediction.detail) {
        console.log(`   ❌ Error: ${prediction.error || prediction.detail}`);
        return null;
    }
    
    console.log(`   ID: ${prediction.id}`);
    
    let result = prediction;
    let dots = 0;
    while (result.status === 'starting' || result.status === 'processing') {
        await sleep(5000);
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
        });
        result = await pollRes.json();
        dots++;
        process.stdout.write(`\r   Status: ${result.status} ${'·'.repeat(dots % 10 + 1)}          `);
    }
    console.log();
    
    if (result.status === 'succeeded') {
        const videoUrl = result.output;
        const videoRes = await fetch(videoUrl);
        const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
        
        const outputName = path.basename(imagePath, '.jpg') + '-subtle.mp4';
        const outputPath = path.join(__dirname, 'output', outputName);
        fs.writeFileSync(outputPath, videoBuffer);
        
        console.log(`   ✅ Saved: ${outputName} (${(videoBuffer.length / 1024).toFixed(1)} KB)`);
        return outputPath;
    } else {
        console.log(`   ❌ Failed: ${result.error || result.status}`);
        return null;
    }
}

async function main() {
    if (!REPLICATE_API_TOKEN) {
        console.log('❌ Set REPLICATE_API_TOKEN environment variable');
        process.exit(1);
    }
    
    console.log('═'.repeat(50));
    console.log('  Generating SUBTLE Motion (no camera movement)');
    console.log('═'.repeat(50));
    console.log('  Using very low motion values for gentle effect');
    
    const panoDir = path.join(__dirname, 'panoramas');
    const outputDir = path.join(__dirname, 'output');
    
    for (const loc of LOCATIONS) {
        const imagePath = path.join(panoDir, loc.file);
        if (fs.existsSync(imagePath)) {
            await generateVideo(imagePath, loc.name, loc.motion);
        }
    }
    
    console.log('\n✅ Done!');
}

main().catch(console.error);
