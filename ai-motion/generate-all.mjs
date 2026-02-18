import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || 'YOUR_REPLICATE_TOKEN';

// Our 4 target locations - using placeholder Hawaii images for POC
const LOCATIONS = [
    {
        id: 'keaau',
        name: "Keaʻau Town Center",
        // Using Hawaii town image
        imageUrl: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1024&h=576&fit=crop',
        motionBucket: 45  // Medium motion for town scene
    },
    {
        id: 'alii-drive',
        name: "Aliʻi Drive, Kailua-Kona",
        // Beach/ocean image
        imageUrl: 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=1024&h=576&fit=crop',
        motionBucket: 55  // Higher motion for ocean waves
    },
    {
        id: 'saddle-road',
        name: "Saddle Road Viewpoint",
        // Mountain/volcano landscape
        imageUrl: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=1024&h=576&fit=crop',
        motionBucket: 35  // Lower motion - clouds/grass
    },
    {
        id: 'hilo-bayfront',
        name: "Hilo Bayfront",
        // Bay/water scene
        imageUrl: 'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=1024&h=576&fit=crop',
        motionBucket: 50  // Medium-high for water
    }
];

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function generateVideo(location) {
    console.log(`\n🎬 ${location.name}`);
    console.log(`   Submitting to Stable Video Diffusion...`);
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
            input: {
                input_image: location.imageUrl,
                motion_bucket_id: location.motionBucket,
                fps: 8,
                cond_aug: 0.02,
                decoding_t: 7,
                seed: Math.floor(Math.random() * 1000000)
            }
        })
    });
    
    const prediction = await response.json();
    
    if (prediction.error) {
        console.log(`   ❌ Error: ${prediction.error}`);
        return null;
    }
    
    console.log(`   ID: ${prediction.id}`);
    
    // Poll for completion
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
        
        const outputPath = path.join(__dirname, 'output', `${location.id}-motion.mp4`);
        fs.writeFileSync(outputPath, videoBuffer);
        
        console.log(`   ✅ Saved: ${location.id}-motion.mp4 (${(videoBuffer.length / 1024).toFixed(1)} KB)`);
        return outputPath;
    } else {
        console.log(`   ❌ Failed: ${result.error || result.status}`);
        return null;
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('  Big Island VR - Generating All Location Videos');
    console.log('═'.repeat(50));
    
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const results = [];
    
    for (const loc of LOCATIONS) {
        const videoPath = await generateVideo(loc);
        results.push({ ...loc, videoPath });
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('  Results');
    console.log('═'.repeat(50));
    for (const r of results) {
        console.log(`  ${r.name}: ${r.videoPath ? '✅' : '❌'}`);
    }
    
    console.log('\n✅ Done!');
}

main().catch(console.error);
