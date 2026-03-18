// ==========================================
// 1. SAVINGS CALCULATOR & CHART LOGIC
// ==========================================
let chart;
let currentSimType = 'cost';

// Toggle the Simulator between Bill Cost and Units
function setSimType(type) {
  currentSimType = type;
  const btnCost = document.getElementById('btnCost');
  const btnUnits = document.getElementById('btnUnits');
  const input = document.getElementById('billInput');
  
  if (type === 'cost') {
      btnCost.style.background = 'rgba(0,229,255,0.2)';
      btnCost.style.color = '#00e5ff';
      btnCost.style.fontWeight = '600';
      
      btnUnits.style.background = 'transparent';
      btnUnits.style.color = '#fff';
      btnUnits.style.fontWeight = 'normal';
      
      input.placeholder = 'Enter your monthly bill (₹)';
  } else {
      btnUnits.style.background = 'rgba(0,229,255,0.2)';
      btnUnits.style.color = '#00e5ff';
      btnUnits.style.fontWeight = '600';
      
      btnCost.style.background = 'transparent';
      btnCost.style.color = '#fff';
      btnCost.style.fontWeight = 'normal';
      
      input.placeholder = 'Enter your monthly units (kWh)';
  }
}

function calculateSavings() {
  const billInput = document.getElementById("billInput");
  if (!billInput) return;

  const rawValue = parseFloat(billInput.value);

  if (!rawValue || rawValue <= 0) {
    alert("Please enter a valid number");
    return;
  }

  // Calculate estimated cost if they entered units (assuming ~₹8 per unit avg) for the financial chart
  let monthlyCost = rawValue;
  if (currentSimType === 'units') {
    monthlyCost = rawValue * 8; 
  }

  const annualBill = monthlyCost * 12;
  const baseSavings = annualBill * 0.8; 
  const inflationRate = 1.05; 

  let savingsData = [];
  let currentSavings = baseSavings;
  let total30YearSavings = 0;

  // Calculate 5-year graph data AND 30-year total savings
  for (let i = 0; i < 30; i++) {
    if (i < 5) {
        savingsData.push(Math.round(currentSavings));
    }
    total30YearSavings += currentSavings;
    currentSavings *= inflationRate;
  }

  // ====================================================
  // NEW: Custom Logic for kW Prediction (Cost vs Units)
  // ====================================================
  let recommendedKw = 1;
  
  if (currentSimType === 'units') {
      // If using Units: 1kW for every 150 units
      recommendedKw = Math.ceil(rawValue / 150);
      if (recommendedKw < 1) recommendedKw = 1; // Minimum 1kW
  } else {
      // If using Cost: 1kW up to 1000, 2kW up to 2000, etc.
      if (monthlyCost <= 1000) {
          recommendedKw = 1;
      } else if (monthlyCost <= 2000) {
          recommendedKw = 2;
      } else {
          recommendedKw = 2 + Math.ceil((monthlyCost - 2000) / 2000);
      }
  }

  // Show Result UI
  const resultCard = document.getElementById("resultCard");
  if (resultCard) resultCard.style.display = "block";

  // Show Extended 30-year text and recommendation
  const extResults = document.getElementById("extended-results");
  if (extResults) {
    extResults.style.display = "block";
    document.getElementById("lifetime-savings-text").innerHTML = `Over the 25-30 year lifespan of your solar panels, you are projected to save a massive <strong>₹ ${Math.round(total30YearSavings).toLocaleString()}</strong>!`;
    document.getElementById("system-size-suggestion").innerHTML = `💡 Recommended System Size: ~${recommendedKw} kW`;
  }

  // Draw Chart
  const chartCanvas = document.getElementById("savingsChart");
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext("2d");

  if (chart) chart.destroy();

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
      maintainAspectRatio: false, // Allows chart to resize beautifully on mobile phones
      plugins: {
        legend: { labels: { color: "#ffffff" } },
        tooltip: { callbacks: { label: function(context) { return "₹ " + context.raw.toLocaleString(); } } }
      },
      scales: {
        x: { ticks: { color: "#ffffff" }, grid: { color: "rgba(255,255,255,0.1)" } },
        y: { beginAtZero: true, ticks: { color: "#ffffff", callback: function(value) { return "₹ " + value.toLocaleString(); } }, grid: { color: "rgba(255,255,255,0.1)" } }
      }
    }
  });
}

