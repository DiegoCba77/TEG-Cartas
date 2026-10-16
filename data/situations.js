// 50 Tarjetas de Situación oficiales de TEG La Revancha
// Se destapa una al comienzo de cada ronda a partir de la ronda 2.

export const SITUATION_TYPES = {
  CLASICO: {
    name: 'Combate Clásico',
    description: 'Las acciones bélicas continúan desarrollándose sin modificación alguna.',
    badge: '⚔️ Clásico'
  },
  NIEVE: {
    name: 'Nieve',
    description: 'Los defensores tiran con 1 dado más del que les correspondería (máximo 4 dados).',
    badge: '❄️ Nieve (+1 dado defensor)'
  },
  VIENTO_A_FAVOR: {
    name: 'Viento a Favor',
    description: 'Los atacantes tiran con 1 dado más del que les correspondería (máximo 4 dados).',
    badge: '💨 Viento a Favor (+1 dado atacante)'
  },
  FRONTERAS_ABIERTAS: {
    name: 'Fronteras Abiertas',
    description: 'Sólo podrán realizarse ataques desde un continente hacia afuera.',
    badge: '🌐 Fronteras Abiertas (solo intercontinental)'
  },
  FRONTERAS_CERRADAS: {
    name: 'Fronteras Cerradas',
    description: 'Sólo podrán realizarse ataques dentro de las fronteras de cada continente.',
    badge: '🔒 Fronteras Cerradas (solo intracontinental)'
  },
  CRISIS: {
    name: 'Crisis',
    description: 'Cada jugador tira un dado. El número más bajo no podrá sacar tarjeta de países en esta vuelta.',
    badge: '⚠️ Crisis'
  },
  REFUERZOS_EXTRAS: {
    name: 'Refuerzos Extras',
    description: 'Todos los jugadores incorporan una suma extra de ejércitos igual a la mitad de los países ocupados.',
    badge: '🎖️ Refuerzos Extras'
  },
  DESCANSO: {
    name: 'Descanso',
    description: 'El color indicado sólo incorpora ejércitos, pero no podrá atacar ni reagrupar en esta vuelta.',
    badge: '🛑 Descanso'
  }
};

export function generateSituationDeck() {
  const deck = [];

  // 20 Combate Clásico
  for (let i = 0; i < 20; i++) {
    deck.push({ id: `clasico_${i}`, type: 'CLASICO', ...SITUATION_TYPES.CLASICO });
  }

  // 4 Nieve
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `nieve_${i}`, type: 'NIEVE', ...SITUATION_TYPES.NIEVE });
  }

  // 4 Viento a favor
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `viento_${i}`, type: 'VIENTO_A_FAVOR', ...SITUATION_TYPES.VIENTO_A_FAVOR });
  }

  // 4 Fronteras abiertas
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `abiertas_${i}`, type: 'FRONTERAS_ABIERTAS', ...SITUATION_TYPES.FRONTERAS_ABIERTAS });
  }

  // 4 Fronteras cerradas
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `cerradas_${i}`, type: 'FRONTERAS_CERRADAS', ...SITUATION_TYPES.FRONTERAS_CERRADAS });
  }

  // 4 Crisis
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `crisis_${i}`, type: 'CRISIS', ...SITUATION_TYPES.CRISIS });
  }

  // 4 Refuerzos extras
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `refuerzos_${i}`, type: 'REFUERZOS_EXTRAS', ...SITUATION_TYPES.REFUERZOS_EXTRAS });
  }

  // 6 Descanso (uno por color)
  const colors = ['blanco', 'negro', 'rojo', 'azul', 'amarillo', 'verde'];
  colors.forEach(color => {
    deck.push({
      id: `descanso_${color}`,
      type: 'DESCANSO',
      targetColor: color,
      name: `Descanso (${color.toUpperCase()})`,
      description: `El jugador ${color.toUpperCase()} sólo incorpora ejércitos, no ataca ni reagrupa.`,
      badge: `🛑 Descanso: ${color.toUpperCase()}`
    });
  });

  // Mezclar mazo
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
