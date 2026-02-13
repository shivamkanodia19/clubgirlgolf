/* ============================================================
   Club Girl Golf — Inventory & Financial Model v3
   Premium animations, spring physics, micro-interactions
   ============================================================ */

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const EXTRA_MONTHS = 6;
const LS_KEY = 'clubGirlGolfData';

const COLORS = {
  pink: '#E83E8C',
  pinkLight: '#FCE4EC',
  plum: '#2E1A2B',
  offwhite: '#FAF9F7',
  red: '#FF6B6B',
  green: '#3CB371',
  orange: '#F4A261',
};

// ── Global State ──
let state = {
  assumptions: [],
  dtcSales: {},
  wholesale: {},
  shipments: {},
  totalDemand: {},
  extendedDemand: {},
  inventory: {},
  financials: {},
};

let originalState = null;
let sawtoothChart = null;
let revenueChart = null;
let marginChart = null;
let selectedSawtoothSku = 'SKU001';
let isFirstRender = true;

// ── Initialization ──
document.addEventListener('DOMContentLoaded', () => {
  setupAccordions();
  setupFileUpload();
  setupModal();
  document.getElementById('btn-reset').addEventListener('click', resetData);
  document.getElementById('btn-export').addEventListener('click', exportExcel);
  document.getElementById('btn-add-sku').addEventListener('click', openModal);

  // Premium animation systems
  initScrollProgress();
  initParallax();
  initMagneticButtons();
  initRippleButtons();

  loadDefaultFile();
});

// ═══════════════════════════════════════
// ANIMATION SYSTEMS
// ═══════════════════════════════════════

// ── Scroll Progress Bar ──
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.transform = 'scaleX(' + progress + ')';
    bar.style.width = '100%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ── Parallax Background ──
function initParallax() {
  const blobs = document.querySelectorAll('.parallax-blob');
  if (blobs.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    blobs[0].style.transform = 'translate(' + (-40 + scrollY * 0.02) + 'px, ' + (50 + scrollY * -0.05) + 'px) scale(1.1)';
    blobs[1].style.transform = 'translate(' + (50 + scrollY * -0.03) + 'px, ' + (-40 + scrollY * 0.04) + 'px) scale(1.05)';
  }, { passive: true });
}

// ── Magnetic Buttons ──
function initMagneticButtons() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── Ripple Buttons ──
function initRippleButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-magnetic');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
}

// ── Toast Notifications ──
function showToast(message, type) {
  type = type || 'info';
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '\u2713', error: '\u2717', info: '\u2139' };

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<div class="toast-icon">' + (icons[type] || '\u2139') + '</div>' +
    '<span>' + message + '</span>' +
    '<div class="toast-progress" style="animation: toastProgress 3s linear forwards"></div>';

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Count-Up Animation ──
function animateCountUp(element, finalText) {
  var match = finalText.match(/(-?[\d,.]+)/);
  if (!match) { element.textContent = finalText; return; }

  var numberStr = match[1].replace(/,/g, '');
  var target = parseFloat(numberStr);
  if (isNaN(target) || target === 0) { element.textContent = finalText; return; }

  var prefix = finalText.substring(0, match.index);
  var suffix = finalText.substring(match.index + match[1].length);
  var hasDecimal = numberStr.includes('.');
  var decimals = hasDecimal ? numberStr.split('.')[1].length : 0;

  var duration = 1200;
  var startTime = performance.now();

  element.classList.add('counting');

  function update(now) {
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = target * eased;

    var formatted;
    if (hasDecimal) {
      formatted = current.toFixed(decimals);
    } else {
      formatted = Math.round(current).toLocaleString('en-US');
    }

    element.textContent = prefix + formatted + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = finalText;
      setTimeout(() => element.classList.remove('counting'), 1000);
    }
  }

  requestAnimationFrame(update);
}

// ── Staggered Entrance Animations ──
function triggerEntranceAnimations() {
  // KPI cards
  var kpiCards = document.querySelectorAll('#kpi-section .kpi-card');
  kpiCards.forEach((card, i) => {
    card.classList.add('anim-ready');
    setTimeout(() => {
      card.style.setProperty('--stagger', (i * 80) + 'ms');
      card.classList.add('anim-in');
    }, 100);
  });

  // Panels
  var panels = document.querySelectorAll('.anim-ready');
  panels.forEach((panel, i) => {
    setTimeout(() => {
      panel.style.setProperty('--stagger', '0ms');
      panel.classList.add('anim-in');
    }, 400 + i * 100);
  });

  // Runway rows
  setTimeout(() => {
    var rows = document.querySelectorAll('.runway-row');
    rows.forEach((row, i) => {
      row.style.setProperty('--row-delay', (i * 50) + 'ms');
      row.classList.add('row-animate');
    });
  }, 600);
}

// ── Intersection Observer for scroll reveals ──
function initScrollReveal() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.anim-ready:not(.anim-in)').forEach(function(el) {
    observer.observe(el);
  });
}

// ═══════════════════════════════════════
// localStorage PERSISTENCE
// ═══════════════════════════════════════

function saveToLocalStorage() {
  var data = {
    assumptions: state.assumptions,
    dtcSales: state.dtcSales,
    wholesale: state.wholesale,
    shipments: state.shipments,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    updatePersistenceStatus(true);
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

function loadFromLocalStorage() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function updatePersistenceStatus(hasSaved) {
  var el = document.getElementById('persistence-status');
  if (hasSaved) {
    var saved = loadFromLocalStorage();
    if (saved && saved.savedAt) {
      var d = new Date(saved.savedAt);
      el.textContent = 'Changes saved locally \u00b7 ' + d.toLocaleString();
    } else {
      el.textContent = 'Changes saved locally';
    }
  } else {
    el.textContent = 'Loaded from Excel (no local edits)';
  }
}

// ═══════════════════════════════════════
// FILE LOADING
// ═══════════════════════════════════════

async function loadDefaultFile() {
  try {
    var resp = await fetch('ClubGirlGolf_INVESTOR_READY.xlsx');
    var buf = await resp.arrayBuffer();
    parseWorkbook(buf);
  } catch (e) {
    console.error('Could not load default Excel file:', e);
    document.getElementById('loading-overlay').innerHTML =
      '<div class="text-center"><p class="text-lg font-semibold text-plum">Upload your Excel file to begin</p><p class="text-sm text-plum/60 mt-1">Use the "Upload File" button in the header</p></div>';
  }
}

function setupFileUpload() {
  document.getElementById('file-upload').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      localStorage.removeItem(LS_KEY);
      parseWorkbook(ev.target.result);
      showToast('File loaded successfully', 'success');
    };
    reader.readAsArrayBuffer(file);
  });
}

