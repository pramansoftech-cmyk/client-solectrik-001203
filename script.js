// ==========================================
// 1. SAVINGS CALCULATOR & CHART LOGIC
// ==========================================
let chart;

function calculateSavings() {
  const billInput = document.getElementById("billInput");
  if (!billInput) return; // Exit if not on the page with the calculator

  const bill = parseFloat(billInput.value);

  if (!bill || bill <= 0) {
    alert("Please enter a valid monthly bill");
    return;
  }

  const annualBill = bill * 12;

  // 80% savings efficiency
  const baseSavings = annualBill * 0.8;

  // 5% yearly electricity inflation
  const inflationRate = 1.05;

  let savingsData = [];
  let currentSavings = baseSavings;

  for (let i = 0; i < 5; i++) {
    savingsData.push(Math.round(currentSavings));
    currentSavings *= inflationRate;
  }

  const resultCard = document.getElementById("resultCard");
  if (resultCard) {
    resultCard.style.display = "block";
  }

  const chartCanvas = document.getElementById("savingsChart");
  if (!chartCanvas) return;
  
  const ctx = chartCanvas.getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
      datasets: [{
        label: "Projected Savings (₹)",
        data: savingsData,
        borderColor: "#00e5ff",
        backgroundColor: "rgba(0,229,255,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#00e5ff",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#ffffff" }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return "₹ " + context.raw.toLocaleString();
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#ffffff",
            callback: function(value) {
              return "₹ " + value.toLocaleString();
            }
          },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      }
    }
  });
}


// ==========================================
// 2. DYNAMIC GALLERY LOADER (IMAGES & VIDEOS)
// ==========================================
const track = document.getElementById('galleryTrack');

// THE FIX: Explicit relative path using ./ and all lowercase
const basePath = './project-images/'; 

// Separate image and video extensions to test them properly
const imageExts = ['jpg', 'png', 'jpeg', 'webp', 'avif']; 
const videoExts = ['mp4', 'webm', 'ogg'];
const allExts = [...imageExts, ...videoExts]; 

const itemWidth = 320; 
let autoPlayInterval;

function loadGalleryMedia(index, extIndex = 0) {
  if (!track) return; 

  // Stop if we tested all extensions for this number and found nothing
  if (extIndex >= allExts.length) {
    console.log(`Gallery loaded successfully. Found ${index - 1} media files.`);
    startGalleryAutoPlay(); 
    return;
  }

  const ext = allExts[extIndex];
  const src = `${basePath}${index}.${ext}`;
  const isVideo = videoExts.includes(ext);

  // Console log to help you debug exactly what the browser is looking for
  console.log(`Checking path: ${src}`);

  if (isVideo) {
    // TEST FOR VIDEO
    const vid = document.createElement('video');
    vid.preload = 'metadata'; 
    
    vid.onloadeddata = () => {
      vid.className = 'gallery-img'; 
      vid.autoplay = true;
      vid.muted = true; 
      vid.loop = true;
      vid.playsInline = true;
      vid.onclick = function() { openLightbox(this); };
      
      track.appendChild(vid);
      loadGalleryMedia(index + 1, 0); // Move to next number
    };

    vid.onerror = () => {
      loadGalleryMedia(index, extIndex + 1); // Try next extension
    };
    
    vid.src = src; 

  } else {
    // TEST FOR IMAGE
    const img = new Image();
    
    img.onload = () => {
      img.className = 'gallery-img'; 
      img.alt = `Solar Project ${index}`;
      img.onclick = function() { openLightbox(this); };
      
      track.appendChild(img);
      loadGalleryMedia(index + 1, 0); // Move to next number
    };

    img.onerror = () => {
      loadGalleryMedia(index, extIndex + 1); // Try next extension
    };

    img.src = src; 
  }
}

// THE FIX: Bulletproof Startup Logic
function initGallery() {
  const trackExists = document.getElementById('galleryTrack');
  if (trackExists) {
    console.log("Starting gallery loader...");
    loadGalleryMedia(1, 0);
  }
}

// Run safely regardless of how fast the browser loads
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initGallery);
} else {
  initGallery(); 
}


// ==========================================
// 3. CONTINUOUS SLIDER MOVEMENT
// ==========================================
function moveGalleryNext() {
  if (!track || track.children.length <= 1) return;
  track.style.transition = 'transform 0.5s ease-in-out';
  track.style.transform = `translateX(-${itemWidth}px)`;
  
  setTimeout(() => {
    track.style.transition = 'none';
    track.appendChild(track.firstElementChild); 
    track.style.transform = 'translateX(0)';
  }, 500); 
}

function moveGalleryPrev() {
  if (!track || track.children.length <= 1) return;
  track.style.transition = 'none';
  track.prepend(track.lastElementChild); 
  track.style.transform = `translateX(-${itemWidth}px)`; 
  
  void track.offsetWidth; 
  
  track.style.transition = 'transform 0.5s ease-in-out';
  track.style.transform = 'translateX(0)';
}

function startGalleryAutoPlay() {
  if (track && track.children.length > 2) { 
    autoPlayInterval = setInterval(moveGalleryNext, 3000);
  }
}

function stopGalleryAutoPlay() {
  clearInterval(autoPlayInterval);
}

if (track) {
  track.addEventListener('mouseenter', stopGalleryAutoPlay);
  track.addEventListener('mouseleave', startGalleryAutoPlay);
}

document.querySelector('.next-arrow')?.addEventListener('click', () => {
  stopGalleryAutoPlay();
  moveGalleryNext();
  startGalleryAutoPlay();
});
document.querySelector('.prev-arrow')?.addEventListener('click', () => {
  stopGalleryAutoPlay();
  moveGalleryPrev();
  startGalleryAutoPlay();
});


// ==========================================
// 4. LIGHTBOX (POP-UP) LOGIC
// ==========================================
const lightbox = document.getElementById('projectLightbox');
const mediaContainer = document.getElementById('lightboxMediaContainer');

function openLightbox(element) {
  if (!lightbox || !mediaContainer) return;
  
  mediaContainer.innerHTML = ''; // Clear previous media
  
  let mediaClone;
  
  // Check if clicked element is a video or image
  if (element.tagName === 'VIDEO') {
    mediaClone = document.createElement('video');
    mediaClone.src = element.src;
    mediaClone.autoplay = true;
    mediaClone.controls = true; // Give user play/pause/volume controls in full screen
  } else {
    mediaClone = document.createElement('img');
    mediaClone.src = element.src;
  }
  
  mediaClone.className = 'lightbox-content';
  mediaContainer.appendChild(mediaClone);
  
  lightbox.classList.add('show');
  stopGalleryAutoPlay(); 
}

function closeLightbox(event) {
  if (!lightbox) return;
  
  // Close only if clicking the background wrapper or 'X' button
  if (event.target === lightbox || event.target.id === 'lightboxMediaContainer' || event.target.classList.contains('close-lightbox')) {
    lightbox.classList.remove('show');
    mediaContainer.innerHTML = ''; // Stop video audio from playing in the background
    startGalleryAutoPlay(); 
  }
}

// ==========================================
// 5. MOBILE HAMBURGER MENU LOGIC
// ==========================================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener('click', () => {
    // Toggle the 'active' class to slide the menu in and out
    navLinks.classList.toggle('active');
  });
}