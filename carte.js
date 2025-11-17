/*
  Script pour gérer les cartes interactives.
  Code réécrit proprement, commentaires simples.
*/

// Chemin vers la carte SVG
const svgFile = "./france2016Low.svg";

// Tooltip général
const tooltip = document.getElementById("tooltip");

// Données (tabac/vape)
const mapDataUrl = "./data.json";

// États de chaque carte (année + mode)
const mapStates = {
  map2021: { year: "2021", mode: "tabac" },
  map2023: { year: "2023", mode: "tabac" }
};

// Stockage des données JSON
let mapData = null;

/* 
  Couleurs pour tabac et vape.
  Le principe : plus c’est élevé, plus c’est foncé.
*/
const palettes = {
  tabac: [
    { threshold: 0, color: "#222" },
    { threshold: 20, color: "#3a1008" },
    { threshold: 23, color: "#5c1a0f" },
    { threshold: 26, color: "#7e2416" },
    { threshold: 28, color: "#a02e1d" },
    { threshold: 30, color: "#c23824" }
  ],
  vape: [
    { threshold: 0, color: "#222" },
    { threshold: 3, color: "#0a1e2a" },
    { threshold: 5, color: "#0f3d55" },
    { threshold: 6, color: "#145c80" },
    { threshold: 7, color: "#197baa" },
    { threshold: 8, color: "#1e9ad5" }
  ]
};

/*
  Correspondance entre les codes du SVG et les noms des régions
  (le JSON utilise les noms exacts)
*/
const regionMap = {
  "FR-IDF": "Île-de-France",
  "FR-HDF": "Hauts-de-France",
  "FR-NOR": "Normandie",
  "FR-BRE": "Bretagne",
  "FR-GES": "Grand-Est",
  "FR-PDL": "Pays-de-la-Loire",
  "FR-CVL": "Centre-Val-de-Loire",
  "FR-BFC": "Bourgogne-Franche-Comté",
  "FR-NAQ": "Nouvelle-Aquitaine",
  "FR-ARA": "Auvergne-Rhône-Alpes",
  "FR-OCC": "Occitanie",
  "FR-PAC": "Provence-Alpes-Côte d'Azur",
  "FR-COR": "Corse"
};


/* 
  Retourne la bonne couleur selon la valeur.
*/
function getColor(value, mode) {
  if (value === null || value === undefined) return "#444";
  const palette = palettes[mode];
  for (let i = palette.length - 1; i >= 0; i--) {
    if (value >= palette[i].threshold) return palette[i].color;
  }
  return palette[0].color;
}

/*
  Tooltip simple : affichage + position
*/
function showTooltip(e, content) {
  tooltip.style.display = "block";
  tooltip.innerHTML = content;
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY - 10 + "px";
}

function hideTooltip() {
  tooltip.style.display = "none";
}

/*
  Applique les couleurs en fonction des données
*/
function updateMapColors(mapId) {
  const container = document.querySelector(`#${mapId} .map__image`);
  const { year, mode } = mapStates[mapId];
  const yearData = mapData[year];

  container.querySelectorAll(".region").forEach(region => {
    const code = region.getAttribute("id");
    const name = regionMap[code];
    const value = yearData[name]?.[mode];
    region.style.fill = getColor(value, mode);
  });
}

/*
  Affiche le SVG si ce n'est pas déjà fait
*/
function renderMap(mapId) {
  const container = document.querySelector(`#${mapId} .map__image`);
  const { year, mode } = mapStates[mapId];
  const yearData = mapData[year];

  if (!container.dataset.loaded) {
    fetch(svgFile)
      .then(res => res.text())
      .then(svg => {
        container.innerHTML = svg;
        container.dataset.loaded = "true";

        const regions = container.querySelectorAll("path, polygon");

        regions.forEach(region => {
          region.classList.add("region");

          const code = region.getAttribute("id");
          const name = regionMap[code];

          // Survol : tooltip
          region.addEventListener("mousemove", e => {
            const data = yearData[name];
            const value = data?.[mode];
            showTooltip(
              e,
              `<strong>${name}</strong><br>${year} — ${mode === "tabac" ? "Tabac" : "Vape"} : ${
                value != null ? value + "%" : "N/A"
              }`
            );
          });

          region.addEventListener("mouseleave", hideTooltip);

          // Effet highlight
          region.addEventListener("mouseenter", () => {
            regions.forEach(r => (r.style.opacity = 0.4));
            region.style.opacity = 1;
          });

          region.addEventListener("mouseleave", () => {
            regions.forEach(r => (r.style.opacity = 1));
          });
        });

        updateMapColors(mapId);
      });
  } else {
    updateMapColors(mapId);
  }
}

/*
  Gestion des boutons Tabac / Vape
*/
function setupControls() {
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const mapId = e.target.dataset.map;
      const mode = e.target.dataset.mode;

      mapStates[mapId].mode = mode;

      const parent = e.target.parentElement;
      parent.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");

      renderMap(mapId);
    });
  });
}

/*
  Petite légende simple
*/
function createLegend() {
  document.querySelectorAll(".map-wrapper").forEach(wrapper => {
    if (wrapper.querySelector(".map-legend")) return;

    const legend = document.createElement("div");
    legend.className = "map-legend";
    legend.style.marginTop = "15px";
    legend.style.fontSize = "0.9rem";

    legend.innerHTML = `
      <div style="display:flex; gap:10px; justify-content:center;">
        <span><span style="display:inline-block;width:15px;height:15px;background:#222"></span> Faible</span>
        <span><span style="display:inline-block;width:15px;height:15px;background:#7e2416"></span> Moyen</span>
        <span><span style="display:inline-block;width:15px;height:15px;background:#c23824"></span> Élevé</span>
      </div>
    `;

    wrapper.appendChild(legend);
  });
}

/*
  Initialisation générale
*/
async function initMaps() {
  mapData = await fetch(mapDataUrl).then(r => r.json());

  setupControls();
  createLegend();

  renderMap("map2021");
  renderMap("map2023");
}

document.addEventListener("DOMContentLoaded", initMaps);
