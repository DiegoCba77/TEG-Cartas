// 72 Países de TEG La Revancha con coordenadas calibradas para el mapa con relieve 3D (1376 x 768)

export const CONTINENTS = {
  AMERICA_DEL_NORTE: {
    id: 'AMERICA_DEL_NORTE',
    name: 'América del Norte',
    bonus: 6,
    color: '#f59e0b',
    labelPos: { x: 320, y: 170 }
  },
  AMERICA_CENTRAL: {
    id: 'AMERICA_CENTRAL',
    name: 'América Central',
    bonus: 3,
    color: '#10b981',
    labelPos: { x: 300, y: 530 }
  },
  AMERICA_DEL_SUR: {
    id: 'AMERICA_DEL_SUR',
    name: 'América del Sur',
    bonus: 4,
    color: '#84cc16',
    labelPos: { x: 490, y: 760 }
  },
  EUROPA: {
    id: 'EUROPA',
    name: 'Europa',
    bonus: 8,
    color: '#3b82f6',
    labelPos: { x: 740, y: 200 }
  },
  ASIA: {
    id: 'ASIA',
    name: 'Asia',
    bonus: 8,
    color: '#ec4899',
    labelPos: { x: 1060, y: 160 }
  },
  AFRICA: {
    id: 'AFRICA',
    name: 'África',
    bonus: 4,
    color: '#eab308',
    labelPos: { x: 740, y: 520 }
  },
  OCEANIA: {
    id: 'OCEANIA',
    name: 'Oceanía',
    bonus: 3,
    color: '#06b6d4',
    labelPos: { x: 1200, y: 620 }
  }
};

export const CONTINENT_SHAPES = [
  {
    id: 'AMERICA_DEL_NORTE',
    name: 'AMÉRICA DEL NORTE (+6)',
    color: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    d: 'M 140,210 Q 300,120 540,130 Q 480,260 380,390 Q 250,380 170,300 Z'
  },
  {
    id: 'AMERICA_CENTRAL',
    name: 'AMÉRICA CENTRAL (+3)',
    color: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    d: 'M 300,420 Q 390,440 430,550 Q 380,570 320,490 Z'
  },
  {
    id: 'AMERICA_DEL_SUR',
    name: 'AMÉRICA DEL SUR (+4)',
    color: 'rgba(132, 204, 22, 0.05)',
    borderColor: 'rgba(132, 204, 22, 0.4)',
    d: 'M 420,570 Q 550,620 520,730 Q 450,770 410,730 Q 410,640 420,570 Z'
  },
  {
    id: 'EUROPA',
    name: 'EUROPA (+8)',
    color: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    d: 'M 590,240 Q 750,180 880,240 Q 820,360 640,380 Z'
  },
  {
    id: 'AFRICA',
    name: 'ÁFRICA (+4)',
    color: 'rgba(234, 179, 8, 0.05)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
    d: 'M 620,440 Q 800,420 830,520 Q 810,720 730,730 Q 640,580 620,440 Z'
  },
  {
    id: 'ASIA',
    name: 'ASIA (+8)',
    color: 'rgba(236, 72, 153, 0.05)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
    d: 'M 880,220 Q 1150,140 1280,180 Q 1280,360 1140,490 Q 940,480 880,220 Z'
  },
  {
    id: 'OCEANIA',
    name: 'OCEANÍA (+3)',
    color: 'rgba(6, 182, 212, 0.05)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    d: 'M 1020,560 Q 1280,480 1330,560 Q 1310,750 1160,770 Q 1060,740 1020,560 Z'
  }
];

export const SYMBOLS = {
  SOLDADO: 'soldado', // comodín
  AVION: 'avion',
  TANQUE: 'tanque',
  BARCO: 'barco',
  GRANADA: 'granada',
  SUPER: 'super'
};

