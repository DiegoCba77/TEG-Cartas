// Definición oficial de datos para T.E.G. Cartas (Yetem)

export const CONTINENTS = {
  AMERICA_DEL_SUR: {
    id: 'AMERICA_DEL_SUR',
    name: 'América del Sur',
    color: '#27ae60', // Verde
    territoryCount: 6,
    bonusCards: 1,
    icon: '🌴'
  },
  AMERICA_DEL_NORTE: {
    id: 'AMERICA_DEL_NORTE',
    name: 'América del Norte',
    color: '#2980b9', // Azul
    territoryCount: 9,
    bonusCards: 2,
    icon: '🦅'
  },
  EUROPA: {
    id: 'EUROPA',
    name: 'Europa',
    color: '#8e44ad', // Violeta
    territoryCount: 9,
    bonusCards: 2,
    icon: '🏰'
  },
  ASIA: {
    id: 'ASIA',
    name: 'Asia',
    color: '#d4ac0d', // Amarillo
    territoryCount: 9,
    bonusCards: 3,
    icon: '🐉'
  },
  AFRICA: {
    id: 'AFRICA',
    name: 'África',
    color: '#d35400', // Naranja / Marrón
    territoryCount: 5,
    bonusCards: 1,
    icon: '🦁'
  },
  OCEANIA: {
    id: 'OCEANIA',
    name: 'Oceanía',
    color: '#16a085', // Verde azulado / Turquesa
    territoryCount: 2,
    bonusCards: 1,
    icon: '🦘'
  }
};

// 40 Territorios con sus puentes intercontinentales oficiales
export const TERRITORIES = [
  // === AMÉRICA DEL SUR (6) ===
  { id: 'ARGENTINA', name: 'Argentina', continent: 'AMERICA_DEL_SUR', bridges: [] },
  { id: 'BRASIL', name: 'Brasil', continent: 'AMERICA_DEL_SUR', bridges: ['SAHARA'] },
  { id: 'CHILE', name: 'Chile', continent: 'AMERICA_DEL_SUR', bridges: ['AUSTRALIA'] },
  { id: 'COLOMBIA', name: 'Colombia', continent: 'AMERICA_DEL_SUR', bridges: ['MEXICO'] },
  { id: 'PERU', name: 'Perú', continent: 'AMERICA_DEL_SUR', bridges: [] },
  { id: 'URUGUAY', name: 'Uruguay', continent: 'AMERICA_DEL_SUR', bridges: [] },

  // === AMÉRICA DEL NORTE (9) ===
  { id: 'MEXICO', name: 'México', continent: 'AMERICA_DEL_NORTE', bridges: ['COLOMBIA'] },
  { id: 'CALIFORNIA', name: 'California', continent: 'AMERICA_DEL_NORTE', bridges: [] },
  { id: 'NUEVA_YORK', name: 'Nueva York', continent: 'AMERICA_DEL_NORTE', bridges: [] },
  { id: 'OREGON', name: 'Oregón', continent: 'AMERICA_DEL_NORTE', bridges: [] },
  { id: 'TERRANOVA', name: 'Terranova', continent: 'AMERICA_DEL_NORTE', bridges: ['GRAN_BRETANA'] },
  { id: 'CANADA', name: 'Canadá', continent: 'AMERICA_DEL_NORTE', bridges: [] },
  { id: 'YUKON', name: 'Yukón', continent: 'AMERICA_DEL_NORTE', bridges: [] },
  { id: 'ALASKA', name: 'Alaska', continent: 'AMERICA_DEL_NORTE', bridges: ['KAMCHATKA'] },
  { id: 'GROENLANDIA', name: 'Groenlandia', continent: 'AMERICA_DEL_NORTE', bridges: ['ISLANDIA'] },

  // === EUROPA (9) ===
  { id: 'ISLANDIA', name: 'Islandia', continent: 'EUROPA', bridges: ['GROENLANDIA'] },
  { id: 'GRAN_BRETANA', name: 'Gran Bretaña', continent: 'EUROPA', bridges: ['TERRANOVA'] },
  { id: 'ESPANIA', name: 'España', continent: 'EUROPA', bridges: ['SAHARA'] },
  { id: 'FRANCIA', name: 'Francia', continent: 'EUROPA', bridges: [] },
  { id: 'ALEMANIA', name: 'Alemania', continent: 'EUROPA', bridges: [] },
  { id: 'ITALIA', name: 'Italia', continent: 'EUROPA', bridges: [] },
  { id: 'POLONIA', name: 'Polonia', continent: 'EUROPA', bridges: ['RUSIA'] },
  { id: 'SUECIA', name: 'Suecia', continent: 'EUROPA', bridges: ['RUSIA'] },
  { id: 'RUSIA', name: 'Rusia', continent: 'EUROPA', bridges: ['ARAL', 'SIBERIA', 'IRAN'] },

  // === ASIA (9) ===
  { id: 'ARAL', name: 'Aral', continent: 'ASIA', bridges: ['RUSIA'] },
  { id: 'SIBERIA', name: 'Siberia', continent: 'ASIA', bridges: ['RUSIA'] },
  { id: 'TARTARIA', name: 'Tartaria', continent: 'ASIA', bridges: [] },
  { id: 'TAIMIR', name: 'Taimir', continent: 'ASIA', bridges: [] },
  { id: 'KAMCHATKA', name: 'Kamchatka', continent: 'ASIA', bridges: ['ALASKA'] },
  { id: 'CHINA', name: 'China', continent: 'ASIA', bridges: [] },
  { id: 'INDIA', name: 'India', continent: 'ASIA', bridges: [] },
  { id: 'IRAN', name: 'Irán', continent: 'ASIA', bridges: ['RUSIA', 'EGIPTO'] },
  { id: 'JAPON', name: 'Japón', continent: 'ASIA', bridges: ['KAMCHATKA'] },

  // === ÁFRICA (5) ===
  { id: 'SAHARA', name: 'Sahara', continent: 'AFRICA', bridges: ['BRASIL', 'ESPANIA'] },
  { id: 'EGIPTO', name: 'Egipto', continent: 'AFRICA', bridges: ['IRAN', 'POLONIA'] },
  { id: 'ETIOPIA', name: 'Etiopía', continent: 'AFRICA', bridges: [] },
  { id: 'ZAIRE', name: 'Zaire', continent: 'AFRICA', bridges: [] },
  { id: 'SUDAFRICA', name: 'Sudáfrica', continent: 'AFRICA', bridges: [] },

  // === OCEANÍA (2) ===
  { id: 'AUSTRALIA', name: 'Australia', continent: 'OCEANIA', bridges: ['CHILE', 'INDIA'] },
  { id: 'SUMATRA', name: 'Sumatra', continent: 'OCEANIA', bridges: ['INDIA'] }
];

