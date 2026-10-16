// TEG II - Objetivos de cada Superpotencia

export const OBJECTIVES = [
  {
    id: 'obj_EEUU_1',
    superpowerId: 'EEUU',
    title: 'Dominio del Pacífico',
    description: 'Controlar el Océano Pacífico, Indochina y Japón (con 4+ ejércitos propios en cada uno, sin rivales).',
    targets: ['PACIFICO', 'INDOCHINA', 'JAPON'],
    type: 'control'
  },
  {
    id: 'obj_EEUU_2',
    superpowerId: 'EEUU',
    title: 'Hemisferio Americano',
    description: 'Controlar América Latina: Chile, Argentina, Brasil, R. Andina, Colom/Venez.',
    targets: ['CHILE', 'ARGENTINA', 'BRASIL', 'R_ANDINA', 'COLOM_VENEZ'],
    type: 'control'
  },
  {
    id: 'obj_URSS_1',
    superpowerId: 'URSS',
    title: 'Cortina de Hierro Global',
    description: 'Controlar Europa Oriental, Europa Occidental y el Medio Oriente.',
    targets: ['EUROPA_OR', 'EUROPA_OCC', 'MEDIO_ORIENTE'],
    type: 'control'
  },
  {
    id: 'obj_URSS_2',
    superpowerId: 'URSS',
    title: 'Mar Interior',
    description: 'Intervenir en los tres océanos: Atlántico, Pacífico e Índico.',
    targets: ['ATLANTICO', 'PACIFICO', 'INDICO'],
    type: 'intervention'
  },
  {
    id: 'obj_CHINA_1',
    superpowerId: 'CHINA',
    title: 'Asia Unificada',
    description: 'Controlar India, Indochina y el Océano Índico.',
    targets: ['INDIA', 'INDOCHINA', 'INDICO'],
    type: 'control'
  },
  {
    id: 'obj_CHINA_2',
    superpowerId: 'CHINA',
    title: 'Gran Muralla Extendida',
    description: 'Intervenir en URSS y controlar el Océano Pacífico.',
    targets: ['URSS', 'PACIFICO'],
    type: 'mixed'
  },
  {
    id: 'obj_JAPON_1',
    superpowerId: 'JAPON',
    title: 'Imperio del Pacífico',
    description: 'Controlar el Océano Pacífico, Indochina y el Índico.',
    targets: ['PACIFICO', 'INDOCHINA', 'INDICO'],
    type: 'control'
  },
  {
    id: 'obj_JAPON_2',
    superpowerId: 'JAPON',
    title: 'Esfera de Coprosperidad',
    description: 'Intervenir en China y controlar el Caribe.',
    targets: ['CHINA', 'CARIBE'],
    type: 'mixed'
  },
  {
    id: 'obj_EOOCC_1',
    superpowerId: 'EUROPA_OCC',
    title: 'Neocolonialismo',
    description: 'Controlar Norte de África, África Central y Cuerno de África.',
    targets: ['NORTE_AFRICA', 'AFRICA_CENTRAL', 'CUERNO_AFRICA'],
    type: 'control'
  },
  {
    id: 'obj_EOOCC_2',
    superpowerId: 'EUROPA_OCC',
    title: 'Occidente Unido',
    description: 'Controlar el Atlántico e intervenir en EE.UU.',
    targets: ['ATLANTICO', 'EEUU'],
    type: 'mixed'
  },
  {
    id: 'obj_EOOR_1',
    superpowerId: 'EUROPA_OR',
    title: 'Alianza Oriental',
    description: 'Intervenir en URSS, China y controlar el Medio Oriente.',
    targets: ['URSS', 'CHINA', 'MEDIO_ORIENTE'],
    type: 'mixed'
  },
  {
    id: 'obj_EOOR_2',
    superpowerId: 'EUROPA_OR',
    title: 'Africa Socialista',
    description: 'Controlar Norte de África, África Central y África del Sur.',
    targets: ['NORTE_AFRICA', 'AFRICA_CENTRAL', 'AFRICA_SUR'],
    type: 'control'
  }
];
