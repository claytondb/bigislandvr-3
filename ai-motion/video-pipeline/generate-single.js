#!/usr/bin/env node
/**
 * Generate motion video for a single location
 * 
 * Usage:
 *   node generate-single.js --location keaau
 *   node generate-single.js --location alii-drive --model kling
 *   node generate-single.js --all
 * 
 * Requires: REPLICATE_API_TOKEN environment variable
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const locations = require('./locations.json').locations;
const settings = require('./locations.json').defaultSettings;

// Available models on Replicate
const MODELS = {
    'kling': {
        version: 'kwaivgi/kling-v2.5-turbo-pro',
        name: 'Kling 2.5 Turbo Pro',
        cost: '~$0.28/5sec',
        inputKey: 'image'
    },
    'svd': {
        version: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        name: 'Stable Video Diffusion',
        cost: '~$0.18/run',
        inputKey: 'input_image'
    },
    'wan': {
        version: 'wan-video/wan-2.5-i2v',
        name: 'Wan 2.5 Image-to-Video',
        cost: '~$0.25/5sec',
        inputKey: 'image'
    }
};

const OUTPUT_DIR = path.join(__dirname, 'output');

function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        location: null,
        model: 'kling',
        all: false,
        dryRun: false
    };
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--location' && args[i+1]) {
            config.location = args[++i];
        } else if (args[i] === '--model' && args[i+1]) {
            config.model = args[++i];
        } else if (args[i] === '--all') {
            config.all = true;
        } else if (args[i] === '--dry-run') {
            config.dryRun = true;
        }
    }
    
    return config;
}

async function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        
        const req = https.request(reqOptions, (res) => {
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
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(outputPath); });
                }).on('error', reject);
            } else {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(outputPath); });
            }
        }).on('error', reject);
    });
}

async function generateVideo(location, modelKey, dryRun) {
    const model = MODELS[modelKey];
    if (!model) {
        console.error(`Unknown model: ${modelKey}`);
        return null;
    }
    
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📍 Location: ${location.name}`);
    console.log(`🤖 Model: ${model.name} (${model.cost})`);
    console.log(`${'═'.repeat(50)}`);
    
    // Check for input image
    const inputImagePath = path.join(OUTPUT_DIR, `${location.slug}.png`);
    const altImagePath = path.join(OUTPUT_DIR, `${location.slug}.jpg`);
    
    let imagePath = null;
    if (fs.existsSync(inputImagePath)) {
        imagePath = inputImagePath;
    } else if (fs.existsSync(altImagePath)) {
        imagePath = altImagePath;
    }
    
    if (!imagePath) {
        console.log(`⚠️  No input image found. Please capture first:`);
        console.log(`   Expected: ${inputImagePath}`);
        console.log(`   Run: node capture-and-animate.js`);
        return null;
    }
    
    console.log(`📷 Input: ${imagePath}`);
    console.log(`💬 Prompt: ${location.motionPrompt.substring(0, 60)}...`);
    
    if (dryRun) {
        console.log(`\n🔵 DRY RUN - would generate video here`);
        return null;
    }
    
    if (!REPLICATE_API_TOKEN) {
        console.log(`\n❌ REPLICATE_API_TOKEN not set`);
        console.log(`   Get one at: https://replicate.com/account/api-tokens`);
        console.log(`   Then run: export REPLICATE_API_TOKEN=r8_xxxxx`);
        return null;
    }
    
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/${imagePath.endsWith('.png') ? 'png' : 'jpeg'};base64,${imageBuffer.toString('base64')}`;
    
    console.log(`\n🚀 Creating prediction...`);
    
    // Build input based on model
    const input = {};
    input[model.inputKey] = base64Image;
    
    if (modelKey === 'kling') {
        input.prompt = location.motionPrompt;
        input.duration = settings.videoDuration;
        input.cfg_scale = 0.5;
    } else if (modelKey === 'svd') {
        input.motion_bucket_id = location.motionIntensity === 'gentle' ? 30 : 
                                  location.motionIntensity === 'slow' ? 20 : 50;
        input.fps = settings.videoFps || 8;
        input.num_frames = 25;
    } else if (modelKey === 'wan') {
        input.prompt = location.motionPrompt;
        input.num_frames = settings.videoDuration * settings.videoFps;
    }
    
    // Create prediction
    const prediction = await fetchJson('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: model.version,
            input: input
        })
    });
    
    if (prediction.error) {
        console.log(`❌ Error: ${prediction.error}`);
        return null;
    }
    
    console.log(`   Prediction ID: ${prediction.id}`);
    console.log(`   Status: ${prediction.status}`);
    
    // Poll for completion
    let result = prediction;
    let dots = 0;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 3000));
        result = await fetchJson(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
        });
        dots = (dots + 1) % 4;
        process.stdout.write(`\r   Processing${'.'.repeat(dots)}${' '.repeat(3-dots)}    `);
    }
    console.log();
    
    if (result.status === 'succeeded') {
        const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        console.log(`✅ Video generated!`);
        
        // Download video
        const outputPath = path.join(OUTPUT_DIR, `${location.slug}_motion.mp4`);
        console.log(`📥 Downloading to: ${outputPath}`);
        await downloadFile(videoUrl, outputPath);
        
        console.log(`✅ Saved: ${outputPath}`);
        return outputPath;
    } else {
        console.log(`❌ Failed: ${result.error || 'Unknown error'}`);
        return null;
    }
}

async function main() {
    const config = parseArgs();
    
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  Big Island VR - AI Motion Generator`);
    console.log(`${'═'.repeat(50)}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Determine which locations to process
    let targetLocations = [];
    
    if (config.all) {
        targetLocations = locations;
    } else if (config.location) {
        const loc = locations.find(l => l.slug === config.location || l.id.toString() === config.location);
        if (!loc) {
            console.log(`\n❌ Location not found: ${config.location}`);
            console.log(`\nAvailable locations:`);
            locations.forEach(l => console.log(`  - ${l.slug} (id: ${l.id})`));
            process.exit(1);
        }
        targetLocations = [loc];
    } else {
        console.log(`\nUsage:`);
        console.log(`  node generate-single.js --location <slug>`);
        console.log(`  node generate-single.js --all`);
        console.log(`  node generate-single.js --location keaau --model svd`);
        console.log(`\nAvailable locations:`);
        locations.forEach(l => console.log(`  - ${l.slug} (id: ${l.id}): ${l.name}`));
        console.log(`\nAvailable models: ${Object.keys(MODELS).join(', ')}`);
        process.exit(0);
    }
    
    // Process each location
    const results = [];
    for (const loc of targetLocations) {
        const result = await generateVideo(loc, config.model, config.dryRun);
        results.push({ location: loc.name, slug: loc.slug, video: result });
    }
    
    // Summary
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  Summary`);
    console.log(`${'═'.repeat(50)}`);
    results.forEach(r => {
        const status = r.video ? '✅' : '❌';
        console.log(`  ${status} ${r.location}: ${r.video || 'not generated'}`);
    });
}

main().catch(console.error);
