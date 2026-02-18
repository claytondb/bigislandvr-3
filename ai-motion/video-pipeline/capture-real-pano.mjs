/**
 * Capture actual 360° panoramas from the Big Island VR viewer
 * Waits for Street View tiles to fully load, then captures the canvas
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Target locations (match the IDs in index.html)
const LOCATIONS = [
    { id: 10, name: 'keaau', label: "Keaʻau Town Center" },
    { id: 20, name: 'alii-drive', label: "Aliʻi Drive" },
    { id: 33, name: 'saddle-road', label: "Saddle Road Viewpoint" },
    { id: 1, name: 'hilo-bayfront', label: "Hilo Bayfront" }
];

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function capturePanorama(page, locationId, outputPath) {
    // Jump to location
    await page.evaluate((id) => {
        const idx = LOCATIONS.findIndex(l => l.id === id);
        if (idx >= 0) jumpToLocation(idx);
    }, locationId);
    
    // Wait for Street View tiles to load
    // The embedded Street View iframe needs time to load tiles
    await sleep(5000);
    
    // Additional wait for high-res tiles
    await sleep(3000);
    
    // Hide all UI elements for clean capture
    await page.evaluate(() => {
        const hide = [
            '#controls', '#info', '#mini-map-container', 
            '#effects-panel', '#achievements-panel', '#nav-arrows',
            '#keyboard-help', '#treasure-popup', '#weather-panel',
            '.nav-arrow', '#vignette-layer', '#bloom-layer', '#lens-flare'
        ];
        hide.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = 'none';
        });
    });
    
    // Capture the viewport
    await page.screenshot({ 
        path: outputPath,
        fullPage: false,
        type: 'png'
    });
    
    console.log(`📸 Captured: ${outputPath}`);
    return outputPath;
}

async function main() {
    const outputDir = path.join(__dirname, 'panoramas');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('═'.repeat(50));
    console.log('  Capturing Real Street View Panoramas');
    console.log('═'.repeat(50));
    
    // Launch browser
    console.log('\n🌐 Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',  // Allow cross-origin for Street View
            '--window-size=1920,1080'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to viewer
    console.log('📍 Loading viewer...');
    await page.goto('http://localhost:3456', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
    });
    
    // Wait for initial load
    await sleep(5000);
    
    // Capture each location
    for (const loc of LOCATIONS) {
        console.log(`\n📍 ${loc.label}`);
        const outputPath = path.join(outputDir, `${loc.name}.png`);
        await capturePanorama(page, loc.id, outputPath);
    }
    
    await browser.close();
    
    console.log('\n✅ Done! Panoramas saved to:', outputDir);
    console.log('\nNext steps:');
    console.log('  1. Run segmentation to identify water/clouds/trees');
    console.log('  2. Generate motion videos for masked regions');
    console.log('  3. Composite back into viewer');
}

main().catch(console.error);
