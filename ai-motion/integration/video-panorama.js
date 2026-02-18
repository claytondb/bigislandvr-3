/**
 * Video Panorama Integration for Big Island VR
 * 
 * Replaces static Street View with AI-animated video backgrounds
 * when available. Falls back to Street View when no video exists.
 */

class VideoPanoramaManager {
    constructor(options = {}) {
        this.videoBasePath = options.basePath || 'ai-motion/output/';
        this.videoCache = new Map();
        this.currentVideo = null;
        this.container = null;
        this.isPlaying = false;
        this.fallbackToStreetView = true;
        
        // Video element (hidden, used as texture source)
        this.videoElement = document.createElement('video');
        this.videoElement.loop = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);
        
        // Overlay container for video display
        this.overlay = document.createElement('div');
        this.overlay.id = 'video-panorama-overlay';
        this.overlay.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 5;
            display: none;
            pointer-events: none;
        `;
        
        // Canvas for video rendering
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        this.overlay.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    
    /**
     * Attach to viewer container
     */
    attachTo(container) {
        this.container = container;
        container.appendChild(this.overlay);
        this.setupResizeHandler();
    }
    
    /**
     * Check if video exists for location
     */
    async checkVideoExists(locationId) {
        const formats = ['webm', 'mp4'];
        for (const fmt of formats) {
            const url = `${this.videoBasePath}${locationId}_motion.${fmt}`;
            try {
                const resp = await fetch(url, { method: 'HEAD' });
                if (resp.ok) return url;
            } catch (e) {
                // Video not found
            }
        }
        return null;
    }
    
    /**
     * Load and play video for location
     */
    async playLocation(locationId) {
        const videoUrl = await this.checkVideoExists(locationId);
        
        if (!videoUrl) {
            console.log(`No video for location ${locationId}, using Street View`);
            this.hide();
            return false;
        }
        
        console.log(`Loading video panorama: ${videoUrl}`);
        
        return new Promise((resolve, reject) => {
            this.videoElement.src = videoUrl;
            
            this.videoElement.onloadeddata = () => {
                this.canvas.width = this.videoElement.videoWidth;
                this.canvas.height = this.videoElement.videoHeight;
                this.show();
                this.videoElement.play();
                this.startRenderLoop();
                resolve(true);
            };
            
            this.videoElement.onerror = () => {
                console.error('Video load error');
                this.hide();
                resolve(false);
            };
        });
    }
    
    /**
     * Start rendering video to canvas
     */
    startRenderLoop() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        const render = () => {
            if (!this.isPlaying) return;
            
            if (!this.videoElement.paused && !this.videoElement.ended) {
                this.ctx.drawImage(
                    this.videoElement, 
                    0, 0, 
                    this.canvas.width, 
                    this.canvas.height
                );
            }
            
            requestAnimationFrame(render);
        };
        
        render();
    }
    
    /**
     * Stop video playback
     */
    stop() {
        this.isPlaying = false;
        this.videoElement.pause();
        this.hide();
    }
    
    /**
     * Show video overlay
     */
    show() {
        this.overlay.style.display = 'block';
    }
    
    /**
     * Hide video overlay
     */
    hide() {
        this.overlay.style.display = 'none';
        this.isPlaying = false;
    }
    
    /**
     * Toggle between video and Street View
     */
    toggle(locationId) {
        if (this.overlay.style.display === 'block') {
            this.stop();
            return false;
        } else {
            return this.playLocation(locationId);
        }
    }
    
    /**
     * Handle window resize
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            if (this.videoElement.videoWidth) {
                this.canvas.width = this.container.offsetWidth;
                this.canvas.height = this.container.offsetHeight;
            }
        });
    }
    
    /**
     * Preload videos for smooth transitions
     */
    preload(locationIds) {
        locationIds.forEach(async (id) => {
            const url = await this.checkVideoExists(id);
            if (url) {
                const vid = document.createElement('video');
                vid.preload = 'metadata';
                vid.src = url;
                this.videoCache.set(id, url);
            }
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined') {
    module.exports = { VideoPanoramaManager };
}

// Add to window for direct script include
if (typeof window !== 'undefined') {
    window.VideoPanoramaManager = VideoPanoramaManager;
}
