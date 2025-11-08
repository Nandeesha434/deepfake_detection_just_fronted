// ============================================
// NEURAL SENTINEL - DEEPFAKE DETECTION SYSTEM
// Interactive JavaScript
// ============================================

// Configuration
const API_URL = 'http://127.0.0.1:8000/detect'; // FastAPI endpoint
let selectedFile = null;

// ============================================
// NEURAL NETWORK BACKGROUND ANIMATION
// ============================================
class NeuralNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Mouse interaction
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    particle.x -= dx / dist * 2;
                    particle.y -= dy / dist * 2;
                }
            }
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = particle.x - this.particles[j].x;
                const dy = particle.y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 242, 255, ${0.2 * (1 - dist / 150)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    uploadContent: document.getElementById('uploadContent'),
    filePreview: document.getElementById('filePreview'),
    previewImage: document.getElementById('previewImage'),
    previewVideo: document.getElementById('previewVideo'),
    fileName: document.getElementById('fileName'),
    removeFile: document.getElementById('removeFile'),
    analyzeButton: document.getElementById('analyzeButton'),
    processingStages: document.getElementById('processingStages'),
    resultsContainer: document.getElementById('resultsContainer'),
    errorContainer: document.getElementById('errorContainer'),
    analyzeAnother: document.getElementById('analyzeAnother'),
    tryAgain: document.getElementById('tryAgain')
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize neural network animation
    new NeuralNetwork('neural-network');
    
    // Animate stats on scroll
    animateStatsOnScroll();
    
    // Setup file upload
    setupFileUpload();
    
    // Smooth scroll for navigation
    setupSmoothScroll();
});

