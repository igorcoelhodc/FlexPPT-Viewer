let renderer = null;
let currentSlide = 0;
let totalSlides = 0;

const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('slide-canvas');
const slideInfo = document.getElementById('slide-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const fsBtn = document.getElementById('fullscreen-btn');

// Initialize the renderer
if (typeof PptxRenderer !== 'undefined') {
  renderer = new PptxRenderer();
} else {
  console.error("Renderer library failed to load.");
}

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file || !renderer) return;

  try {
    slideInfo.textContent = "Loading file...";
    // Clean old buffers before parsing a new one to prevent memory leaks
    renderer.destroy(); 
    renderer = new PptxRenderer();

    await renderer.load(file);
    totalSlides = renderer.slideCount;
    currentSlide = 0;
    
    renderCurrentSlide();
  } catch (err) {
    console.error(err);
    slideInfo.textContent = "Error loading PPTX.";
  }
});

async function renderCurrentSlide() {
  if (!renderer || totalSlides === 0) return;
  
  slideInfo.textContent = `Slide ${currentSlide + 1} / ${totalSlides}`;
  
  // 1280px width balance rendering fidelity and old hardware capability perfectly
  await renderer.renderSlide(currentSlide, canvas, 1280); 
}

// Navigation Logic
const nextSlide = () => {
  if (currentSlide < totalSlides - 1) { currentSlide++; renderCurrentSlide(); }
};
const prevSlide = () => {
  if (currentSlide > 0) { currentSlide--; renderCurrentSlide(); }
};

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Key-bindings optimized for clickers and keyboard presentations
window.addEventListener('keydown', (e) => {
  if (totalSlides === 0) return;
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') nextSlide();
  if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') prevSlide();
});

// Fullscreen Optimization
fsBtn.addEventListener('click', () => {
  const body = document.body;
  if (!document.fullscreenElement) {
    body.classList.add('fullscreen');
    body.requestFullscreen().catch(err => console.error(err));
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    document.body.classList.remove('fullscreen');
  }
});