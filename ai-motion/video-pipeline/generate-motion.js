/**
 * Generate animated panorama videos using AI
 * Uses Replicate API with Stable Video Diffusion
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Replicate API
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

const locations = require('./locations.json').locations;

// Models on Replicate
const MODELS = {
    // Stable Video Diffusion - image to video
    svd: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    
    // Alternative: AnimateDiff for more control
    animateDiff: 'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f'
};

async function replicateRequest(endpoint, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.replicate.com',
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });
        
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function generateMotionVideo(imagePath, location) {
    console.log(`\n🎬 Generating motion for: ${location.name}`);
    
    if (!REPLICATE_API_TOKEN) {
        console.log('⚠️  No REPLICATE_API_TOKEN - skipping');
        console.log('   Set environment variable and retry');
        return null;
    }
    
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Create prediction with Stable Video Diffusion
    const prediction = await replicateRequest('/v1/predictions', 'POST', {
        version: MODELS.svd,
        input: {
            input_image: base64Image,
            // Motion parameters
            motion_bucket_id: 40,  // Lower = less motion, higher = more motion (1-255)
            fps: 8,                // Frames per second
            num_frames: 25,        // ~3 seconds at 8fps
            cond_aug: 0.02,        // Conditioning augmentation
            decoding_t: 7,         // Temporal decoding steps
            seed: 42               // For reproducibility
        }
    });
    
    console.log(`   Prediction ID: ${prediction.id}`);
    console.log(`   Status: ${prediction.status}`);
    
    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 5000));
        result = await replicateRequest(`/v1/predictions/${prediction.id}`, 'GET');
        console.log(`   Status: ${result.status}...`);
    }
    
    if (result.status === 'succeeded') {
        console.log(`   ✅ Video generated!`);
        console.log(`   Output: ${result.output}`);
        
        // Download the video
        const videoUrl = result.output;
        const videoPath = imagePath.replace('.jpg', '_motion.mp4');
        
        // Download video file
        await downloadFile(videoUrl, videoPath);
        console.log(`   Saved to: ${videoPath}`);
        
        return videoPath;
    } else {
        console.log(`   ❌ Failed: ${result.error}`);
        return null;
    }
}

function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(outputPath);
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

async function main() {
    const panoramasDir = path.join(__dirname, 'panoramas');
    
    console.log('='.repeat(50));
    console.log('Big Island VR - AI Motion Generator');
    console.log('='.repeat(50));
    
    if (!fs.existsSync(panoramasDir)) {
        console.log('\n❌ No panoramas found. Run download-panoramas.js first.');
        return;
    }
    
    for (const loc of locations) {
        const imagePath = path.join(panoramasDir, `${loc.id}.jpg`);
        
        if (!fs.existsSync(imagePath)) {
            console.log(`\n⚠️  Skipping ${loc.name} - no image found`);
            continue;
        }
        
        await generateMotionVideo(imagePath, loc);
    }
    
    console.log('\n✅ Done!');
}

// Also export for use as module
module.exports = { generateMotionVideo };

if (require.main === module) {
    main();
}
