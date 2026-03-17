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
  const baseSavings = annualBill * 0.8; // 80% savings efficiency
  const inflationRate = 1.05; // 5% yearly electricity inflation

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

  // Calculate System Size Recommendation
  // Assuming avg rate is ₹8/unit, and 1kW produces ~120 units/month.
  // Formula: (Bill / Rate) / Units Per kW -> rough estimate: Bill / 900
  let recommendedKw = (bill / 900).toFixed(1);
  if(recommendedKw < 1) recommendedKw = 1; // Minimum 1kW

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
// 2. MODAL LOGIC (CONSULTATION & SUBSIDY)
// ==========================================
const consultationModal = document.getElementById('consultationModal');
const subsidyModal = document.getElementById('subsidyModal');

function openConsultationModal(event) {
  if(event) event.preventDefault();
  if(consultationModal) {
    consultationModal.classList.add('show');
    document.getElementById('consultationForm').style.display = 'block';
    document.getElementById('consultSuccess').style.display = 'none';
    document.getElementById('consultationForm').reset();
  }
}

function closeConsultationModal(event) {
  if (!event || event.target === consultationModal || event.target.classList.contains('close-lightbox') || event.target.innerText === 'Close Window') {
    consultationModal.classList.remove('show');
  }
}

// NEW: Subsidy Modal Functions
function openSubsidyModal(event) {
  if(event) event.preventDefault();
  if(subsidyModal) subsidyModal.classList.add('show');
}

function closeSubsidyModal(event) {
  if (!event || event.target === subsidyModal || event.target.classList.contains('close-lightbox')) {
    subsidyModal.classList.remove('show');
  }
}

// ==========================================
// 3. EMAIL LOGIC
// ==========================================
async function sendToEmail(event) {
  event.preventDefault(); 
  
  const form = document.getElementById('consultationForm');
  const btn = document.getElementById('consultBtn');
  const successMsg = document.getElementById('consultSuccess');
  
  btn.disabled = true;
  btn.innerText = "Sending Booking...";
  
  const formData = new FormData(form);
  
  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      form.style.display = "none";
      successMsg.style.display = "block";
    } else {
      const data = await response.json();
      if (Object.hasOwn(data, 'errors')) {
        alert("Error: " + data["errors"].map(error => error["message"]).join(", "));
      } else {
        alert("Oops! There was a problem submitting your form");
      }
    }
  } catch (error) {
    alert("Connection error. Please check your internet and try again.");
  }
  
  btn.disabled = false;
  btn.innerText = "Confirm Booking";
}

// ==========================================
// 4. MOBILE HAMBURGER MENU
// ==========================================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}