// Helper: ¿Puede origen atacar a destino?
export function canAttack(fromTerritoryId, toTerritoryId) {
  if (fromTerritoryId === toTerritoryId) return false;
  const tFrom = TERRITORIES.find(t => t.id === fromTerritoryId);
  const tTo = TERRITORIES.find(t => t.id === toTerritoryId);
  if (!tFrom || !tTo) return false;

  // Mismo continente -> Siempre se puede atacar
  if (tFrom.continent === tTo.continent) return true;

  // Continentes distintos -> Solo si hay puente directo
  return tFrom.bridges.includes(toTerritoryId) || tTo.bridges.includes(fromTerritoryId);
}

// 56 Cartas de Dados equilibradas oficiales (3 dados ordenados descendentemente: d1 >= d2 >= d3)
export function generateDiceDeck() {
  const deck = [];
  let id = 1;

  // Variedad de combinaciones de dados del 1 al 6
  const combos = [
    [6,6,6], [6,6,5], [6,6,4], [6,6,3], [6,5,5], [6,5,4], [6,5,3], [6,5,2],
    [6,4,4], [6,4,3], [6,4,2], [6,4,1], [6,3,3], [6,3,2], [6,3,1], [6,2,1],
    [5,5,5], [5,5,4], [5,5,3], [5,5,2], [5,4,4], [5,4,3], [5,4,2], [5,4,1],
    [5,3,3], [5,3,2], [5,3,1], [5,2,2], [5,2,1], [5,1,1],
    [4,4,4], [4,4,3], [4,4,2], [4,4,1], [4,3,3], [4,3,2], [4,3,1], [4,2,2], [4,2,1], [4,1,1],
    [3,3,3], [3,3,2], [3,3,1], [3,2,2], [3,2,1], [3,1,1],
    [2,2,2], [2,2,1], [2,1,1], [1,1,1],
    [6,5,4], [5,4,3], [4,3,2], [6,4,2], [5,3,1], [6,6,2]
  ];

  combos.slice(0, 56).forEach(c => {
    deck.push({ id: `dice_${id++}`, d1: c[0], d2: c[1], d3: c[2] });
  });

  return deck;
}

