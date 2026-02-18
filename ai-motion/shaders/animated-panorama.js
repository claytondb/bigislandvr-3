/**
 * Animated Panorama Shader System
 * Uses masks from AI segmentation to apply real-time motion effects
 * 
 * Effects:
 * - Water: sine wave displacement, ripple distortion
 * - Sky/Clouds: slow UV offset, subtle morphing  
 * - Vegetation: gentle sway with noise
 */

// Vertex shader - standard panorama sphere
const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader with animated effects
const fragmentShader = `
uniform sampler2D panorama;      // Main panorama texture
uniform sampler2D waterMask;     // Water regions (white = water)
uniform sampler2D skyMask;       // Sky/cloud regions
uniform sampler2D vegMask;       // Vegetation regions (optional)

uniform float time;              // Animation time
uniform float waterIntensity;    // 0.0 - 1.0
uniform float skyIntensity;      // 0.0 - 1.0
uniform float vegIntensity;      // 0.0 - 1.0

varying vec2 vUv;

// Simplex noise for organic movement
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Water ripple effect
vec2 waterDistortion(vec2 uv, float t) {
    float wave1 = sin(uv.x * 20.0 + t * 1.5) * 0.002;
    float wave2 = sin(uv.y * 15.0 + t * 1.2) * 0.0015;
    float ripple = snoise(uv * 10.0 + t * 0.3) * 0.003;
    return vec2(wave1 + ripple, wave2 + ripple);
}

// Cloud drift effect
vec2 cloudDistortion(vec2 uv, float t) {
    // Very slow horizontal drift
    float drift = t * 0.01;
    // Subtle morphing
    float morph = snoise(uv * 3.0 + t * 0.1) * 0.002;
    return vec2(drift + morph, morph * 0.5);
}

// Vegetation sway effect
vec2 vegDistortion(vec2 uv, float t) {
    // Gentle swaying motion
    float sway = sin(t * 0.8 + uv.x * 5.0) * 0.003;
    float rustle = snoise(uv * 8.0 + t * 0.5) * 0.002;
    return vec2(sway + rustle, rustle * 0.3);
}

void main() {
    vec2 uv = vUv;
    
    // Sample masks
    float water = texture2D(waterMask, uv).r;
    float sky = texture2D(skyMask, uv).r;
    float veg = texture2D(vegMask, uv).r;
    
    // Apply distortions based on masks
    vec2 distortion = vec2(0.0);
    
    if (water > 0.5 && waterIntensity > 0.0) {
        distortion += waterDistortion(uv, time) * waterIntensity * water;
    }
    
    if (sky > 0.5 && skyIntensity > 0.0) {
        distortion += cloudDistortion(uv, time) * skyIntensity * sky;
    }
    
    if (veg > 0.5 && vegIntensity > 0.0) {
        distortion += vegDistortion(uv, time) * vegIntensity * veg;
    }
    
    // Sample panorama with distortion
    vec4 color = texture2D(panorama, uv + distortion);
    
    gl_FragColor = color;
}
`;

// Simple masks (can be replaced with AI-generated masks)
const createGradientSkyMask = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Sky is typically in upper portion of equirectangular
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'white');      // Top = sky
    gradient.addColorStop(0.4, 'white');
    gradient.addColorStop(0.5, 'black');    // Horizon
    gradient.addColorStop(1, 'black');      // Bottom = ground
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
};

// Animated Panorama Manager
class AnimatedPanoramaManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.clock = new THREE.Clock();
        
        this.settings = {
            waterIntensity: 0.8,
            skyIntensity: 0.5,
            vegIntensity: 0.3
        };
        
        this.material = null;
        this.mesh = null;
    }
    
    async loadPanorama(panoramaUrl, masks = {}) {
        const loader = new THREE.TextureLoader();
        
        // Load panorama
        const panoramaTexture = await new Promise((resolve) => {
            loader.load(panoramaUrl, resolve);
        });
        
        // Load or generate masks
        const waterMask = masks.water 
            ? await new Promise(r => loader.load(masks.water, r))
            : this.createEmptyMask();
            
        const skyMask = masks.sky
            ? await new Promise(r => loader.load(masks.sky, r))
            : this.createDefaultSkyMask(panoramaTexture.image.width, panoramaTexture.image.height);
            
        const vegMask = masks.vegetation
            ? await new Promise(r => loader.load(masks.vegetation, r))
            : this.createEmptyMask();
        
        // Create shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                panorama: { value: panoramaTexture },
                waterMask: { value: waterMask },
                skyMask: { value: skyMask },
                vegMask: { value: vegMask },
                time: { value: 0 },
                waterIntensity: { value: this.settings.waterIntensity },
                skyIntensity: { value: this.settings.skyIntensity },
                vegIntensity: { value: this.settings.vegIntensity }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });
        
        // Create sphere
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);
        
        return this.mesh;
    }
    
    createEmptyMask() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 64, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createDefaultSkyMask(width, height) {
        const canvas = createGradientSkyMask(width || 1024, height || 512);
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    update() {
        if (this.material) {
            this.material.uniforms.time.value = this.clock.getElapsedTime();
            this.material.uniforms.waterIntensity.value = this.settings.waterIntensity;
            this.material.uniforms.skyIntensity.value = this.settings.skyIntensity;
            this.material.uniforms.vegIntensity.value = this.settings.vegIntensity;
        }
    }
    
    setIntensity(type, value) {
        this.settings[type + 'Intensity'] = Math.max(0, Math.min(1, value));
    }
}

// Export for use
if (typeof module !== 'undefined') {
    module.exports = { AnimatedPanoramaManager, vertexShader, fragmentShader };
}
