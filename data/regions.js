// TEG II (T.E.G. 2 - Cold War / Yetem) Definición de Regiones y Superpotencias

export const SUPERPOWERS = {
  EEUU: {
    id: 'EEUU',
    name: 'E.E.U.U.',
    fullName: 'Estados Unidos de América',
    color: '#27ae60', // Verde
    textColor: '#ffffff',
    homelandId: 'EEUU',
    flag: '🇺🇸',
    emblem: '🦅',
    accentColor: '#2ecc71'
  },
  URSS: {
    id: 'URSS',
    name: 'U.R.S.S.',
    fullName: 'Unión de Repúblicas Socialistas Soviéticas',
    color: '#c0392b', // Rojo
    textColor: '#ffffff',
    homelandId: 'URSS',
    flag: '☭',
    emblem: '⭐',
    accentColor: '#e74c3c'
  },
  CHINA: {
    id: 'CHINA',
    name: 'China',
    fullName: 'República Popular China',
    color: '#d4ac0d', // Amarillo
    textColor: '#1a1a1a',
    homelandId: 'CHINA',
    flag: '🇨🇳',
    emblem: '🐉',
    accentColor: '#f1c40f'
  },
  JAPON: {
    id: 'JAPON',
    name: 'Japón',
    fullName: 'Imperio / Estado de Japón',
    color: '#2c3e50', // Azul marino / negro
    textColor: '#ffffff',
    homelandId: 'JAPON',
    flag: '🇯🇵',
    emblem: '⛩️',
    accentColor: '#34495e'
  },
  EUROPA_OCC: {
    id: 'EUROPA_OCC',
    name: 'Europa Occ.',
    fullName: 'Europa Occidental (OTAN)',
    color: '#8e44ad', // Violeta / Púrpura
    textColor: '#ffffff',
    homelandId: 'EUROPA_OCC',
    flag: '🇪🇺',
    emblem: '⚔️',
    accentColor: '#9b59b6'
  },
  EUROPA_OR: {
    id: 'EUROPA_OR',
    name: 'Europa Or.',
    fullName: 'Europa Oriental (Pacto de Varsovia)',
    color: '#0097a7', // Celeste / Cyan
    textColor: '#ffffff',
    homelandId: 'EUROPA_OR',
    flag: '★',
    emblem: '🛡️',
    accentColor: '#00bcd4'
  }
};