// 16 Cartas Especiales oficiales de Yetem con arte conceptual de la Segunda Guerra Mundial
export const SPECIAL_CARDS = [
  { id: 'sp_1', type: 'reforzar_dado', name: '+1 a un dado', concept: 'Artillería Pesada 155mm', artKey: 'artillery', desc: 'Durante un combate (atacando o defendiendo), sumá +1 a uno de los 3 dados de tu carta. Elegís cuál.' },
  { id: 'sp_2', type: 'reforzar_dado', name: '+1 a un dado', concept: 'Artillería Pesada 155mm', artKey: 'artillery', desc: 'Durante un combate (atacando o defendiendo), sumá +1 a uno de los 3 dados de tu carta. Elegís cuál.' },
  { id: 'sp_3', type: 'reforzar_dado_2', name: '+2 al dado menor', concept: 'Munición Perforante Flak', artKey: 'ammo', desc: 'Durante un combate, sumá +2 al tercer dado (el menor) de tu carta.' },
  { id: 'sp_4', type: 'reforzar_dado_2', name: '+2 al dado menor', concept: 'Munición Perforante Flak', artKey: 'ammo', desc: 'Durante un combate, sumá +2 al tercer dado (el menor) de tu carta.' },
  { id: 'sp_5', type: 'repetir_dado', name: 'Relanzar Combate', concept: 'Apoyo Aéreo Táctico', artKey: 'air_support', desc: 'Durante un combate, después de jugar tu carta de dados: la descartás y robás otra nueva del mazo.' },
  { id: 'sp_6', type: 'repetir_dado', name: 'Relanzar Combate', concept: 'Apoyo Aéreo Táctico', artKey: 'air_support', desc: 'Durante un combate, después de jugar tu carta de dados: la descartás y robás otra nueva del mazo.' },
  { id: 'sp_7', type: 'espionaje', name: 'Espionaje Táctico', concept: 'Inteligencia y Radar', artKey: 'espionage', desc: 'Como atacante, antes de jugar tu carta: si el defensor ya jugó la suya, la ves boca arriba.' },
  { id: 'sp_8', type: 'espionaje', name: 'Espionaje Táctico', concept: 'Inteligencia y Radar', artKey: 'espionage', desc: 'Como atacante, antes de jugar tu carta: si el defensor ya jugó la suya, la ves boca arriba.' },
  { id: 'sp_9', type: 'robo_carta', name: 'Infiltración', concept: 'Comandos Paracaidistas', artKey: 'infiltration', desc: 'En tu turno: robale una carta al azar (de dados o especial) a un rival que elijas.' },
  { id: 'sp_10', type: 'robo_carta', name: 'Infiltración', concept: 'Comandos Paracaidistas', artKey: 'infiltration', desc: 'En tu turno: robale una carta al azar (de dados o especial) a un rival que elijas.' },
  { id: 'sp_11', type: 'defensa_aerea', name: 'Defensa Blindada', concept: 'División Blindada', artKey: 'armor', desc: 'Como defensor, durante el combate: el atacante necesita ganar los 3 dados (en lugar de 2) para conquistar.' },
  { id: 'sp_12', type: 'defensa_aerea', name: 'Defensa Blindada', concept: 'División Blindada', artKey: 'armor', desc: 'Como defensor, durante el combate: el atacante necesita ganar los 3 dados (en lugar de 2) para conquistar.' },
  { id: 'sp_13', type: 'ataque_sorpresa', name: 'Ataque Sorpresa', concept: 'Desembarco Anfibio', artKey: 'blitz', desc: 'En tu turno: tu próximo ataque puede apuntar a cualquier territorio del mundo, ignorando puentes.' },
  { id: 'sp_14', type: 'ataque_sorpresa', name: 'Ataque Sorpresa', concept: 'Desembarco Anfibio', artKey: 'blitz', desc: 'En tu turno: tu próximo ataque puede apuntar a cualquier territorio del mundo, ignorando puentes.' },
  { id: 'sp_15', type: 'paz_armada', name: 'Alto el Fuego', concept: 'Tratado de Armisticio', artKey: 'ceasefire', desc: 'En tu turno: ningún rival puede atacarte hasta tu próximo turno.' },
  { id: 'sp_16', type: 'suministro', name: 'Suministros Extra', concept: 'Lanzamiento Aéreo', artKey: 'supply', desc: 'En tu turno: robás 2 cartas de dados inmediatamente del mazo.' }
];