// ═══════════════════════════════════════
// EXCEL PARSING
// ═══════════════════════════════════════

function parseWorkbook(data) {
  var wb = XLSX.read(data, { type: 'array' });

  // 1. Assumptions
  var assSheet = XLSX.utils.sheet_to_json(wb.Sheets['Assumptions'], { header: 1, defval: '' });
  state.assumptions = [];
  for (var r = 4; r <= 50; r++) {
    var row = assSheet[r];
    if (!row || !row[0] || !String(row[0]).startsWith('SKU')) break;
    state.assumptions.push({
      sku: String(row[0]),
      name: String(row[1]),
      unitCost: Number(row[2]) || 0,
      dtcPrice: Number(row[3]) || 0,
      wholesalePrice: Number(row[4]) || 0,
      leadTime: Number(row[5]) || 3,
      safetyStock: Number(row[6]) || 0,
      currentInventory: Number(row[7]) || 0,
      moq: Number(row[8]) || 50,
    });
  }

  // 2. DTC Sales
  var demSheet = XLSX.utils.sheet_to_json(wb.Sheets['Demand Forecast'], { header: 1, defval: '' });
  state.dtcSales = {};
  for (var r = 5; r <= 50; r++) {
    var row = demSheet[r];
    if (!row || !row[0] || !String(row[0]).startsWith('SKU')) break;
    var sku = String(row[0]);
    state.dtcSales[sku] = [];
    for (var m = 0; m < 12; m++) {
      state.dtcSales[sku][m] = Number(row[m + 2]) || 0;
    }
  }

  // 3. Wholesale
  state.wholesale = {};
  state.assumptions.forEach(function(a) { state.wholesale[a.sku] = {}; });
  var wsStart = -1;
  for (var r = 0; r < demSheet.length; r++) {
    if (demSheet[r] && String(demSheet[r][0]).includes('RETAIL')) { wsStart = r + 2; break; }
  }
  if (wsStart > 0) {
    for (var r = wsStart; r < demSheet.length; r++) {
      var row = demSheet[r];
      if (!row || !row[0]) continue;
      var val = String(row[0]);
      if (val.includes('TOTAL')) break;
      if (!val.startsWith('SKU')) continue;
      var sku = val;
      var company = String(row[1]);
      if (!state.wholesale[sku]) state.wholesale[sku] = {};
      state.wholesale[sku][company] = [];
      for (var m = 0; m < 12; m++) {
        state.wholesale[sku][company][m] = Number(row[m + 2]) || 0;
      }
    }
  }

  // 4. Incoming shipments
  state.shipments = {};
  state.assumptions.forEach(function(a) {
    state.shipments[a.sku] = new Array(12).fill(0);
  });
  var invSheet = XLSX.utils.sheet_to_json(wb.Sheets['Inventory Model'], { header: 1, defval: '' });
  var currentSku = '';
  for (var r = 4; r < invSheet.length; r++) {
    var row = invSheet[r];
    if (!row) continue;
    if (row[0] && String(row[0]).startsWith('SKU')) currentSku = String(row[0]);
    if (currentSku && state.shipments[currentSku] && row[1] && String(row[1]).includes('Incoming Shipments')) {
      for (var m = 0; m < 12; m++) {
        state.shipments[currentSku][m] = Number(row[m + 2]) || 0;
      }
    }
  }

  // Ensure all arrays exist
  state.assumptions.forEach(function(a) {
    if (!state.dtcSales[a.sku]) state.dtcSales[a.sku] = new Array(12).fill(0);
    if (!state.wholesale[a.sku]) state.wholesale[a.sku] = {};
    if (!state.shipments[a.sku]) state.shipments[a.sku] = new Array(12).fill(0);
  });

  // Save original for reset
  originalState = JSON.parse(JSON.stringify({
    assumptions: state.assumptions,
    dtcSales: state.dtcSales,
    wholesale: state.wholesale,
    shipments: state.shipments,
  }));

  // Check localStorage
  var saved = loadFromLocalStorage();
  if (saved) {
    state.assumptions = saved.assumptions;
    state.dtcSales = saved.dtcSales;
    state.wholesale = saved.wholesale;
    state.shipments = saved.shipments;
    updatePersistenceStatus(true);
  } else {
    updatePersistenceStatus(false);
  }

  if (!state.assumptions.find(function(a) { return a.sku === selectedSawtoothSku; })) {
    selectedSawtoothSku = state.assumptions[0] ? state.assumptions[0].sku : 'SKU001';
  }

  recalcAll();
  hideLoading();
}

function hideLoading() {
  var overlay = document.getElementById('loading-overlay');
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  setTimeout(function() {
    overlay.style.display = 'none';
    // Trigger entrance animations after loading fades
    triggerEntranceAnimations();
    // Start scroll reveal for accordion sections
    setTimeout(initScrollReveal, 500);
    isFirstRender = false;
  }, 500);
}

// ═══════════════════════════════════════
// CALCULATIONS
// ═══════════════════════════════════════

var recalcTimer = null;

function scheduleRecalc() {
  clearTimeout(recalcTimer);
  recalcTimer = setTimeout(function() {
    recalcAll();
    saveToLocalStorage();
    showToast('Model updated', 'success');
  }, 80);
}

function recalcAll() {
  calcTotalDemand();
  calcExtendedDemand();
  calcInventory();
  calcFinancials();
  renderAll();
}

function calcTotalDemand() {
  state.totalDemand = {};
  state.assumptions.forEach(function(a) {
    state.totalDemand[a.sku] = new Array(12).fill(0);
    for (var m = 0; m < 12; m++) {
      var total = (state.dtcSales[a.sku] && state.dtcSales[a.sku][m]) || 0;
      var ws = state.wholesale[a.sku];
      if (ws) Object.values(ws).forEach(function(arr) { total += (arr[m] || 0); });
      state.totalDemand[a.sku][m] = total;
    }
  });
}

