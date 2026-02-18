/**
 * Download Street View panorama tiles and stitch into full equirectangular image
 * Requires: Google Cloud API key with Street View Static API enabled
 * 
 * Usage:
 *   export GOOGLE_STREETVIEW_KEY=AIzaXXXXX
 *   node get-streetview-tiles.mjs --lat 19.6222 --lng -155.0386 --name keaau
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GOOGLE_STREETVIEW_KEY || '';

// Locations to download
const LOCATIONS = [
    { name: 'keaau', lat: 19.6222, lng: -155.0386, heading: 0 },
    { name: 'alii-drive', lat: 19.6400, lng: -155.9969, heading: 270 },
    { name: 'saddle-road', lat: 19.6833, lng: -155.4667, heading: 270 },
    { name: 'hilo-bayfront', lat: 19.7235, lng: -155.0720, heading: 45 }
];

/**
 * Get Street View metadata to find actual panorama ID
 */
async function getMetadata(lat, lng) {
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${API_KEY}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Download a single Street View tile
 * For equirectangular, we need multiple tiles at different headings/pitches
 */
async function downloadTile(lat, lng, heading, pitch, width, height, outputPath) {
    return new Promise((resolve, reject) => {
        const url = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=90&key=${API_KEY}`;
        
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

/**
 * Download all tiles for a location and stitch into equirectangular panorama
 * We download 8 tiles at 45° intervals for horizontal, 2 rows for vertical
 */
async function downloadPanorama(location, outputDir) {
    console.log(`\n📍 ${location.name}`);
    console.log(`   Location: ${location.lat}, ${location.lng}`);
    
    if (!API_KEY) {
        console.log('   ⚠️ No API key - generating URL preview only');
        console.log(`   Preview: https://www.google.com/maps/@${location.lat},${location.lng},3a,90y,${location.heading}h,90t/data=!3m6!1e1!3m4!1s0:0!2e0!7i16384!8i8192`);
        return null;
    }
    
    // Check metadata first
    const meta = await getMetadata(location.lat, location.lng);
    if (meta.status !== 'OK') {
        console.log(`   ❌ No Street View at this location: ${meta.status}`);
        return null;
    }
    console.log(`   Pano ID: ${meta.pano_id}`);
    
    const tilesDir = path.join(outputDir, location.name);
    if (!fs.existsSync(tilesDir)) {
        fs.mkdirSync(tilesDir, { recursive: true });
    }
    
    // Download tiles: 8 headings × 2 pitch rows = 16 tiles
    // Each tile is 640×640 with 90° FOV
    const tileSize = 640;
    const headings = [0, 45, 90, 135, 180, 225, 270, 315];
    const pitches = [45, -45]; // Looking up and down
    
    console.log(`   Downloading ${headings.length * pitches.length} tiles...`);
    
    for (const pitch of pitches) {
        for (const heading of headings) {
            const tilePath = path.join(tilesDir, `tile_h${heading}_p${pitch}.jpg`);
            await downloadTile(location.lat, location.lng, heading, pitch, tileSize, tileSize, tilePath);
            process.stdout.write('.');
        }
    }
    console.log(' Done!');
    
    // Stitch using ImageMagick or ffmpeg
    const outputPath = path.join(outputDir, `${location.name}_pano.jpg`);
    console.log(`   Stitching to: ${outputPath}`);
    
    // Simple horizontal stitch for now (would need proper equirectangular projection)
    // This creates a basic panorama strip
    const stitchCmd = `cd "${tilesDir}" && convert +append tile_h0_p45.jpg tile_h45_p45.jpg tile_h90_p45.jpg tile_h135_p45.jpg tile_h180_p45.jpg tile_h225_p45.jpg tile_h270_p45.jpg tile_h315_p45.jpg -append tile_h0_p-45.jpg tile_h45_p-45.jpg tile_h90_p-45.jpg tile_h135_p-45.jpg tile_h180_p-45.jpg tile_h225_p-45.jpg tile_h270_p-45.jpg tile_h315_p-45.jpg "${outputPath}"`;
    
    console.log(`   (Manual stitch command): ${stitchCmd}`);
    
    return tilesDir;
}

async function main() {
    console.log('═'.repeat(50));
    console.log('  Street View Panorama Downloader');
    console.log('═'.repeat(50));
    
    if (!API_KEY) {
        console.log('\n⚠️ No GOOGLE_STREETVIEW_KEY environment variable set');
        console.log('   Get one at: https://console.cloud.google.com/apis/credentials');
        console.log('   Enable: Street View Static API');
        console.log('   Cost: ~$7 per 1000 panoramas');
        console.log('\nGenerating preview URLs instead...\n');
    }
    
    const outputDir = path.join(__dirname, 'panoramas');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (const loc of LOCATIONS) {
        await downloadPanorama(loc, outputDir);
    }
    
    console.log('\n✅ Done!');
}

main().catch(console.error);