// ==========================================
// 2. DYNAMIC GALLERY LOADER & SLIDER
// ==========================================
const track = document.getElementById('galleryTrack');
const basePath = './project-images/'; 
const imageExts = ['jpg', 'png', 'jpeg', 'webp', 'avif']; 
const videoExts = ['mp4', 'webm', 'ogg'];
const allExts = [...imageExts, ...videoExts]; 
const itemWidth = 320; 
let autoPlayInterval;

function loadGalleryMedia(index, extIndex = 0) {
  if (!track) return; 

  if (extIndex >= allExts.length) {
    console.log(`Gallery loaded. Found ${index - 1} files.`);
    startGalleryAutoPlay(); 
    return;
  }

  const ext = allExts[extIndex];
  const src = `${basePath}${index}.${ext}`;
  const isVideo = videoExts.includes(ext);

  if (isVideo) {
    const vid = document.createElement('video');
    vid.preload = 'metadata'; 
    vid.onloadeddata = () => {
      vid.className = 'gallery-img'; 
      vid.autoplay = true; vid.muted = true; vid.loop = true; vid.playsInline = true;
      vid.onclick = function() { openLightbox(this); };
      track.appendChild(vid);
      loadGalleryMedia(index + 1, 0); 
    };
    vid.onerror = () => { loadGalleryMedia(index, extIndex + 1); };
    vid.src = src; 
  } else {
    const img = new Image();
    img.onload = () => {
      img.className = 'gallery-img'; 
      img.onclick = function() { openLightbox(this); };
      track.appendChild(img);
      loadGalleryMedia(index + 1, 0); 
    };
    img.onerror = () => { loadGalleryMedia(index, extIndex + 1); };
    img.src = src; 
  }
}

function initGallery() {
  if (document.getElementById('galleryTrack')) {
    loadGalleryMedia(1, 0);
  }
}

// TRIGGER AUTO-POPUP ON LOAD
window.addEventListener('load', () => {
  initGallery();
  
  // Automatically open the Quote Modal 1 second after loading, only once per session
  setTimeout(() => {
    const autoQuote = document.getElementById('autoQuoteModal');
    if (autoQuote && !sessionStorage.getItem('quotePopupShown')) {
      autoQuote.classList.add('show');
      document.body.classList.add('modal-open'); // Hides floating buttons
      sessionStorage.setItem('quotePopupShown', 'true');
    }
  }, 25000);
});

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

function stopGalleryAutoPlay() { clearInterval(autoPlayInterval); }

if (track) {
  track.addEventListener('mouseenter', stopGalleryAutoPlay);
  track.addEventListener('mouseleave', startGalleryAutoPlay);
}
document.querySelector('.next-arrow')?.addEventListener('click', () => { stopGalleryAutoPlay(); moveGalleryNext(); startGalleryAutoPlay(); });
document.querySelector('.prev-arrow')?.addEventListener('click', () => { stopGalleryAutoPlay(); moveGalleryPrev(); startGalleryAutoPlay(); });

// ==========================================
// 3. PROJECT LIGHTBOX LOGIC (WITH SLIDER)
// ==========================================
const projectLightbox = document.getElementById('projectLightbox');
const mediaContainer = document.getElementById('lightboxMediaContainer');
let currentLightboxElement = null; // Tracks the currently viewing element

function openLightbox(element) {
  if (!projectLightbox || !mediaContainer) return;
  currentLightboxElement = element;
  updateLightboxContent();
  projectLightbox.classList.add('show');
  document.body.classList.add('modal-open'); // Hides floating buttons
  stopGalleryAutoPlay(); 
}

function updateLightboxContent() {
  if (!currentLightboxElement) return;
  mediaContainer.innerHTML = ''; 
  let mediaClone;
  
  if (currentLightboxElement.tagName === 'VIDEO') {
    mediaClone = document.createElement('video');
    mediaClone.src = currentLightboxElement.src; 
    mediaClone.autoplay = true; 
    mediaClone.controls = true; 
  } else {
    mediaClone = document.createElement('img');
    mediaClone.src = currentLightboxElement.src;
  }
  mediaClone.className = 'lightbox-content';
  mediaContainer.appendChild(mediaClone);
}

