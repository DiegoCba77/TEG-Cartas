// public/icons.js - Vector Icons & Insignia de la Segunda Guerra Mundial
// Estética retro militar 1940s (auténticos gráficos vectoriales para reemplazar emojis)

window.WW2Icons = {
  // Espadas / Dagas de combate cruzadas (Ataque / Ofensiva)
  crossedDaggers: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
      <path d="M13 19l2 2 4-4-2-2"/>
      <path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/>
      <path d="M11 19l-2 2-4-4 2-2"/>
      <line x1="12" y1="12" x2="12.01" y2="12" stroke-width="3"/>
    </svg>
  `,

  // Estrella Militar con Laureles (Cartas Especiales / Rangos)
  starMedal: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1" class="ww2-svg-icon">
      <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" fill="${color}" stroke="none"/>
      <circle cx="12" cy="12" r="3" fill="#111827" stroke="${color}" stroke-width="1.5"/>
    </svg>
  `,

  // Mira de Artillería / Blanco Táctico (Objetivo Secreto)
  crosshair: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <circle cx="12" cy="12" r="9"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <circle cx="12" cy="12" r="3" fill="${color}" fill-opacity="0.3"/>
    </svg>
  `,

  // Brújula Militar de Campaña (Mini Mapa)
  compass: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="${color}" fill-opacity="0.25"/>
      <line x1="12" y1="2" x2="12" y2="4"/>
      <line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="4" y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
    </svg>
  `,

  // Gorra de Brigadier / Oficial al Mando (Bots & Comandantes)
  officerCap: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <path d="M4 14C4 9 7 6 12 6s8 3 8 8" fill="${color}" fill-opacity="0.2"/>
      <path d="M2 15h20l-2 3H4z" fill="${color}" fill-opacity="0.6"/>
      <ellipse cx="12" cy="10" rx="2" ry="1.5" fill="${color}"/>
      <line x1="12" y1="15" x2="12" y2="18"/>
    </svg>
  `,

  // Chevrons de Rango / Finalizar Turno
  chevrons: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <polyline points="7 13 12 18 17 13"/>
      <polyline points="7 6 12 11 17 6"/>
    </svg>
  `,

  // Cartuchos / Dados de Combate
  diceAmmo: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="${color}" fill-opacity="0.15"/>
      <circle cx="8" cy="8" r="1.5" fill="${color}"/>
      <circle cx="16" cy="8" r="1.5" fill="${color}"/>
      <circle cx="12" cy="12" r="1.5" fill="${color}"/>
      <circle cx="8" cy="16" r="1.5" fill="${color}"/>
      <circle cx="16" cy="16" r="1.5" fill="${color}"/>
    </svg>
  `,

  // Salir al Lobby / Puesto de Comando
  exitDoor: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  `,

  // Reiniciar Sala / Reabastecimiento de Arsenal
  reload: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  `,

  // Tanque de Asalto Blindado (Combate / Defensa Blindada)
  tank: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 20" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <rect x="3" y="11" width="22" height="7" rx="3.5" fill="${color}" fill-opacity="0.3"/>
      <circle cx="7" cy="14.5" r="1.5" fill="${color}"/>
      <circle cx="12" cy="14.5" r="1.5" fill="${color}"/>
      <circle cx="17" cy="14.5" r="1.5" fill="${color}"/>
      <circle cx="21" cy="14.5" r="1.5" fill="${color}"/>
      <path d="M7 11L10 6h8l3 5H7z" fill="${color}" fill-opacity="0.4"/>
      <circle cx="14" cy="4.5" r="2.5" fill="${color}"/>
      <line x1="16.5" y1="4.5" x2="26" y2="4.5" stroke-width="2.5"/>
    </svg>
  `,

  // Bombardero de la Segunda Guerra Mundial (Ataque Aéreo)
  bomber: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="0.8" class="ww2-svg-icon">
      <path d="M12 2c-.6 0-1 .4-1 1v5L2 13v2l9-2v5l-2.5 2v1l3.5-1 3.5 1v-1L13 18v-5l9 2v-2l-9-5V3c0-.6-.4-1-1-1z"/>
    </svg>
  `,

  // Sello Confidencial / Alto Mando
  classifiedSeal: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ww2-svg-icon">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="${color}" fill-opacity="0.1"/>
      <line x1="7" y1="8" x2="17" y2="8"/>
      <line x1="7" y1="12" x2="13" y2="12"/>
      <circle cx="16" cy="15" r="2.5" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>
    </svg>
  `,

  // Rayo de Guerra Relámpago (Blitzkrieg / Especiales)
  lightning: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1" class="ww2-svg-icon">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  `,

  // Corona de Laureles de la Victoria (Fin de Partida)
  victoryWreath: (size = 32, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${color}" stroke-width="2" class="ww2-svg-icon">
      <path d="M8 26C5 20 6 13 11 8c1-1 3 1 2 2-3 4-3 9-1 14 1 2-1 3-2 2z" fill="${color}" fill-opacity="0.3"/>
      <path d="M28 26c3-6 2-13-3-18-1-1-3 1-2 2 3 4 3 9 1 14-1 2 1 3 2 2z" fill="${color}" fill-opacity="0.3"/>
      <polygon points="18,4 20,9.5 25,10 21,14 22,19 18,16 14,19 15,14 11,10 16,9.5" fill="${color}"/>
      <line x1="18" y1="20" x2="18" y2="32" stroke-width="2.5"/>
      <circle cx="18" cy="30" r="3" fill="${color}"/>
    </svg>
  `
};
