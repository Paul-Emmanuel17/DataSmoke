const DATA_URL = './data.json';

let DATA = null;

async function loadData() {
  const url = `${DATA_URL}?v=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Échec chargement ${url} (${res.status})`);
  const json = await res.json();

  const keys = ['annees','tabac','ecig','ages','tabacQ','ecigQ'];
  keys.forEach(k => { if (!json[k]) throw new Error(`Clé manquante: ${k}`); });

  DATA = json;
  return DATA;
}

const css = getComputedStyle(document.documentElement);
const cRouge  = css.getPropertyValue('--rouge').trim()  || '#9B2C2C';
const cOr     = css.getPropertyValue('--or').trim()     || '#C88C3B';
const cViolet = css.getPropertyValue('--violet').trim() || '#7A77FF';

const config = {
  responsive: false,
  displaylogo: false,
  toImageButtonOptions: { format: 'png', filename: 'data_smoke' }
};

function ensureWrap(containerId) {
  const chart = document.getElementById(containerId);
  if (!chart) return null;

  if (chart.parentElement && chart.parentElement.classList.contains('chart-wrap')) {
    return chart.parentElement;
  }

  const wrap = document.createElement('div');
  wrap.className = 'chart-wrap';
  wrap.style.display = 'block';
  wrap.style.width = 'max-content';
  wrap.style.margin = '0 auto';

  chart.parentElement.insertBefore(wrap, chart);
  wrap.appendChild(chart);

  return wrap;
}

function syncWrapWidth(containerId) {
  const chart = document.getElementById(containerId);
  if (!chart) return;
  const wrap = ensureWrap(containerId);
  const plotRoot = chart.querySelector('.js-plotly-plot');
  if (!plotRoot) return;

  const w = Math.round(plotRoot.getBoundingClientRect().width);
  if (w > 0) {
    wrap.style.width = w + 'px';
    wrap.style.marginLeft = 'auto';
    wrap.style.marginRight = 'auto';
  }

  plotRoot.style.display = 'block';
  plotRoot.style.margin = '0 auto';
}

function targetSizeFor(containerId) {
  const el = document.getElementById(containerId);
  const panel = el?.closest('.panel') ?? document.body;
  const panelW = Math.max(0, panel.clientWidth);
  const width  = Math.min(900, Math.max(320, Math.floor(panelW * 0.9)));
  const height = 420;
  return { width, height };
}

function baseLayout({ width, height }) {
  return {
    paper_bgcolor: '#fff',
    plot_bgcolor: '#fff',
    margin: { l: 60, r: 60, t: 10, b: 50 },
    width, height,
    font: { family: 'Lora,Georgia,serif', color: '#161616', size: 14 },
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.18 },
    xaxis: { automargin: true, showgrid: false, showline: true, linecolor: cRouge, zeroline: false },
    yaxis: { automargin: true, showgrid: false, showline: true, linecolor: cRouge, zeroline: false }
  };
}

function drawEvolution(d) {
  ensureWrap('chart-evolution');
  const { width, height } = targetSizeFor('chart-evolution');

  const t1 = {
    name: 'Tabagisme quotidien',
    x: d.annees, y: d.tabac, type: 'scatter', mode: 'lines+markers',
    line: { color: cOr, width: 3, shape: 'spline', smoothing: 0.6 },
    marker: { color: cOr, size: 8 }
  };
  const t2 = {
    name: 'E-cigarette – usage quotidien',
    x: d.annees, y: d.ecig, type: 'scatter', mode: 'lines+markers',
    line: { color: cViolet, width: 3, shape: 'spline', smoothing: 0.6 },
    marker: { color: cViolet, size: 8 }
  };

  const layout = baseLayout({ width, height });
  layout.yaxis = { ...layout.yaxis, title: 'Part (%)', range: [0, 30], tickformat: ',.0f' };

  return Plotly.newPlot('chart-evolution', [t1, t2], layout, config)
    .then(() => syncWrapWidth('chart-evolution'));
}

function drawAge(d) {
  ensureWrap('chart-age');
  const { width, height } = targetSizeFor('chart-age');

  const b1 = { name: 'Tabac – quotidien 2023', x: d.ages, y: d.tabacQ, type: 'bar', marker: { color: cOr } };
  const b2 = { name: 'E-cig – quotidien 2023', x: d.ages, y: d.ecigQ, type: 'bar', marker: { color: cViolet } };

  const layout = baseLayout({ width, height });
  layout.barmode = 'group';
  layout.yaxis = { ...layout.yaxis, title: 'Part (%)', range: [0, 35], tickformat: ',.0f' };

  return Plotly.newPlot('chart-age', [b1, b2], layout, config)
    .then(() => syncWrapWidth('chart-age'));
}

async function init() {
  try {
    await loadData();
    await Promise.all([ drawEvolution(DATA), drawAge(DATA) ]);
  } catch (err) {
    console.error('Erreur au chargement des données:', err);
    alert('Impossible de charger les données (data.json). Vérifie le fichier et son emplacement.');
  }
}
init();

let raf;
window.addEventListener('resize', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    if (!DATA) return;
    const eSize = targetSizeFor('chart-evolution');
    const aSize = targetSizeFor('chart-age');
    Promise.all([
      Plotly.relayout('chart-evolution', { width: eSize.width, height: eSize.height }),
      Plotly.relayout('chart-age',       { width: aSize.width, height: aSize.height })
    ]).then(() => {
      syncWrapWidth('chart-evolution');
      syncWrapWidth('chart-age');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('toggle-mentions');
  const content = document.getElementById('mentions-content');
  if (!trigger || !content) return;
  content.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    content.hidden = open;
  });
});