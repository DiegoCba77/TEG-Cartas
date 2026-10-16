/* ═══════════════════════════════════════════════════════
   T.E.G. CARTAS — Mini Mapa Geopolítico de Referencia
   SVG interactivo de los 40 territorios con colores de jugadores
   ═══════════════════════════════════════════════════════ */

'use strict';

const MINI_TERRITORIES = [
  // === AMÉRICA DEL NORTE (9) ===
  { id: 'ALASKA', name: 'Alaska', d: 'M 16,28 L 40,24 L 42,48 L 18,52 Z' },
  { id: 'YUKON', name: 'Yukón', d: 'M 43,24 L 66,20 L 68,46 L 44,48 Z' },
  { id: 'CANADA', name: 'Canadá', d: 'M 69,20 L 105,18 L 100,44 L 71,46 Z' },
  { id: 'GROENLANDIA', name: 'Groenlandia', d: 'M 110,10 L 138,8 L 134,30 L 108,26 Z' },
  { id: 'OREGON', name: 'Oregón', d: 'M 30,52 L 56,50 L 58,72 L 32,74 Z' },
  { id: 'NUEVA_YORK', name: 'Nueva York', d: 'M 60,48 L 94,45 L 92,70 L 61,72 Z' },
  { id: 'TERRANOVA', name: 'Terranova', d: 'M 102,36 L 122,34 L 118,54 L 100,56 Z' },
  { id: 'CALIFORNIA', name: 'California', d: 'M 36,76 L 62,74 L 64,98 L 38,100 Z' },
  { id: 'MEXICO', name: 'México', d: 'M 66,74 L 90,72 L 86,104 L 66,102 Z' },

  // === AMÉRICA DEL SUR (6) ===
  { id: 'COLOMBIA', name: 'Colombia', d: 'M 78,110 L 105,108 L 102,130 L 76,128 Z' },
  { id: 'PERU', name: 'Perú', d: 'M 72,132 L 96,132 L 92,160 L 70,158 Z' },
  { id: 'BRASIL', name: 'Brasil', d: 'M 104,112 L 140,118 L 136,162 L 98,158 Z' },
  { id: 'CHILE', name: 'Chile', d: 'M 68,162 L 82,162 L 78,218 L 66,216 Z' },
  { id: 'ARGENTINA', name: 'Argentina', d: 'M 84,162 L 108,162 L 98,222 L 80,218 Z' },
  { id: 'URUGUAY', name: 'Uruguay', d: 'M 106,162 L 124,162 L 120,185 L 104,185 Z' },

  // === EUROPA (9) ===
  { id: 'ISLANDIA', name: 'Islandia', d: 'M 150,15 L 170,14 L 168,29 L 148,30 Z' },
  { id: 'GRAN_BRETANA', name: 'Gran Bretaña', d: 'M 158,42 L 178,40 L 175,64 L 156,66 Z' },
  { id: 'ESPANIA', name: 'España', d: 'M 154,76 L 178,74 L 174,100 L 152,100 Z' },
  { id: 'FRANCIA', name: 'Francia', d: 'M 180,66 L 202,64 L 198,88 L 178,90 Z' },
  { id: 'ALEMANIA', name: 'Alemania', d: 'M 200,52 L 222,50 L 218,74 L 198,76 Z' },
  { id: 'ITALIA', name: 'Italia', d: 'M 198,86 L 214,84 L 210,105 L 196,104 Z' },
  { id: 'POLONIA', name: 'Polonia', d: 'M 222,48 L 246,46 L 242,74 L 220,75 Z' },
  { id: 'SUECIA', name: 'Suecia', d: 'M 198,18 L 220,16 L 218,44 L 196,46 Z' },
  { id: 'RUSIA', name: 'Rusia', d: 'M 248,25 L 290,22 L 285,68 L 246,70 Z' },

  // === ASIA (9) ===
  { id: 'ARAL', name: 'Aral', d: 'M 288,34 L 322,30 L 318,66 L 286,68 Z' },
  { id: 'SIBERIA', name: 'Siberia', d: 'M 324,12 L 362,10 L 358,40 L 322,42 Z' },
  { id: 'TARTARIA', name: 'Tartaria', d: 'M 322,44 L 362,42 L 358,70 L 320,72 Z' },
  { id: 'TAIMIR', name: 'Taimir', d: 'M 364,10 L 402,8 L 398,36 L 362,38 Z' },
  { id: 'KAMCHATKA', name: 'Kamchatka', d: 'M 406,12 L 444,10 L 440,46 L 402,46 Z' },
  { id: 'JAPON', name: 'Japón', d: 'M 422,54 L 444,52 L 440,84 L 420,82 Z' },
  { id: 'CHINA', name: 'China', d: 'M 366,54 L 416,50 L 410,98 L 364,96 Z' },
  { id: 'IRAN', name: 'Irán', d: 'M 272,74 L 305,72 L 302,104 L 270,104 Z' },
  { id: 'INDIA', name: 'India', d: 'M 312,80 L 354,76 L 348,124 L 310,116 Z' },

  // === ÁFRICA (5) ===
  { id: 'SAHARA', name: 'Sahara', d: 'M 162,110 L 205,108 L 200,150 L 158,145 Z' },
  { id: 'EGIPTO', name: 'Egipto', d: 'M 208,108 L 244,106 L 240,140 L 206,142 Z' },
  { id: 'ETIOPIA', name: 'Etiopía', d: 'M 208,144 L 246,142 L 242,174 L 206,170 Z' },
  { id: 'ZAIRE', name: 'Zaire', d: 'M 166,152 L 204,150 L 200,190 L 164,188 Z' },
  { id: 'SUDAFRICA', name: 'Sudáfrica', d: 'M 174,194 L 226,190 L 220,230 L 178,228 Z' },

  // === OCEANÍA (2) ===
  { id: 'SUMATRA', name: 'Sumatra', d: 'M 348,132 L 382,130 L 378,162 L 346,160 Z' },
  { id: 'AUSTRALIA', name: 'Australia', d: 'M 378,162 L 436,158 L 430,214 L 376,212 Z' }
];