export const REGIONS = [
  // ==================== SUPERPOTENCIAS (BASES HOMELAND) ====================
  {
    id: 'EEUU',
    name: 'E.E.U.U.',
    fullName: 'Estados Unidos de América',
    hemisphere: 'occidental',
    isSuperpowerHomeland: true,
    superpowerId: 'EEUU',
    type: 'land',
    adjacencies: ['CENTROAMERICA', 'PACIFICO', 'ATLANTICO'],
    coords: { x: 260, y: 130 },
    shape: 'M 190 90 L 330 85 L 340 145 L 290 180 L 220 165 L 180 120 Z'
  },
  {
    id: 'URSS',
    name: 'U.R.S.S.',
    fullName: 'Unión Soviética',
    hemisphere: 'oriental',
    isSuperpowerHomeland: true,
    superpowerId: 'URSS',
    type: 'land',
    adjacencies: ['EUROPA_OCC', 'EUROPA_OR', 'MEDIO_ORIENTE', 'CHINA', 'JAPON', 'PACIFICO', 'ATLANTICO'],
    coords: { x: 740, y: 80 },
    shape: 'M 560 65 L 890 60 L 920 100 L 860 145 L 750 140 L 640 115 L 570 95 Z'
  },
  {
    id: 'EUROPA_OCC',
    name: 'Europa Occ.',
    fullName: 'Europa Occidental',
    hemisphere: 'oriental',
    isSuperpowerHomeland: true,
    superpowerId: 'EUROPA_OCC',
    type: 'land',
    adjacencies: ['EUROPA_OR', 'NORTE_AFRICA', 'ATLANTICO', 'URSS'],
    coords: { x: 520, y: 135 },
    shape: 'M 495 105 L 545 100 L 550 145 L 515 160 L 485 140 Z'
  },
  {
    id: 'EUROPA_OR',
    name: 'Europa Or.',
    fullName: 'Europa Oriental',
    hemisphere: 'oriental',
    isSuperpowerHomeland: true,
    superpowerId: 'EUROPA_OR',
    type: 'land',
    adjacencies: ['EUROPA_OCC', 'URSS', 'MEDIO_ORIENTE', 'NORTE_AFRICA'],
    coords: { x: 575, y: 145 },
    shape: 'M 550 102 L 610 105 L 615 155 L 565 165 L 548 140 Z'
  },
  {
    id: 'CHINA',
    name: 'China',
    fullName: 'República Popular China',
    hemisphere: 'oriental',
    isSuperpowerHomeland: true,
    superpowerId: 'CHINA',
    type: 'land',
    adjacencies: ['URSS', 'INDIA', 'INDOCHINA', 'JAPON', 'PACIFICO'],
    coords: { x: 800, y: 185 },
    shape: 'M 730 145 L 850 145 L 870 195 L 810 230 L 740 210 Z'
  },
  {
    id: 'JAPON',
    name: 'Japón',
    fullName: 'Japón',
    hemisphere: 'oriental',
    isSuperpowerHomeland: true,
    superpowerId: 'JAPON',
    type: 'land',
    adjacencies: ['URSS', 'CHINA', 'PACIFICO'],
    coords: { x: 915, y: 175 },
    shape: 'M 900 155 Q 920 165 925 195 Q 915 210 905 185 Z'
  },

  // ==================== HEMISFERIO OCCIDENTAL (TIERRA) ====================
  {
    id: 'CENTROAMERICA',
    name: 'Centroamérica',
    fullName: 'América Central y México',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['EEUU', 'CARIBE', 'COLOM_VENEZ', 'PACIFICO'],
    coords: { x: 255, y: 220 },
    shape: 'M 225 175 L 285 180 L 275 240 L 245 235 Z'
  },
  {
    id: 'CARIBE',
    name: 'Caribe',
    fullName: 'Mar Caribe y Antillas',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['CENTROAMERICA', 'COLOM_VENEZ', 'EEUU', 'ATLANTICO'],
    coords: { x: 320, y: 215 },
    shape: 'M 290 195 L 345 200 L 335 235 L 285 225 Z'
  },
  {
    id: 'COLOM_VENEZ',
    name: 'Colom/Venez',
    fullName: 'Colombia y Venezuela',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['CENTROAMERICA', 'CARIBE', 'R_ANDINA', 'BRASIL', 'PACIFICO', 'ATLANTICO'],
    coords: { x: 300, y: 275 },
    shape: 'M 260 245 L 340 240 L 345 290 L 285 300 L 255 265 Z'
  },
  {
    id: 'R_ANDINA',
    name: 'R. Andina',
    fullName: 'Región Andina (Perú, Ecuador, Bolivia)',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['COLOM_VENEZ', 'BRASIL', 'CHILE', 'ARGENTINA', 'PACIFICO'],
    coords: { x: 275, y: 350 },
    shape: 'M 265 295 L 305 300 L 300 395 L 260 380 Z'
  },
  {
    id: 'BRASIL',
    name: 'Brasil',
    fullName: 'Brasil y Amazonas',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['COLOM_VENEZ', 'R_ANDINA', 'ARGENTINA', 'ATLANTICO'],
    coords: { x: 350, y: 345 },
    shape: 'M 310 285 L 390 280 L 405 365 L 335 390 L 305 330 Z'
  },
  {
    id: 'CHILE',
    name: 'Chile',
    fullName: 'Chile',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['R_ANDINA', 'ARGENTINA', 'PACIFICO'],
    coords: { x: 270, y: 440 },
    shape: 'M 268 385 L 288 390 L 280 495 L 260 480 Z'
  },
  {
    id: 'ARGENTINA',
    name: 'Argentina',
    fullName: 'Argentina, Uruguay y Paraguay',
    hemisphere: 'occidental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['CHILE', 'R_ANDINA', 'BRASIL', 'ATLANTICO', 'PACIFICO'],
    coords: { x: 305, y: 445 },
    shape: 'M 292 390 L 340 385 L 330 480 L 285 495 Z'
  },

  // ==================== HEMISFERIO ORIENTAL (TIERRA) ====================
  {
    id: 'NORTE_AFRICA',
    name: 'Norte de África',
    fullName: 'Norte de África y Magreb',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['EUROPA_OCC', 'EUROPA_OR', 'AFRICA_CENTRAL', 'CUERNO_AFRICA', 'MEDIO_ORIENTE', 'ATLANTICO'],
    coords: { x: 530, y: 220 },
    shape: 'M 465 180 L 595 180 L 600 240 L 450 240 Z'
  },
  {
    id: 'AFRICA_CENTRAL',
    name: 'África Central',
    fullName: 'África Central y Guinea',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['NORTE_AFRICA', 'CUERNO_AFRICA', 'AFRICA_SUR', 'ATLANTICO'],
    coords: { x: 535, y: 300 },
    shape: 'M 460 245 L 565 245 L 560 340 L 485 330 Z'
  },
  {
    id: 'CUERNO_AFRICA',
    name: 'Cuerno de África',
    fullName: 'Cuerno de África y África Oriental',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['NORTE_AFRICA', 'AFRICA_CENTRAL', 'AFRICA_SUR', 'MEDIO_ORIENTE', 'INDICO'],
    coords: { x: 610, y: 310 },
    shape: 'M 570 245 L 640 245 L 620 355 L 568 335 Z'
  },
  {
    id: 'AFRICA_SUR',
    name: 'África del Sur',
    fullName: 'África del Sur',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['AFRICA_CENTRAL', 'CUERNO_AFRICA', 'ATLANTICO', 'INDICO'],
    coords: { x: 565, y: 400 },
    shape: 'M 500 345 L 610 345 L 580 440 L 525 435 Z'
  },
  {
    id: 'MEDIO_ORIENTE',
    name: 'Medio Oriente',
    fullName: 'Medio Oriente y Península Arábiga',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['EUROPA_OR', 'URSS', 'NORTE_AFRICA', 'CUERNO_AFRICA', 'INDIA', 'INDICO'],
    coords: { x: 650, y: 215 },
    shape: 'M 605 175 L 685 175 L 680 255 L 610 240 Z'
  },
  {
    id: 'INDIA',
    name: 'India',
    fullName: 'Subcontinente Indio',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['MEDIO_ORIENTE', 'CHINA', 'INDOCHINA', 'INDICO'],
    coords: { x: 745, y: 260 },
    shape: 'M 700 210 L 775 210 L 760 295 L 715 285 Z'
  },
  {
    id: 'INDOCHINA',
    name: 'Indochina',
    fullName: 'Indochina y Sudeste Asiático',
    hemisphere: 'oriental',
    isSuperpowerHomeland: false,
    type: 'land',
    adjacencies: ['CHINA', 'INDIA', 'INDICO', 'PACIFICO'],
    coords: { x: 840, y: 280 },
    shape: 'M 795 235 L 870 235 L 875 320 L 810 310 Z'
  },

  // ==================== REGIONES MARÍTIMAS (OCÉANOS) ====================
  {
    id: 'ATLANTICO',
    name: 'Océano Atlántico',
    fullName: 'Océano Atlántico (Norte y Sur)',
    hemisphere: 'maritimo',
    isSuperpowerHomeland: false,
    type: 'ocean',
    adjacencies: [
      'EEUU', 'CARIBE', 'COLOM_VENEZ', 'BRASIL', 'ARGENTINA',
      'EUROPA_OCC', 'EUROPA_OR', 'NORTE_AFRICA', 'AFRICA_CENTRAL', 'AFRICA_SUR',
      'PACIFICO', 'INDICO'
    ],
    coords: { x: 420, y: 230 },
    // Representación en dos sectores o corredor oceánico
    shape: 'M 360 110 L 470 110 L 460 380 L 370 470 L 350 430 Z'
  },
  {
    id: 'PACIFICO',
    name: 'Océano Pacífico',
    fullName: 'Océano Pacífico (Este y Oeste)',
    hemisphere: 'maritimo',
    isSuperpowerHomeland: false,
    type: 'ocean',
    adjacencies: [
      'EEUU', 'CENTROAMERICA', 'COLOM_VENEZ', 'R_ANDINA', 'CHILE', 'ARGENTINA',
      'URSS', 'CHINA', 'JAPON', 'INDOCHINA',
      'ATLANTICO', 'INDICO'
    ],
    coords: { x: 120, y: 270 },
    shape: 'M 50 110 L 170 100 L 195 380 L 90 420 Z'
  },
  {
    id: 'INDICO',
    name: 'Océano Índico',
    fullName: 'Océano Índico',
    hemisphere: 'maritimo',
    isSuperpowerHomeland: false,
    type: 'ocean',
    adjacencies: [
      'CUERNO_AFRICA', 'AFRICA_SUR', 'MEDIO_ORIENTE', 'INDIA', 'INDOCHINA',
      'ATLANTICO', 'PACIFICO'
    ],
    coords: { x: 670, y: 390 },
    shape: 'M 640 280 L 730 300 L 750 440 L 610 440 Z'
  }
];

// Niveles de Potencial Bélico (de 3 a 11)
export const POTENCIAL_BELICO_TRACK = [3, 4, 5, 6, 7, 8, 9, 10, 11];
export const INITIAL_POTENCIAL = 7;

// Tabla de Objetivos del tablero físico TEG II
export const OBJECTIVE_TABLE_ROWS_WEST = [
  'ATLANTICO',
  'ARGENTINA',
  'CHILE',
  'BRASIL',
  'R_ANDINA',
  'COLOM_VENEZ',
  'CENTROAMERICA',
  'CARIBE',
  'PACIFICO'
];

export const OBJECTIVE_TABLE_ROWS_EAST = [
  'NORTE_AFRICA',
  'AFRICA_CENTRAL',
  'CUERNO_AFRICA',
  'AFRICA_SUR',
  'MEDIO_ORIENTE',
  'ATLANTICO',
  'INDICO',
  'INDIA',
  'INDOCHINA',
  'PACIFICO'
];

// Helper para encontrar región por ID
export function getRegion(id) {
  return REGIONS.find(r => r.id === id);
}
