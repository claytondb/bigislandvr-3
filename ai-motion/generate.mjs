import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || 'YOUR_REPLICATE_TOKEN';

async function generateVideo(imagePath, outputName) {
    console.log(`\n🎬 Processing: ${path.basename(imagePath)}`);
    
    // Read and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    
    console.log(`   Image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
    
    // Submit to Replicate
    console.log('   Submitting to Stable Video Diffusion...');
    
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
                motion_bucket_id: 50,  // Medium-high motion for natural movement
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
    
    console.log(`   Prediction ID: ${prediction.id}`);
    
    // Poll for completion
    let result = prediction;
    let dots = 0;
    while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
        });
        result = await pollRes.json();
        dots++;
        process.stdout.write(`\r   Status: ${result.status} ${'·'.repeat(dots % 10 + 1)}          `);
    }
    console.log();
    
    if (result.status === 'succeeded') {
        console.log(`   ✅ Video generated!`);
        
        // Download video
        const videoUrl = result.output;
        console.log(`   Downloading from: ${videoUrl}`);
        
        const videoRes = await fetch(videoUrl);
        const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
        
        const outputPath = path.join(__dirname, 'output', `${outputName}.mp4`);
        fs.writeFileSync(outputPath, videoBuffer);
        
        console.log(`   📁 Saved: ${outputPath} (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        return outputPath;
    } else {
        console.log(`   ❌ Failed: ${result.error || result.status}`);
        return null;
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('  Big Island VR - AI Scene Motion Generator');
    console.log('═'.repeat(50));
    
    // Ensure output dir exists
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Test with sample image first
    const testImage = path.join(outputDir, 'test-hawaii.jpg');
    
    if (fs.existsSync(testImage)) {
        await generateVideo(testImage, 'test-motion');
    } else {
        console.log('No test image found. Downloading sample...');
        const res = await fetch('https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=1024&h=576&fit=crop');
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(testImage, buffer);
        console.log(`Downloaded sample image: ${testImage}`);
        await generateVideo(testImage, 'test-motion');
    }
    
    console.log('\n✅ Done!');
}

main().catch(console.error);
