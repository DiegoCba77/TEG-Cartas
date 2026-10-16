// Motor de Juego Oficial para T.E.G. Cartas (Yetem)
import {
  CONTINENTS,
  TERRITORIES,
  canAttack,
  generateDiceDeck,
  SPECIAL_CARDS,
  OBJECTIVES,
  PLAYER_COLORS
} from '../data/tegCartasData.js';

export class TegCartasGame {
  constructor(roomId) {
    this.roomId = roomId;
    this.status = 'waiting'; // 'waiting' | 'playing' | 'combat' | 'finished'
    this.round = 1;
    this.currentPlayerIndex = 0;
    this.winner = null;

    this.players = []; // { id, name, color, token, isHost, territories: [], diceCards: [], specialCards: [], secretObjective, conqueredThisRound }

    // Mazos
    this.diceDeck = [];
    this.diceDiscard = [];
    this.specialDeck = [];
    this.specialDiscard = [];

    // Estado de combate activo
    this.pendingCombat = null; // { attackerId, defenderId, fromTerritory, toTerritory, attackerCard, defenderCard, defenderSource, result }

    this.logs = [];
  }

  log(message, type = 'info') {
    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logs.push({ ts: time, message, type });
    if (this.logs.length > 50) this.logs.shift();
  }

  addPlayer(id, name, colorHex, token) {
    // 1. Si ya existe un jugador con el mismo token o mismo nombre desconectado, reconectarlo
    const existing = this.players.find(p => p.token === token || (!p.connected && p.name.trim().toLowerCase() === name.trim().toLowerCase()));
    if (existing) {
      existing.id = id;
      existing.connected = true;
      existing.token = token;
      if (colorHex) {
        const isTakenByOther = this.players.some(p => p.id !== existing.id && p.color.toLowerCase() === colorHex.toLowerCase());
        if (!isTakenByOther) existing.color = colorHex;
      }
      this.log(`${existing.name} se reconectó a la mesa.`, 'info');
      return existing;
    }

    if (this.status !== 'waiting') {
      throw new Error('La partida ya comenzó. Podés reiniciar la sala para jugar una nueva.');
    }

    // Limpiar jugadores desconectados que hayan quedado huérfanos en la sala de espera
    this.players = this.players.filter(p => p.connected || p.isBot);

    if (this.players.length >= 4) {
      throw new Error('La sala está completa (máximo 4 jugadores). Tocá "Reiniciar Sala" para comenzar de cero.');
    }

    // Validar que el color no esté ocupado por otro jugador en la sala
    const activeColors = this.players.map(p => p.color.toLowerCase());
    if (colorHex && activeColors.includes(colorHex.toLowerCase())) {
      const takenBy = this.players.find(p => p.color.toLowerCase() === colorHex.toLowerCase());
      const available = PLAYER_COLORS.find(c => !activeColors.includes(c.hex.toLowerCase()));
      throw new Error(`El color ya fue elegido por ${takenBy?.name || 'otro comandante'}. Por favor elegí ${available ? available.name : 'otro color'}.`);
    }

    let color = colorHex;
    if (!color) {
      const available = PLAYER_COLORS.find(c => !activeColors.includes(c.hex.toLowerCase()));
      color = available ? available.hex : PLAYER_COLORS[0].hex;
    }

    const isHost = this.players.filter(p => !p.isBot).length === 0;

    const player = {
      id,
      name,
      color,
      token,
      isHost,
      isBot: false,
      connected: true,
      territories: [],
      diceCards: [],
      specialCards: [],
      secretObjective: null,
      conqueredThisRound: false,
      peaceTurnsRemaining: 0 // para carta 'Alto el Fuego'
    };

    this.players.push(player);
    this.log(`${name} se sentó a la mesa.`, 'system');
    return player;
  }

