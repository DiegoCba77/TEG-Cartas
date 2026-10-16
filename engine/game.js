// TEG II - Engine Principal (Cold War Edition)
// Mecánica: Potencial Bélico + Comando de Batallas (3 diales secretos)
// Unidades: Ejércitos (tierra), Aviones (aire), Barcos (mar)

import { REGIONS, SUPERPOWERS, POTENCIAL_BELICO_TRACK, INITIAL_POTENCIAL, getRegion } from '../data/regions.js';
import { OBJECTIVES } from '../data/objectives.js';

export class TegGame {
  constructor(roomId) {
    this.roomId = roomId;
    this.version = 'TEG_II_v1';

    // Estado general
    this.status = 'waiting'; // 'waiting' | 'playing' | 'finished'
    this.phase = 'setup';   // 'setup' | 'incorporation' | 'attacks' | 'regroup' | 'endturn'

    // Jugadores: up to 6, each picks one superpower
    this.players = [];
    /*
      player: {
        id, name, token, isHost, connected, eliminated,
        superpowerId,       // 'EEUU'|'URSS'|'CHINA'|'JAPON'|'EUROPA_OCC'|'EUROPA_OR'
        secretObjective,    // objective object
        potencialBelico,    // 3..11
        pendingUnits,       // { ejercitos, aviones, barcos } to place this turn
        cards,              // array of regionIds (tarjetas de regiones)
        combatReady,        // null | { dial1, dial2, dial3 } (set secretly in combat)
      }
    */

    this.round = 1;
    this.turnIndex = 0;

    // Board: { [regionId]: { units: [ { playerId, ejercitos, aviones, barcos } ] } }
    // Multiple players can have units in the same region simultaneously
    this.board = {};

    // Combat state
    this.pendingCombat = null;
    /*
      pendingCombat: {
        attackerId, defenderId(s), regionId,
        attackerDials: null | { b1, b2, b3 },
        defenderDials: null | { b1, b2, b3 },
        result: null | { ... }
      }
    */

    this.regionCardDeck = []; // shuffled region IDs for card drawing
    this.logs = [];
    this.winner = null;

    this._initBoard();
  }

  // ─── Logging ────────────────────────────────────────────────────────────────