// Puentes / Líneas de conexión
const MINI_BRIDGES = [
  { x1: 28, y1: 38, x2: 424, y2: 25 },  // Alaska <-> Kamchatka
  { x1: 76, y1: 88, x2: 90, y2: 120 },   // Mexico <-> Colombia
  { x1: 122, y1: 18, x2: 160, y2: 22 },  // Groenlandia <-> Islandia
  { x1: 110, y1: 45, x2: 168, y2: 52 },  // Terranova <-> Gran Bretaña
  { x1: 120, y1: 142, x2: 182, y2: 130 },// Brasil <-> Sahara
  { x1: 164, y1: 88, x2: 182, y2: 130 }, // Espana <-> Sahara
  { x1: 226, y1: 125, x2: 232, y2: 60 }, // Egipto <-> Polonia
  { x1: 226, y1: 125, x2: 288, y2: 88 }, // Egipto <-> Iran
  { x1: 268, y1: 45, x2: 288, y2: 88 },  // Rusia <-> Iran
  { x1: 76, y1: 188, x2: 405, y2: 185 }, // Chile <-> Australia
  { x1: 334, y1: 100, x2: 365, y2: 145 },// India <-> Sumatra
  { x1: 334, y1: 100, x2: 405, y2: 185 } // India <-> Australia
];

function initMiniMap() {
  const container = document.getElementById('mini-map-container');
  if (!container) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 460 240');
  svg.setAttribute('class', 'mini-map-svg');

  // Fondo oceánico
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '460');
  bg.setAttribute('height', '240');
  bg.setAttribute('fill', '#091520');
  bg.setAttribute('rx', '6');
  svg.appendChild(bg);

  // Puentes intercontinentales
  const bridgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  bridgesGroup.setAttribute('class', 'mini-map-bridges');
  MINI_BRIDGES.forEach(b => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', b.x1);
    line.setAttribute('y1', b.y1);
    line.setAttribute('x2', b.x2);
    line.setAttribute('y2', b.y2);
    line.setAttribute('stroke', 'rgba(212, 175, 55, 0.3)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '2,2');
    bridgesGroup.appendChild(line);
  });
  svg.appendChild(bridgesGroup);

  // Territorios
  const territoriesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  territoriesGroup.setAttribute('class', 'mini-map-territories');

  MINI_TERRITORIES.forEach(t => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', `mini-t-${t.id}`);
    path.setAttribute('d', t.d);
    path.setAttribute('class', 'mini-map-patch');
    path.setAttribute('fill', '#1c2d3d');
    path.setAttribute('stroke', '#091520');
    path.setAttribute('stroke-width', '1.2');

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = t.name;
    path.appendChild(title);

    // Clic en el minimapa para seleccionar atacante si es tu turno
    path.onclick = () => {
      if (typeof onSelectMiniMapTerritory === 'function') {
        onSelectMiniMapTerritory(t.id);
      }
    };

    territoriesGroup.appendChild(path);
  });

  svg.appendChild(territoriesGroup);
  container.innerHTML = '';
  container.appendChild(svg);
}

function updateMiniMap(state) {
  if (!state || !state.players) return;

  MINI_TERRITORIES.forEach(t => {
    const el = document.getElementById(`mini-t-${t.id}`);
    if (!el) return;

    const owner = state.players.find(p => p.territories && p.territories.includes(t.id));
    if (owner) {
      el.style.fill = owner.color;
      el.style.fillOpacity = '0.9';
      el.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.5))';
      const title = el.querySelector('title');
      if (title) title.textContent = `${t.name} — Controlado por ${owner.name}`;
    } else {
      el.style.fill = '#1c2d3d';
      el.style.fillOpacity = '0.4';
    }
  });

  // Leyenda de colores de jugadores
  const legend = document.getElementById('mini-map-legend');
  if (legend) {
    legend.innerHTML = state.players.map(p => `
      <div class="map-legend-item">
        <span class="legend-color-dot" style="background-color: ${p.color}"></span>
        <span class="legend-player-name">${p.name}: <strong>${p.territories?.length || 0}</strong></span>
      </div>
    `).join('');
  }
}

// Global hook
window.initMiniMap = initMiniMap;
window.updateMiniMap = updateMiniMap;