function calcExtendedDemand() {
  state.extendedDemand = {};
  state.assumptions.forEach(function(a) {
    var base = state.totalDemand[a.sku];
    var last3 = base.slice(-3);
    var avg = last3.reduce(function(s, v) { return s + v; }, 0) / (last3.length || 1);
    state.extendedDemand[a.sku] = base.slice();
    for (var i = 0; i < EXTRA_MONTHS; i++) {
      state.extendedDemand[a.sku].push(Math.round(avg));
    }
  });
}

function calcInventory() {
  state.inventory = {};
  state.assumptions.forEach(function(a) {
    var demand = state.extendedDemand[a.sku];
    var shipments = state.shipments[a.sku];
    var totalMonths = 12 + EXTRA_MONTHS;

    var beginning = new Array(totalMonths).fill(0);
    var grossSales = new Array(totalMonths).fill(0);
    var netPosition = new Array(totalMonths).fill(0);
    var incoming = new Array(totalMonths).fill(0);
    var ending = new Array(totalMonths).fill(0);

    for (var m = 0; m < totalMonths; m++) {
      beginning[m] = m === 0 ? a.currentInventory : ending[m - 1];
      grossSales[m] = demand[m] || 0;
      incoming[m] = m < 12 ? (shipments[m] || 0) : 0;
      netPosition[m] = beginning[m] - grossSales[m];
      ending[m] = Math.max(0, netPosition[m] + incoming[m]);
    }

    var alerts = new Array(12).fill('');
    var orderQty = new Array(12).fill(0);
    var monthsOfSupply = new Array(12).fill(0);

    for (var m = 0; m < 12; m++) {
      var futureDemand = demand.slice(m + 1, 12);
      if (futureDemand.length > 0) {
        var avgFuture = futureDemand.reduce(function(s, v) { return s + v; }, 0) / futureDemand.length;
        monthsOfSupply[m] = avgFuture > 0 ? ending[m] / avgFuture : 999;
      } else {
        monthsOfSupply[m] = -1;
      }

      var futureIdx = m + a.leadTime;
      var futureEnding = ending[futureIdx] !== undefined ? ending[futureIdx] : ending[totalMonths - 1];

      if (futureEnding < a.safetyStock) {
        alerts[m] = 'ORDER NOW';
        var futureDmd = demand[futureIdx] || demand[11] || 0;
        var shortage = a.safetyStock - futureEnding;
        orderQty[m] = Math.max(a.moq, shortage + futureDmd);
      } else if (futureEnding < a.safetyStock * 1.5) {
        alerts[m] = 'ORDER SOON';
        orderQty[m] = 0;
      }
    }

    state.inventory[a.sku] = {
      beginning: beginning.slice(0, 12),
      grossSales: grossSales.slice(0, 12),
      netPosition: netPosition.slice(0, 12),
      incoming: shipments,
      ending: ending.slice(0, 12),
      monthsOfSupply: monthsOfSupply,
      alerts: alerts,
      orderQty: orderQty,
    };
  });
}

function calcFinancials() {
  var fin = {
    dtcRevenue: new Array(12).fill(0),
    wholesaleRevenue: new Array(12).fill(0),
    totalRevenue: new Array(12).fill(0),
    totalUnits: new Array(12).fill(0),
    cogs: new Array(12).fill(0),
    grossProfit: new Array(12).fill(0),
    grossMargin: new Array(12).fill(0),
    cashInflow: new Array(12).fill(0),
    cashOutflow: new Array(12).fill(0),
    netCashFlow: new Array(12).fill(0),
  };

  for (var m = 0; m < 12; m++) {
    state.assumptions.forEach(function(a) {
      var dtcUnits = (state.dtcSales[a.sku] && state.dtcSales[a.sku][m]) || 0;
      var wsUnits = 0;
      var ws = state.wholesale[a.sku];
      if (ws) Object.values(ws).forEach(function(arr) { wsUnits += (arr[m] || 0); });

      fin.dtcRevenue[m] += dtcUnits * a.dtcPrice;
      fin.wholesaleRevenue[m] += wsUnits * a.wholesalePrice;
      fin.totalUnits[m] += dtcUnits + wsUnits;
      fin.cogs[m] += (dtcUnits + wsUnits) * a.unitCost;
      fin.cashOutflow[m] += ((state.shipments[a.sku] && state.shipments[a.sku][m]) || 0) * a.unitCost;
    });

    fin.totalRevenue[m] = fin.dtcRevenue[m] + fin.wholesaleRevenue[m];
    fin.grossProfit[m] = fin.totalRevenue[m] - fin.cogs[m];
    fin.grossMargin[m] = fin.totalRevenue[m] > 0 ? fin.grossProfit[m] / fin.totalRevenue[m] : 0;
    fin.cashInflow[m] = fin.totalRevenue[m];
    fin.netCashFlow[m] = fin.cashInflow[m] - fin.cashOutflow[m];
  }

  state.financials = fin;
}

// ═══════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════

function renderAll() {
  renderKPIs();
  renderRunway();
  renderAssumptionsTable();
  renderDemandTable();
  renderInventoryTables();
  renderFinancialTable();
  renderCharts();
}

