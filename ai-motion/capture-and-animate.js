#!/usr/bin/env node
/**
 * Complete pipeline: Capture panoramas → Generate AI motion videos
 * 
 * Setup:
 * 1. Get Replicate API token: https://replicate.com/account/api-tokens
 * 2. Set: export REPLICATE_API_TOKEN=r8_xxxxx
 * 3. Run: node capture-and-animate.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const OUTPUT_DIR = path.join(__dirname, 'output');
const VIEWER_URL = 'http://localhost:3456';

// Locations to capture (matching index.html IDs)
const TARGETS = [
    { id: 10, name: 'keaau', label: "Keaʻau Town Center" },
    { id: 20, name: 'alii-drive', label: "Aliʻi Drive" },
    { id: 33, name: 'saddle-road', label: "Saddle Road Viewpoint" },
    { id: 1, name: 'hilo-bayfront', label: "Hilo Bayfront" }  // Will need to update coords
];

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function captureLocation(browser, locationId, outputPath) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to viewer
    await page.goto(VIEWER_URL, { waitUntil: 'networkidle0' });
    
    // Wait for viewer to load
    await sleep(3000);
    
    // Jump to specific location using console
    await page.evaluate((id) => {
        // Find location by id and jump to it
        const loc = LOCATIONS.find(l => l.id === id);
        if (loc) {
            jumpToLocation(LOCATIONS.indexOf(loc));
        }
    }, locationId);
    
    // Wait for panorama to load
    await sleep(4000);
    
    // Hide UI elements for clean capture
    await page.evaluate(() => {
        document.querySelectorAll('#controls, #info, #mini-map-container, #effects-panel, #achievements-panel, #nav-arrows').forEach(el => {
            el.style.display = 'none';
        });
    });
    
    // Take screenshot
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`📸 Captured: ${outputPath}`);
    
    await page.close();
    return outputPath;
}

async function generateVideo(imagePath, motionHints = []) {
    if (!REPLICATE_API_TOKEN) {
        console.log('⚠️  No REPLICATE_API_TOKEN - skipping video generation');
        return null;
    }
    
    console.log(`🎬 Generating motion video...`);
    
    // Read image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Call Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
            input: {
                input_image: base64Image,
                motion_bucket_id: 50,  // Medium motion
                fps: 8,
                num_frames: 25,  // ~3 sec
                cond_aug: 0.02,
                decoding_t: 7,
                seed: Math.floor(Math.random() * 1000000)
            }
        })
    });
    
    const prediction = await response.json();
    console.log(`   Prediction: ${prediction.id}`);
    
    // Poll for result
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
        await sleep(5000);
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
        });
        result = await pollRes.json();
        console.log(`   Status: ${result.status}`);
    }
    
    if (result.status === 'succeeded') {
        // Download video
        const videoPath = imagePath.replace('.png', '.mp4').replace('.jpg', '.mp4');
        const videoRes = await fetch(result.output);
        const buffer = Buffer.from(await videoRes.arrayBuffer());
        fs.writeFileSync(videoPath, buffer);
        console.log(`   ✅ Saved: ${videoPath}`);
        return videoPath;
    } else {
        console.log(`   ❌ Failed: ${result.error}`);
        return null;
    }
}

async function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    console.log('═'.repeat(50));
    console.log('  Big Island VR - AI Scene Motion Pipeline');
    console.log('═'.repeat(50));
    console.log();
    
    // Check for API token
    if (!REPLICATE_API_TOKEN) {
        console.log('⚠️  REPLICATE_API_TOKEN not set');
        console.log('   Get one at: https://replicate.com/account/api-tokens');
        console.log('   Then run: export REPLICATE_API_TOKEN=r8_xxxxx');
        console.log();
        console.log('Continuing with capture only...');
    }
    
    // Launch browser
    console.log('\n🌐 Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = [];
    
    for (const target of TARGETS) {
        console.log(`\n📍 Processing: ${target.label}`);
        
        const imagePath = path.join(OUTPUT_DIR, `${target.name}.png`);
        
        try {
            // Capture panorama
            await captureLocation(browser, target.id, imagePath);
            
            // Generate video
            if (REPLICATE_API_TOKEN) {
                const videoPath = await generateVideo(imagePath);
                results.push({ ...target, imagePath, videoPath });
            } else {
                results.push({ ...target, imagePath, videoPath: null });
            }
        } catch (err) {
            console.error(`   ❌ Error: ${err.message}`);
            results.push({ ...target, error: err.message });
        }
    }
    
    await browser.close();
    
    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('  Summary');
    console.log('═'.repeat(50));
    for (const r of results) {
        console.log(`  ${r.label}:`);
        console.log(`    Image: ${r.imagePath || '❌'}`);
        console.log(`    Video: ${r.videoPath || '(not generated)'}`);
    }
    
    // Write manifest
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        JSON.stringify(results, null, 2)
    );
    
    console.log('\n✅ Done! Check output directory:', OUTPUT_DIR);
}

main().catch(console.error);