  removePlayer(id) {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx === -1) return;
    const p = this.players[idx];
    if (this.status === 'waiting') {
      this.players.splice(idx, 1);
      const remainingHuman = this.players.find(pl => !pl.isBot);
      if (remainingHuman) remainingHuman.isHost = true;
      this.log(`${p.name} salió de la sala.`, 'info');
    } else {
      p.connected = false;
      this.log(`${p.name} se desconectó.`, 'warn');
    }
  }

  addBot() {
    if (this.status !== 'waiting') throw new Error('Solo se pueden agregar bots en sala de espera.');
    if (this.players.length >= 4) throw new Error('La sala ya tiene 4 jugadores.');

    // Elegir siempre un color libre no tomado por ningún jugador
    const activeColors = this.players.map(p => p.color.toLowerCase());
    const availableColorObj = PLAYER_COLORS.find(c => !activeColors.includes(c.hex.toLowerCase())) 
      || PLAYER_COLORS[this.players.length % PLAYER_COLORS.length];
    const availableColor = availableColorObj.hex;

    const botNameByFaction = {
      usa: 'General Patton',
      urss: 'Mariscal Zhúkov',
      germany: 'Mariscal Rommel',
      japan: 'Almirante Yamamoto'
    };

    const usedNames = this.players.map(p => p.name);
    let chosenName = botNameByFaction[availableColorObj.id] || availableColorObj.leader;
    if (usedNames.includes(chosenName)) {
      chosenName = `${availableColorObj.name} Bot ${this.players.length + 1}`;
    }

    const bot = {
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      name: chosenName,
      color: availableColor,
      faction: availableColorObj.id,
      token: 'bot_' + Math.random().toString(36).substring(2, 7),
      isHost: false,
      isBot: true,
      connected: true,
      territories: [],
      diceCards: [],
      specialCards: [],
      secretObjective: null,
      conqueredThisRound: false,
      peaceTurnsRemaining: 0
    };

    this.players.push(bot);
    this.log(`🤖 Se unió ${bot.name} a la sala.`, 'system');
    return bot;
  }

  resetGame() {
    this.status = 'waiting';
    this.round = 1;
    this.players = [];
    this.pendingCombat = null;
    this.winner = null;
    this.diceDeck = [];
    this.diceDiscard = [];
    this.specialDeck = [];
    this.specialDiscard = [];
    this.logs = [];
    this.log('La mesa ha sido reiniciada.', 'system');
  }

  stepBotTurn() {
    const bot = this.getCurrentPlayer();
    if (!bot || !bot.isBot || this.status !== 'playing') return;

    if (bot.diceCards.length === 0 || Math.random() < 0.25) {
      this.endTurn();
      return;
    }

    for (const fromTId of bot.territories) {
      const fromT = TERRITORIES.find(t => t.id === fromTId);
      if (!fromT) continue;

      for (const targetT of TERRITORIES) {
        if (bot.territories.includes(targetT.id)) continue;
        if (canAttack(fromTId, targetT.id)) {
          const defender = this.players.find(p => p.territories.includes(targetT.id));
          if (defender && defender.id !== bot.id && defender.peaceTurnsRemaining === 0) {
            try {
              this.declareAttack(bot.id, fromTId, targetT.id);
              return;
            } catch (e) {}
          }
        }
      }
    }

    this.endTurn();
  }

  startGame() {
    if (this.players.length < 2) {
      throw new Error('Se necesitan al menos 2 jugadores para comenzar.');
    }

    this.status = 'playing';
    this.round = 1;
    this.currentPlayerIndex = 0;

    // 1. Inicializar y mezclar mazos
    this.diceDeck = shuffle(generateDiceDeck());
    this.diceDiscard = [];
    this.specialDeck = shuffle([...SPECIAL_CARDS]);
    this.specialDiscard = [];

    // 2. Repartir Objetivos Secretos según cantidad de jugadores
    const numPlayers = this.players.length;
    const availableObjectives = shuffle(OBJECTIVES.filter(o => o.players === numPlayers));
    this.players.forEach((p, idx) => {
      p.secretObjective = availableObjectives[idx] || availableObjectives[0];
    });

    // 3. Repartir TODOS los 40 territorios uno a uno equitativamente
    const shuffledTerritories = shuffle([...TERRITORIES]);
    let turnIdx = 0;
    shuffledTerritories.forEach(t => {
      this.players[turnIdx % numPlayers].territories.push(t.id);
      turnIdx++;
    });

    // 4. Repartir 5 Cartas de Dados a cada jugador
    this.players.forEach(p => {
      p.diceCards = this.drawDiceCards(5);
      p.specialCards = [];
      p.conqueredThisRound = false;
    });

    this.log(`¡La partida de T.E.G. Cartas comenzó! Turno de ${this.getCurrentPlayer().name}.`, 'system');
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  drawDiceCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.diceDeck.length === 0) {
        if (this.diceDiscard.length === 0) break;
        this.diceDeck = shuffle(this.diceDiscard);
        this.diceDiscard = [];
        this.log('Se remezcló el mazo de descarte de dados.', 'info');
      }
      drawn.push(this.diceDeck.pop());
    }
    return drawn;
  }

  drawSpecialCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.specialDeck.length === 0) {
        if (this.specialDiscard.length === 0) break;
        this.specialDeck = shuffle(this.specialDiscard);
        this.specialDiscard = [];
        this.log('Se remezcló el mazo de cartas especiales.', 'info');
      }
      drawn.push(this.specialDeck.pop());
    }
    return drawn;
  }

  // === ATAQUES Y COMBATES ===
  declareAttack(attackerId, fromTerritoryId, toTerritoryId, ignoreBridges = false) {
    if (this.status !== 'playing') throw new Error('No estás en fase de ataque.');
    const attacker = this.getCurrentPlayer();
    if (attacker.id !== attackerId) throw new Error('No es tu turno de atacar.');

    if (!attacker.territories.includes(fromTerritoryId)) {
      throw new Error('No poseés el territorio atacante.');
    }

    const defender = this.players.find(p => p.territories.includes(toTerritoryId));
    if (!defender) throw new Error('Territorio objetivo no encontrado.');
    if (defender.id === attacker.id) throw new Error('No podés atacar tus propios territorios.');

    if (defender.peaceTurnsRemaining > 0) {
      throw new Error(`${defender.name} tiene tratado de paz (Alto el Fuego) activo.`);
    }

    if (attacker.diceCards.length === 0) {
      throw new Error('No tenés cartas de dados en mano para iniciar un ataque.');
    }

    const needsBridge = !canAttack(fromTerritoryId, toTerritoryId);
    if (needsBridge && !ignoreBridges) {
      if (attacker.surpriseAttack) {
        // Ataque Sorpresa: se consume al atacar fuera del alcance normal
        attacker.surpriseAttack = false;
        this.log(`${attacker.name} lanzó un Ataque Sorpresa fuera de su alcance habitual.`, 'combat');
      } else {
        throw new Error('No podés atacar ese territorio: no está en tu continente ni conectado por puente.');
      }
    }

    this.status = 'combat';
    this.pendingCombat = {
      attackerId: attacker.id,
      defenderId: defender.id,
      fromTerritory: fromTerritoryId,
      toTerritory: toTerritoryId,
      attackerCard: null,
      defenderCard: null,
      defenderSource: null, // 'hand' | 'deck'
      attackerBonuses: [0, 0, 0], // refuerzos por posición de dado
      defenderBonuses: [0, 0, 0],
      defenderArmor: false,       // Defensa Blindada: el atacante necesita ganar los 3 dados
      defenderRevealed: false,    // Espionaje Táctico: el atacante ve la carta del defensor
      result: null
    };

    const fromT = TERRITORIES.find(t => t.id === fromTerritoryId);
    const toT = TERRITORIES.find(t => t.id === toTerritoryId);
    this.log(`⚔️ ${attacker.name} (${fromT.name}) declaró ataque contra ${defender.name} (${toT.name}).`, 'combat');
  }

  playCombatCard(playerId, diceCardId, isFromDeck = false) {
    if (this.status !== 'combat' || !this.pendingCombat) throw new Error('No hay combate activo.');
    const combat = this.pendingCombat;

    if (playerId === combat.attackerId) {
      const p = this.players.find(pl => pl.id === playerId);
      const cardIdx = p.diceCards.findIndex(c => c.id === diceCardId);
      if (cardIdx === -1) throw new Error('Carta de dado no encontrada en tu mano.');
      combat.attackerCard = p.diceCards.splice(cardIdx, 1)[0];
      this.log(`${p.name} preparó su carta de dados de ataque.`, 'info');
    } else if (playerId === combat.defenderId) {
      const p = this.players.find(pl => pl.id === playerId);
      if (isFromDeck) {
        // Opción oficial del manual: defender con la carta de arriba del mazo
        const drawn = this.drawDiceCards(1);
        if (drawn.length === 0) throw new Error('No quedan cartas de dados en el mazo.');
        combat.defenderCard = drawn[0];
        combat.defenderSource = 'deck';
        this.log(`${p.name} apostó a la suerte y tomó la carta superior del mazo para defenderse.`, 'info');
      } else {
        const cardIdx = p.diceCards.findIndex(c => c.id === diceCardId);
        if (cardIdx === -1) throw new Error('Carta de dado no encontrada en tu mano.');
        combat.defenderCard = p.diceCards.splice(cardIdx, 1)[0];
        combat.defenderSource = 'hand';
        this.log(`${p.name} jugó una carta de su mano para defenderse.`, 'info');
      }
    } else {
      throw new Error('No participás en este combate.');
    }

    // Si ambos ya presentaron sus cartas, resolver
    if (combat.attackerCard && combat.defenderCard) {
      this.resolveCombat();
    }
  }

  resolveCombat() {
    const combat = this.pendingCombat;
    const aCard = combat.attackerCard;
    const dCard = combat.defenderCard;

    // Regla oficial Yetem:
    // Se comparan el primer número con el primer número, el segundo con el segundo, y el tercero con el tercero.
    // Los números mayores ganan. En caso de empate gana el defensor.
    const atkValues = [0, 1, 2].map(i => [aCard.d1, aCard.d2, aCard.d3][i] + (combat.attackerBonuses?.[i] || 0));
    const defValues = [0, 1, 2].map(i => [dCard.d1, dCard.d2, dCard.d3][i] + (combat.defenderBonuses?.[i] || 0));

    let atkWins = 0;
    let defWins = 0;
    const rounds = [];

    for (let i = 0; i < 3; i++) {
      const av = atkValues[i];
      const dv = defValues[i];
      if (av > dv) {
        atkWins++;
        rounds.push({ pos: i + 1, atk: av, def: dv, winner: 'attacker' });
      } else {
        defWins++; // Empate gana el defensor
        rounds.push({ pos: i + 1, atk: av, def: dv, winner: 'defender' });
      }
    }

    // Defensa Blindada: el atacante necesita ganar los 3 dados
    const winsNeeded = combat.defenderArmor ? 3 : 2;
    const overallWinner = atkWins >= winsNeeded ? 'attacker' : 'defender';

    const attacker = this.players.find(p => p.id === combat.attackerId);
    const defender = this.players.find(p => p.id === combat.defenderId);
    const toTerritory = TERRITORIES.find(t => t.id === combat.toTerritory);

    if (overallWinner === 'attacker') {
      // Atacante gana: toma la carta de territorio del defensor
      const tIdx = defender.territories.indexOf(combat.toTerritory);
      if (tIdx !== -1) defender.territories.splice(tIdx, 1);
      attacker.territories.push(combat.toTerritory);
      attacker.conqueredThisRound = true;

      this.log(`🏆 ¡${attacker.name} venció en combate (${atkWins}-${defWins}) y conquistó ${toTerritory.name}!`, 'success');

      // Verificar si el defensor fue eliminado
      if (defender.territories.length === 0) {
        this.log(`💀 ¡${defender.name} se quedó sin territorios y ha sido eliminado!`, 'warn');
        this.diceDiscard.push(...defender.diceCards);
        this.specialDiscard.push(...defender.specialCards);
        defender.diceCards = [];
        defender.specialCards = [];
      }
    } else {
      this.log(`🛡️ ¡${defender.name} defendió exitosamente su territorio (${defWins}-${atkWins})!`, 'info');
    }

    // Descartar cartas de dados usadas
    this.diceDiscard.push(aCard, dCard);

    combat.result = {
      rounds,
      atkWins,
      defWins,
      overallWinner,
      conquered: overallWinner === 'attacker'
    };

    // Verificar condición de victoria
    this.checkVictoryConditions();
  }

  closeCombat() {
    this.status = 'playing';
    this.pendingCombat = null;
  }

  // === JUGAR CARTAS ESPECIALES ===
  // opts: { targetId, dieIndex }  (dieIndex: 1..3)
  playSpecialCard(playerId, specialCardId, opts = {}) {
    const { targetId = null, dieIndex = null } = (typeof opts === 'string' ? { targetId: opts } : (opts || {}));
    const player = this.players.find(p => p.id === playerId);
    if (!player) throw new Error('Jugador no encontrado.');

    const cardIdx = player.specialCards.findIndex(c => c.id === specialCardId);
    if (cardIdx === -1) throw new Error('Carta especial no encontrada en tu mano.');
    const card = player.specialCards[cardIdx];

    const combat = this.pendingCombat;
    const live = this.status === 'combat' && combat && !combat.result;
    const isAtk = !!live && combat.attackerId === playerId;
    const isDef = !!live && combat.defenderId === playerId;
    const myTurnFree = this.status === 'playing' && this.getCurrentPlayer()?.id === playerId;

    const needTurn = () => {
      if (!myTurnFree) throw new Error('Esta carta solo se juega en tu turno, fuera de un combate.');
    };
    const needCombat = () => {
      if (!isAtk && !isDef) throw new Error('Esta carta solo se juega durante un combate en el que participes.');
    };

    switch (card.type) {
      case 'suministro': {
        needTurn();
        const drawn = this.drawDiceCards(2);
        player.diceCards.push(...drawn);
        this.log(`${player.name} usó Suministros Extra y robó ${drawn.length} cartas de dados.`, 'info');
        break;
      }
      case 'paz_armada': {
        needTurn();
        player.peaceTurnsRemaining = 2; // cubre los turnos de todos los rivales hasta tu próximo turno
        this.log(`${player.name} activó Alto el Fuego: nadie puede atacarlo hasta su próximo turno.`, 'info');
        break;
      }
      case 'robo_carta': {
        needTurn();
        const victim = this.players.find(p => p.id === targetId);
        if (!victim || victim.id === player.id) throw new Error('Elegí un rival al que infiltrar.');
        const pool = [
          ...victim.diceCards.map(c => ({ c, kind: 'dice' })),
          ...victim.specialCards.map(c => ({ c, kind: 'special' }))
        ];
        if (pool.length === 0) throw new Error(`${victim.name} no tiene cartas para robar.`);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick.kind === 'dice') {
          victim.diceCards.splice(victim.diceCards.indexOf(pick.c), 1);
          player.diceCards.push(pick.c);
        } else {
          victim.specialCards.splice(victim.specialCards.indexOf(pick.c), 1);
          player.specialCards.push(pick.c);
        }
        this.log(`${player.name} usó Infiltración y le robó una carta a ${victim.name}.`, 'info');
        break;
      }
      case 'ataque_sorpresa': {
        needTurn();
        if (player.surpriseAttack) throw new Error('Ya tenés un Ataque Sorpresa preparado.');
        player.surpriseAttack = true;
        this.log(`${player.name} preparó un Ataque Sorpresa: podrá atacar cualquier territorio.`, 'info');
        break;
      }
      case 'reforzar_dado': {
        needCombat();
        const idx = Number(dieIndex);
        if (![1, 2, 3].includes(idx)) throw new Error('Elegí a cuál de tus 3 dados sumar +1.');
        (isAtk ? combat.attackerBonuses : combat.defenderBonuses)[idx - 1] += 1;
        this.log(`${player.name} reforzó su dado Nº${idx} con +1.`, 'combat');
        break;
      }
      case 'reforzar_dado_2': {
        needCombat();
        (isAtk ? combat.attackerBonuses : combat.defenderBonuses)[2] += 2;
        this.log(`${player.name} reforzó su dado menor con +2.`, 'combat');
        break;
      }
      case 'repetir_dado': {
        needCombat();
        const placed = isAtk ? combat.attackerCard : combat.defenderCard;
        if (!placed) throw new Error('Primero tenés que jugar tu carta de dados para poder relanzarla.');
        const fresh = this.drawDiceCards(1);
        if (fresh.length === 0) throw new Error('No quedan cartas de dados en el mazo.');
        this.diceDiscard.push(placed);
        if (isAtk) combat.attackerCard = fresh[0]; else combat.defenderCard = fresh[0];
        this.log(`${player.name} relanzó su carta de combate.`, 'combat');
        break;
      }
      case 'espionaje': {
        if (!isAtk) throw new Error('Solo el atacante puede espiar, durante el combate.');
        if (combat.attackerCard) throw new Error('El espionaje se usa antes de jugar tu carta de dados.');
        if (!combat.defenderCard) throw new Error('El defensor todavía no jugó su carta: no hay nada que espiar.');
        combat.defenderRevealed = true;
        this.log(`${player.name} espió la carta del defensor.`, 'combat');
        break;
      }
      case 'defensa_aerea': {
        if (!isDef) throw new Error('Solo el defensor puede usar la Defensa Blindada, durante el combate.');
        if (combat.defenderArmor) throw new Error('La Defensa Blindada ya está activa en este combate.');
        combat.defenderArmor = true;
        this.log(`${player.name} desplegó una Defensa Blindada: el atacante necesita ganar los 3 dados.`, 'combat');
        break;
      }
      default:
        throw new Error('Carta especial desconocida.');
    }

    const removeIdx = player.specialCards.findIndex(c => c.id === specialCardId);
    if (removeIdx !== -1) player.specialCards.splice(removeIdx, 1);
    this.specialDiscard.push(card);
  }

  drawTestSpecial(playerId) {
    const p = this.players.find(pl => pl.id === playerId);
    if (!p) throw new Error('Jugador no encontrado');
    const drawn = this.drawSpecialCards(1);
    if (drawn.length === 0) throw new Error('No quedan cartas especiales en el mazo');
    p.specialCards.push(...drawn);
    this.log(`🧪 ${p.name} robó 1 carta especial del mazo (${drawn[0].name}).`, 'info');
  }

  // === PASAR TURNO Y RONDA DE JUEGO ===
  endTurn() {
    if (this.status !== 'playing') throw new Error('No podés finalizar turno en este momento.');
    const current = this.getCurrentPlayer();
    if (current.peaceTurnsRemaining > 0) current.peaceTurnsRemaining--;

    // Avanzar al siguiente jugador activo con territorios
    let nextIdx = (this.currentPlayerIndex + 1) % this.players.length;
    let loops = 0;
    while (this.players[nextIdx].territories.length === 0 && loops < this.players.length) {
      nextIdx = (nextIdx + 1) % this.players.length;
      loops++;
    }

    // ¿Comenzó una nueva ronda (volvió al primer jugador)?
    if (nextIdx <= this.currentPlayerIndex) {
      this.startNewRound();
    } else {
      this.currentPlayerIndex = nextIdx;
      this.log(`Turno de ${this.getCurrentPlayer().name}.`, 'info');
    }
  }

  startNewRound() {
    this.round++;
    this.log(`═════════════ INICIA LA RONDA ${this.round} ═════════════`, 'system');

    // Regla oficial Yetem para 2ª ronda en adelante:
    // 1. Cada jugador recibe cartas de dado = mitad de sus territorios (redondeado hacia arriba, mínimo 3)
    // 2. Si conquistó al menos 1 territorio en la ronda anterior -> 1 CARTA ESPECIAL
    // 3. Si posee un continente completo -> Cartas especiales extra según tabla
    this.players.forEach(p => {
      if (p.territories.length === 0) return;

      // Cartas de Dados
      const count = Math.max(3, Math.ceil(p.territories.length / 2));
      const newDice = this.drawDiceCards(count);
      p.diceCards.push(...newDice);

      // Cartas Especiales por conquista
      let specialCount = p.conqueredThisRound ? 1 : 0;
      p.conqueredThisRound = false;

      // Cartas Especiales por continente completo
      for (const [cId, cont] of Object.entries(CONTINENTS)) {
        const ownsAll = cont.territoryCount === p.territories.filter(tId => {
          const t = TERRITORIES.find(te => te.id === tId);
          return t && t.continent === cId;
        }).length;

        if (ownsAll) {
          specialCount += cont.bonusCards;
          this.log(`🌟 ${p.name} domina ${cont.name} y recibe ${cont.bonusCards} carta(s) especial(es) extra!`, 'success');
        }
      }

      if (specialCount > 0) {
        const newSpecials = this.drawSpecialCards(specialCount);
        p.specialCards.push(...newSpecials);
      }

      // Regla de límite de mano: máximo 15 cartas
      while (p.diceCards.length + p.specialCards.length > 15) {
        if (p.diceCards.length > 0) this.diceDiscard.push(p.diceCards.pop());
        else if (p.specialCards.length > 0) this.specialDiscard.push(p.specialCards.pop());
      }
    });

    this.currentPlayerIndex = 0;
    this.log(`Turno de ${this.getCurrentPlayer().name}.`, 'info');
  }

  // === CONDICIÓN DE VICTORIA ===
  checkVictoryConditions() {
    const commonGoal = this.players.length === 4 ? 21 : 29;

    for (const p of this.players) {
      // 1. Objetivo común
      if (p.territories.length >= commonGoal) {
        this.winner = p.id;
        this.status = 'finished';
        this.log(`🎉 ¡VICTORIA! ${p.name} conquistó ${p.territories.length} territorios y cumplió el Objetivo Común!`, 'success');
        return;
      }

      // 2. Objetivo secreto
      if (this.evalSecretObjective(p)) {
        this.winner = p.id;
        this.status = 'finished';
        this.log(`🎉 ¡VICTORIA! ${p.name} cumplió su Objetivo Secreto: ${p.secretObjective.title}!`, 'success');
        return;
      }
    }
  }

  evalSecretObjective(player) {
    if (!player.secretObjective) return false;
    const objId = player.secretObjective.id;
    const myT = player.territories;

    // Helper por continente
    const countIn = (cId) => myT.filter(tid => TERRITORIES.find(t => t.id === tid)?.continent === cId).length;

    // Evaluador de objetivos oficiales
    if (objId.includes('Expansion') || objId.includes('Expansión') || objId === 'obj_2p_4') {
      return myT.length >= 25;
    }
    if (objId === 'obj_3p_4') return myT.length >= 20;
    if (objId === 'obj_4p_4') return myT.length >= 16;

    if (objId === 'obj_2p_6') {
      // América del Sur (6), África (5) y Oceanía (2)
      return countIn('AMERICA_DEL_SUR') === 6 && countIn('AFRICA') === 5 && countIn('OCEANIA') === 2;
    }
    if (objId === 'obj_2p_7') {
      // América del Norte (9) y Europa (9)
      return countIn('AMERICA_DEL_NORTE') === 9 && countIn('EUROPA') === 9;
    }
    if (objId === 'obj_3p_6') {
      // América del Norte (9) y África (5)
      return countIn('AMERICA_DEL_NORTE') === 9 && countIn('AFRICA') === 5;
    }
    if (objId === 'obj_4p_7') {
      // América del Sur (6) y África (5)
      return countIn('AMERICA_DEL_SUR') === 6 && countIn('AFRICA') === 5;
    }

    return false;
  }

  toClientState(forPlayerId) {
    let maskedCombat = null;
    if (this.pendingCombat) {
      maskedCombat = { ...this.pendingCombat };
      if (!this.pendingCombat.result) {
        // Si el combate no se ha resuelto aún, ocultar la carta del oponente (se muestra boca abajo)
        if (maskedCombat.attackerCard && forPlayerId !== maskedCombat.attackerId) {
          maskedCombat.attackerCard = { faceDown: true };
        }
        if (maskedCombat.defenderCard && forPlayerId !== maskedCombat.defenderId) {
          // Espionaje Táctico: el atacante puede ver la carta del defensor
          const spied = maskedCombat.defenderRevealed && forPlayerId === maskedCombat.attackerId;
          if (!spied) maskedCombat.defenderCard = { faceDown: true };
        }
      }
    }

    return {
      roomId: this.roomId,
      status: this.status,
      round: this.round,
      currentPlayerId: this.getCurrentPlayer()?.id,
      winner: this.winner,
      pendingCombat: maskedCombat,
      diceDeckCount: this.diceDeck.length,
      diceDiscardCount: this.diceDiscard.length,
      specialDeckCount: this.specialDeck.length,
      specialDiscardCount: this.specialDiscard.length,
      logs: this.logs,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        isHost: p.isHost,
        connected: p.connected,
        isCurrent: p.id === this.getCurrentPlayer()?.id,
        territoryCount: p.territories.length,
        territories: p.territories, // Siempre público (están boca arriba en la mesa)
        diceCount: p.diceCards.length,
        specialCount: p.specialCards.length,
        peaceActive: (p.peaceTurnsRemaining || 0) > 0,
        mySurpriseAttack: p.id === forPlayerId ? !!p.surpriseAttack : undefined,
        // Datos privados solo para el dueño
        myDiceCards: p.id === forPlayerId ? p.diceCards : undefined,
        mySpecialCards: p.id === forPlayerId ? p.specialCards : undefined,
        secretObjective: p.id === forPlayerId ? p.secretObjective : undefined
      }))
    };
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
