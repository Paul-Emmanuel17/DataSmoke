// Fichier SVG
const svgFile = "france2016Low.svg";

// Tooltip général
const tooltip = document.getElementById("tooltip");

// Données JSON
const mapDataUrl = "data.json";

// Années disponibles (celles qui ont une carte)
const availableYears = ["2014", "2017", "2021", "2023", "2024"];

// États initiaux
const mapStates = {
    mapA: { year: "2021", mode: "tabac" },
    mapB: { year: "2024", mode: "tabac" }
};

let mapData = null;

/* Couleurs tabac/vape */
const palettes = {
    tabac: [
        { threshold: 0, color: "#222222ff" },
        { threshold: 20, color: "#3a1008" },
        { threshold: 23, color: "#5c1a0f" },
        { threshold: 26, color: "#7e2416" },
        { threshold: 28, color: "#a02e1d" },
        { threshold: 30, color: "#c23824" }
    ],
    vape: [
        { threshold: 0, color: "#222222ff" },
        { threshold: 3, color: "#0a1e2a" },
        { threshold: 5, color: "#0f3d55" },
        { threshold: 6, color: "#145c80" },
        { threshold: 7, color: "#197baa" },
        { threshold: 8, color: "#1e9ad5" }
    ]
};

/* Région → nom */
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

/* Couleur selon valeur */
function getColor(value, mode) {
    if (value === null || value === undefined) return "#e1e1e1ff";
    const palette = palettes[mode];
    for (let i = palette.length - 1; i >= 0; i--) {
        if (value >= palette[i].threshold) return palette[i].color;
    }
    return palette[0].color;
}

/* Tooltip */
function showTooltip(e, content) {
    tooltip.style.display = "block";
    tooltip.innerHTML = content;
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY - 20 + "px";
}
function hideTooltip() { tooltip.style.display = "none"; }

/* Actualise la carte */
function updateMapColors(mapId) {
    const container = document.querySelector(`#${mapId}`);
    const { year, mode } = mapStates[mapId];
    const data = mapData[year];

    container.querySelectorAll(".region").forEach(region => {
        const regionName = regionMap[region.id];
        const value = data[regionName]?.[mode];
        region.style.fill = getColor(value, mode);
    });
}


/* Légende */
function updateLegend(mapId) {
    const wrapper = document.querySelector(`#${mapId}`).closest(".map-wrapper");
    const mode = mapStates[mapId].mode;
    const palette = palettes[mode];

    wrapper.querySelector(".legend-low").style.background = palette[0].color;
    wrapper.querySelector(".legend-mid").style.background = palette[3].color;
    wrapper.querySelector(".legend-high").style.background = palette[palette.length - 1].color;
}

/* Désactiver vape si absent */
function refreshVapeButton(mapId) {
    const wrapper = document.querySelector(`#${mapId}`).closest(".map-wrapper");
    const vapeBtn = wrapper.querySelector('[data-mode="vape"]');
    const year = mapStates[mapId].year;

    const hasVape = Object.values(mapData[year]).some(r => r.vape !== undefined);

    if (!hasVape) vapeBtn.classList.add("disabled");
    else vapeBtn.classList.remove("disabled");
}

/* Injecte la carte et ajoute les events */
function renderMap(mapId) {
    const container = document.querySelector(`#${mapId}`);

    if (!container.dataset.loaded) {
        fetch(svgFile)
            .then(res => res.text())
            .then(svg => {
                container.innerHTML = svg;
                container.dataset.loaded = "true";

                const regions = container.querySelectorAll("path, polygon");

                regions.forEach(region => {
                    region.classList.add("region");

                    region.addEventListener("mousemove", e => {
                        const { year, mode } = mapStates[mapId];
                        const regionData = mapData[year][regionMap[region.id]];
                        const value = regionData?.[mode];

                        showTooltip(e,
                            `<strong>${regionMap[region.id]}</strong><br>${year} — ${
                                mode === "tabac" ? "Tabac" : "Vape"
                            } : ${value != null ? value + "%" : "N/A"}`
                        );
                    });

                    region.addEventListener("mouseleave", hideTooltip);
                });

                updateMapColors(mapId);
                updateLegend(mapId);
            });
    } else {
        updateMapColors(mapId);
        updateLegend(mapId);
    }
}

/* Boutons tabac / vape */
function setupModeButtons() {
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            if (btn.classList.contains("disabled")) return;

            const mapId = btn.dataset.map;
            const mode = btn.dataset.mode;

            mapStates[mapId].mode = mode;

            const parent = btn.parentElement;
            parent.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            renderMap(mapId);
        });
    });
}

/* Select d'année */
function setupYearSelectors() {
    document.querySelectorAll(".year-select").forEach(select => {
        select.addEventListener("change", () => {
            const mapId = select.dataset.map;
            mapStates[mapId].year = select.value;

            refreshVapeButton(mapId);
            renderMap(mapId);
        });
    });
}

/* Init */
async function initMaps() {
    mapData = await fetch(mapDataUrl).then(r => r.json());

    setupModeButtons();
    setupYearSelectors();

    refreshVapeButton("mapA");
    refreshVapeButton("mapB");

    renderMap("mapA");
    renderMap("mapB");
}

document.addEventListener("DOMContentLoaded", initMaps);