// ============================================
// SMOOTH SCROLL
// ============================================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// ANIMATE STATS ON SCROLL
// ============================================
function animateStatsOnScroll() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.dataset.target);
                animateNumber(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const decimals = end % 1 !== 0 ? 1 : 0;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuad = progress * (2 - progress);
        const current = start + (end - start) * easeOutQuad;
        
        element.textContent = current.toFixed(decimals);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// FILE UPLOAD
// ============================================
function setupFileUpload() {
    // Click to upload
    elements.uploadZone.addEventListener('click', () => {
        if (!selectedFile) {
            elements.fileInput.click();
        }
    });
    
    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.uploadZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        elements.uploadZone.addEventListener(eventName, () => {
            elements.uploadZone.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        elements.uploadZone.addEventListener(eventName, () => {
            elements.uploadZone.classList.remove('dragover');
        });
    });
    
    elements.uploadZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });
    
    // Remove file
    elements.removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });
    
    // Analyze button
    elements.analyzeButton.addEventListener('click', analyzeFile);
    
    // Analyze another / Try again
    elements.analyzeAnother.addEventListener('click', resetUpload);
    elements.tryAgain.addEventListener('click', resetUpload);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleFile(file) {
    if (!file) return;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        showError('Invalid file type. Please upload JPG, PNG, MP4, MOV, or AVI files.');
        return;
    }
    
    selectedFile = file;
    
    // Show preview
    elements.uploadContent.style.display = 'none';
    elements.filePreview.style.display = 'block';
    elements.fileName.textContent = file.name;
    
    // Preview image or video
    const reader = new FileReader();
    reader.onload = (e) => {
        if (validImageTypes.includes(file.type)) {
            elements.previewImage.src = e.target.result;
            elements.previewImage.style.display = 'block';
            elements.previewVideo.style.display = 'none';
        } else {
            elements.previewVideo.src = e.target.result;
            elements.previewVideo.style.display = 'block';
            elements.previewImage.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
    
    // Enable analyze button
    elements.analyzeButton.disabled = false;
}

function resetUpload() {
    selectedFile = null;
    elements.fileInput.value = '';
    elements.uploadContent.style.display = 'block';
    elements.filePreview.style.display = 'none';
    elements.previewImage.src = '';
    elements.previewVideo.src = '';
    elements.analyzeButton.disabled = true;
    elements.processingStages.style.display = 'none';
    elements.resultsContainer.style.display = 'none';
    elements.errorContainer.style.display = 'none';
}

// ============================================
// FILE ANALYSIS
// ============================================
async function analyzeFile() {
    if (!selectedFile) return;
    
    // Show processing UI
    elements.analyzeButton.querySelector('.button-text').style.display = 'none';
    elements.analyzeButton.querySelector('.button-loader').style.display = 'block';
    elements.analyzeButton.disabled = true;
    elements.processingStages.style.display = 'flex';
    elements.resultsContainer.style.display = 'none';
    elements.errorContainer.style.display = 'none';
    
    // Animate stages
    await animateStage('upload', 500);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    await animateStage('detection', 1000);
    
    try {
        // Call API
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        await animateStage('analysis', 1500);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        await animateStage('results', 500);
        
        if (result.success) {
            displayResults(result);
        } else {
            showError(result.error || 'Analysis failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to connect to the server. Please ensure the backend is running.');
    } finally {
        // Reset button
        elements.analyzeButton.querySelector('.button-text').style.display = 'block';
        elements.analyzeButton.querySelector('.button-loader').style.display = 'none';
    }
}

async function animateStage(stageName, duration) {
    const stage = document.querySelector(`[data-stage="${stageName}"]`);
    if (!stage) return;
    
    // Set active
    stage.classList.add('active');
    
    // Activate connector
    const prevStage = stage.previousElementSibling?.previousElementSibling;
    if (prevStage && prevStage.nextElementSibling) {
        prevStage.nextElementSibling.classList.add('active');
    }
    
    // Wait
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Mark completed
    stage.classList.remove('active');
    stage.classList.add('completed');
}

// ============================================
// DISPLAY RESULTS
// ============================================
function displayResults(result) {
    elements.processingStages.style.display = 'none';
    elements.resultsContainer.style.display = 'block';
    
    const { label, confidence, probability_real, probability_fake, num_frames_analyzed } = result;
    
    // Set badge
    const badge = elements.resultsContainer.querySelector('#resultBadge');
    badge.textContent = label;
    badge.className = 'result-badge ' + label.toLowerCase();
    
    // Animate confidence meter
    const confidencePercent = (confidence * 100).toFixed(1);
    const confidenceCircle = document.getElementById('confidenceCircle');
    const confidenceValue = document.getElementById('confidenceValue');
    
    // Calculate stroke-dashoffset (534 is circumference for r=85)
    const circumference = 534;
    const offset = circumference - (confidence * circumference);
    
    // Add SVG gradient
    if (!document.querySelector('#confidenceGradient')) {
        const svg = confidenceCircle.closest('svg');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'confidenceGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', label === 'REAL' ? '#00ff88' : '#ff3366');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', label === 'REAL' ? '#00d4ff' : '#ff006e');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }
    
    setTimeout(() => {
        confidenceCircle.style.strokeDashoffset = offset;
        animateNumber(confidenceValue, 0, confidence * 100, 2000);
    }, 100);
    
    // Set details
    document.getElementById('classification').textContent = label;
    document.getElementById('classification').style.color = label === 'REAL' ? '#00ff88' : '#ff3366';
    document.getElementById('realProb').textContent = (probability_real * 100).toFixed(2) + '%';
    document.getElementById('fakeProb').textContent = (probability_fake * 100).toFixed(2) + '%';
    
    // Show frames if video
    if (num_frames_analyzed) {
        document.getElementById('framesAnalyzed').style.display = 'flex';
        document.getElementById('framesCount').textContent = num_frames_analyzed;
    } else {
        document.getElementById('framesAnalyzed').style.display = 'none';
    }
}

// ============================================
// ERROR HANDLING
// ============================================
function showError(message) {
    elements.processingStages.style.display = 'none';
    elements.resultsContainer.style.display = 'none';
    elements.errorContainer.style.display = 'block';
    
    document.getElementById('errorMessage').textContent = message;
}
