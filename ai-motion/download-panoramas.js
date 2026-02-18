/**
 * Download Street View panoramas for AI motion processing
 * Uses Google Street View Static API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Locations for POC
const locations = require('./locations.json').locations;

// Street View Static API config
// Note: For production, use your own API key
const API_KEY = process.env.GOOGLE_STREETVIEW_KEY || '';

// Download a single panorama tile
async function downloadPanorama(location, outputDir) {
    const { id, lat, lng, heading } = location;
    
    // For equirectangular panorama, we need to stitch multiple tiles
    // Or use the embed approach and capture
    
    // Simple approach: download a wide FOV image
    const width = 2048;
    const height = 1024;
    const fov = 120;
    const pitch = 0;
    
    const url = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${API_KEY}`;
    
    const outputPath = path.join(outputDir, `${id}.jpg`);
    
    console.log(`Downloading: ${location.name}`);
    console.log(`  URL: ${url}`);
    console.log(`  Output: ${outputPath}`);
    
    if (!API_KEY) {
        console.log('  ⚠️  No API key - skipping download');
        console.log('  Set GOOGLE_STREETVIEW_KEY environment variable');
        return null;
    }
    
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`  ✅ Downloaded`);
                resolve(outputPath);
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

// Alternative: Use Google's embed and screenshot
// This is more complex but doesn't require API key for testing
function getEmbedUrl(location) {
    const { lat, lng, heading } = location;
    return `https://www.google.com/maps/@${lat},${lng},3a,90y,${heading}h,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i16384!8i8192`;
}

async function main() {
    const outputDir = path.join(__dirname, 'panoramas');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('='.repeat(50));
    console.log('Big Island VR - Panorama Downloader');
    console.log('='.repeat(50));
    console.log();
    
    for (const loc of locations) {
        try {
            await downloadPanorama(loc, outputDir);
        } catch (err) {
            console.error(`  ❌ Error: ${err.message}`);
        }
        console.log();
    }
    
    console.log('Done! Panoramas saved to:', outputDir);
    console.log();
    console.log('Alternative embed URLs (for manual capture):');
    for (const loc of locations) {
        console.log(`  ${loc.name}:`);
        console.log(`    ${getEmbedUrl(loc)}`);
        console.log();
    }
}

main();
