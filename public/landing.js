const FRAME_START = 1000;
const FRAME_END = 1239;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;
const INITIAL_READY_FRAMES = 12;

const header = document.querySelector(".site-header");
const sequenceSection = document.querySelector("[data-sequence-section]");
const canvas = document.getElementById("sequence-canvas");
const loaderValue = document.getElementById("sequence-loader-value");
const frameCount = document.getElementById("frame-count");
const progressFill = document.getElementById("progress-fill");
const heroSteps = [...document.querySelectorAll(".hero-step")];
const sceneDots = [...document.querySelectorAll(".scene-dot")];
const revealBlocks = [...document.querySelectorAll(".reveal")];

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const context = canvas.getContext("2d");
const frames = new Array(TOTAL_FRAMES);

let loadedFrames = 0;
let currentScene = 0;
let rafId = 0;
let latestProgress = 0;
let viewportWidth = 0;
let viewportHeight = 0;
let dpr = 1;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function frameSrc(index) {
  return `sequence-1/sequence-${FRAME_START + index}.jpg`;
}

function updateScene(progress) {
  let sceneIndex = 0;

  if (progress >= 0.34 && progress < 0.68) {
    sceneIndex = 1;
  } else if (progress >= 0.68) {
    sceneIndex = 2;
  }

  if (sceneIndex === currentScene) {
    return;
  }

  currentScene = sceneIndex;

  heroSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === sceneIndex);
  });

  sceneDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === sceneIndex);
  });
}

function getLoadedFrame(index) {
  if (frames[index]?.complete) {
    return frames[index];
  }

  for (let offset = 1; offset < TOTAL_FRAMES; offset += 1) {
    const prev = frames[index - offset];
    if (prev?.complete) {
      return prev;
    }

    const next = frames[index + offset];
    if (next?.complete) {
      return next;
    }
  }

  return null;
}

function resizeCanvas() {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(viewportWidth * dpr);
  canvas.height = Math.round(viewportHeight * dpr);
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;

  queueRender();
}

function drawFrame(progress) {
  // Scroll infinito: la secuencia de fotos se repite
  let infiniteProgress = progress % 1;
  const frameIndex = reduceMotionQuery.matches
    ? 0
    : Math.round(infiniteProgress * (TOTAL_FRAMES - 1));
  const image = getLoadedFrame(frameIndex);

  if (!image || !image.naturalWidth || !image.naturalHeight) {
    return;
  }

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = "brightness(0.9) contrast(1.03) saturate(0.96)";

  const coverScale = Math.max(viewportWidth / image.naturalWidth, viewportHeight / image.naturalHeight) * 1.4;
  const drawWidth = image.naturalWidth * coverScale;
  const drawHeight = image.naturalHeight * coverScale;
  const driftY = reduceMotionQuery.matches ? 0 : viewportHeight * 0.15 * infiniteProgress;
  const offsetX = (viewportWidth - drawWidth) / 2;
  const offsetY = (viewportHeight - drawHeight) / 2 + driftY;

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  context.filter = "none";

  progressFill.style.transform = `scaleX(${infiniteProgress.toFixed(4)})`;
}

function queueRender() {
  if (rafId) {
    return;
  }

  rafId = window.requestAnimationFrame(() => {
    rafId = 0;
    drawFrame(latestProgress);
  });
}

function updateScrollState() {
  header.classList.toggle("is-compact", window.scrollY > 18);

  // Progreso respecto al scroll total de la página
  const totalScrollable = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const scrollY = window.scrollY;
  latestProgress = reduceMotionQuery.matches
    ? 0
    : clamp(scrollY / totalScrollable, 0, 1);

  updateScene(latestProgress);
  queueRender();
}

function preloadFrames() {
  for (let index = 0; index < TOTAL_FRAMES; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = frameSrc(index);
    image.onload = () => {
      loadedFrames += 1;

      if (loaderValue) {
        loaderValue.textContent = `${Math.round((loadedFrames / TOTAL_FRAMES) * 100)}%`;
      }

      if (loadedFrames >= INITIAL_READY_FRAMES) {
        document.body.classList.add("frames-ready");
      }

      if (index === 0 || index === Math.round(latestProgress * (TOTAL_FRAMES - 1))) {
        queueRender();
      }
    };

    frames[index] = image;
  }
}

function setupRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    revealBlocks.forEach((block) => block.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealBlocks.forEach((block) => observer.observe(block));
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateScrollState, { passive: true });
reduceMotionQuery.addEventListener("change", () => {
  updateScrollState();
  queueRender();
});

resizeCanvas();
preloadFrames();
setupRevealObserver();
updateScene(0);
updateScrollState();
