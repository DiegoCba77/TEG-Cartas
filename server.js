import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TegCartasGame } from './engine/tegCartasGame.js';
import { CONTINENTS, TERRITORIES, SPECIAL_CARDS, OBJECTIVES, PLAYER_COLORS } from './data/tegCartasData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const PORT = process.env.PORT || 3000;
const SAVED_GAMES_DIR = path.join(__dirname, 'saved_games');
if (!fs.existsSync(SAVED_GAMES_DIR)) fs.mkdirSync(SAVED_GAMES_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const games = new Map();

// ─── Metadata API ─────────────────────────────────────────────────────────────
app.get('/api/metadata', (req, res) => {
  res.json({
    continents: CONTINENTS,
    territories: TERRITORIES,
    specials: SPECIAL_CARDS,
    playerColors: PLAYER_COLORS
  });
});

app.get('/api/rooms', (req, res) => {
  const rooms = [];
  for (const [id, game] of games.entries()) {
    rooms.push({
      id,
      status: game.status,
      players: game.players.length,
      round: game.round
    });
  }
  res.json(rooms);
});

// ─── Broadcast ────────────────────────────────────────────────────────────────
// ─── Broadcast ────────────────────────────────────────────────────────────────
function broadcastState(roomId) {
  const game = games.get(roomId);
  if (!game) return;

  for (const player of game.players) {
    if (!player.isBot) {
      const socket = io.sockets.sockets.get(player.id);
      if (socket) {
        socket.emit('game_state', game.toClientState(player.id));
      }
    }
  }
  // Espectadores
  io.to(roomId).emit('game_state_public', game.toClientState(null));

  // Notificar disponibilidad de colores en tiempo real a todos (incluso en lobby)
  broadcastRoomColors(roomId);

  // Automatización de Bots
  checkBotActions(roomId);
}

function broadcastRoomColors(roomId) {
  const game = games.get(roomId);
  const activePlayers = game 
    ? game.players.filter(p => p.connected || p.isBot)
    : [];
  const takenColors = activePlayers.map(p => ({ color: p.color, name: p.name, isBot: p.isBot }));
  const botCount = activePlayers.filter(p => p.isBot).length;
  const humanCount = activePlayers.filter(p => !p.isBot).length;
  io.emit('room_colors_update', {
    roomId,
    takenColors,
    playerCount: activePlayers.length,
    botCount,
    humanCount
  });
}

function checkBotActions(roomId) {
  const game = games.get(roomId);
  if (!game) return;

  // 1. Bot o Combate resuelto
  if (game.status === 'combat' && game.pendingCombat) {
    const combat = game.pendingCombat;
    if (combat.result) {
      const atkP = game.players.find(p => p.id === combat.attackerId);
      const defP = game.players.find(p => p.id === combat.defenderId);
      const delay = (atkP?.isBot || defP?.isBot) ? 2200 : 7000;
      setTimeout(() => {
        if (game.status === 'combat' && game.pendingCombat?.result) {
          game.closeCombat();
          broadcastState(roomId);
        }
      }, delay);
      return;
    }

    const atkP = game.players.find(p => p.id === combat.attackerId);
    if (atkP?.isBot && !combat.attackerCard) {
      setTimeout(() => {
        if (game.status === 'combat' && game.pendingCombat?.attackerId === atkP.id && !game.pendingCombat.attackerCard) {
          if (atkP.diceCards.length > 0) {
            game.playCombatCard(atkP.id, atkP.diceCards[0].id, false);
            broadcastState(roomId);
          }
        }
      }, 1000);
    }

    const defP = game.players.find(p => p.id === combat.defenderId);
    if (defP?.isBot && !combat.defenderCard) {
      setTimeout(() => {
        if (game.status === 'combat' && game.pendingCombat?.defenderId === defP.id && !game.pendingCombat.defenderCard) {
          if (defP.diceCards.length > 0 && Math.random() > 0.4) {
            game.playCombatCard(defP.id, defP.diceCards[0].id, false);
          } else {
            game.playCombatCard(defP.id, null, true);
          }
          broadcastState(roomId);
        }
      }, 1000);
    }
    return;
  }

  // 2. Turno del Bot
  if (game.status === 'playing') {
    const curP = game.getCurrentPlayer();
    if (curP?.isBot) {
      setTimeout(() => {
        if (game.status === 'playing' && game.getCurrentPlayer()?.id === curP.id) {
          game.stepBotTurn();
          broadcastState(roomId);
        }
      }, 1500);
    }
  }
}

// ─── Socket.io Handlers ───────────────────────────────────────────────────────
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentPlayerId = null;

  function getGame() {
    if (currentRoomId && games.has(currentRoomId)) {
      return { game: games.get(currentRoomId), roomId: currentRoomId };
    }
    for (const [rId, g] of games.entries()) {
      if (g.players.some(p => p.id === socket.id)) {
        currentRoomId = rId;
        return { game: g, roomId: rId };
      }
    }
    return { game: null, roomId: null };
  }

  socket.on('join_game', ({ roomId, playerName, playerColor, token }) => {
    currentRoomId = roomId.toUpperCase().trim();
    currentPlayerId = socket.id;

    let game = games.get(currentRoomId);
    if (!game) {
      game = new TegCartasGame(currentRoomId);
      games.set(currentRoomId, game);
    }

    try {
      game.addPlayer(socket.id, playerName, playerColor, token);
      socket.join(currentRoomId);
      broadcastState(currentRoomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('add_bot', (data = {}) => {
    const targetRoom = (data?.roomId || currentRoomId || 'TEG').toUpperCase().trim();
    let game = games.get(targetRoom);
    if (!game) {
      game = new TegCartasGame(targetRoom);
      games.set(targetRoom, game);
    }
    try {
      const bot = game.addBot();
      broadcastState(targetRoom);
      socket.emit('toast_message', `🤖 ${bot.name} agregado a la sala.`);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('reset_room', ({ roomId }) => {
    const targetRoom = (roomId || currentRoomId || 'TEG').toUpperCase().trim();
    let game = games.get(targetRoom);
    if (game) {
      game.resetGame();
      broadcastState(targetRoom);
      socket.emit('toast_message', 'Mesa reiniciada con éxito.');
    }
  });

  socket.on('get_room_colors', ({ roomId }) => {
    const targetRoom = (roomId || currentRoomId || 'TEG').toUpperCase().trim();
    const game = games.get(targetRoom);
    const activePlayers = game 
      ? game.players.filter(p => p.connected || p.isBot)
      : [];
    const takenColors = activePlayers.map(p => ({ color: p.color, name: p.name, isBot: p.isBot }));
    const botCount = activePlayers.filter(p => p.isBot).length;
    const humanCount = activePlayers.filter(p => !p.isBot).length;
    socket.emit('room_colors_update', {
      roomId: targetRoom,
      takenColors,
      playerCount: activePlayers.length,
      botCount,
      humanCount
    });
  });

  socket.on('change_color', ({ newColorHex }) => {
    if (!currentRoomId) return;
    const game = games.get(currentRoomId);
    if (!game || game.status !== 'waiting') return;
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    const isTaken = game.players.some(p => p.id !== socket.id && (p.connected || p.isBot) && p.color.toLowerCase() === newColorHex.toLowerCase());
    if (isTaken) {
      socket.emit('error_message', 'Ese color ya está ocupado por otro jugador.');
      return;
    }
    player.color = newColorHex;
    broadcastState(currentRoomId);
  });

  socket.on('start_game', () => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.startGame();
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('declare_attack', ({ fromTerritoryId, toTerritoryId }) => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.declareAttack(socket.id, fromTerritoryId, toTerritoryId);
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('play_combat_dice', ({ diceCardId, isFromDeck }) => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.playCombatCard(socket.id, diceCardId, isFromDeck);
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('close_combat', () => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.closeCombat();
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('play_special_card', ({ specialCardId, targetId, dieIndex }) => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.playSpecialCard(socket.id, specialCardId, { targetId, dieIndex });
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('draw_test_special', () => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.drawTestSpecial(socket.id);
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('end_turn', () => {
    const { game, roomId } = getGame();
    if (!game) return;
    try {
      game.endTurn();
      broadcastState(roomId);
    } catch (err) {
      socket.emit('error_message', err.message);
    }
  });

  socket.on('chat_message', ({ text }) => {
    const { game, roomId } = getGame();
    if (!game) return;
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    io.to(currentRoomId).emit('chat', {
      playerName: player.name,
      color: player.color,
      text,
      ts: time
    });
  });

  socket.on('leave_game', () => {
    if (currentRoomId) {
      const game = games.get(currentRoomId);
      if (game) {
        game.removePlayer(socket.id);
        socket.leave(currentRoomId);
        broadcastState(currentRoomId);
      }
      currentRoomId = null;
    }
  });

  socket.on('disconnect', () => {
    if (currentRoomId) {
      const game = games.get(currentRoomId);
      if (game) {
        game.removePlayer(socket.id);
        broadcastState(currentRoomId);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║        🃏  T.E.G. CARTAS — ONLINE  🃏            ║`);
  console.log(`║   http://localhost:${PORT}                          ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
