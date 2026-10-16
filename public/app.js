/* ═══════════════════════════════════════════════════════
   T.E.G. CARTAS — Cliente Frontend Oficial
   ═══════════════════════════════════════════════════════ */

'use strict';

const State = {
  socket: null,
  myId: null,
  myToken: null,
  myColor: null,
  roomId: null,
  gameState: null,
  metadata: null, // { continents, territories, specials, playerColors }
  selectedAttackingTerritory: null,
  continentFilter: 'ALL'
};

// ─── Inicialización ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  State.myToken = localStorage.getItem('teg_cartas_token') || ('tk_' + Math.random().toString(36).substring(2));
  localStorage.setItem('teg_cartas_token', State.myToken);

  try {
    const res = await fetch('/api/metadata');
    State.metadata = await res.json();
  } catch (e) {
    console.error('Error cargando metadata:', e);
  }

  buildColorPicker();
  if (window.initMiniMap) window.initMiniMap();
  initSocket();

  const roomInput = document.getElementById('input-room');
  if (roomInput) {
    roomInput.addEventListener('input', () => {
      const room = roomInput.value.trim().toUpperCase() || 'TEG';
      State.socket?.emit('get_room_colors', { roomId: room });
    });
  }

  // Sincronización continua de colores/facciones en lobby cada 2 segundos
  setInterval(() => {
    const lobby = document.getElementById('lobby-screen');
    if (lobby && lobby.classList.contains('active') && State.socket?.connected) {
      const room = document.getElementById('input-room')?.value?.trim().toUpperCase() || 'TEG';
      State.socket.emit('get_room_colors', { roomId: room });
    }
  }, 2000);
});

function buildColorPicker() {
  const grid = document.getElementById('color-picker-grid');
  if (!grid || !State.metadata?.playerColors) return;
  grid.innerHTML = '';

  State.metadata.playerColors.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = `lobby-faction-card ${idx === 0 ? 'selected' : ''}`;
    card.dataset.hex = c.hex;
    card.dataset.faction = c.id;
    card.style.setProperty('--faction-color', c.hex);

    card.innerHTML = `
      <div class="faction-flag">${c.flag || '🎖️'}</div>
      <div class="faction-info">
        <div class="faction-name">${c.name}</div>
        <div class="faction-army">${c.army || c.country || ''}</div>
      </div>
      <div class="faction-badge">${c.badge || '★'}</div>
      <div class="faction-lock-overlay">
        <span class="lock-icon">🔒</span>
        <span class="lock-label">OCUPADO</span>
      </div>
    `;

    card.onclick = () => selectColor(c.hex);
    grid.appendChild(card);
  });

  State.myColor = State.metadata.playerColors[0].hex;
}

function selectColor(hex) {
  const card = document.querySelector(`.lobby-faction-card[data-hex="${hex}"]`);
  if (!card || card.classList.contains('taken')) {
    showToast('Esta potencia ya fue elegida por otro comandante en la sala.', 'error');
    return;
  }
  document.querySelectorAll('.lobby-faction-card').forEach(d => d.classList.remove('selected'));
  card.classList.add('selected');
  State.myColor = hex;
}

function updateColorPickerAvailability(data = {}) {
  const grid = document.getElementById('color-picker-grid');
  if (!grid || !State.metadata?.playerColors) return;

  // Extraer lista de colores ocupados (tolerante a objeto o array)
  const takenList = Array.isArray(data) ? data : (data.takenColors || []);
  const takenHexes = takenList.map(t => (typeof t === 'string' ? t : t.color).toLowerCase());
  const playerCount = data.playerCount ?? takenList.length;
  const botCount = data.botCount ?? 0;
  const humanCount = data.humanCount ?? (playerCount - botCount);

  let currentSelectedIsTaken = false;

  State.metadata.playerColors.forEach(c => {
    const card = grid.querySelector(`.lobby-faction-card[data-hex="${c.hex}"]`);
    if (!card) return;

    const isTaken = takenHexes.includes(c.hex.toLowerCase());
    const takenInfo = takenList.find(t => (typeof t === 'string' ? t : t.color).toLowerCase() === c.hex.toLowerCase());

    if (isTaken) {
      card.classList.add('taken');
      card.classList.remove('selected');
      const occupantName = takenInfo?.name || 'otro comandante';
      card.title = `🔒 Ocupado por ${occupantName}`;
      const lockLabel = card.querySelector('.lock-label');
      if (lockLabel) lockLabel.textContent = takenInfo?.isBot ? 'BOT' : 'OCUPADO';

      if (State.myColor && State.myColor.toLowerCase() === c.hex.toLowerCase()) {
        currentSelectedIsTaken = true;
      }
    } else {
      card.classList.remove('taken');
      card.title = `Elegir ${c.name} (${c.army})`;
    }
  });

  // Si la potencia seleccionada quedó ocupada, saltar automáticamente a la primera libre
  if (currentSelectedIsTaken || !State.myColor || takenHexes.includes(State.myColor.toLowerCase())) {
    const firstAvailable = State.metadata.playerColors.find(c => !takenHexes.includes(c.hex.toLowerCase()));
    if (firstAvailable) {
      State.myColor = firstAvailable.hex;
      const card = grid.querySelector(`.lobby-faction-card[data-hex="${firstAvailable.hex}"]`);
      if (card) card.classList.add('selected');
    } else {
      State.myColor = null;
    }
  } else {
    const card = grid.querySelector(`.lobby-faction-card[data-hex="${State.myColor}"]`);
    if (card && !card.classList.contains('taken')) {
      card.classList.add('selected');
    }
  }

  // Actualizar hint de potencias
  const hintEl = document.getElementById('color-picker-hint');
  if (hintEl) {
    const availableCount = State.metadata.playerColors.length - takenHexes.length;
    if (availableCount <= 0) {
      hintEl.textContent = '⚠️ Todas las potencias ocupadas (Sala llena 4/4)';
      hintEl.style.color = '#e74c3c';
    } else {
      hintEl.textContent = `🎯 ${availableCount} de 4 potencias militares disponibles`;
      hintEl.style.color = '#8da4be';
    }
  }

  // Actualizar contador y estado de Bots en Menú Principal
  const countEl = document.getElementById('lobby-player-count');
  if (countEl) countEl.textContent = playerCount;

  const botsSubEl = document.getElementById('lobby-bots-sub');
  if (botsSubEl) {
    if (playerCount === 0) {
      botsSubEl.textContent = 'Sin rivales aún';
      botsSubEl.style.color = '#8da4be';
    } else {
      const parts = [];
      if (humanCount > 0) parts.push(`${humanCount} humano${humanCount > 1 ? 's' : ''}`);
      if (botCount > 0) parts.push(`${botCount} Bot${botCount > 1 ? 's' : ''} (IA)`);
      botsSubEl.textContent = parts.join(' + ');
      botsSubEl.style.color = botCount > 0 ? '#2ecc71' : '#f1c40f';
    }
  }

  const btnAddBot = document.getElementById('btn-add-bot-lobby');
  if (btnAddBot) {
    if (playerCount >= 4) {
      btnAddBot.disabled = true;
      btnAddBot.style.opacity = '0.5';
      btnAddBot.style.cursor = 'not-allowed';
      btnAddBot.textContent = '🤖 Sala llena (4/4)';
    } else {
      btnAddBot.disabled = false;
      btnAddBot.style.opacity = '1';
      btnAddBot.style.cursor = 'pointer';
      btnAddBot.textContent = '🤖 + Agregar Bot (IA)';
    }
  }
}

function addBotFromLobby() {
  const room = document.getElementById('input-room')?.value?.trim().toUpperCase() || 'TEG';
  State.socket?.emit('add_bot', { roomId: room });
}