// Navigate to NEXT image
function lightboxNext(event) {
  if (event) event.stopPropagation(); // Prevents click from closing the background
  if (!currentLightboxElement) return;
  // Get next image, or loop back to the first one
  currentLightboxElement = currentLightboxElement.nextElementSibling || currentLightboxElement.parentNode.firstElementChild;
  updateLightboxContent();
}

// Navigate to PREVIOUS image
function lightboxPrev(event) {
  if (event) event.stopPropagation(); 
  if (!currentLightboxElement) return;
  // Get previous image, or loop back to the last one
  currentLightboxElement = currentLightboxElement.previousElementSibling || currentLightboxElement.parentNode.lastElementChild;
  updateLightboxContent();
}

// Close Lightbox
function closeLightbox(event) {
  if (!projectLightbox) return;
  // Only close if clicking the background, the X, or passing a forced close
  if (event.forceClose || event.target === projectLightbox || event.target.id === 'lightboxMediaContainer' || event.target.classList.contains('close-lightbox')) {
    projectLightbox.classList.remove('show');
    document.body.classList.remove('modal-open'); // Shows floating buttons
    mediaContainer.innerHTML = ''; 
    currentLightboxElement = null;
    startGalleryAutoPlay(); 
  }
}

// Keyboard Support for Desktop Users (Arrows & Escape key)
document.addEventListener('keydown', function(e) {
  if (projectLightbox && projectLightbox.classList.contains('show')) {
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'Escape') closeLightbox({forceClose: true}); 
  }
});
// ==========================================
// 4. MODALS (CONSULTATION, SUBSIDY, AUTO-QUOTE)
// ==========================================
const consultationModal = document.getElementById('consultationModal');
const subsidyModal = document.getElementById('subsidyModal');
const autoQuoteModal = document.getElementById('autoQuoteModal');

function openConsultationModal(event) {
  if(event) event.preventDefault();
  if(consultationModal) {
    consultationModal.classList.add('show');
    document.body.classList.add('modal-open'); // Hides floating buttons
    document.getElementById('consultationForm').style.display = 'block';
    document.getElementById('consultSuccess').style.display = 'none';
    document.getElementById('consultationForm').reset();
  }
}

function closeConsultationModal(event) {
  if (!event || event.target === consultationModal || event.target.classList.contains('close-lightbox') || event.target.innerText === 'Close Window') {
    consultationModal.classList.remove('show');
    document.body.classList.remove('modal-open'); // Shows floating buttons
  }
}

function openSubsidyModal(event) {
  if(event) event.preventDefault();
  if(subsidyModal) {
    subsidyModal.classList.add('show');
    document.body.classList.add('modal-open'); // Hides floating buttons
  }
}

function closeSubsidyModal(event) {
  if (!event || event.target === subsidyModal || event.target.classList.contains('close-lightbox')) {
    subsidyModal.classList.remove('show');
    document.body.classList.remove('modal-open'); // Shows floating buttons
  }
}

function closeAutoQuoteModal(event) {
  if (!event || event.target === autoQuoteModal || event.target.classList.contains('close-lightbox') || event.target.innerText === 'Close Window') {
    autoQuoteModal.classList.remove('show');
    document.body.classList.remove('modal-open'); // Shows floating buttons
  }
}

// ==========================================
// 5. EMAIL LOGIC
// ==========================================
async function sendToEmail(event) {
  event.preventDefault(); 
  const form = document.getElementById('consultationForm');
  const btn = document.getElementById('consultBtn');
  const successMsg = document.getElementById('consultSuccess');
  
  btn.disabled = true; btn.innerText = "Sending Booking...";
  
  try {
    const response = await fetch(form.action, { method: form.method, body: new FormData(form), headers: { 'Accept': 'application/json' } });
    if (response.ok) { form.style.display = "none"; successMsg.style.display = "block"; } 
    else { alert("Oops! There was a problem submitting your form"); }
  } catch (error) { alert("Connection error. Please check your internet and try again."); }
  btn.disabled = false; btn.innerText = "Confirm Booking";
}

// ==========================================
// 6. MOBILE HAMBURGER MENU
// ==========================================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener('click', () => { navLinks.classList.toggle('active'); });
}