// ── KPI Cards ──
function renderKPIs() {
  var f = state.financials;
  var totalRev = f.totalRevenue.reduce(function(s, v) { return s + v; }, 0);
  var totalGP = f.grossProfit.reduce(function(s, v) { return s + v; }, 0);
  var avgMargin = totalRev > 0 ? totalGP / totalRev : 0;
  var totalUnits = f.totalUnits.reduce(function(s, v) { return s + v; }, 0);
  var totalInvOnHand = state.assumptions.reduce(function(s, a) { return s + a.currentInventory; }, 0);
  var skusBelowSafety = state.assumptions.filter(function(a) {
    var ending = state.inventory[a.sku] && state.inventory[a.sku].ending;
    return ending && ending[0] < a.safetyStock;
  }).length;
  var cashInInv = state.assumptions.reduce(function(s, a) { return s + a.currentInventory * a.unitCost; }, 0);

  var kpis = [
    { value: '$' + fmtK(totalRev), label: 'Total Revenue (YTD)' },
    { value: (avgMargin * 100).toFixed(1) + '%', label: 'Gross Margin %' },
    { value: fmtNum(totalUnits), label: 'Total Units Sold' },
    { value: fmtNum(totalInvOnHand), label: 'Inventory On Hand' },
    { value: String(skusBelowSafety), label: 'SKUs Below Safety', alert: skusBelowSafety > 0 },
    { value: '$' + fmtK(cashInInv), label: 'Cash in Inventory' },
  ];

  var section = document.getElementById('kpi-section');
  section.innerHTML = kpis.map(function(k, i) {
    return '<div class="kpi-card' + (isFirstRender ? ' anim-ready' : '') + '" style="--stagger:' + (i * 80) + 'ms">' +
      '<div class="kpi-glow"></div>' +
      '<div class="kpi-value" ' + (k.alert ? 'style="color:#FF6B6B"' : '') +
        ' data-target="' + k.value.replace(/"/g, '') + '">' +
        (isFirstRender ? '0' : k.value) + '</div>' +
      '<div class="kpi-label">' + k.label + '</div>' +
    '</div>';
  }).join('');

  // Count-up animation on first render
  if (isFirstRender) {
    setTimeout(function() {
      section.querySelectorAll('.kpi-value').forEach(function(el) {
        animateCountUp(el, el.dataset.target);
      });
    }, 300);
  }
}

// ── Inventory Runway ──
function renderRunway() {
  var body = document.getElementById('runway-body');
  body.innerHTML = state.assumptions.map(function(a, idx) {
    var stock = a.currentInventory;
    var totalDemand = state.totalDemand[a.sku].reduce(function(s, v) { return s + v; }, 0);
    var dailySales = totalDemand / 365;
    var daysLeft = dailySales > 0 ? stock / dailySales : 999;

    var statusClass, statusText;
    if (daysLeft < 60) { statusClass = 'badge-urgent'; statusText = 'URGENT'; }
    else if (daysLeft < 120) { statusClass = 'badge-warn'; statusText = 'SOON'; }
    else { statusClass = 'badge-ok'; statusText = 'OK'; }

    return '<tr class="runway-row border-b border-pink-light/20 ' +
      (a.sku === selectedSawtoothSku ? 'active' : '') + '" data-sku="' + a.sku + '"' +
      (isFirstRender ? ' style="--row-delay:' + (idx * 50) + 'ms"' : '') + '>' +
      '<td class="px-4 py-2.5 font-semibold">' + a.sku +
        '<span class="row-chevron ml-1 text-pink text-[10px]">\u203A</span></td>' +
      '<td class="px-3 py-2.5 text-right">' + fmtNum(stock) + '</td>' +
      '<td class="px-3 py-2.5 text-right">' + dailySales.toFixed(1) + '</td>' +
      '<td class="px-3 py-2.5 text-right">' + Math.round(daysLeft) + '</td>' +
      '<td class="px-3 py-2.5 text-center"><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
    '</tr>';
  }).join('');

  body.querySelectorAll('.runway-row').forEach(function(row) {
    row.addEventListener('click', function() {
      selectedSawtoothSku = row.dataset.sku;
      document.getElementById('sawtooth-sku-select').value = selectedSawtoothSku;
      renderRunway();
      updateSawtoothChart();
    });
  });
}

// ── Assumptions Table ──
function renderAssumptionsTable() {
  var head = document.getElementById('assumptions-head');
  head.innerHTML = '<tr class="border-b border-pink-light/40 text-left text-plum/60">' +
    '<th class="px-2 py-2.5 font-semibold w-8"></th>' +
    '<th class="px-3 py-2.5 font-semibold">SKU ID</th>' +
    '<th class="px-3 py-2.5 font-semibold">Product Name</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">Unit Cost</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">DTC Price</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">Wholesale</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">Lead Time</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">Safety Stock</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">Cur. Inventory</th>' +
    '<th class="px-3 py-2.5 font-semibold text-right">MOQ</th>' +
  '</tr>';

  var body = document.getElementById('assumptions-body');
  body.innerHTML = state.assumptions.map(function(a) {
    return '<tr class="border-b border-pink-light/20 table-row-hover" data-sku="' + a.sku + '">' +
      '<td class="px-2 py-1.5 text-center"><button class="btn-delete-sku" data-sku="' + a.sku + '" title="Remove ' + a.sku + '">&times;</button></td>' +
      '<td class="px-3 py-1.5 font-semibold text-plum">' + a.sku + '</td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" data-sku="' + a.sku + '" data-field="name" value="' + a.name + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" step="0.01" min="0" data-sku="' + a.sku + '" data-field="unitCost" value="' + a.unitCost + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" step="0.01" min="0" data-sku="' + a.sku + '" data-field="dtcPrice" value="' + a.dtcPrice + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" step="0.01" min="0" data-sku="' + a.sku + '" data-field="wholesalePrice" value="' + a.wholesalePrice + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" min="1" max="12" data-sku="' + a.sku + '" data-field="leadTime" value="' + a.leadTime + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" min="0" data-sku="' + a.sku + '" data-field="safetyStock" value="' + a.safetyStock + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" min="0" data-sku="' + a.sku + '" data-field="currentInventory" value="' + a.currentInventory + '"></td>' +
      '<td class="px-1 py-1"><input class="cell-editable-wide ass-input" type="number" min="1" data-sku="' + a.sku + '" data-field="moq" value="' + a.moq + '"></td>' +
    '</tr>';
  }).join('');

  body.querySelectorAll('.ass-input').forEach(function(input) {
    input.addEventListener('change', onAssumptionChange);
  });
  body.querySelectorAll('.btn-delete-sku').forEach(function(btn) {
    btn.addEventListener('click', function() { removeSKU(btn.dataset.sku); });
  });
}

function onAssumptionChange(e) {
  var el = e.target;
  var sku = el.dataset.sku;
  var field = el.dataset.field;
  var a = state.assumptions.find(function(x) { return x.sku === sku; });
  if (!a) return;

  if (field === 'name') {
    a[field] = el.value;
  } else {
    a[field] = Math.max(0, parseFloat(el.value) || 0);
    el.value = a[field];
  }
  scheduleRecalc();
}

// ── Demand Forecast Table ──
function renderDemandTable() {
  var head = document.getElementById('demand-head');
  head.innerHTML = '<tr class="border-b border-pink-light/40 text-left text-plum/60">' +
    '<th class="px-4 py-2.5 font-semibold sticky left-0 bg-white z-10">SKU</th>' +
    '<th class="px-3 py-2.5 font-semibold">Channel</th>' +
    MONTHS.map(function(m) { return '<th class="px-3 py-2.5 font-semibold text-right">' + m.slice(0,3) + '</th>'; }).join('') +
    '<th class="px-3 py-2.5 font-semibold text-right">Total</th>' +
  '</tr>';

  var body = document.getElementById('demand-body');
  var html = '';

  state.assumptions.forEach(function(a) {
    var dtc = state.dtcSales[a.sku] || new Array(12).fill(0);
    var dtcTotal = dtc.reduce(function(s, v) { return s + v; }, 0);
    html += '<tr class="border-b border-pink-light/20 table-row-hover">' +
      '<td class="px-4 py-2 font-semibold sticky left-0 bg-white z-10">' + a.sku + '</td>' +
      '<td class="px-3 py-2 text-plum/60">DTC</td>' +
      dtc.map(function(v, m) {
        return '<td class="px-1 py-1.5 text-right"><input class="cell-editable demand-input" type="number" min="0" data-sku="' + a.sku + '" data-channel="dtc" data-month="' + m + '" value="' + v + '"></td>';
      }).join('') +
      '<td class="px-3 py-2 text-right font-semibold">' + fmtNum(dtcTotal) + '</td>' +
    '</tr>';

    var ws = state.wholesale[a.sku];
    if (ws) {
      Object.entries(ws).forEach(function(entry) {
        var company = entry[0], arr = entry[1];
        var total = arr.reduce(function(s, v) { return s + v; }, 0);
        html += '<tr class="border-b border-pink-light/20 table-row-hover">' +
          '<td class="px-4 py-2 sticky left-0 bg-white z-10"></td>' +
          '<td class="px-3 py-2 text-plum/60">' + company + '</td>' +
          arr.map(function(v, m) {
            return '<td class="px-1 py-1.5 text-right"><input class="cell-editable demand-input" type="number" min="0" data-sku="' + a.sku + '" data-channel="ws" data-company="' + company + '" data-month="' + m + '" value="' + v + '"></td>';
          }).join('') +
          '<td class="px-3 py-2 text-right font-medium">' + fmtNum(total) + '</td>' +
        '</tr>';
      });
    }

    var totalDem = state.totalDemand[a.sku];
    var grandTotal = totalDem.reduce(function(s, v) { return s + v; }, 0);
    html += '<tr class="border-b border-plum/10 bg-pink-light/20">' +
      '<td class="px-4 py-2 sticky left-0 bg-pink-light/20 z-10"></td>' +
      '<td class="px-3 py-2 font-bold text-plum/70">TOTAL</td>' +
      totalDem.map(function(v) { return '<td class="px-3 py-2 text-right font-bold">' + fmtNum(v) + '</td>'; }).join('') +
      '<td class="px-3 py-2 text-right font-bold">' + fmtNum(grandTotal) + '</td>' +
    '</tr>';
  });

  body.innerHTML = html;
  body.querySelectorAll('.demand-input').forEach(function(input) {
    input.addEventListener('change', onDemandChange);
  });
}

function onDemandChange(e) {
  var el = e.target;
  var sku = el.dataset.sku;
  var month = parseInt(el.dataset.month);
  var val = Math.max(0, parseInt(el.value) || 0);
  el.value = val;

  if (el.dataset.channel === 'dtc') {
    if (!state.dtcSales[sku]) state.dtcSales[sku] = new Array(12).fill(0);
    state.dtcSales[sku][month] = val;
  } else {
    var company = el.dataset.company;
    if (!state.wholesale[sku]) state.wholesale[sku] = {};
    if (!state.wholesale[sku][company]) state.wholesale[sku][company] = new Array(12).fill(0);
    state.wholesale[sku][company][month] = val;
  }
  scheduleRecalc();
}

// ── Inventory Model Tables ──
function renderInventoryTables() {
  var container = document.getElementById('inventory-tables');
  var html = '';

  state.assumptions.forEach(function(a) {
    var inv = state.inventory[a.sku];
    if (!inv) return;
    html += '<table class="w-full text-xs mb-0">' +
      '<thead><tr class="inv-sku-header">' +
        '<td class="px-4 py-2.5 sticky left-0 z-10" style="background:#2E1A2B" colspan="2">' + a.sku + ' \u2014 ' + a.name + '</td>' +
        MON_SHORT.map(function(m) { return '<td class="px-3 py-2.5 text-right">' + m + '</td>'; }).join('') +
      '</tr></thead>' +
      '<tbody>' +
        invRow('Beginning Inv.', inv.beginning, false) +
        invRow('Gross Sales', inv.grossSales, false) +
        invRow('Net Position', inv.netPosition, true) +
        invShipmentRow(a.sku, inv.incoming) +
        invEndingRow(a, inv.ending) +
        invRow('Mo. of Supply', inv.monthsOfSupply.map(function(v) { return v === -1 ? '-' : v >= 999 ? '\u221e' : v.toFixed(1); }), false) +
        invAlertRow(inv.alerts) +
        invRow('Order Qty', inv.orderQty.map(function(v) { return v > 0 ? fmtNum(v) : ''; }), false) +
      '</tbody>' +
    '</table>';
  });

  container.innerHTML = html;
  container.querySelectorAll('.shipment-input').forEach(function(input) {
    input.addEventListener('change', onShipmentChange);
  });
}

function invRow(label, vals, canBeNeg) {
  return '<tr class="border-b border-pink-light/20 table-row-hover">' +
    '<td class="px-4 py-2 sticky left-0 bg-white z-10 font-medium text-plum/70" colspan="2">' + label + '</td>' +
    vals.map(function(v) {
      var num = typeof v === 'string' ? v : fmtNum(Math.round(v));
      var color = canBeNeg && typeof v === 'number' && v < 0 ? 'color:#FF6B6B' : '';
      return '<td class="px-3 py-2 text-right" style="' + color + '">' + num + '</td>';
    }).join('') +
  '</tr>';
}

function invShipmentRow(sku, vals) {
  return '<tr class="border-b border-pink-light/20 bg-pink-light/10">' +
    '<td class="px-4 py-2 sticky left-0 bg-pink-light/10 z-10 font-medium text-pink" colspan="2">Incoming Shipments</td>' +
    vals.map(function(v, m) {
      return '<td class="px-1 py-1.5 text-right"><input class="cell-editable shipment-input" type="number" min="0" data-sku="' + sku + '" data-month="' + m + '" value="' + v + '"></td>';
    }).join('') +
  '</tr>';
}

function invEndingRow(a, vals) {
  return '<tr class="border-b border-pink-light/20 table-row-hover font-bold">' +
    '<td class="px-4 py-2 sticky left-0 bg-white z-10 font-bold text-plum" colspan="2">Ending Inventory</td>' +
    vals.map(function(v) {
      var bg = '';
      if (v === 0) bg = 'background:#FF6B6B18; color:#FF6B6B';
      else if (v < a.safetyStock) bg = 'background:#F4A26118; color:#c47a2a';
      else bg = 'color:#3CB371';
      return '<td class="px-3 py-2 text-right" style="' + bg + '">' + fmtNum(Math.round(v)) + '</td>';
    }).join('') +
  '</tr>';
}

function invAlertRow(alerts) {
  return '<tr class="border-b border-pink-light/20">' +
    '<td class="px-4 py-2 sticky left-0 bg-white z-10 font-medium text-plum/70" colspan="2">Order Alert</td>' +
    alerts.map(function(a) {
      if (a === 'ORDER NOW') return '<td class="px-3 py-2 text-right alert-text alert-order-now">ORDER NOW!</td>';
      if (a === 'ORDER SOON') return '<td class="px-3 py-2 text-right alert-text alert-order-soon">ORDER SOON</td>';
      return '<td class="px-3 py-2 text-right text-plum/30">\u2014</td>';
    }).join('') +
  '</tr>';
}

function onShipmentChange(e) {
  var el = e.target;
  var sku = el.dataset.sku;
  var month = parseInt(el.dataset.month);
  var val = Math.max(0, parseInt(el.value) || 0);
  el.value = val;
  if (!state.shipments[sku]) state.shipments[sku] = new Array(12).fill(0);
  state.shipments[sku][month] = val;
  scheduleRecalc();
}

// ── Financial Summary Table ──
function renderFinancialTable() {
  var f = state.financials;
  var head = document.getElementById('financial-head');
  head.innerHTML = '<tr class="border-b border-pink-light/40 text-left text-plum/60">' +
    '<th class="px-4 py-2.5 font-semibold sticky left-0 bg-white z-10" colspan="2">Line Item</th>' +
    MON_SHORT.map(function(m) { return '<th class="px-3 py-2.5 font-semibold text-right">' + m + '</th>'; }).join('') +
    '<th class="px-3 py-2.5 font-semibold text-right">Total</th>' +
  '</tr>';

  var rows = [
    { label: 'REVENUE', type: 'header' },
    { label: 'DTC Revenue', data: f.dtcRevenue, fmt: '$' },
    { label: 'Wholesale Revenue', data: f.wholesaleRevenue, fmt: '$' },
    { label: 'Total Revenue', data: f.totalRevenue, fmt: '$', bold: true },
    { label: '', type: 'spacer' },
    { label: 'COST OF GOODS SOLD', type: 'header' },
    { label: 'Total Units Sold', data: f.totalUnits, fmt: '#' },
    { label: 'COGS', data: f.cogs, fmt: '$' },
    { label: 'Gross Profit', data: f.grossProfit, fmt: '$', bold: true },
    { label: 'Gross Margin %', data: f.grossMargin, fmt: '%', bold: true },
    { label: '', type: 'spacer' },
    { label: 'CASH FLOW', type: 'header' },
    { label: 'Cash Inflow', data: f.cashInflow, fmt: '$' },
    { label: 'Cash Outflow', data: f.cashOutflow, fmt: '$' },
    { label: 'Net Cash Flow', data: f.netCashFlow, fmt: '$', bold: true },
  ];

  var body = document.getElementById('financial-body');
  body.innerHTML = rows.map(function(r) {
    if (r.type === 'header') {
      return '<tr class="bg-plum text-white"><td class="px-4 py-2.5 font-bold sticky left-0 z-10" style="background:#2E1A2B" colspan="15">' + r.label + '</td></tr>';
    }
    if (r.type === 'spacer') return '<tr class="h-2"></tr>';

    var total = r.data.reduce(function(s, v) { return s + v; }, 0);
    var cls = r.bold ? 'fin-total-row' : 'table-row-hover';
    var stickyBg = r.bold ? 'background:#FCE4EC44' : 'background:#fff';
    var totalDisplay;
    if (r.fmt === '%') {
      var tRev = f.totalRevenue.reduce(function(s, v) { return s + v; }, 0);
      var tGP = f.grossProfit.reduce(function(s, v) { return s + v; }, 0);
      totalDisplay = tRev > 0 ? tGP / tRev : 0;
    } else {
      totalDisplay = total;
    }
    return '<tr class="border-b border-pink-light/20 ' + cls + '">' +
      '<td class="px-4 py-2 font-medium sticky left-0 z-10 ' + (r.bold ? 'font-bold' : '') + '" style="' + stickyBg + '" colspan="2">' + r.label + '</td>' +
      r.data.map(function(v) { return '<td class="px-3 py-2 text-right">' + fmtFinVal(v, r.fmt) + '</td>'; }).join('') +
      '<td class="px-3 py-2 text-right font-bold">' + fmtFinVal(totalDisplay, r.fmt) + '</td>' +
    '</tr>';
  }).join('');
}

function fmtFinVal(v, fmt) {
  if (fmt === '$') return '$' + fmtNum(Math.round(v));
  if (fmt === '%') return (v * 100).toFixed(1) + '%';
  return fmtNum(Math.round(v));
}

// ═══════════════════════════════════════
// CHARTS — Enhanced Animations
// ═══════════════════════════════════════

function renderCharts() {
  renderSawtoothSelect();
  updateSawtoothChart();
  updateRevenueChart();
  updateMarginChart();
}

function renderSawtoothSelect() {
  var sel = document.getElementById('sawtooth-sku-select');
  sel.innerHTML = state.assumptions.map(function(a) {
    return '<option value="' + a.sku + '" ' + (a.sku === selectedSawtoothSku ? 'selected' : '') + '>' + a.sku + ' \u2014 ' + a.name + '</option>';
  }).join('');
  sel.onchange = function() {
    selectedSawtoothSku = sel.value;
    renderRunway();
    updateSawtoothChart();
  };
}

function updateSawtoothChart() {
  var ctx = document.getElementById('sawtooth-chart').getContext('2d');
  var inv = state.inventory[selectedSawtoothSku];
  var a = state.assumptions.find(function(x) { return x.sku === selectedSawtoothSku; });
  if (!inv || !a) return;

  if (sawtoothChart) sawtoothChart.destroy();
  sawtoothChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MON_SHORT,
      datasets: [
        {
          label: 'Ending Inventory',
          data: inv.ending,
          borderColor: COLORS.pink,
          backgroundColor: COLORS.pink + '20',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#fff',
          pointBorderColor: COLORS.pink,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          borderWidth: 3,
        },
        {
          label: 'Safety Stock',
          data: new Array(12).fill(a.safetyStock),
          borderColor: COLORS.red,
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: isFirstRender ? 1500 : 600,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
        tooltip: { backgroundColor: COLORS.plum, titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8 }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#2E1A2B08' }, ticks: { font: { size: 10 }, color: COLORS.plum + '80' } },
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: COLORS.plum + '80' } }
      }
    }
  });
}