// ─── Socket.io ────────────────────────────────────────────────────────────────
function initSocket() {
  State.socket = io({ transports: ['websocket'] });

  State.socket.on('connect', () => {
    State.myId = State.socket.id;
    const room = State.roomId || document.getElementById('input-room')?.value?.trim().toUpperCase() || 'TEG';
    State.socket.emit('get_room_colors', { roomId: room });
    // Re-vincular sesión si se perdió la conexión mientras se jugaba
    const playerName = document.getElementById('input-name')?.value?.trim();
    if (State.roomId && playerName && State.myColor) {
      State.socket.emit('join_game', {
        roomId: State.roomId,
        playerName,
        playerColor: State.myColor,
        token: State.myToken
      });
    }
  });

  State.socket.on('room_colors_update', (data) => {
    const currentInputRoom = document.getElementById('input-room')?.value?.trim().toUpperCase() || 'TEG';
    if (data.roomId === currentInputRoom) {
      updateColorPickerAvailability(data);
    }
  });

  State.socket.on('error_message', (msg) => {
    showToast(msg, 'error');
    const inGame = State.gameState?.players?.some(p => p.id === State.myId);
    if (!inGame) {
      showScreen('lobby-screen');
    }
  });

  State.socket.on('toast_message', (msg) => {
    showToast(msg, 'success');
  });

  State.socket.on('game_state', (state) => {
    State.gameState = state;
    State.myId = State.socket.id;
    const inGame = state.players.some(p => p.id === State.myId);
    if (inGame) {
      showScreen('game-screen');
    }
    renderGameState(state);
  });
}

function joinGame() {
  const name = document.getElementById('input-name').value.trim();
  const room = document.getElementById('input-room').value.trim().toUpperCase() || 'TEG';

  if (!name) {
    showToast('¡Ingresá tu nombre de comandante!', 'error');
    return;
  }

  if (!State.myColor) {
    showToast('No hay colores disponibles en esta sala o todos están ocupados.', 'error');
    return;
  }

  State.roomId = room;
  State.socket.emit('join_game', {
    roomId: room,
    playerName: name,
    playerColor: State.myColor,
    token: State.myToken
  });
}