  log(message, type = 'info') {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ts: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type // 'info'|'combat'|'warn'|'success'|'system'
    };
    this.logs.push(entry);
    if (this.logs.length > 150) this.logs.shift();
  }

  // ─── Board Init ─────────────────────────────────────────────────────────────

  _initBoard() {
    for (const region of REGIONS) {
      this.board[region.id] = {
        regionId: region.id,
        units: []
        // units: [{ playerId, ejercitos, aviones, barcos }]
      };
    }
  }

  // ─── Player Management ──────────────────────────────────────────────────────

  addPlayer(socketId, name, superpowerId, token) {
    if (this.status !== 'waiting') return { success: false, error: 'La partida ya comenzó' };
    if (this.players.length >= 6) return { success: false, error: 'Sala llena (máximo 6 jugadores)' };
    if (!SUPERPOWERS[superpowerId]) return { success: false, error: 'Superpotencia inválida' };
    if (this.players.some(p => p.superpowerId === superpowerId)) {
      return { success: false, error: `${SUPERPOWERS[superpowerId].name} ya está elegida por otro jugador` };
    }

    const player = {
      id: socketId,
      name,
      token,
      isHost: this.players.length === 0,
      connected: true,
      eliminated: false,
      superpowerId,
      secretObjective: null,
      potencialBelico: INITIAL_POTENCIAL,
      pendingUnits: { ejercitos: 0, aviones: 0, barcos: 0 },
      cards: [],
      combatReady: null
    };

    this.players.push(player);
    const sp = SUPERPOWERS[superpowerId];
    this.log(`${name} eligió ${sp.name} y se unió a la sala.`, 'system');
    return { success: true, player };
  }

  getPlayerById(socketId) {
    return this.players.find(p => p.id === socketId);
  }

  getPlayerBySuperpower(superpowerId) {
    return this.players.find(p => p.superpowerId === superpowerId);
  }

  getActivePlayers() {
    return this.players.filter(p => !p.eliminated);
  }

  getCurrentPlayer() {
    const active = this.getActivePlayers();
    if (!active.length) return null;
    return active[this.turnIndex % active.length];
  }

  // ─── Game Start ─────────────────────────────────────────────────────────────

  startGame() {
    if (this.players.length < 2) return { success: false, error: 'Se necesitan mínimo 2 jugadores' };
    if (this.status !== 'waiting') return { success: false, error: 'La partida ya comenzó' };

    // Asignar objetivos secretos - uno por jugador según superpotencia
    const spObjectives = {};
    for (const obj of OBJECTIVES) {
      if (!spObjectives[obj.superpowerId]) spObjectives[obj.superpowerId] = [];
      spObjectives[obj.superpowerId].push(obj);
    }

    for (const player of this.players) {
      const objsForSP = spObjectives[player.superpowerId] || [];
      if (objsForSP.length > 0) {
        const shuffled = [...objsForSP].sort(() => Math.random() - 0.5);
        player.secretObjective = shuffled[0];
      }
    }

    // Colocar unidades iniciales en homeland de cada superpotencia
    for (const player of this.players) {
      const sp = SUPERPOWERS[player.superpowerId];
      const homelandId = sp.homelandId;
      // Cada superpotencia empieza con 5 ejércitos en su propio territorio
      this._addUnits(homelandId, player.id, 5, 0, 0);
    }

    // Mazos de cartas de regiones (para repartir tarjetas al ganar combates)
    this.regionCardDeck = REGIONS
      .filter(r => r.type === 'land' && !r.isSuperpowerHomeland)
      .map(r => r.id)
      .sort(() => Math.random() - 0.5);

    // Calcular unidades iniciales de incorporación (Ronda 1)
    this._calculatePendingUnits();

    this.status = 'playing';
    this.phase = 'incorporation';
    this.round = 1;
    this.turnIndex = 0;

    this.log('¡La Guerra Fría comienza! Fase de incorporación inicial.', 'success');
    return { success: true };
  }

  // ─── Incorporación de Unidades ───────────────────────────────────────────────

  _calculatePendingUnits() {
    // Según Potencial Bélico, cada jugador recibe unidades
    // El PB va de 3 (peor) a 11 (mejor). Mapeamos a unidades:
    const pbToUnits = {
      3:  { ejercitos: 2, aviones: 0, barcos: 0 },
      4:  { ejercitos: 2, aviones: 0, barcos: 1 },
      5:  { ejercitos: 3, aviones: 0, barcos: 1 },
      6:  { ejercitos: 3, aviones: 1, barcos: 1 },
      7:  { ejercitos: 4, aviones: 1, barcos: 1 },
      8:  { ejercitos: 4, aviones: 1, barcos: 2 },
      9:  { ejercitos: 5, aviones: 2, barcos: 2 },
      10: { ejercitos: 5, aviones: 2, barcos: 3 },
      11: { ejercitos: 6, aviones: 3, barcos: 3 }
    };

    for (const player of this.getActivePlayers()) {
      const units = pbToUnits[player.potencialBelico] || { ejercitos: 4, aviones: 1, barcos: 1 };
      player.pendingUnits = { ...units };
    }
  }

  // Colocar unidades en región
  placeUnits(socketId, regionId, { ejercitos = 0, aviones = 0, barcos = 0 } = {}) {
    if (this.phase !== 'incorporation') return { success: false, error: 'No es la fase de incorporación' };
    const player = this.getPlayerById(socketId);
    if (!player) return { success: false, error: 'Jugador no encontrado' };

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== socketId) {
      return { success: false, error: 'No es tu turno' };
    }

    const region = getRegion(regionId);
    if (!region) return { success: false, error: 'Región inválida' };

    // Validar tipo de unidad vs tipo de región
    if (region.type === 'ocean') {
      if (ejercitos > 0) return { success: false, error: 'Los ejércitos no pueden ir al océano' };
    } else {
      if (barcos > 0) return { success: false, error: 'Los barcos solo van en océanos' };
    }

    // Validar fondos
    if (ejercitos > player.pendingUnits.ejercitos) return { success: false, error: 'No tenés suficientes ejércitos' };
    if (aviones > player.pendingUnits.aviones) return { success: false, error: 'No tenés suficientes aviones' };
    if (barcos > player.pendingUnits.barcos) return { success: false, error: 'No tenés suficientes barcos' };

    const total = ejercitos + aviones + barcos;
    if (total === 0) return { success: false, error: 'Debés colocar al menos 1 unidad' };

    this._addUnits(regionId, player.id, ejercitos, aviones, barcos);
    player.pendingUnits.ejercitos -= ejercitos;
    player.pendingUnits.aviones -= aviones;
    player.pendingUnits.barcos -= barcos;

    const sp = SUPERPOWERS[player.superpowerId];
    this.log(`${sp.name} desplegó ${ejercitos > 0 ? `${ejercitos} ejércitos` : ''} ${aviones > 0 ? `${aviones} aviones` : ''} ${barcos > 0 ? `${barcos} barcos` : ''} en ${region.name}.`, 'info');

    // Si el jugador agotó sus unidades, avanzamos turno de incorporación
    const pending = player.pendingUnits;
    const totalPending = pending.ejercitos + pending.aviones + pending.barcos;
    if (totalPending === 0) {
      return this._advanceIncorporationTurn();
    }

    return { success: true };
  }

  _advanceIncorporationTurn() {
    const active = this.getActivePlayers();
    this.turnIndex = (this.turnIndex + 1) % active.length;

    // Si dimos la vuelta completa (todos incorporaron), pasamos a ataques
    if (this.turnIndex === 0) {
      this.phase = 'attacks';
      this.log('Todos incorporaron. ¡Comienza la fase de ataques!', 'system');
    } else {
      const next = this.getCurrentPlayer();
      const sp = SUPERPOWERS[next.superpowerId];
      this.log(`Es el turno de incorporación de ${sp.name} (${next.name}).`, 'system');
    }
    return { success: true };
  }

  // ─── Combate (Comando de Batallas) ──────────────────────────────────────────

  initiateAttack(attackerSocketId, regionId) {
    if (this.phase !== 'attacks') return { success: false, error: 'No es la fase de ataques' };
    const attacker = this.getPlayerById(attackerSocketId);
    if (!attacker) return { success: false, error: 'Jugador no encontrado' };
    if (this.getCurrentPlayer().id !== attackerSocketId) return { success: false, error: 'No es tu turno' };

    const boardCell = this.board[regionId];
    if (!boardCell) return { success: false, error: 'Región inválida' };

    // Verificar que el atacante tiene unidades ahí
    const attackerStack = boardCell.units.find(u => u.playerId === attackerSocketId);
    if (!attackerStack || (attackerStack.ejercitos + attackerStack.aviones + attackerStack.barcos) < 1) {
      return { success: false, error: 'No tenés unidades en esa región' };
    }

    // Verificar que hay rivales en la región
    const defenders = boardCell.units.filter(u => u.playerId !== attackerSocketId);
    if (defenders.length === 0) return { success: false, error: 'No hay enemigos en esa región' };

    // Elegir defensor (por ahora el primer rival)
    const defenderStack = defenders[0];
    const defender = this.getPlayerById(defenderStack.playerId);

    this.pendingCombat = {
      regionId,
      attackerId: attackerSocketId,
      defenderId: defenderStack.playerId,
      attackerTotalForce: attackerStack.ejercitos + attackerStack.aviones * 2 + attackerStack.barcos,
      defenderTotalForce: defenderStack.ejercitos + defenderStack.aviones * 2 + defenderStack.barcos,
      attackerDials: null,
      defenderDials: null,
      result: null
    };

    attacker.combatReady = null;
    defender.combatReady = null;

    const region = getRegion(regionId);
    const spAtk = SUPERPOWERS[attacker.superpowerId];
    const spDef = SUPERPOWERS[defender.superpowerId];
    this.log(`⚔️ ${spAtk.name} inicia combate en ${region.name} contra ${spDef.name}. ¡Cada uno debe fijar sus diales!`, 'combat');

    return { success: true, combat: this.pendingCombat };
  }

  // Cada jugador (atacante o defensor) fija secretamente sus diales
  setCombatDials(socketId, { b1, b2, b3 }) {
    if (!this.pendingCombat) return { success: false, error: 'No hay combate en curso' };
    const { attackerId, defenderId, attackerTotalForce, defenderTotalForce } = this.pendingCombat;

    if (socketId !== attackerId && socketId !== defenderId) {
      return { success: false, error: 'No participás en este combate' };
    }

    // Validar que los diales sumen un valor razonable (max 11 por dial)
    if ([b1, b2, b3].some(v => v < 0 || v > 11 || !Number.isInteger(v))) {
      return { success: false, error: 'Los diales deben ser enteros entre 0 y 11' };
    }

    const total = b1 + b2 + b3;
    const maxForce = socketId === attackerId ? attackerTotalForce : defenderTotalForce;
    if (total > maxForce) {
      return { success: false, error: `No podés asignar más de ${maxForce} en total (tenés ${total})` };
    }

    if (socketId === attackerId) {
      this.pendingCombat.attackerDials = { b1, b2, b3 };
    } else {
      this.pendingCombat.defenderDials = { b1, b2, b3 };
    }

    // Si ambos fijaron los diales, resolver combate
    if (this.pendingCombat.attackerDials && this.pendingCombat.defenderDials) {
      return this._resolveCombat();
    }

    return { success: true, waitingFor: 'other_player' };
  }

  _resolveCombat() {
    const combat = this.pendingCombat;
    const { regionId, attackerId, defenderId, attackerDials, defenderDials } = combat;

    // Resolver 3 batallas: el mínimo de los dos se pierde de ambos lados en cada batalla
    let attackerLosses = 0;
    let defenderLosses = 0;
    let attackerWins = 0;
    let defenderWins = 0;

    const battles = ['b1', 'b2', 'b3'];
    const battleDetails = [];
    for (const b of battles) {
      const atk = attackerDials[b];
      const def = defenderDials[b];
      const loss = Math.min(atk, def);
      attackerLosses += loss;
      defenderLosses += loss;
      if (atk > def) attackerWins++;
      else if (def > atk) defenderWins++;
      battleDetails.push({ atk, def, loss, winner: atk > def ? 'attacker' : def > atk ? 'defender' : 'tie' });
    }

    // Aplicar bajas en el tablero
    this._applyLosses(regionId, attackerId, attackerLosses);
    this._applyLosses(regionId, defenderId, defenderLosses);

    // Determinar ganador general (el que ganó más batallas)
    let overallWinner = null;
    if (attackerWins > defenderWins) {
      overallWinner = 'attacker';
      const attacker = this.getPlayerById(attackerId);
      attacker.potencialBelico = Math.min(11, attacker.potencialBelico + 1);
      const defender = this.getPlayerById(defenderId);
      defender.potencialBelico = Math.max(3, defender.potencialBelico - 1);
    } else if (defenderWins > attackerWins) {
      overallWinner = 'defender';
      const attacker = this.getPlayerById(attackerId);
      attacker.potencialBelico = Math.max(3, attacker.potencialBelico - 1);
      const defender = this.getPlayerById(defenderId);
      defender.potencialBelico = Math.min(11, defender.potencialBelico + 1);
    }
    // Empate: nadie sube ni baja de PB

    const region = getRegion(regionId);
    const attacker = this.getPlayerById(attackerId);
    const defender = this.getPlayerById(defenderId);
    const spAtk = SUPERPOWERS[attacker.superpowerId];
    const spDef = SUPERPOWERS[defender.superpowerId];

    const result = {
      regionId,
      attackerId,
      defenderId,
      attackerDials,
      defenderDials,
      battleDetails,
      attackerWins,
      defenderWins,
      attackerLosses,
      defenderLosses,
      overallWinner,
      newPBAttacker: attacker.potencialBelico,
      newPBDefender: defender.potencialBelico
    };

    combat.result = result;

    const winnerLabel = overallWinner === 'attacker'
      ? `${spAtk.name} gana el combate`
      : overallWinner === 'defender'
        ? `${spDef.name} defiende exitosamente`
        : 'Combate empatado';

    this.log(
      `⚔️ Resultado en ${region.name}: ${winnerLabel}. Bajas: ${spAtk.name} -${attackerLosses} | ${spDef.name} -${defenderLosses}.`,
      'combat'
    );

    // Dar carta al ganador
    if (overallWinner === 'attacker' && this.regionCardDeck.length > 0) {
      const card = this.regionCardDeck.pop();
      attacker.cards.push(card);
    } else if (overallWinner === 'defender' && this.regionCardDeck.length > 0) {
      const card = this.regionCardDeck.pop();
      defender.cards.push(card);
    }

    // Limpiar combate
    this.pendingCombat = null;
    attacker.combatReady = null;
    defender.combatReady = null;

    return { success: true, result };
  }

  // ─── Reagrupar / Mover ───────────────────────────────────────────────────────

  moveUnits(socketId, fromRegionId, toRegionId, { ejercitos = 0, aviones = 0, barcos = 0 } = {}) {
    const player = this.getPlayerById(socketId);
    if (!player) return { success: false, error: 'Jugador no encontrado' };
    if (this.phase !== 'regroup' && this.phase !== 'attacks') return { success: false, error: 'No podés mover en esta fase' };

    const fromRegion = getRegion(fromRegionId);
    const toRegion = getRegion(toRegionId);
    if (!fromRegion || !toRegion) return { success: false, error: 'Región inválida' };

    // Verificar adyacencia
    if (!fromRegion.adjacencies.includes(toRegionId)) {
      return { success: false, error: `${fromRegion.name} no es adyacente a ${toRegion.name}` };
    }

    // Verificar unidades disponibles
    const stack = this.board[fromRegionId].units.find(u => u.playerId === socketId);
    if (!stack) return { success: false, error: 'No tenés unidades en esa región' };
    if (stack.ejercitos < ejercitos) return { success: false, error: 'No tenés suficientes ejércitos ahí' };
    if (stack.aviones < aviones) return { success: false, error: 'No tenés suficientes aviones ahí' };
    if (stack.barcos < barcos) return { success: false, error: 'No tenés suficientes barcos ahí' };

    // Validar tipo (barcos solo en océanos, ejércitos solo en tierra)
    if (toRegion.type === 'ocean' && ejercitos > 0) return { success: false, error: 'Ejércitos no pueden ir al océano' };
    if (toRegion.type === 'land' && barcos > 0) return { success: false, error: 'Barcos solo en océanos' };

    // Mover
    stack.ejercitos -= ejercitos;
    stack.aviones -= aviones;
    stack.barcos -= barcos;

    this._addUnits(toRegionId, socketId, ejercitos, aviones, barcos);

    // Limpiar stacks vacíos
    this.board[fromRegionId].units = this.board[fromRegionId].units.filter(
      u => u.ejercitos + u.aviones + u.barcos > 0
    );

    const sp = SUPERPOWERS[player.superpowerId];
    this.log(`${sp.name} movió unidades de ${fromRegion.name} → ${toRegion.name}.`, 'info');
    return { success: true };
  }

  // ─── Fin de Turno ───────────────────────────────────────────────────────────

  endTurn(socketId) {
    const player = this.getPlayerById(socketId);
    if (!player || this.getCurrentPlayer()?.id !== socketId) {
      return { success: false, error: 'No es tu turno' };
    }

    const active = this.getActivePlayers();
    this.turnIndex = (this.turnIndex + 1) % active.length;

    // Si se completó una ronda entera, nueva ronda
    if (this.turnIndex === 0) {
      this.round++;
      this._calculatePendingUnits();
      this.phase = 'incorporation';
      this.log(`═══ RONDA ${this.round} ═══`, 'system');
    } else {
      this.phase = 'attacks'; // El siguiente jugador empieza en ataques si todos ya incorporaron
    }

    const next = this.getCurrentPlayer();
    if (next) {
      const spNext = SUPERPOWERS[next.superpowerId];
      this.log(`Turno de ${spNext.name} (${next.name}).`, 'system');
    }

    // Chequear victorias
    this._checkVictory();

    return { success: true };
  }

  nextPhase(socketId) {
    const player = this.getPlayerById(socketId);
    if (!player || this.getCurrentPlayer()?.id !== socketId) {
      return { success: false, error: 'No es tu turno' };
    }

    const phaseOrder = ['incorporation', 'attacks', 'regroup'];
    const currentIdx = phaseOrder.indexOf(this.phase);
    if (currentIdx < phaseOrder.length - 1) {
      this.phase = phaseOrder[currentIdx + 1];
      this.log(`${SUPERPOWERS[player.superpowerId].name} avanzó a fase: ${this.phase}.`, 'system');
      return { success: true };
    }

    // Fin de todas las fases = fin de turno
    return this.endTurn(socketId);
  }

  // ─── Helpers Internos ───────────────────────────────────────────────────────

  _addUnits(regionId, playerId, ejercitos, aviones, barcos) {
    const cell = this.board[regionId];
    if (!cell) return;
    let stack = cell.units.find(u => u.playerId === playerId);
    if (!stack) {
      stack = { playerId, ejercitos: 0, aviones: 0, barcos: 0 };
      cell.units.push(stack);
    }
    stack.ejercitos += ejercitos;
    stack.aviones += aviones;
    stack.barcos += barcos;
  }

  _applyLosses(regionId, playerId, losses) {
    const cell = this.board[regionId];
    if (!cell) return;
    const stack = cell.units.find(u => u.playerId === playerId);
    if (!stack) return;

    // Distribuir bajas: primero ejércitos, luego barcos, luego aviones
    let remaining = losses;
    const removeFrom = (field) => {
      const removed = Math.min(stack[field], remaining);
      stack[field] -= removed;
      remaining -= removed;
    };
    removeFrom('ejercitos');
    removeFrom('barcos');
    removeFrom('aviones');

    // Eliminar stack vacío
    if (stack.ejercitos + stack.barcos + stack.aviones <= 0) {
      cell.units = cell.units.filter(u => u.playerId !== playerId);
    }
  }

  // ─── Potencial Bélico - Estado Intervención/Control ─────────────────────────

  getRegionStatus(regionId, playerId) {
    const cell = this.board[regionId];
    if (!cell) return 'no_intervencion';
    const ownStack = cell.units.find(u => u.playerId === playerId);
    const ownTotal = ownStack ? ownStack.ejercitos + ownStack.aviones + ownStack.barcos : 0;
    const hasEnemies = cell.units.some(u => u.playerId !== playerId && (u.ejercitos + u.aviones + u.barcos) > 0);

    if (ownTotal === 0) return 'no_intervencion';
    if (ownTotal >= 4 && !hasEnemies) return 'control';
    return 'intervencion';
  }

  // ─── Chequeo de Victoria ────────────────────────────────────────────────────

  _checkVictory() {
    for (const player of this.getActivePlayers()) {
      const obj = player.secretObjective;
      if (!obj) continue;

      const allTargetsMet = obj.targets.every(targetId => {
        const status = this.getRegionStatus(targetId, player.id);
        if (obj.type === 'control') return status === 'control';
        if (obj.type === 'intervention') return status === 'intervencion' || status === 'control';
        if (obj.type === 'mixed') {
          // Mitad control, mitad intervención - simplificado: todos en intervención o mejor
          return status !== 'no_intervencion';
        }
        return false;
      });

      if (allTargetsMet) {
        this.winner = player.id;
        this.status = 'finished';
        const sp = SUPERPOWERS[player.superpowerId];
        this.log(`🏆 ¡${sp.name} (${player.name}) cumplió su objetivo secreto y GANA la guerra!`, 'success');
        return;
      }
    }
  }

  // ─── Serialización para cliente ─────────────────────────────────────────────

  toClientState(forPlayerId) {
    const safeBoard = {};
    for (const [regionId, cell] of Object.entries(this.board)) {
      safeBoard[regionId] = {
        regionId,
        units: cell.units.map(u => ({
          playerId: u.playerId,
          superpowerId: this.players.find(p => p.id === u.playerId)?.superpowerId,
          ejercitos: u.ejercitos,
          aviones: u.aviones,
          barcos: u.barcos,
          total: u.ejercitos + u.aviones + u.barcos
        })),
        statusFor: forPlayerId ? this.getRegionStatus(regionId, forPlayerId) : null
      };
    }

    const safePlayers = this.players.map(p => ({
      id: p.id,
      name: p.name,
      superpowerId: p.superpowerId,
      isHost: p.isHost,
      connected: p.connected,
      eliminated: p.eliminated,
      potencialBelico: p.potencialBelico,
      cardCount: p.cards.length,
      pendingUnits: p.pendingUnits,
      // Solo mostramos el objetivo secreto al propio jugador
      secretObjective: p.id === forPlayerId ? p.secretObjective : (p.secretObjective ? '???' : null),
      isCurrent: this.getCurrentPlayer()?.id === p.id,
      combatDialsSet: p.combatReady !== null
    }));

    return {
      roomId: this.roomId,
      status: this.status,
      phase: this.phase,
      round: this.round,
      currentPlayerId: this.getCurrentPlayer()?.id,
      currentSuperpower: this.getCurrentPlayer()?.superpowerId,
      board: safeBoard,
      players: safePlayers,
      pendingCombat: this.pendingCombat ? {
        regionId: this.pendingCombat.regionId,
        attackerId: this.pendingCombat.attackerId,
        defenderId: this.pendingCombat.defenderId,
        attackerDialsSet: !!this.pendingCombat.attackerDials,
        defenderDialsSet: !!this.pendingCombat.defenderDials,
        result: this.pendingCombat.result,
        // Solo mostramos los diales del oponente DESPUÉS de que ambos los fijaron
        attackerDials: this.pendingCombat.result ? this.pendingCombat.attackerDials : null,
        defenderDials: this.pendingCombat.result ? this.pendingCombat.defenderDials : null,
      } : null,
      winner: this.winner,
      logs: this.logs.slice(-30)
    };
  }
}