function updateRevenueChart() {
  var ctx = document.getElementById('revenue-chart').getContext('2d');
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MON_SHORT,
      datasets: [
        { label: 'DTC Revenue', data: state.financials.dtcRevenue, backgroundColor: COLORS.pink, borderRadius: 6, barPercentage: 0.7 },
        { label: 'Wholesale Revenue', data: state.financials.wholesaleRevenue, backgroundColor: COLORS.plum, borderRadius: 6, barPercentage: 0.7 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: isFirstRender ? 1200 : 500,
        easing: 'easeOutQuart',
        delay: function(context) {
          return isFirstRender ? context.dataIndex * 60 : 0;
        },
      },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
        tooltip: { backgroundColor: COLORS.plum, callbacks: { label: function(c) { return c.dataset.label + ': $' + fmtNum(Math.round(c.raw)); } } }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { stacked: true, grid: { color: '#2E1A2B08' }, ticks: { font: { size: 10 }, callback: function(v) { return '$' + fmtK(v); } } }
      }
    }
  });
}

function updateMarginChart() {
  var ctx = document.getElementById('margin-chart').getContext('2d');
  if (marginChart) marginChart.destroy();

  var data = state.financials.grossMargin.map(function(v) { return +(v * 100).toFixed(1); });
  var minVal = Math.max(0, Math.floor(Math.min.apply(null, data) / 5) * 5 - 5);
  var maxVal = Math.min(100, Math.ceil(Math.max.apply(null, data) / 5) * 5 + 5);

  marginChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MON_SHORT,
      datasets: [{
        label: 'Gross Margin %',
        data: data,
        borderColor: COLORS.green,
        backgroundColor: COLORS.green + '15',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#fff',
        pointBorderColor: COLORS.green,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: isFirstRender ? 1500 : 600,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: COLORS.plum, callbacks: { label: function(c) { return 'Margin: ' + c.raw + '%'; } } }
      },
      scales: {
        y: { min: minVal, max: maxVal, grid: { color: '#2E1A2B08' }, ticks: { font: { size: 10 }, callback: function(v) { return v + '%'; } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });
}

// ═══════════════════════════════════════
// ADD / REMOVE SKU
// ═══════════════════════════════════════

function setupModal() {
  var modal = document.getElementById('add-sku-modal');
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('add-sku-form').addEventListener('submit', onAddSKU);
}

function openModal() {
  var modal = document.getElementById('add-sku-modal');
  modal.classList.add('visible');
  modal.classList.remove('closing');
  document.getElementById('add-sku-form').reset();
  var form = document.getElementById('add-sku-form');
  form.elements.leadTime.value = 3;
  form.elements.moq.value = 50;
}

function closeModal() {
  var modal = document.getElementById('add-sku-modal');
  modal.classList.add('closing');
  setTimeout(function() {
    modal.classList.remove('visible', 'closing');
  }, 300);
}

function onAddSKU(e) {
  e.preventDefault();
  var form = e.target;

  var existingNums = state.assumptions.map(function(a) {
    var m = a.sku.match(/SKU(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  var nextNum = Math.max.apply(null, [0].concat(existingNums)) + 1;
  var skuId = 'SKU' + String(nextNum).padStart(3, '0');

  var newSku = {
    sku: skuId,
    name: form.elements.name.value.trim(),
    unitCost: parseFloat(form.elements.unitCost.value) || 0,
    dtcPrice: parseFloat(form.elements.dtcPrice.value) || 0,
    wholesalePrice: parseFloat(form.elements.wholesalePrice.value) || 0,
    leadTime: parseInt(form.elements.leadTime.value) || 3,
    safetyStock: parseInt(form.elements.safetyStock.value) || 0,
    currentInventory: parseInt(form.elements.currentInventory.value) || 0,
    moq: parseInt(form.elements.moq.value) || 50,
  };

  state.assumptions.push(newSku);
  state.dtcSales[skuId] = new Array(12).fill(0);
  state.wholesale[skuId] = { 'Company X': new Array(12).fill(0), 'Company Y': new Array(12).fill(0) };
  state.shipments[skuId] = new Array(12).fill(0);

  closeModal();
  recalcAll();
  saveToLocalStorage();
  showToast(skuId + ' added successfully', 'success');
}

function removeSKU(skuId) {
  if (state.assumptions.length <= 1) return;
  if (!confirm('Remove ' + skuId + '? This cannot be undone.')) return;

  state.assumptions = state.assumptions.filter(function(a) { return a.sku !== skuId; });
  delete state.dtcSales[skuId];
  delete state.wholesale[skuId];
  delete state.shipments[skuId];

  if (selectedSawtoothSku === skuId) {
    selectedSawtoothSku = state.assumptions[0] ? state.assumptions[0].sku : 'SKU001';
  }

  recalcAll();
  saveToLocalStorage();
  showToast(skuId + ' removed', 'info');
}

// ═══════════════════════════════════════
// RESET
// ═══════════════════════════════════════

function resetData() {
  if (!originalState) return;
  if (!confirm('Reset all changes to the original Excel data? This clears all saved edits.')) return;

  state.assumptions = JSON.parse(JSON.stringify(originalState.assumptions));
  state.dtcSales = JSON.parse(JSON.stringify(originalState.dtcSales));
  state.wholesale = JSON.parse(JSON.stringify(originalState.wholesale));
  state.shipments = JSON.parse(JSON.stringify(originalState.shipments));

  localStorage.removeItem(LS_KEY);
  updatePersistenceStatus(false);

  selectedSawtoothSku = state.assumptions[0] ? state.assumptions[0].sku : 'SKU001';
  recalcAll();
  showToast('Reset to original data', 'info');
}

// ═══════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════

function exportExcel() {
  var wb = XLSX.utils.book_new();

  var assData = [
    ['SKU MASTER DATA'],
    ['Product costs, pricing, and inventory parameters'],
    [],
    ['SKU ID', 'Product Name', 'Unit Cost', 'DTC Price', 'Wholesale Price', 'Lead Time (Mo)', 'Safety Stock', 'Current Inventory', 'MOQ'],
  ];
  state.assumptions.forEach(function(a) {
    assData.push([a.sku, a.name, a.unitCost, a.dtcPrice, a.wholesalePrice, a.leadTime, a.safetyStock, a.currentInventory, a.moq]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(assData), 'Assumptions');

  var demData = [
    ['DEMAND FORECAST'],
    ['12-month sales projections by channel'],
    [],
    ['DTC / ONLINE SALES'],
    ['SKU', 'Channel'].concat(MONTHS),
  ];
  state.assumptions.forEach(function(a) {
    demData.push([a.sku, 'DTC'].concat(state.dtcSales[a.sku] || new Array(12).fill(0)));
  });
  demData.push([]);
  demData.push(['RETAIL / WHOLESALE ORDERS']);
  demData.push(['SKU', 'Channel'].concat(MONTHS));
  state.assumptions.forEach(function(a) {
    var ws = state.wholesale[a.sku];
    if (ws) Object.entries(ws).forEach(function(entry) {
      demData.push([a.sku, entry[0]].concat(entry[1]));
    });
  });
  demData.push([]);
  demData.push(['TOTAL DEMAND (ALL CHANNELS)']);
  demData.push(['SKU', ''].concat(MONTHS));
  state.assumptions.forEach(function(a) {
    demData.push([a.sku, 'TOTAL'].concat(state.totalDemand[a.sku]));
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(demData), 'Demand Forecast');

  var invData = [
    ['INVENTORY MODEL'],
    ['Real-time inventory tracking with lead-time-aware reorder alerts'],
    [],
    ['SKU', 'Metric'].concat(MONTHS, ['Status']),
  ];
  state.assumptions.forEach(function(a) {
    var inv = state.inventory[a.sku];
    if (!inv) return;
    invData.push([a.sku, 'Beginning Inventory'].concat(inv.beginning));
    invData.push(['', 'Gross Sales'].concat(inv.grossSales));
    invData.push(['', 'Net Position'].concat(inv.netPosition));
    invData.push(['', 'Incoming Shipments'].concat(inv.incoming));
    var hasZero = inv.ending.some(function(v) { return v === 0; });
    invData.push(['', 'Ending Inventory'].concat(inv.ending, [hasZero ? 'REORDER NOW' : '']));
    invData.push(['', 'Months of Supply'].concat(inv.monthsOfSupply.map(function(v) { return v === -1 ? '-' : v >= 999 ? 'INF' : +v.toFixed(1); })));
    invData.push(['', 'Order Alert'].concat(inv.alerts));
    invData.push(['', 'Order Qty Needed'].concat(inv.orderQty.map(function(v) { return v > 0 ? v : ''; })));
    invData.push([]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(invData), 'Inventory Model');

  var f = state.financials;
  var finData = [
    ['FINANCIAL SUMMARY'],
    ['Monthly revenue, costs, margins, and cash flow'],
    [],
    ['REVENUE'],
    ['Line Item', 'Description'].concat(MONTHS),
    ['DTC Revenue', '(units x DTC price)'].concat(f.dtcRevenue),
    ['Wholesale Revenue', '(units x wholesale price)'].concat(f.wholesaleRevenue),
    ['Total Revenue', ''].concat(f.totalRevenue),
    [],
    ['COST OF GOODS SOLD'],
    ['Line Item', 'Description'].concat(MONTHS),
    ['Total Units Sold', '(all channels)'].concat(f.totalUnits),
    ['COGS', '(units x unit cost)'].concat(f.cogs),
    ['Gross Profit', ''].concat(f.grossProfit),
    ['Gross Margin %', ''].concat(f.grossMargin),
    [],
    ['CASH FLOW'],
    ['Line Item', 'Description'].concat(MONTHS),
    ['Cash Inflow', '(from sales)'].concat(f.cashInflow),
    ['Cash Outflow', '(inventory purchases)'].concat(f.cashOutflow),
    ['Net Cash Flow', ''].concat(f.netCashFlow),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(finData), 'Financial Summary');

  XLSX.writeFile(wb, 'ClubGirlGolf_Updated.xlsx');
  showToast('Excel exported', 'success');
}

// ═══════════════════════════════════════
// ACCORDION — Smooth height transitions
// ═══════════════════════════════════════

function setupAccordions() {
  document.querySelectorAll('.accordion-toggle').forEach(function(btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function() {
      var target = document.getElementById(btn.dataset.target);
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));

      if (expanded) {
        target.classList.remove('open');
      } else {
        target.classList.add('open');
      }
    });
  });
}

// ═══════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════

function fmtNum(n) {
  if (typeof n === 'string') return n;
  return Number(n).toLocaleString('en-US');
}

function fmtK(n) {
  var abs = Math.abs(n);
  if (abs >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (n / 1000).toFixed(0) + 'K';
  return fmtNum(Math.round(n));
}