// ─── Renderizado General ───────────────────────────────────────────────────────
function renderGameState(state) {
  if (!state) return;

  const myPlayer = state.players.find(p => p.id === State.myId);
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  const isMyTurn = myPlayer && (myPlayer.id === state.currentPlayerId);

  // 1. Header & Badge del Jugador Local
  renderPlayerBadge(myPlayer);
  document.getElementById('lbl-round').textContent = `Ronda ${state.round}`;
  const turnBanner = document.getElementById('turn-indicator');

  // Cálculo de cartas especiales jugables en este instante
  const playableSpecials = getPlayableSpecialCards(state, myPlayer);

  if (state.status === 'waiting') {
    const isHost = myPlayer?.isHost;
    const canStart = isHost && state.players.length >= 2;
    turnBanner.innerHTML = `
      <div class="ww2-waiting-toolbar">
        ${canStart
          ? `<button class="btn-ww2-start" onclick="startGame()">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5"/></svg>
               INICIAR OFENSIVA (${state.players.length}/4)
             </button>`
          : `<div class="ww2-waiting-badge">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
               RECLUTANDO (${state.players.length}/4)
             </div>`
        }
        ${state.players.length < 4
          ? `<button class="btn-ww2-bot" onclick="addBot()" title="Añadir comandante con inteligencia artificial">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14C4 9 7 6 12 6s8 3 8 8"/><path d="M2 15h20l-2 3H4z"/></svg>
               + Oficial IA
             </button>`
          : ''
        }
        <button class="btn-ww2-reset" onclick="resetRoom()" title="Reiniciar sala">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
          Reiniciar
        </button>
      </div>
    `;
  } else if (state.status === 'finished') {
    turnBanner.textContent = 'Partida Finalizada';
  } else {
    let specialPillHtml = '';
    if (playableSpecials.length > 0) {
      specialPillHtml = `
        <button type="button" class="btn-special-pill-alert" onclick="openPlaySpecialModal('${playableSpecials[0].id}')" title="Hacé clic para ver y ejecutar esta orden especial">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f1c40f" stroke="none"><polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5"/></svg>
          ${playableSpecials.length} Especial Disponible
        </button>
      `;
    }

    turnBanner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; justify-content:center; flex-wrap:nowrap;">
        ${isMyTurn
          ? `<span style="color:#2ecc71; font-weight:800; letter-spacing:1px;">★ ¡ES TU TURNO DE ATACAR! ★</span>`
          : `<span style="color:#cbd5e1;">Turno de <strong style="color:${currentPlayer?.color}">${currentPlayer?.name}</strong></span>`
        }
        ${specialPillHtml}
      </div>
    `;
  }

  // 2. Mazos centrales y descartes
  document.getElementById('dice-deck-count').textContent = state.diceDeckCount;
  const discardDiceEl = document.getElementById('dice-discard-count');
  if (discardDiceEl) discardDiceEl.textContent = state.diceDiscardCount || 0;
  document.getElementById('special-deck-count').textContent = state.specialDeckCount;

  // 3. Ticker
  if (state.logs && state.logs.length > 0) {
    const lastLog = state.logs[state.logs.length - 1];
    document.getElementById('ticker-text').textContent = lastLog.message;
  }

  // 4. Sidebar Táctico (Guía de turno, pasos, botones y avance continental)
  renderTacticalSidebar(state, myPlayer, isMyTurn, playableSpecials);
  if (window.updateMiniMap) window.updateMiniMap(state);

  // 5. Rivales (Sector superior)
  renderOpponents(state.players.filter(p => p.id !== State.myId));

  // 6. Mis Territorios (Sector inferior con filtros por continente y ordenación)
  renderMyTerritories(myPlayer?.territories || []);

  // 7. Mi Mano de cartas (Dados ordenados de mayor a menor fuerza + Especiales)
  renderMyHand(myPlayer?.myDiceCards || [], myPlayer?.mySpecialCards || []);

  // 8. Combate en progreso (con cartas ocultas boca abajo y resolución flip reveal)
  renderCombat(state.pendingCombat, myPlayer);

  // 9. Modal de Victoria
  if (state.winner) {
    const winnerP = state.players.find(p => p.id === state.winner);
    document.getElementById('winner-name').textContent = winnerP ? winnerP.name : 'Un jugador';
    document.getElementById('winner-reason').textContent = winnerP?.secretObjective?.title || 'Conquistó los territorios requeridos';
    showModal('modal-victory');
  }
}

// ─── Render Sidebar Táctico ───────────────────────────────────────────────────
function renderTacticalSidebar(state, myPlayer, isMyTurn, playableSpecials = []) {
  const badgeEl = document.getElementById('guide-badge');
  const titleEl = document.getElementById('guide-title');
  const descEl = document.getElementById('guide-desc');
  const combat = state.pendingCombat;
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);

  // Reiniciar estado visual de los 4 pasos
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`step-${i}`);
    if (step) step.className = 'step-item';
  }

  if (state.status === 'waiting') {
    if (badgeEl) { badgeEl.textContent = '★ EN ESPERA'; badgeEl.className = 'guide-badge'; }
    if (titleEl) titleEl.textContent = 'Sala de Espera';
    if (descEl) descEl.textContent = myPlayer?.isHost 
      ? 'Tocá "Iniciar Partida" arriba para arrancar la partida.' 
      : 'Esperando que el anfitrión comience la partida...';
  } else if (state.status === 'combat') {
    const isAttacker = combat.attackerId === myPlayer?.id;
    const isDefender = combat.defenderId === myPlayer?.id;

    if (combat.result) {
      if (badgeEl) { badgeEl.textContent = '🏆 RESULTADO'; badgeEl.className = 'guide-badge my-turn'; }
      if (titleEl) titleEl.textContent = 'Batalla Resuelta';
      if (descEl) descEl.textContent = combat.result.overallWinner === 'attacker'
        ? `¡Victoria! Conquista lograda. Tocá "Continuar" para cerrar el combate.`
        : `Defensa exitosa. El ataque rival fue repelido.`;
      document.getElementById('step-1')?.classList.add('completed');
      document.getElementById('step-2')?.classList.add('completed');
      document.getElementById('step-3')?.classList.add('completed');
      document.getElementById('step-4')?.classList.add('active');
    } else if (isAttacker) {
      if (badgeEl) { badgeEl.textContent = '⚔️ TU ATAQUE'; badgeEl.className = 'guide-badge my-turn'; }
      if (!combat.attackerCard) {
        if (titleEl) titleEl.textContent = '¡Elegí tu carta de dados!';
        if (descEl) descEl.textContent = 'Hacé clic en una carta de tu mano o arrastrala. Se jugará boca abajo hasta que el defensor elija.';
        document.getElementById('step-1')?.classList.add('completed');
        document.getElementById('step-2')?.classList.add('completed');
        document.getElementById('step-3')?.classList.add('active');
      } else {
        if (titleEl) titleEl.textContent = 'Carta jugada boca abajo 🂠';
        if (descEl) descEl.textContent = 'Esperando a que el defensor elija su carta de dados o juegue desde el mazo...';
        document.getElementById('step-1')?.classList.add('completed');
        document.getElementById('step-2')?.classList.add('completed');
        document.getElementById('step-3')?.classList.add('active');
      }
    } else if (isDefender) {
      if (badgeEl) { badgeEl.textContent = '🚨 ¡BAJO ATAQUE!'; badgeEl.className = 'guide-badge defending'; }
      if (!combat.defenderCard) {
        if (titleEl) titleEl.textContent = '¡Defendé tu territorio!';
        if (descEl) descEl.textContent = 'Jugá una carta de dados de tu mano o defendete con la carta superior del mazo. Se mantendrá oculta hasta comparar.';
        document.getElementById('step-3')?.classList.add('active');
      } else {
        if (titleEl) titleEl.textContent = 'Defensa preparada 🂠';
        if (descEl) descEl.textContent = 'Esperando a que el atacante juegue su carta...';
        document.getElementById('step-3')?.classList.add('active');
      }
    } else {
      if (badgeEl) { badgeEl.textContent = '⚔️ COMBATE'; badgeEl.className = 'guide-badge'; }
      if (titleEl) titleEl.textContent = 'Combate en Curso';
      if (descEl) descEl.textContent = 'Dos comandantes se están enfrentando en este momento.';
    }
  } else if (isMyTurn) {
    if (badgeEl) { badgeEl.textContent = '★ TU TURNO'; badgeEl.className = 'guide-badge my-turn'; }
    if (titleEl) titleEl.textContent = 'Fase de Ataque';
    if (descEl) descEl.textContent = 'Hacé clic en uno de tus territorios abajo (o tocá "Declarar Ataque") para conquistar un país limítrofe.';
    document.getElementById('step-1')?.classList.add('active');
  } else {
    if (badgeEl) { badgeEl.textContent = '⏳ EN ESPERA'; badgeEl.className = 'guide-badge'; }
    if (titleEl) titleEl.textContent = `Turno de ${currentPlayer?.name || 'Comandante'}`;
    if (descEl) descEl.textContent = 'Esperá tu turno de ataque. Podés revisar tus objetivos y consultar las cartas especiales.';
    if (descEl && playableSpecials && playableSpecials.length > 0) {
      descEl.innerHTML += `<div class="sidebar-special-notice" onclick="openPlaySpecialModal('${playableSpecials[0].id}')">⚡ <strong>${playableSpecials.length} Orden Especial lista:</strong> Hacé clic para activarla.</div>`;
    }
  }
}

function openAttackSelectionModal() {
  if (State.gameState?.status !== 'playing') {
    showToast('No podés atacar en este momento.', 'error');
    return;
  }
  if (State.gameState.currentPlayerId !== State.myId) {
    showToast('Solo podés atacar en tu turno.', 'error');
    return;
  }

  const rack = document.getElementById('my-territories-rack');
  if (rack) {
    rack.scrollTop = 0;
    showToast('👉 Hacé clic en cualquiera de tus territorios en la columna derecha para iniciar la ofensiva', 'info');
  }
}

// ─── Badge de Jugador Local y Volver al Lobby ─────────────────────────────────
function renderPlayerBadge(myPlayer) {
  const badge = document.getElementById('current-player-badge');
  const nameEl = document.getElementById('header-player-name');
  const factionEl = document.getElementById('header-player-faction');
  const avatarEl = document.getElementById('header-player-avatar');

  if (!myPlayer) {
    if (badge) badge.style.display = 'none';
    return;
  }

  if (badge) badge.style.display = 'flex';
  const faction = State.metadata?.playerColors?.find(c => c.hex.toLowerCase() === myPlayer.color.toLowerCase())
    || { name: 'Comandante', army: 'Fuerzas Militares', flag: '🎖️', badge: '★' };

  if (nameEl) nameEl.textContent = myPlayer.name;
  if (factionEl) factionEl.textContent = `${faction.flag} ${faction.name} • ${faction.army}`;
  if (avatarEl) {
    avatarEl.textContent = faction.badge;
    avatarEl.style.backgroundColor = myPlayer.color;
  }
  if (badge) {
    badge.style.borderColor = myPlayer.color;
    badge.style.boxShadow = `0 0 12px ${myPlayer.color}55`;
  }
}

function leaveToLobby() {
  const inGame = State.gameState?.status && State.gameState.status !== 'waiting' && State.gameState.status !== 'finished';
  if (inGame) {
    const ok = confirm('¿Deseas salir al Lobby principal? Tu ejército quedará desconectado de la batalla.');
    if (!ok) return;
  }
  State.socket?.emit('leave_game');
  State.gameState = null;
  showScreen('lobby-screen');
  showToast('Has regresado al Lobby principal.', 'info');
  const room = document.getElementById('input-room')?.value?.trim().toUpperCase() || 'TEG';
  State.socket?.emit('get_room_colors', { roomId: room });
}

// ─── Render Rivales (Prolijo, limpio y agrupado por Continente) ────────────────
function renderOpponents(opponents) {
  const container = document.getElementById('opponents-zone');
  if (!container) return;
  container.innerHTML = '';

  const continentOrder = ['AMERICA_DEL_SUR', 'AMERICA_DEL_NORTE', 'EUROPA', 'ASIA', 'AFRICA', 'OCEANIA'];

  opponents.forEach(p => {
    const card = document.createElement('div');
    card.className = `opponent-card ${p.isCurrent ? 'current-turn' : ''}`;
    card.style.setProperty('--player-color', p.color);

    const faction = State.metadata?.playerColors?.find(c => c.hex.toLowerCase() === p.color.toLowerCase())
      || { flag: '🎖️', name: '', army: '' };

    // Agrupar territorios por continente
    const grouped = {};
    continentOrder.forEach(cId => { grouped[cId] = []; });

    p.territories.forEach(tId => {
      const t = State.metadata?.territories?.find(item => item.id === tId);
      if (t && grouped[t.continent]) {
        grouped[t.continent].push(t);
      }
    });

    const activeContinents = continentOrder.filter(cId => grouped[cId].length > 0);
    
    let continentChipsHtml = '';
    let detailsListHtml = '';

    if (activeContinents.length === 0) {
      continentChipsHtml = `<span class="opp-empty-note">Sin territorios bajo control</span>`;
    } else {
      continentChipsHtml = activeContinents.map(cId => {
        const cont = State.metadata?.continents?.[cId];
        const count = grouped[cId].length;
        const total = cont?.territoryCount || 0;
        const countryNames = grouped[cId].map(t => t.name).join(', ');
        const isFull = count === total;

        return `
          <div class="opp-continent-chip ${isFull ? 'full-control' : ''}" 
               style="--cont-color: ${cont?.color || '#555'};" 
               title="${cont?.name}: ${countryNames}">
            <span class="cont-icon">${cont?.icon || '🌍'}</span>
            <span class="cont-label">${cont?.name.split(' ')[0]}</span>
            <span class="cont-fraction">${count}/${total}</span>
          </div>
        `;
      }).join('');

      detailsListHtml = activeContinents.map(cId => {
        const cont = State.metadata?.continents?.[cId];
        const tags = grouped[cId].map(t => `<span class="mini-t-tag" style="--c-color:${cont?.color || '#555'}">${t.name}</span>`).join(' ');
        return `
          <div class="opp-detail-row">
            <span class="opp-detail-header" style="color:${cont?.color || '#fff'}">${cont?.icon} ${cont?.name} (${grouped[cId].length}):</span>
            <div class="opp-detail-tags">${tags}</div>
          </div>
        `;
      }).join('');
    }

    const uniqueId = `opp-drawer-${p.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    card.innerHTML = `
      <div class="opp-header">
        <div class="opp-name-block">
          <span class="opp-flag">${faction.flag}</span>
          <span class="opp-name" style="color:${p.color}">${p.name} ${!p.connected ? '● (offline)' : ''}</span>
          <span class="opp-faction-badge">${faction.name}</span>
        </div>
        <div class="opp-stats-group">
          <span class="opp-stat-badge" title="Cartas de dados en mano">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/></svg><strong>${p.diceCount}</strong>
          </span>
          <span class="opp-stat-badge special" title="Cartas especiales en mano">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f1c40f" stroke="none" style="vertical-align:middle; margin-right:2px;"><polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5"/></svg><strong>${p.specialCount}</strong>
          </span>
          <span class="opp-stat-badge total" title="Total de territorios dominados">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><strong>${p.territories.length}</strong>
          </span>
        </div>
      </div>

      <!-- Resumen geopolítico prolijo agrupado por continente -->
      <div class="opp-continents-summary">
        <div class="opp-chips-row">${continentChipsHtml}</div>
        ${activeContinents.length > 0 ? `
          <button type="button" class="btn-toggle-opp-details" onclick="toggleOpponentDrawer('${uniqueId}', this)" title="Ver u ocultar listado de territorios">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"/></svg> Frentes
          </button>
        ` : ''}
      </div>

      <!-- Bandeja desplegable con los territorios detallados -->
      <div class="opp-details-drawer" id="${uniqueId}" style="display:none;">
        ${detailsListHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

function toggleOpponentDrawer(id, btn) {
  const drawer = document.getElementById(id);
  if (!drawer) return;
  const isHidden = drawer.style.display === 'none';
  drawer.style.display = isHidden ? 'flex' : 'none';
  if (btn) {
    btn.classList.toggle('active', isHidden);
  }
}

// ─── Render Mis Territorios (Con filtros por continente y ordenación) ────────────
function renderMyTerritories(territoryIds) {
  document.getElementById('my-territory-count').textContent = territoryIds.length;
  const rack = document.getElementById('my-territories-rack');
  const filtersContainer = document.getElementById('continent-filters');
  rack.innerHTML = '';

  const continentOrder = ['AMERICA_DEL_SUR', 'AMERICA_DEL_NORTE', 'EUROPA', 'ASIA', 'AFRICA', 'OCEANIA'];

  // Pestañas / Filtros por continente
  if (filtersContainer && State.metadata?.continents) {
    filtersContainer.innerHTML = '';
    const allBtn = document.createElement('div');
    allBtn.className = `cont-filter-pill ${State.continentFilter === 'ALL' ? 'active' : ''}`;
    allBtn.textContent = `Todos (${territoryIds.length})`;
    allBtn.onclick = () => { State.continentFilter = 'ALL'; renderMyTerritories(territoryIds); };
    filtersContainer.appendChild(allBtn);

    continentOrder.forEach(cId => {
      const cont = State.metadata.continents[cId];
      const count = territoryIds.filter(tId => State.metadata.territories.find(t => t.id === tId)?.continent === cId).length;
      if (count > 0) {
        const pill = document.createElement('div');
        pill.className = `cont-filter-pill ${State.continentFilter === cId ? 'active' : ''}`;
        pill.style.setProperty('--c-color', cont.color);
        pill.textContent = `${cont.name.split(' ')[0]} (${count})`;
        pill.onclick = () => { State.continentFilter = cId; renderMyTerritories(territoryIds); };
        filtersContainer.appendChild(pill);
      }
    });
  }

  // Ordenar territorios: orden oficial por continente y luego alfabético
  const sortedTerritories = territoryIds
    .map(tId => State.metadata?.territories?.find(item => item.id === tId))
    .filter(Boolean)
    .sort((a, b) => {
      const idxA = continentOrder.indexOf(a.continent);
      const idxB = continentOrder.indexOf(b.continent);
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });

  const filtered = State.continentFilter === 'ALL'
    ? sortedTerritories
    : sortedTerritories.filter(t => t.continent === State.continentFilter);

  filtered.forEach(t => {
    const c = State.metadata?.continents?.[t.continent];
    const card = document.createElement('div');
    card.className = 'territory-card';
    card.style.setProperty('--c-color', c?.color || '#555');

    const bridgeNames = t.bridges.map(bId => {
      return State.metadata?.territories?.find(item => item.id === bId)?.name || bId;
    }).join(', ');

    card.innerHTML = `
      <div class="t-card-cont">${c?.name || ''}</div>
      <div class="t-card-name">${t.name}</div>
      <div class="t-card-bridges">${bridgeNames ? `🌉 ${bridgeNames}` : '—'}</div>
    `;

    card.onclick = () => onSelectAttackingTerritory(t);
    rack.appendChild(card);
  });
}

// ─── Concept Art Vectorial WWII para Cartas Especiales ────────────────────────
function getSpecialCardArtSvg(artKey) {
  switch (artKey) {
    case 'artillery':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <circle cx="95" cy="22" r="16" fill="rgba(245, 158, 11, 0.25)" />
          <path d="M96 22 L112 16 M98 25 L114 26 M95 20 L108 10 M93 26 L106 36" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
          <polygon points="40,36 94,22 93,17 38,32" fill="#cbd5e1" stroke="#1f2937" stroke-width="1.5"/>
          <rect x="28" y="28" width="16" height="12" rx="2" fill="#9ca3af" stroke="#111" stroke-width="1.5"/>
          <polygon points="34,35 10,60 18,62 38,38" fill="#64748b" stroke="#111" stroke-width="1.2"/>
          <circle cx="44" cy="46" r="14" fill="#334155" stroke="#f1f5f9" stroke-width="2"/>
          <circle cx="44" cy="46" r="4.5" fill="#f1f5f9"/>
          <line x1="44" y1="32" x2="44" y2="60" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="30" y1="46" x2="58" y2="46" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="5" y1="62" x2="115" y2="62" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
        </svg>
      `;
    case 'ammo':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="28" x2="35" y2="28" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="14" y1="35" x2="40" y2="35" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="6" y1="42" x2="33" y2="42" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 40,24 L 75,24 Q 98,28 105,35 Q 98,42 75,42 L 40,42 Z" fill="#475569" stroke="#cbd5e1" stroke-width="1.5"/>
          <rect x="46" y="24" width="6" height="18" fill="#d97706" stroke="#b45309" stroke-width="1"/>
          <rect x="56" y="24" width="5" height="18" fill="#d97706" stroke="#b45309" stroke-width="1"/>
          <path d="M 90,26 Q 102,32 108,35 Q 102,38 90,44 Z" fill="#dc2626"/>
          <rect x="36" y="22" width="5" height="22" rx="1" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.2"/>
          <polygon points="108,35 116,28 113,34 120,35 113,37 117,43 109,36" fill="#facc15"/>
        </svg>
      `;
    case 'air_support':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10,48 Q 25,42 45,46 Q 65,48 80,44" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round" fill="none"/>
          <ellipse cx="106" cy="26" rx="3" ry="18" fill="none" stroke="#fcd34d" stroke-width="1.2" stroke-dasharray="2,2"/>
          <path d="M 28,34 Q 65,30 102,26 Q 104,26 104,27 Q 104,29 101,31 Q 65,37 28,38 Z" fill="#334155" stroke="#94a3b8" stroke-width="1.2"/>
          <path d="M 68,26 Q 78,21 86,25 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
          <polygon points="58,31 72,10 82,10 75,31" fill="#475569" stroke="#94a3b8" stroke-width="1.2"/>
          <polygon points="56,33 66,54 76,54 72,34" fill="#1e293b" stroke="#64748b" stroke-width="1.2"/>
          <circle cx="76" cy="18" r="3.5" fill="#1e3a8a"/>
          <polygon points="30,34 20,20 28,20 36,34" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
          <polygon points="62,46 70,52 68,54 60,48" fill="#dc2626"/>
        </svg>
      `;
    case 'espionage':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <path d="M 66,22 A 20 20 0 0 1 82,38" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 72,16 A 28 28 0 0 1 94,38" fill="none" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round"/>
          <polygon points="50,56 46,38 54,38" fill="#64748b" stroke="#1e293b" stroke-width="1.2"/>
          <line x1="40" y1="58" x2="60" y2="58" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M 38,20 Q 56,38 38,54" fill="none" stroke="#f1c40f" stroke-width="3" stroke-linecap="round"/>
          <line x1="48" y1="38" x2="60" y2="38" stroke="#e2e8f0" stroke-width="2"/>
          <circle cx="62" cy="38" r="3" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
          <rect x="74" y="44" width="38" height="15" rx="3" fill="rgba(220,38,38,0.2)" stroke="#dc2626" stroke-width="1.2"/>
          <text x="93" y="55" font-size="7" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="1">ENIGMA</text>
        </svg>
      `;
    case 'infiltration':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <path d="M 38,26 Q 60,6 82,26 Q 72,24 60,24 Q 48,24 38,26 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
          <path d="M 60,7 Q 60,18 60,24" stroke="#94a3b8" stroke-width="1" fill="none"/>
          <line x1="39" y1="26" x2="58" y2="44" stroke="#94a3b8" stroke-width="0.8"/>
          <line x1="60" y1="24" x2="60" y2="44" stroke="#94a3b8" stroke-width="0.8"/>
          <line x1="81" y1="26" x2="62" y2="44" stroke="#94a3b8" stroke-width="0.8"/>
          <circle cx="60" cy="45" r="2.5" fill="#1e293b"/>
          <polygon points="57,48 63,48 62,56 58,56" fill="#1e293b"/>
          <line x1="58" y1="56" x2="56" y2="62" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="62" y1="56" x2="64" y2="62" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="46" x2="28" y2="60" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
          <line x1="28" y1="46" x2="12" y2="60" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    case 'armor':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="56" y="8" width="8" height="26" fill="#334155" stroke="#94a3b8" stroke-width="1.2"/>
          <rect x="54" y="6" width="12" height="5" rx="1" fill="#1e293b" stroke="#cbd5e1" stroke-width="1"/>
          <polygon points="44,28 76,28 82,38 38,38" fill="#475569" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="60" cy="34" r="3.5" fill="#111" stroke="#cbd5e1" stroke-width="1"/>
          <polygon points="26,38 94,38 100,50 20,50" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
          <rect x="14" y="48" width="18" height="15" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
          <circle cx="23" cy="55" r="3.5" fill="#475569"/>
          <rect x="88" y="48" width="18" height="15" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
          <circle cx="97" cy="55" r="3.5" fill="#475569"/>
          <polygon points="60,44 68,49 60,54 52,49" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
        </svg>
      `;
    case 'blitz':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <polygon points="86,22 104,15 96,25 108,26 96,30 102,36 88,30" fill="#f59e0b"/>
          <polygon points="52,24 68,24 64,14 56,14" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
          <line x1="60" y1="14" x2="60" y2="6" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="68" y="24" width="16" height="8" rx="2" fill="#334155" stroke="#cbd5e1" stroke-width="1"/>
          <line x1="84" y1="26" x2="98" y2="24" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>
          <polygon points="12,38 108,38 116,42 98,52 24,52 14,44" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
          <path d="M 8,50 Q 20,44 32,50 Q 44,56 56,50 Q 68,44 80,50 Q 92,56 104,50 Q 112,46 118,52" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      `;
    case 'ceasefire':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="36" y="10" width="48" height="50" rx="3" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
          <line x1="44" y1="18" x2="76" y2="18" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
          <line x1="44" y1="24" x2="76" y2="24" stroke="#92400e" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4,2"/>
          <line x1="44" y1="29" x2="72" y2="29" stroke="#92400e" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3,2"/>
          <circle cx="60" cy="46" r="9" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>
          <polygon points="60,41 62,44 65,44 63,46 64,49 60,47 56,49 57,46 55,44 58,44" fill="#fbbf24"/>
          <path d="M 28,48 Q 20,32 30,16" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M 92,48 Q 100,32 90,16" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    case 'supply':
      return `
        <svg viewBox="0 0 120 70" class="sp-art-svg" xmlns="http://www.w3.org/2000/svg">
          <path d="M 44,22 Q 60,6 76,22 Q 68,20 60,20 Q 52,20 44,22 Z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
          <line x1="45" y1="22" x2="55" y2="38" stroke="#78350f" stroke-width="1"/>
          <line x1="75" y1="22" x2="65" y2="38" stroke="#78350f" stroke-width="1"/>
          <rect x="46" y="38" width="28" height="24" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
          <line x1="46" y1="38" x2="74" y2="62" stroke="#b45309" stroke-width="2"/>
          <line x1="74" y1="38" x2="46" y2="62" stroke="#b45309" stroke-width="2"/>
          <circle cx="60" cy="50" r="4.5" fill="#fef3c7"/>
          <polygon points="60,46 61,48 64,48 62,50 63,53 60,51 57,53 58,50 56,48 59,48" fill="#1e3a8a"/>
          <rect x="24" y="52" width="14" height="12" rx="2" fill="#15803d" stroke="#14532d" stroke-width="1"/>
          <rect x="82" y="50" width="16" height="14" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
        </svg>
      `;
    default:
      return `<svg viewBox="0 0 120 70" class="sp-art-svg"><circle cx="60" cy="35" r="18" fill="#d4af37"/></svg>`;
  }
}

// ─── Render Mi Mano (Dados ordenados por poder y Especiales con Arte WWII) ──────
function renderMyHand(diceCards, specialCards) {
  const container = document.getElementById('my-hand-cards');
  const countEl = document.getElementById('hand-count');
  const instructionEl = document.getElementById('hand-instruction');

  countEl.textContent = `${diceCards.length} dados | ${specialCards.length} especiales`;
  container.innerHTML = '';

  const inCombat = State.gameState?.status === 'combat';
  const myPlayer = State.gameState?.players?.find(p => p.id === State.myId);
  const combat = State.gameState?.pendingCombat;

  const isMyTurnInCombat = inCombat && (
    (combat?.attackerId === myPlayer?.id && !combat?.attackerCard) ||
    (combat?.defenderId === myPlayer?.id && !combat?.defenderCard)
  );

  if (isMyTurnInCombat) {
    instructionEl.innerHTML = '⚡ <strong>¡ES TU TURNO! HACÉ CLIC O ARRASTRÁ UNA CARTA DE DADOS AL COMBATE</strong>';
    instructionEl.style.color = '#f1c40f';
  } else if (inCombat) {
    instructionEl.innerHTML = '⏳ Esperando que el oponente elija su carta de dados...';
    instructionEl.style.color = '#8da4be';
  } else {
    instructionEl.innerHTML = '💡 Hacé clic en tus cartas de combate o arrastralas. Seleccioná un territorio a la derecha para atacar';
    instructionEl.style.color = '#8da4be';
  }

  // 1. Cartas de Dados ordenadas por mayor fuerza militar (d1*100 + d2*10 + d3)
  const sortedDiceCards = [...diceCards].sort((a, b) => {
    const scoreA = a.d1 * 100 + a.d2 * 10 + a.d3;
    const scoreB = b.d1 * 100 + b.d2 * 10 + b.d3;
    return scoreB - scoreA;
  });

  sortedDiceCards.forEach((d) => {
    const card = document.createElement('div');
    card.className = `dice-card ${isMyTurnInCombat ? 'playable-pulse' : ''}`;
    card.setAttribute('draggable', 'true');
    card.title = isMyTurnInCombat ? '¡Hacé clic o arrastrá para jugar en combate!' : 'Carta de 3 dados (ordenada por fuerza)';

    card.innerHTML = `
      <div class="card-type-badge">DADO TÁCTICO</div>
      <div class="dice-circle">${d.d1}</div>
      <div class="dice-circle">${d.d2}</div>
      <div class="dice-circle">${d.d3}</div>
      <div class="card-play-label">${isMyTurnInCombat ? '⚡ JUGAR' : 'MUNITION'}</div>
    `;

    // Clic directo
    card.onclick = () => onPlayDiceCard(d.id);

    // Arrastrar (Drag & Drop)
    card.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'dice', id: d.id }));
      card.classList.add('is-dragging');
    };
    card.ondragend = () => {
      card.classList.remove('is-dragging');
    };

    container.appendChild(card);
  });

  // 2. Cartas Especiales (con Arte Conceptual de la Segunda Guerra Mundial)
  if (specialCards.length > 0) {
    specialCards.forEach(s => {
      const card = document.createElement('div');
      const check = getSpecialCardPlayability(s, State.gameState, myPlayer);
      card.className = `special-card ${check.playable ? 'playable-pulse' : ''}`;
      card.setAttribute('draggable', 'true');
      card.title = check.playable ? '¡Lista para jugar! Clic para abrir orden táctica' : `Especial: ${s.name} (${check.reason})`;

      const artSvg = getSpecialCardArtSvg(s.artKey || s.type);

      card.innerHTML = `
        <div class="sp-badge">${check.playable ? '⚡ JUGABLE AHORA' : '★ ALTO MANDO 1940s'}</div>
        <div class="sp-art-container">${artSvg}</div>
        <div class="sp-concept-title">${s.concept || 'Táctica Secreta'}</div>
        <div class="sp-title">${s.name}</div>
        <div class="sp-desc">${s.desc}</div>
        <button class="btn-use-special" style="${check.playable ? 'background:linear-gradient(135deg,#2ecc71,#27ae60); color:#fff; border-color:#2ecc71;' : ''}">
          ${check.playable ? 'ACTIVAR ⚡' : 'VER ORDEN ℹ'}
        </button>
      `;

      card.onclick = () => openPlaySpecialModal(s.id);

      card.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'special', id: s.id }));
        card.classList.add('is-dragging');
      };
      card.ondragend = () => {
        card.classList.remove('is-dragging');
      };

      container.appendChild(card);
    });
  } else {
    // Mini placeholder informativo interactivo
    const placeholder = document.createElement('div');
    placeholder.className = 'no-specials-hint';
    placeholder.innerHTML = `
      <div>
        <strong>★ 0 CARTAS ESPECIALES</strong>
        <small style="display:block; margin-top:3px;">Ronda 1 arranca solo con dados. Se ganan en Ronda 2 por victorias en combate.</small>
      </div>
      <div class="no-specials-actions">
        <button class="btn-hint-action" onclick="openSpecialDeckInfo()">📖 Ver 16 cartas</button>
        <button class="btn-hint-action test-btn" onclick="testDrawSpecialCard()" title="Tomar 1 carta para probar cómo funcionan">🧪 Probar 1</button>
      </div>
    `;
    container.appendChild(placeholder);
  }
}

// ─── Selección de Ataque ───────────────────────────────────────────────────────
function onSelectAttackingTerritory(sourceTerritory) {
  if (State.gameState?.status !== 'playing') {
    showToast('No podés atacar en este momento.', 'error');
    return;
  }
  if (State.gameState.currentPlayerId !== State.myId) {
    showToast('Solo podés atacar en tu turno.', 'error');
    return;
  }

  State.selectedAttackingTerritory = sourceTerritory;
  document.getElementById('attack-source-desc').textContent = `Desde: ${sourceTerritory.name} (Elegí territorio enemigo a conquistar)`;

  // Buscar todos los territorios enemigos que se pueden atacar
  const grid = document.getElementById('target-grid');
  grid.innerHTML = '';

  const myPlayer = State.gameState.players.find(p => p.id === State.myId);
  const allTerritories = State.metadata?.territories || [];

  allTerritories.forEach(targetT => {
    // No atacar mis propios territorios
    if (myPlayer.territories.includes(targetT.id)) return;

    // ¿Es válido atacar? Mismo continente O conectado por puente
    const sameContinent = targetT.continent === sourceTerritory.continent;
    const hasBridge = sourceTerritory.bridges.includes(targetT.id) || targetT.bridges.includes(sourceTerritory.id);

    if (sameContinent || hasBridge) {
      const owner = State.gameState.players.find(p => p.territories.includes(targetT.id));
      const btn = document.createElement('button');
      btn.className = 'target-btn';
      btn.innerHTML = `
        <div class="target-btn-name">${targetT.name}</div>
        <div class="target-btn-owner" style="color:${owner?.color || '#fff'}">Defensor: ${owner?.name || '?'}</div>
      `;
      btn.onclick = () => {
        closeModal('modal-target-selection');
        State.socket.emit('declare_attack', {
          fromTerritoryId: sourceTerritory.id,
          toTerritoryId: targetT.id
        });
      };
      grid.appendChild(btn);
    }
  });

  if (grid.children.length === 0) {
    grid.innerHTML = '<div style="grid-column: span 2; color:#777; text-align:center; padding:20px;">No hay territorios enemigos al alcance directo de este territorio.</div>';
  }

  showModal('modal-target-selection');
}

// ─── Combate en Vivo ───────────────────────────────────────────────────────────
function renderCombat(combat, myPlayer) {
  const display = document.getElementById('combat-display');
  if (!combat) {
    display.style.display = 'none';
    return;
  }

  display.style.display = 'flex';
  const atkPlayer = State.gameState.players.find(p => p.id === combat.attackerId);
  const defPlayer = State.gameState.players.find(p => p.id === combat.defenderId);
  const fromT = State.metadata?.territories?.find(t => t.id === combat.fromTerritory);
  const toT = State.metadata?.territories?.find(t => t.id === combat.toTerritory);

  document.getElementById('atk-player-name').textContent = `${atkPlayer?.name || 'Atacante'}`;
  document.getElementById('atk-player-name').style.color = atkPlayer?.color || '#fff';
  document.getElementById('atk-territory-name').textContent = `Desde: ${fromT?.name || ''}`;

  document.getElementById('def-player-name').textContent = `${defPlayer?.name || 'Defensor'}`;
  document.getElementById('def-player-name').style.color = defPlayer?.color || '#fff';
  document.getElementById('def-territory-name').textContent = `Defiende: ${toT?.name || ''}`;

  // Slot atacante
  const atkSlot = document.getElementById('atk-card-slot');
  atkSlot.classList.remove('active-dropzone');
  if (combat.attackerCard) {
    if (combat.attackerCard.faceDown) {
      atkSlot.innerHTML = `
        <div class="dice-card card-face-down" style="cursor:default;">
          <div class="deck-back-inner">
            <span class="back-icon">🎲</span>
            <span class="back-text">BOCA ABAJO</span>
            <small class="back-sub">Carta oculta 🂠</small>
          </div>
        </div>
      `;
    } else {
      const r = combat.result?.rounds;
      atkSlot.innerHTML = `
        <div class="dice-card ${combat.result ? 'flip-card-reveal' : ''}" style="cursor:default; transform:none;">
          <div class="card-type-badge">ATACANTE</div>
          <div class="dice-circle ${r ? (r[0].winner === 'attacker' ? 'die-win' : 'die-lose') : ''}">${combat.attackerCard.d1}</div>
          <div class="dice-circle ${r ? (r[1].winner === 'attacker' ? 'die-win' : 'die-lose') : ''}">${combat.attackerCard.d2}</div>
          <div class="dice-circle ${r ? (r[2].winner === 'attacker' ? 'die-win' : 'die-lose') : ''}">${combat.attackerCard.d3}</div>
        </div>
      `;
    }
  } else {
    const isMe = combat.attackerId === myPlayer?.id;
    if (isMe) atkSlot.classList.add('active-dropzone');
    atkSlot.innerHTML = `<div class="placeholder-card" onclick="highlightHandCards()">${
      isMe
        ? '🎯 <strong>ARRASTRÁ ACÁ TU CARTA</strong><small style="color:#f1c40f; display:block; margin-top:4px;">o hacé clic en tu mano abajo 👇</small>'
        : 'Esperando carta atacante...'
    }</div>`;
  }

  // Slot defensor
  const defSlot = document.getElementById('def-card-slot');
  defSlot.classList.remove('active-dropzone');
  if (combat.defenderCard) {
    if (combat.defenderCard.faceDown) {
      defSlot.innerHTML = `
        <div class="dice-card card-face-down" style="cursor:default;">
          <div class="deck-back-inner">
            <span class="back-icon">🎲</span>
            <span class="back-text">BOCA ABAJO</span>
            <small class="back-sub">Carta oculta 🂠</small>
          </div>
        </div>
      `;
    } else {
      const r = combat.result?.rounds;
      defSlot.innerHTML = `
        <div class="dice-card ${combat.result ? 'flip-card-reveal' : ''}" style="cursor:default; transform:none;">
          <div class="card-type-badge">DEFENSOR</div>
          <div class="dice-circle ${r ? (r[0].winner === 'defender' ? 'die-win' : 'die-lose') : ''}">${combat.defenderCard.d1}</div>
          <div class="dice-circle ${r ? (r[1].winner === 'defender' ? 'die-win' : 'die-lose') : ''}">${combat.defenderCard.d2}</div>
          <div class="dice-circle ${r ? (r[2].winner === 'defender' ? 'die-win' : 'die-lose') : ''}">${combat.defenderCard.d3}</div>
        </div>
      `;
    }
  } else {
    const isMe = combat.defenderId === myPlayer?.id;
    if (isMe) defSlot.classList.add('active-dropzone');
    defSlot.innerHTML = `<div class="placeholder-card" onclick="highlightHandCards()">${
      isMe
        ? '🛡️ <strong>ARRASTRÁ ACÁ TU CARTA</strong><small style="color:#f1c40f; display:block; margin-top:4px;">o hacé clic abajo / botón del mazo</small>'
        : 'Esperando carta defensora...'
    }</div>`;
  }

  // Desglose de los 3 dados mano a mano
  const breakdownEl = document.getElementById('combat-breakdown');
  if (combat.result?.rounds) {
    breakdownEl.innerHTML = combat.result.rounds.map(r => {
      const atkWin = r.winner === 'attacker';
      return `
        <div class="breakdown-row">
          <span class="breakdown-die ${atkWin ? 'die-win' : 'die-lose'}">${r.atk}</span>
          <span style="font-size:9px; color:#8da4be">vs</span>
          <span class="breakdown-die ${!atkWin ? 'die-win' : 'die-lose'}">${r.def}</span>
          <small style="color:${atkWin ? '#2ecc71' : '#e74c3c'}">${atkWin ? 'Atk' : (r.atk === r.def ? 'Empate' : 'Def')}</small>
        </div>
      `;
    }).join('');
  } else {
    breakdownEl.innerHTML = '';
  }

  // Acciones de combate
  const actionsDiv = document.getElementById('combat-actions');
  actionsDiv.innerHTML = '';

  if (combat.result) {
    const isAttackerWin = combat.result.overallWinner === 'attacker';
    const banner = document.createElement('div');
    banner.style.fontWeight = '700';
    banner.style.color = isAttackerWin ? '#2ecc71' : '#e74c3c';
    banner.textContent = isAttackerWin ? `¡${atkPlayer?.name} gana el territorio!` : `¡${defPlayer?.name} resistió el ataque!`;
    actionsDiv.appendChild(banner);

    const btnClose = document.createElement('button');
    btnClose.className = 'btn-primary';
    btnClose.style.padding = '8px 22px';
    btnClose.style.fontSize = '14px';
    btnClose.style.cursor = 'pointer';
    btnClose.textContent = 'Continuar ✓';
    btnClose.onclick = () => {
      display.style.display = 'none';
      if (State.gameState) State.gameState.pendingCombat = null;
      State.socket?.emit('close_combat');
    };
    actionsDiv.appendChild(btnClose);
  } else if (combat.defenderId === myPlayer?.id && !combat.defenderCard) {
    // Opción oficial Yetem: defenderse con la carta del mazo
    const btnDeck = document.createElement('button');
    btnDeck.className = 'btn-top';
    btnDeck.style.background = 'rgba(243, 156, 18, 0.2)';
    btnDeck.style.borderColor = '#f39c12';
    btnDeck.textContent = '🎲 Defender con carta del Mazo';
    btnDeck.onclick = () => State.socket.emit('play_combat_dice', { isFromDeck: true });
    actionsDiv.appendChild(btnDeck);
  }
}

window.onSelectMiniMapTerritory = function(territoryId) {
  const t = State.metadata?.territories?.find(te => te.id === territoryId);
  if (!t) return;
  const myPlayer = State.gameState?.players?.find(p => p.id === State.myId);
  const isMine = myPlayer?.territories?.includes(territoryId);
  const owner = State.gameState?.players?.find(p => p.territories?.includes(territoryId));

  if (isMine && State.gameState?.status === 'playing' && State.gameState?.currentPlayerId === State.myId) {
    onSelectAttackingTerritory(t);
  } else {
    showToast(`📍 ${t.name} — Ocupado por ${owner ? owner.name : 'Nadie'}`, 'info');
  }
};

function onPlayDiceCard(diceCardId) {
  if (State.gameState?.status !== 'combat') {
    showToast('Las cartas de dados se usan durante un combate. Elegí un país abajo para atacar.', 'info');
    return;
  }
  State.socket.emit('play_combat_dice', { diceCardId, isFromDeck: false });
}

function getPlayableSpecialCards(state, myPlayer) {
  if (!state || !myPlayer || !myPlayer.mySpecialCards) return [];
  return myPlayer.mySpecialCards.filter(card => {
    return getSpecialCardPlayability(card, state, myPlayer).playable;
  });
}

function getSpecialCardPlayability(card, state, myPlayer) {
  if (!card) return { playable: false, reason: 'Carta no válida', phase: 'none' };
  if (!state || !myPlayer) return { playable: false, reason: 'Partida no iniciada', phase: 'none' };

  const cType = card.type || card.id;
  const inCombat = state.status === 'combat';
  const isPlaying = state.status === 'playing';
  const isMyTurn = state.currentPlayerId === myPlayer.id;
  const isAttacker = inCombat && state.pendingCombat?.attackerId === myPlayer.id;
  const isDefender = inCombat && state.pendingCombat?.defenderId === myPlayer.id;
  const isCombatant = isAttacker || isDefender;

  // Acciones tácticas de turno previo a declarar ataque
  if (['suministro', 'paz_armada', 'robo_carta', 'ataque_sorpresa'].includes(cType)) {
    if (inCombat) return { playable: false, reason: 'Solo antes de declarar ataque (en tu turno)', phase: 'turn' };
    if (!isPlaying) return { playable: false, reason: 'Solo durante el turno activo', phase: 'turn' };
    if (!isMyTurn) return { playable: false, reason: 'Solo podés jugarla durante tu propio turno', phase: 'turn' };
    if (cType === 'ataque_sorpresa' && myPlayer.surpriseAttack) {
      return { playable: false, reason: 'Ya tenés Ataque Sorpresa activo para tu próxima ofensiva', phase: 'turn' };
    }
    if (cType === 'paz_armada' && state.peaceActive) {
      return { playable: false, reason: 'Ya rige un tratado de Paz Armada en la mesa', phase: 'turn' };
    }
    return { playable: true, reason: 'Lista para activar en tu turno', phase: 'turn' };
  }

  // Modificadores de dados en combate
  if (['reforzar_dado', 'reforzar_dado_2', 'repetir_dado'].includes(cType)) {
    if (!inCombat) return { playable: false, reason: 'Solo se puede jugar durante un combate activo', phase: 'combat' };
    if (!isCombatant) return { playable: false, reason: 'Solo los comandantes en batalla pueden usarla', phase: 'combat' };
    return { playable: true, reason: 'Lista para usar en este combate', phase: 'combat' };
  }

  // Espionaje táctico (solo atacante)
  if (cType === 'espionaje') {
    if (!inCombat) return { playable: false, reason: 'Solo durante un combate activo', phase: 'combat' };
    if (!isAttacker) return { playable: false, reason: 'Solo el atacante puede espiar al defensor', phase: 'combat' };
    return { playable: true, reason: 'Lista para espiar los dados del defensor', phase: 'combat' };
  }

  // Defensa Blindada (solo defensor)
  if (cType === 'defensa_aerea') {
    if (!inCombat) return { playable: false, reason: 'Solo durante un combate activo', phase: 'combat' };
    if (!isDefender) return { playable: false, reason: 'Solo el defensor puede activar Defensa Blindada', phase: 'combat' };
    return { playable: true, reason: 'Lista para blindar tu defensa', phase: 'combat' };
  }

  return { playable: false, reason: 'No disponible en esta fase', phase: 'none' };
}

function openPlaySpecialModal(specialCardId) {
  const myPlayer = State.gameState?.players?.find(p => p.id === State.myId);
  const card = myPlayer?.mySpecialCards?.find(c => c.id === specialCardId)
            || State.metadata?.specialCards?.find(c => c.id === specialCardId);
  if (!card) {
    showToast('No se encontró la carta especial.', 'error');
    return;
  }

  const cType = card.type || card.id;
  State.pendingPlaySpecialCardId = card.id;
  State.pendingSpecialTargetId = null;
  State.pendingSpecialDieIndex = 1;

  document.getElementById('play-special-title').textContent = card.name.toUpperCase();
  document.getElementById('play-special-type').textContent = card.concept || 'ORDEN DEL ALTO MANDO 1940s';
  document.getElementById('play-special-artwork-frame').innerHTML = getSpecialCardArtSvg(card.artKey || card.type);
  document.getElementById('play-special-desc-text').textContent = card.desc;

  const check = getSpecialCardPlayability(card, State.gameState, myPlayer);
  const timingEl = document.getElementById('play-special-timing');
  const btnExecute = document.getElementById('btn-execute-special');

  if (check.playable) {
    timingEl.innerHTML = `<span class="badge-playable-yes">🟢 JUGABLE AHORA (${check.phase === 'combat' ? 'FASE DE COMBATE' : 'TU TURNO'})</span>`;
    btnExecute.disabled = false;
    btnExecute.classList.remove('disabled');
    btnExecute.textContent = 'EJECUTAR ORDEN TÁCTICA ⚡';
  } else {
    timingEl.innerHTML = `<span class="badge-playable-no">🔴 NO DISPONIBLE AHORA — ${check.reason}</span>`;
    btnExecute.disabled = true;
    btnExecute.classList.add('disabled');
    btnExecute.textContent = 'NO DISPONIBLE EN ESTA FASE';
  }

  // Selectores dinámicos
  const targetSection = document.getElementById('play-special-target-section');
  const targetTitle = document.getElementById('play-special-target-title');
  const targetBtns = document.getElementById('play-special-target-buttons');
  targetBtns.innerHTML = '';

  if (cType === 'robo_carta') {
    targetSection.style.display = 'block';
    targetTitle.textContent = 'ELEGIR COMANDANTE RIVAL A INFILTRAR:';
    const rivals = State.gameState?.players?.filter(p => p.id !== State.myId) || [];
    if (rivals.length > 0) {
      State.pendingSpecialTargetId = rivals[0].id;
      rivals.forEach((r, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `btn-target-selector ${idx === 0 ? 'selected' : ''}`;
        b.style.borderColor = r.color;
        b.innerHTML = `<span style="color:${r.color}; font-weight:800;">${r.name}</span> <small style="color:#8da4be">(${r.diceCount} dados, ${r.specialCount} esp.)</small>`;
        b.onclick = () => {
          State.pendingSpecialTargetId = r.id;
          targetBtns.querySelectorAll('.btn-target-selector').forEach(el => el.classList.remove('selected'));
          b.classList.add('selected');
        };
        targetBtns.appendChild(b);
      });
    }
  } else if (cType === 'reforzar_dado') {
    targetSection.style.display = 'block';
    targetTitle.textContent = 'ELEGIR QUÉ DADO REFORZAR (+1):';
    State.pendingSpecialDieIndex = 1;
    const dieNames = ['1º Dado (Mayor)', '2º Dado (Medio)', '3º Dado (Menor)'];
    dieNames.forEach((dName, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `btn-target-selector ${idx === 0 ? 'selected' : ''}`;
      b.textContent = dName;
      b.onclick = () => {
        State.pendingSpecialDieIndex = idx + 1; // 1, 2 o 3
        targetBtns.querySelectorAll('.btn-target-selector').forEach(el => el.classList.remove('selected'));
        b.classList.add('selected');
      };
      targetBtns.appendChild(b);
    });
  } else {
    targetSection.style.display = 'none';
  }

  showModal('modal-play-special');
}

function confirmPlaySpecialCard() {
  const cardId = State.pendingPlaySpecialCardId;
  if (!cardId) return;

  const myPlayer = State.gameState?.players?.find(p => p.id === State.myId);
  const card = myPlayer?.mySpecialCards?.find(c => c.id === cardId);
  const check = getSpecialCardPlayability(card, State.gameState, myPlayer);
  if (!check.playable) {
    showToast(check.reason, 'error');
    return;
  }

  State.socket.emit('play_special_card', {
    specialCardId: cardId,
    targetId: State.pendingSpecialTargetId,
    dieIndex: State.pendingSpecialDieIndex
  });

  closeModal('modal-play-special');
  showToast(`⚡ Orden táctica ejecutada: ${card?.name || 'Especial'}`, 'success');
}

function onPlaySpecialCard(specialCardId) {
  openPlaySpecialModal(specialCardId);
}

// ─── Drag & Drop Handlers ──────────────────────────────────────────────────────
function onCardSlotDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function onCardSlotDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function onCardSlotDrop(e, role) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  try {
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.type === 'dice') {
      onPlayDiceCard(data.id);
    }
  } catch (err) {
    console.error('Error al soltar carta:', err);
  }
}

function onCombatDisplayDragOver(e) {
  e.preventDefault();
}

function onCombatDisplayDragLeave(e) {}

function onCombatDisplayDrop(e) {
  e.preventDefault();
  try {
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.type === 'dice') {
      onPlayDiceCard(data.id);
    } else if (data.type === 'special') {
      onPlaySpecialCard(data.id);
    }
  } catch (err) {
    console.error('Error al soltar carta en la arena:', err);
  }
}

function highlightHandCards() {
  const hand = document.getElementById('my-hand-cards');
  if (hand) {
    hand.scrollIntoView({ behavior: 'smooth' });
    showToast('👇 Hacé clic en cualquiera de tus cartas de dados de tu mano', 'info');
  }
}

// ─── Modales de Información de Mazos ──────────────────────────────────────────
function openSpecialDeckInfo() {
  const grid = document.getElementById('specials-catalogue-grid');
  if (grid && State.metadata?.specials) {
    grid.innerHTML = '';
    State.metadata.specials.forEach(s => {
      const card = document.createElement('div');
      card.className = 'special-catalog-card';
      const artSvg = getSpecialCardArtSvg(s.artKey || s.type);
      card.innerHTML = `
        <div class="cat-type">★ ALTO MANDO 1940s</div>
        <div class="cat-art">${artSvg}</div>
        <div class="cat-concept">${s.concept || 'Táctica Secreta'}</div>
        <div class="cat-title">${s.name}</div>
        <div class="cat-desc">${s.desc}</div>
      `;
      grid.appendChild(card);
    });
  }
  showModal('modal-specials-info');
}

function openDiceDeckInfo() {
  showModal('modal-dice-info');
}

function testDrawSpecialCard() {
  if (State.gameState?.status === 'waiting') {
    showToast('Iniciá la partida antes de robar cartas.', 'error');
    return;
  }
  State.socket.emit('draw_test_special');
  closeModal('modal-specials-info');
  showToast('🧪 ¡Robaste 1 carta especial del mazo para tu mano!', 'success');
}

function addBot() {
  State.socket.emit('add_bot');
  showToast('🤖 Agregando Bot (IA) a la mesa...', 'info');
}

function resetRoom() {
  const room = State.roomId || document.getElementById('input-room')?.value?.trim() || 'TEG';
  State.socket.emit('reset_room', { roomId: room });
  showToast('🔄 Sala reiniciada. Podés invitar nuevos jugadores.', 'success');
}

function resetCurrentRoom() {
  const room = document.getElementById('input-room')?.value?.trim().toUpperCase() || 'TEG';
  State.socket.emit('reset_room', { roomId: room });
  State.socket.emit('get_room_colors', { roomId: room });
  showToast(`🔄 Sala ${room} vaciada. Ya podés entrar.`, 'success');
}

// ─── Acciones de Turno ─────────────────────────────────────────────────────────
function startGame() {
  State.socket.emit('start_game');
}

function doEndTurn() {
  if (State.gameState?.currentPlayerId !== State.myId) {
    showToast('No es tu turno.', 'error');
    return;
  }
  State.socket.emit('end_turn');
}

function toggleObjectiveModal() {
  const myPlayer = State.gameState?.players?.find(p => p.id === State.myId);
  if (myPlayer?.secretObjective) {
    document.getElementById('modal-obj-title').textContent = myPlayer.secretObjective.title;
    document.getElementById('modal-obj-desc').textContent = myPlayer.secretObjective.desc;
  }
  showModal('modal-objective');
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

let _toastTimer = null;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}
