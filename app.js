/* ===== Update Time ===== */
function updateTime() {
  const el = document.getElementById('update-time');
  if (!el) return;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  el.textContent = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} 更新`;
}
updateTime();
setInterval(updateTime, 1000);

/* ===== Sparkline Charts ===== */
function drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || canvas.width;
  const h = canvas.height;
  canvas.width = w;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  ctx.clearRect(0, 0, w, h);

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// Demo sparkline data
const nikkeiData = [37800, 38050, 37920, 38200, 38100, 38300, 38187, 38421];
const topixData  = [2680, 2692, 2685, 2700, 2696, 2708, 2694, 2712];
const dowData    = [43900, 44100, 43950, 44050, 43980, 44020, 43997, 43840];
const nasdaqData = [19350, 19400, 19280, 19320, 19250, 19300, 19303, 19204];

drawSparkline('chart-nikkei',  nikkeiData,  '#4ade80');
drawSparkline('chart-topix',   topixData,   '#4ade80');
drawSparkline('chart-dow',     dowData,     '#f87171');
drawSparkline('chart-nasdaq',  nasdaqData,  '#f87171');

window.addEventListener('resize', () => {
  drawSparkline('chart-nikkei',  nikkeiData,  '#4ade80');
  drawSparkline('chart-topix',   topixData,   '#4ade80');
  drawSparkline('chart-dow',     dowData,     '#f87171');
  drawSparkline('chart-nasdaq',  nasdaqData,  '#f87171');
});

/* ===== GDP Bar Chart ===== */
const gdpData = [
  { country: '日本',  value: 1.9,  color: '#4ade80' },
  { country: '米国',  value: 2.3,  color: '#60a5fa' },
  { country: 'EU',    value: 0.9,  color: '#a78bfa' },
  { country: '中国',  value: 5.0,  color: '#f87171' },
  { country: '英国',  value: 1.1,  color: '#fb923c' },
  { country: 'インド',value: 6.8,  color: '#facc15' },
];

function buildBarChart() {
  const container = document.getElementById('gdp-bar-chart');
  if (!container) return;
  container.innerHTML = '';

  const maxVal = Math.max(...gdpData.map(d => d.value));
  const chartH = container.offsetHeight || 220;

  gdpData.forEach(item => {
    const heightPct = (item.value / maxVal) * 85;
    const group = document.createElement('div');
    group.className = 'bar-group';

    group.innerHTML = `
      <div class="bar-value">${item.value > 0 ? '+' : ''}${item.value}%</div>
      <div class="bar-wrapper">
        <div class="bar" style="height:${heightPct}%;background:${item.color};" title="${item.country}: ${item.value}%"></div>
      </div>
      <div class="bar-label">${item.country}</div>
    `;
    container.appendChild(group);
  });
}
buildBarChart();
window.addEventListener('resize', buildBarChart);

/* ===== Simulated Ticker Updates ===== */
const markets = [
  {
    valId: 'nikkei-val', chgId: 'nikkei-chg', cardId: 'nikkei-card',
    base: 38421.50, tick: 15, data: nikkeiData, chartId: 'chart-nikkei', upColor: '#4ade80', downColor: '#f87171'
  },
  {
    valId: 'topix-val', chgId: 'topix-chg', cardId: 'topix-card',
    base: 2712.38, tick: 1, data: topixData, chartId: 'chart-topix', upColor: '#4ade80', downColor: '#f87171'
  },
  {
    valId: 'dow-val', chgId: 'dow-chg', cardId: 'dow-card',
    base: 43840.30, tick: 20, data: dowData, chartId: 'chart-dow', upColor: '#4ade80', downColor: '#f87171'
  },
  {
    valId: 'nasdaq-val', chgId: 'nasdaq-chg', cardId: 'nasdaq-card',
    base: 19204.67, tick: 10, data: nasdaqData, chartId: 'chart-nasdaq', upColor: '#4ade80', downColor: '#f87171'
  },
];

const fmt = (n) => n.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function tickMarkets() {
  markets.forEach(m => {
    const delta = (Math.random() - 0.5) * m.tick;
    m.base += delta;
    const sign = delta >= 0 ? '+' : '';
    const pct = ((delta / (m.base - delta)) * 100).toFixed(2);

    const valEl = document.getElementById(m.valId);
    const chgEl = document.getElementById(m.chgId);
    if (!valEl || !chgEl) return;

    valEl.textContent = fmt(m.base);
    chgEl.textContent = `${sign}${fmt(delta)} (${sign}${pct}%)`;
    chgEl.className = `market-change ${delta >= 0 ? 'positive' : 'negative'}`;

    // Update sparkline data
    m.data.push(m.base);
    if (m.data.length > 20) m.data.shift();
    const color = delta >= 0 ? m.upColor : m.downColor;
    drawSparkline(m.chartId, m.data, color);

    // Flash effect
    valEl.style.transition = 'color .2s';
    valEl.style.color = delta >= 0 ? '#4ade80' : '#f87171';
    setTimeout(() => { valEl.style.color = ''; }, 400);
  });
}

setInterval(tickMarkets, 3000);

/* ===== Smooth scroll for nav links ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