export const COUNTRIES = [
  // --- AMÉRICA DEL NORTE (10 países) ---
  { id: 'alaska', name: 'Alaska', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.AVION, isIsland: false, x: 180, y: 230 },
  { id: 'yukon', name: 'Yukón', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.TANQUE, isIsland: false, x: 235, y: 230 },
  { id: 'canada', name: 'Canadá', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.BARCO, isIsland: false, x: 310, y: 220 },
  { id: 'groenlandia', name: 'Groenlandia', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.SOLDADO, isIsland: true, x: 530, y: 150 },
  { id: 'labrador', name: 'Labrador', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.GRANADA, isIsland: false, x: 425, y: 230 },
  { id: 'terranova', name: 'Terranova', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.AVION, isIsland: true, x: 465, y: 280 },
  { id: 'oregon', name: 'Oregón', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.TANQUE, isIsland: false, x: 250, y: 300 },
  { id: 'nueva_york', name: 'Nueva York', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.BARCO, isIsland: false, x: 360, y: 315 },
  { id: 'california', name: 'California', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.GRANADA, isIsland: false, x: 270, y: 365 },
  { id: 'florida', name: 'Florida', continent: 'AMERICA_DEL_NORTE', symbol: SYMBOLS.AVION, isIsland: false, x: 375, y: 385 },

  // --- AMÉRICA CENTRAL (7 países) ---
  { id: 'mexico', name: 'México', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.TANQUE, isIsland: false, x: 315, y: 430 },
  { id: 'guatemala', name: 'Guatemala', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.BARCO, isIsland: false, x: 350, y: 465 },
  { id: 'el_salvador', name: 'El Salvador', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.SOLDADO, isIsland: false, x: 335, y: 495 },
  { id: 'honduras', name: 'Honduras', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.GRANADA, isIsland: false, x: 380, y: 475 },
  { id: 'nicaragua', name: 'Nicaragua', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.AVION, isIsland: false, x: 370, y: 515 },
  { id: 'costa_rica', name: 'Costa Rica', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.TANQUE, isIsland: false, x: 395, y: 540 },
  { id: 'panama', name: 'Panamá', continent: 'AMERICA_CENTRAL', symbol: SYMBOLS.BARCO, isIsland: false, x: 420, y: 555 },

  // --- AMÉRICA DEL SUR (6 países) ---
  { id: 'colombia', name: 'Colombia', continent: 'AMERICA_DEL_SUR', symbol: SYMBOLS.GRANADA, isIsland: false, x: 440, y: 590 },
  { id: 'peru', name: 'Perú', continent: 'AMERICA_DEL_SUR', symbol: SYMBOLS.AVION, isIsland: false, x: 430, y: 660 },
  { id: 'brasil', name: 'Brasil', continent: 'AMERICA_DEL_SUR', symbol: SYMBOLS.TANQUE, isIsland: false, x: 505, y: 640 },
  { id: 'chile', name: 'Chile', continent: 'AMERICA_DEL_SUR', symbol: SYMBOLS.BARCO, isIsland: false, x: 425, y: 730 },
  { id: 'argentina', name: 'Argentina', continent: 'AMERICA_DEL_SUR', symbol: SYMBOLS.SOLDADO, isIsland: false, x: 460, y: 740 },
  { id: 'uruguay', name: 'Uruguay', continent: 'AMERICA_DEL_SUR', symbol: SYMBOLS.GRANADA, isIsland: false, x: 495, y: 715 },

  // --- EUROPA (12 países) ---
  { id: 'islandia', name: 'Islandia', continent: 'EUROPA', symbol: SYMBOLS.AVION, isIsland: true, x: 605, y: 235 },
  { id: 'gran_bretana', name: 'Gran Bretaña', continent: 'EUROPA', symbol: SYMBOLS.TANQUE, isIsland: true, x: 655, y: 290 },
  { id: 'portugal', name: 'Portugal', continent: 'EUROPA', symbol: SYMBOLS.SOLDADO, isIsland: false, x: 635, y: 365 },
  { id: 'espana', name: 'España', continent: 'EUROPA', symbol: SYMBOLS.BARCO, isIsland: false, x: 665, y: 370 },
  { id: 'francia', name: 'Francia', continent: 'EUROPA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 700, y: 335 },
  { id: 'italia', name: 'Italia', continent: 'EUROPA', symbol: SYMBOLS.AVION, isIsland: false, x: 730, y: 365 },
  { id: 'alemania', name: 'Alemania', continent: 'EUROPA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 730, y: 305 },
  { id: 'suecia', name: 'Suecia', continent: 'EUROPA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 735, y: 235 },
  { id: 'polonia', name: 'Polonia', continent: 'EUROPA', symbol: SYMBOLS.BARCO, isIsland: false, x: 770, y: 300 },
  { id: 'bielorrusia', name: 'Bielorrusia', continent: 'EUROPA', symbol: SYMBOLS.AVION, isIsland: false, x: 810, y: 285 },
  { id: 'ucrania', name: 'Ucrania', continent: 'EUROPA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 810, y: 335 },
  { id: 'rusia', name: 'Rusia', continent: 'EUROPA', symbol: SYMBOLS.SUPER, isIsland: false, x: 860, y: 265 },

  // --- ÁFRICA (8 países) ---
  { id: 'sahara', name: 'Sahara', continent: 'AFRICA', symbol: SYMBOLS.BARCO, isIsland: false, x: 670, y: 445 },
  { id: 'mauritania', name: 'Mauritania', continent: 'AFRICA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 635, y: 485 },
  { id: 'nigeria', name: 'Nigeria', continent: 'AFRICA', symbol: SYMBOLS.SOLDADO, isIsland: false, x: 705, y: 525 },
  { id: 'egipto', name: 'Egipto', continent: 'AFRICA', symbol: SYMBOLS.AVION, isIsland: false, x: 775, y: 430 },
  { id: 'etiopia', name: 'Etiopía', continent: 'AFRICA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 810, y: 525 },
  { id: 'zaire', name: 'Zaire', continent: 'AFRICA', symbol: SYMBOLS.BARCO, isIsland: false, x: 745, y: 600 },
  { id: 'sudafrica', name: 'Sudáfrica', continent: 'AFRICA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 765, y: 690 },
  { id: 'madagascar', name: 'Madagascar', continent: 'AFRICA', symbol: SYMBOLS.AVION, isIsland: true, x: 830, y: 660 },

  // --- ASIA (18 países) ---
  { id: 'turquia', name: 'Turquía', continent: 'ASIA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 810, y: 385 },
  { id: 'israel', name: 'Israel', continent: 'ASIA', symbol: SYMBOLS.BARCO, isIsland: false, x: 795, y: 430 },
  { id: 'arabia', name: 'Arabia', continent: 'ASIA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 840, y: 470 },
  { id: 'iran', name: 'Irán', continent: 'ASIA', symbol: SYMBOLS.SOLDADO, isIsland: false, x: 870, y: 415 },
  { id: 'ural', name: 'Ural', continent: 'ASIA', symbol: SYMBOLS.AVION, isIsland: false, x: 920, y: 255 },
  { id: 'siberia', name: 'Siberia', continent: 'ASIA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 990, y: 220 },
  { id: 'taimir', name: 'Taimir', continent: 'ASIA', symbol: SYMBOLS.BARCO, isIsland: false, x: 1070, y: 195 },
  { id: 'chukchi', name: 'Chukchi', continent: 'ASIA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 1240, y: 195 },
  { id: 'kamchatka', name: 'Kamchatka', continent: 'ASIA', symbol: SYMBOLS.AVION, isIsland: false, x: 1250, y: 250 },
  { id: 'vladivostok', name: 'Vladivostok', continent: 'ASIA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 1170, y: 290 },
  { id: 'mongolia', name: 'Mongolia', continent: 'ASIA', symbol: SYMBOLS.BARCO, isIsland: false, x: 1070, y: 285 },
  { id: 'gobi', name: 'Gobi', continent: 'ASIA', symbol: SYMBOLS.SOLDADO, isIsland: false, x: 1030, y: 335 },
  { id: 'china', name: 'China', continent: 'ASIA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 1090, y: 375 },
  { id: 'japon', name: 'Japón', continent: 'ASIA', symbol: SYMBOLS.AVION, isIsland: true, x: 1245, y: 335 },
  { id: 'corea', name: 'Corea', continent: 'ASIA', symbol: SYMBOLS.AVION, isIsland: false, x: 1180, y: 355 },
  { id: 'india', name: 'India', continent: 'ASIA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 970, y: 445 },
  { id: 'malasia', name: 'Malasia', continent: 'ASIA', symbol: SYMBOLS.BARCO, isIsland: false, x: 1065, y: 515 },
  { id: 'vietnam', name: 'Vietnam', continent: 'ASIA', symbol: SYMBOLS.GRANADA, isIsland: false, x: 1120, y: 455 },

  // --- OCEANÍA (11 países) ---
  { id: 'sumatra', name: 'Sumatra', continent: 'OCEANIA', symbol: SYMBOLS.TANQUE, isIsland: true, x: 1035, y: 575 },
  { id: 'borneo', name: 'Borneo', continent: 'OCEANIA', symbol: SYMBOLS.BARCO, isIsland: true, x: 1100, y: 560 },
  { id: 'filipinas', name: 'Filipinas', continent: 'OCEANIA', symbol: SYMBOLS.SOLDADO, isIsland: true, x: 1170, y: 490 },
  { id: 'micronesia', name: 'Micronesia', continent: 'OCEANIA', symbol: SYMBOLS.BARCO, isIsland: true, x: 1250, y: 500 },
  { id: 'nueva_guinea', name: 'Nueva Guinea', continent: 'OCEANIA', symbol: SYMBOLS.GRANADA, isIsland: true, x: 1195, y: 575 },
  { id: 'polinesia', name: 'Polinesia', continent: 'OCEANIA', symbol: SYMBOLS.TANQUE, isIsland: true, x: 1300, y: 560 },
  { id: 'tonga', name: 'Tonga', continent: 'OCEANIA', symbol: SYMBOLS.AVION, isIsland: true, x: 1290, y: 630 },
  { id: 'australia_occidental', name: 'Australia Occ.', continent: 'OCEANIA', symbol: SYMBOLS.AVION, isIsland: false, x: 1095, y: 685 },
  { id: 'australia_oriental', name: 'Australia Or.', continent: 'OCEANIA', symbol: SYMBOLS.TANQUE, isIsland: false, x: 1170, y: 675 },
  { id: 'tasmania', name: 'Tasmania', continent: 'OCEANIA', symbol: SYMBOLS.BARCO, isIsland: true, x: 1170, y: 740 },
  { id: 'nueva_zelanda', name: 'Nueva Zelanda', continent: 'OCEANIA', symbol: SYMBOLS.GRANADA, isIsland: true, x: 1260, y: 730 }
];

export const ADJACENCIES = {
  // América del Norte
  alaska: ['chukchi', 'kamchatka', 'yukon', 'oregon'],
  yukon: ['alaska', 'canada', 'oregon'],
  canada: ['yukon', 'labrador', 'oregon', 'nueva_york'],
  groenlandia: ['labrador', 'islandia'],
  labrador: ['canada', 'groenlandia', 'terranova', 'nueva_york'],
  terranova: ['labrador', 'nueva_york'],
  oregon: ['alaska', 'yukon', 'canada', 'nueva_york', 'california'],
  nueva_york: ['canada', 'labrador', 'terranova', 'oregon', 'california', 'florida'],
  california: ['oregon', 'nueva_york', 'florida', 'mexico'],
  florida: ['california', 'nueva_york', 'mexico'],

  // América Central
  mexico: ['california', 'florida', 'guatemala', 'honduras'],
  guatemala: ['mexico', 'el_salvador', 'honduras'],
  el_salvador: ['guatemala', 'honduras', 'nicaragua'],
  honduras: ['mexico', 'guatemala', 'el_salvador', 'nicaragua'],
  nicaragua: ['el_salvador', 'honduras', 'costa_rica'],
  costa_rica: ['nicaragua', 'panama'],
  panama: ['costa_rica', 'colombia'],

  // América del Sur
  colombia: ['panama', 'peru', 'brasil'],
  peru: ['colombia', 'brasil', 'chile', 'argentina'],
  brasil: ['colombia', 'peru', 'argentina', 'uruguay', 'sahara'],
  chile: ['peru', 'argentina', 'australia_oriental'],
  argentina: ['chile', 'peru', 'brasil', 'uruguay', 'australia_occidental'],
  uruguay: ['argentina', 'brasil'],

  // Europa
  islandia: ['groenlandia', 'gran_bretana', 'suecia'],
  gran_bretana: ['islandia', 'espana', 'francia', 'alemania'],
  espana: ['gran_bretana', 'portugal', 'francia', 'sahara', 'mauritania'],
  portugal: ['espana'],
  francia: ['espana', 'gran_bretana', 'alemania', 'italia'],
  italia: ['francia', 'alemania', 'egipto'],
  alemania: ['gran_bretana', 'francia', 'italia', 'polonia', 'suecia'],
  polonia: ['alemania', 'suecia', 'bielorrusia', 'ucrania'],
  suecia: ['islandia', 'alemania', 'polonia', 'rusia'],
  bielorrusia: ['polonia', 'ucrania', 'rusia'],
  ucrania: ['polonia', 'bielorrusia', 'rusia', 'turquia', 'iran'],
  rusia: ['suecia', 'bielorrusia', 'ucrania', 'ural', 'iran'],

  // África
  sahara: ['espana', 'brasil', 'mauritania', 'nigeria', 'egipto'],
  mauritania: ['espana', 'sahara', 'nigeria'],
  nigeria: ['mauritania', 'sahara', 'zaire', 'etiopia'],
  egipto: ['sahara', 'italia', 'etiopia', 'israel', 'turquia'],
  etiopia: ['egipto', 'nigeria', 'zaire', 'arabia'],
  zaire: ['nigeria', 'etiopia', 'sudafrica'],
  sudafrica: ['zaire', 'etiopia', 'madagascar'],
  madagascar: ['sudafrica', 'etiopia'],

  // Asia
  turquia: ['egipto', 'ucrania', 'israel', 'iran'],
  israel: ['egipto', 'turquia', 'arabia'],
  arabia: ['israel', 'etiopia', 'iran', 'india'],
  iran: ['rusia', 'ucrania', 'turquia', 'arabia', 'india', 'ural'],
  ural: ['rusia', 'iran', 'siberia', 'mongolia'],
  siberia: ['ural', 'taimir', 'mongolia', 'gobi'],
  taimir: ['siberia', 'chukchi'],
  chukchi: ['taimir', 'kamchatka', 'alaska'],
  kamchatka: ['chukchi', 'alaska', 'vladivostok', 'japon'],
  vladivostok: ['kamchatka', 'gobi', 'mongolia', 'corea', 'japon'],
  mongolia: ['ural', 'siberia', 'gobi', 'vladivostok'],
  gobi: ['mongolia', 'siberia', 'vladivostok', 'china'],
  china: ['gobi', 'india', 'malasia', 'vietnam', 'corea'],
  japon: ['kamchatka', 'vladivostok', 'corea', 'micronesia'],
  corea: ['vladivostok', 'china', 'japon'],
  india: ['arabia', 'iran', 'china', 'malasia'],
  malasia: ['india', 'china', 'vietnam', 'sumatra', 'borneo'],
  vietnam: ['china', 'malasia', 'filipinas'],

  // Oceanía
  sumatra: ['malasia', 'borneo', 'australia_occidental'],
  borneo: ['malasia', 'sumatra', 'filipinas', 'nueva_guinea'],
  filipinas: ['vietnam', 'borneo', 'micronesia'],
  micronesia: ['filipinas', 'japon', 'polinesia'],
  nueva_guinea: ['borneo', 'australia_oriental', 'tonga'],
  polinesia: ['tonga', 'micronesia'],
  tonga: ['nueva_guinea', 'nueva_zelanda', 'polinesia'],
  australia_occidental: ['sumatra', 'australia_oriental', 'argentina'],
  australia_oriental: ['australia_occidental', 'tasmania', 'nueva_guinea', 'nueva_zelanda', 'chile'],
  tasmania: ['australia_oriental', 'nueva_zelanda'],
  nueva_zelanda: ['tasmania', 'australia_oriental', 'tonga']
};

for (const [from, neighbors] of Object.entries(ADJACENCIES)) {
  for (const to of neighbors) {
    if (!ADJACENCIES[to]) {
      console.warn(`País ${to} no existe en adyacencias`);
    } else if (!ADJACENCIES[to].includes(from)) {
      ADJACENCIES[to].push(from);
    }
  }
}