// 21 Objetivos Secretos de TEG Cartas
export const OBJECTIVES = [
  // Objetivos para 2 jugadores
  { id: 'obj_2p_1', players: 2, title: 'Dominio Continental I', desc: 'Ocupar América del Sur, Europa y 4 territorios de Asia.' },
  { id: 'obj_2p_2', players: 2, title: 'Dominio Continental II', desc: 'Ocupar Asia, África y 3 territorios de América del Norte.' },
  { id: 'obj_2p_3', players: 2, title: 'Dominio Continental III', desc: 'Ocupar América del Norte, Oceanía y 5 territorios de Europa.' },
  { id: 'obj_2p_4', players: 2, title: 'Expansión Global I', desc: 'Ocupar 25 territorios en cualquier parte del mundo.' },
  { id: 'obj_2p_5', players: 2, title: 'Expansión Global II', desc: 'Ocupar 23 territorios teniendo presencia en los 6 continentes.' },
  { id: 'obj_2p_6', players: 2, title: 'Bloque Austral', desc: 'Ocupar América del Sur, África y Oceanía completos.' },
  { id: 'obj_2p_7', players: 2, title: 'Bloque Boreal', desc: 'Ocupar América del Norte y Europa completos.' },

  // Objetivos para 3 jugadores
  { id: 'obj_3p_1', players: 3, title: 'Dominio Continental I', desc: 'Ocupar América del Sur, 7 de América del Norte y 4 de Europa.' },
  { id: 'obj_3p_2', players: 3, title: 'Dominio Continental II', desc: 'Ocupar África, 6 de Asia y Oceanía completo.' },
  { id: 'obj_3p_3', players: 3, title: 'Dominio Continental III', desc: 'Ocupar Europa, 4 de América del Sur y 3 de África.' },
  { id: 'obj_3p_4', players: 3, title: 'Expansión Global I', desc: 'Ocupar 20 territorios en cualquier lugar del planeta.' },
  { id: 'obj_3p_5', players: 3, title: 'Expansión Global II', desc: 'Ocupar 18 territorios teniendo al menos 2 en cada continente.' },
  { id: 'obj_3p_6', players: 3, title: 'Eje Atlántico', desc: 'Ocupar América del Norte y África completos.' },
  { id: 'obj_3p_7', players: 3, title: 'Eje Pacífico', desc: 'Ocupar Asia y América del Sur completos.' },

  // Objetivos para 4 jugadores
  { id: 'obj_4p_1', players: 4, title: 'Dominio Rápido I', desc: 'Ocupar América del Sur, 5 de América del Norte y 4 de África.' },
  { id: 'obj_4p_2', players: 4, title: 'Dominio Rápido II', desc: 'Ocupar Europa, Oceanía y 4 de Asia.' },
  { id: 'obj_4p_3', players: 4, title: 'Dominio Rápido III', desc: 'Ocupar África, 5 de Europa y 3 de América del Sur.' },
  { id: 'obj_4p_4', players: 4, title: 'Expansión Táctica', desc: 'Ocupar 16 territorios en cualquier lugar del mapa.' },
  { id: 'obj_4p_5', players: 4, title: 'Soberanía Boreal', desc: 'Ocupar América del Norte y 4 territorios de Europa.' },
  { id: 'obj_4p_6', players: 4, title: 'Soberanía Oriental', desc: 'Ocupar Asia completo y 2 territorios de Oceanía.' },
  { id: 'obj_4p_7', players: 4, title: 'Soberanía Austral', desc: 'Ocupar América del Sur y África completos.' }
];

// 4 Grandes Potencias de la Segunda Guerra Mundial
export const PLAYER_COLORS = [
  {
    id: 'usa',
    name: 'EEUU',
    army: 'Fuerzas Aliadas',
    country: 'Estados Unidos',
    hex: '#2563eb', // Royal Blue Aliado
    text: '#ffffff',
    flag: '🇺🇸',
    badge: '★',
    motto: 'Arsenal de la Democracia',
    leader: 'General Patton',
    insignia: 'star'
  },
  {
    id: 'urss',
    name: 'URSS',
    army: 'Ejército Rojo',
    country: 'Unión Soviética',
    hex: '#dc2626', // Rojo Carmesí Soviético
    text: '#ffffff',
    flag: '☭',
    badge: '★',
    motto: 'Por la Madre Patria',
    leader: 'Mariscal Zhúkov',
    insignia: 'soviet'
  },
  {
    id: 'germany',
    name: 'Alemania',
    army: 'Wehrmacht',
    country: 'Alemania',
    hex: '#475569', // Gris Acero Wehrmacht
    text: '#ffffff',
    flag: '✠',
    badge: '✠',
    motto: 'Guerra Relámpago',
    leader: 'Mariscal Rommel',
    insignia: 'cross'
  },
  {
    id: 'japan',
    name: 'Japón',
    army: 'Imperio del Sol',
    country: 'Imperio de Japón',
    hex: '#d97706', // Ámbar Imperial
    text: '#ffffff',
    flag: '🇯🇵',
    badge: '☀',
    motto: 'Sol Naciente',
    leader: 'Almirante Yamamoto',
    insignia: 'sun'
  }
];
