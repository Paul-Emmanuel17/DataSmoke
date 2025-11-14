// CONFIGURATION
const svgFile = "france2016Low.svg";
const tooltip = document.getElementById('tooltip');
const mapDataUrl = './data.json';

// État global des deux cartes
const mapStates = {
  map1: { year: '2023', mode: 'tabac' },
  map2: { year: '2021', mode: 'tabac' }
};

// Données chargées depuis le JSON
let mapData = null;

// PALETTES DE COULEURS
const palettes = {
  tabac: [
    { threshold: 0, color: '#222222' },
    { threshold: 20, color: '#3a1008' },
    { threshold: 23, color: '#5c1a0f' },
    { threshold: 26, color: '#7e2416' },
    { threshold: 28, color: '#a02e1d' },
    { threshold: 30, color: '#c23824' }
  ],
  vape: [
    { threshold: 0, color: '#222222' },
    { threshold: 3, color: '#0a1e2a' },
    { threshold: 5, color: '#0f3d55' },
    { threshold: 6, color: '#145c80' },
    { threshold: 7, color: '#197baa' },
    { threshold: 8, color: '#1e9ad5' }
  ]
};

// UTILITAIRES
function getColor(value, mode) {
  if (value === null || value === undefined || isNaN(value)) return '#444444';
  const palette = palettes[mode];
  for (let i = palette.length - 1; i >= 0; i--) {
    if (value >= palette[i].threshold) return palette[i].color;
  }
  return palette[0].color;
}

function getName(region) {
  return region.getAttribute("data-name") || region.id || "Région";
}

function showTooltip(e, content) {
  if (!tooltip) return;
  tooltip.style.display = "block";
  tooltip.innerHTML = content;
  tooltip.style.left = (e.pageX + 10) + "px";
  tooltip.style.top = (e.pageY - 10) + "px";
}

function hideTooltip() {
  if (!tooltip) return;
  tooltip.style.display = "none";
}

// CHARGEMENT DES DONNÉES
async function loadMapData() {
  try {
    const response = await fetch(`${mapDataUrl}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Erreur chargement map-data.json');
    mapData = await response.json();
    return mapData;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return null;
  }
}

// CRÉATION/MISE À JOUR D'UNE CARTE
function renderMap(mapId) {
  const container = document.querySelector(`#${mapId} .map__image`);
  const { year, mode } = mapStates[mapId];
  const yearData = mapData[year];
  
  if (!container || !yearData) {
    console.error(`Données ou conteneur manquant pour ${mapId}`);
    return;
  }

  // Si la carte n'existe pas encore, la créer
  if (!container.dataset.loaded) {
    return fetch(svgFile)
      .then(res => res.text())
      .then(svg => {
        container.innerHTML = svg;
        container.dataset.loaded = 'true';
        const regions = container.querySelectorAll("path, polygon");
        
        regions.forEach(region => {
          region.classList.add("region");
          const name = getName(region);
          
          // Tooltip
          region.addEventListener("mousemove", e => {
            const data = yearData[name] || {};
            const value = data[mode];
            let content = `<strong>${name}</strong><br>${year} - `;
            content += mode === 'tabac' ? 'Tabac : ' : 'Cigarette électronique : ';
            content += value !== null && value !== undefined ? `${value}%` : 'N/A';
            showTooltip(e, content);
          });
          
          region.addEventListener("mouseleave", hideTooltip);
        });
        
        updateMapColors(mapId);
      })
      .catch(err => console.error("Erreur de chargement de la carte:", err));
  } else {
    // Sinon, juste mettre à jour les couleurs
    updateMapColors(mapId);
  }
}

function updateMapColors(mapId) {
  const container = document.querySelector(`#${mapId} .map__image`);
  const { year, mode } = mapStates[mapId];
  const yearData = mapData[year];
  
  if (!container || !yearData) return;
  
  const regions = container.querySelectorAll(".region");
  regions.forEach(region => {
    const name = getName(region);
    const value = yearData[name]?.[mode];
    region.style.fill = getColor(value, mode);
    region.style.transition = "fill 0.4s ease";
  });
}

// GESTIONNAIRE D'ÉVÉNEMENTS
function setupControls() {
  // Sélecteurs d'année
  document.querySelectorAll('.year-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const mapId = e.target.dataset.map;
      mapStates[mapId].year = e.target.value;
      renderMap(mapId);
    });
  });
  
  // Boutons Tabac/Vape
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mapId = e.target.dataset.map;
      const mode = e.target.dataset.mode;
      
      // Mettre à jour l'état
      mapStates[mapId].mode = mode;
      
      // Mettre à jour les classes actives
      const parent = e.target.parentElement;
      parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Mettre à jour la carte
      renderMap(mapId);
    });
  });
}

// INITIALISATION
async function initMaps() {
  await loadMapData();
  if (!mapData) return;
  
  setupControls();
  
  // Rendre les deux cartes initiales
  Promise.all([
    renderMap('map1'),
    renderMap('map2')
  ]);
}

// LANCER QUAND LE DOM EST PRÊT
document.addEventListener('DOMContentLoaded', initMaps);