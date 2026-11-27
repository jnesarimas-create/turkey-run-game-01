// HUD and screens: score, distance, lives, dash gauge, combo, zone label,
// mute/pause buttons, plus the title, pause and end overlays.

const SCREEN_TITLE = 0;
const SCREEN_PLAY = 1;
const SCREEN_PAUSED = 2;
const SCREEN_OVER = 3;

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = PALETTE.panel;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
}

function drawHud(ctx, state, best, muted) {
  const s = state;
  ctx.save();
  ctx.textBaseline = 'middle';
  // Score + distance.
  panel(ctx, 16, 14, 300, 64);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(`SCORE ${Math.floor(s.score)}`, 30, 34);
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(`${Math.floor(s.distance)} m  •  BEST ${Math.floor(best)}`, 30, 62);
  // Lives (hearts).
  panel(ctx, 330, 14, 150, 64);
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillStyle = PALETTE.red;
  ctx.fillText('♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(Math.max(0, 3 - s.lives)), 344, 46);
  // Dash gauge.
  panel(ctx, 494, 14, 190, 64);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('DASH  [Shift / E]', 508, 30);
  ctx.fillStyle = '#3A2A4A';
  ctx.fillRect(508, 42, 162, 14);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(508, 42, 162 * s.dashGauge, 14);
  // Combo.
  if (s.combo > 1) {
    panel(ctx, 698, 14, 110, 64);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(`COMBO x${s.combo}`, 710, 46);
  }
  // Zone label + mute/pause.
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(s.zone.label, FIELD.width - 130, 34);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(muted ? '🔇 M  •  ⏸ P' : '🔊 M  •  ⏸ P', FIELD.width - 130, 62);
  ctx.textAlign = 'left';
  // Close-call flash.
  if (s.elapsed - s.lastCloseCall < 1.1) {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLOSE CALL! +150', FIELD.width / 2, 120);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

function titleText(ctx, y, text, size, color, font = 'system-ui, sans-serif') {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = 'center';
  ctx.fillText(text, FIELD.width / 2, y);
  ctx.textAlign = 'left';
}

function drawTitle(ctx, best, time) {
  ctx.save();
  ctx.fillStyle = 'rgba(29,16,48,0.55)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const bob = Math.sin(time * 2) * 8;
  ctx.font = 'bold 92px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F2994A';
  ctx.fillText('GOBBLE', FIELD.width / 2, 210 + bob);
  ctx.fillStyle = '#F2C94C';
  ctx.fillText('BREAK', FIELD.width / 2, 300 + bob);
  ctx.textAlign = 'left';
  titleText(ctx, 360, 'The Great Thanksgiving Escape', 30, PALETTE.text);
  titleText(ctx, 400, 'Barnaby the turkey is on the run. Farmer Jed, the oven and', 20, PALETTE.muted);
  titleText(ctx, 428, 'the carving knife are all after him. Run 1000 m to freedom.', 20, PALETTE.muted);
  titleText(ctx, 500, 'W / ↑ / SPACE  jump — hold to flutter-glide     S / ↓  duck', 22, PALETTE.text);
  titleText(ctx, 534, 'SHIFT / E  feather dash     P  pause     M  mute', 22, PALETTE.text);
  titleText(ctx, 534, '', 22, PALETTE.text);
  const blink = Math.floor(time * 2) % 2 === 0;
  if (blink) titleText(ctx, 600, '— PRESS SPACE OR CLICK TO START —', 24, PALETTE.gold);
  if (best > 0) titleText(ctx, 650, `Best score: ${best}`, 20, PALETTE.muted);
  ctx.restore();
}

function drawPaused(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(29,16,48,0.7)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  titleText(ctx, 330, 'PAUSED', 72, PALETTE.text);
  titleText(ctx, 400, 'P or Esc to keep running  •  R to restart', 22, PALETTE.muted);
  ctx.restore();
}

function drawOver(ctx, state, best, time) {
  ctx.save();
  ctx.fillStyle = 'rgba(29,16,48,0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const escaped = state.cause === 'escaped';
  titleText(ctx, 250, escaped ? 'ESCAPED!' : 'CAUGHT!', escaped ? 84 : 84, escaped ? PALETTE.green : PALETTE.red);
  titleText(ctx, 310, escaped
    ? 'Barnaby vaulted the Freedom Fence. Thanksgiving is cancelled.'
    : state.cause === 'roasted' ? 'Into the oven! The roast was almost served.'
    : state.cause === 'carved' ? 'The carving knife got him. So close.'
    : state.cause === 'caught' ? 'Farmer Jed grabbed him by the tail feathers.'
    : 'Bonked on the kitchen counter. Ouch.', 22, PALETTE.text);
  titleText(ctx, 390, `Score  ${Math.floor(state.score)}`, 34, PALETTE.gold);
  titleText(ctx, 440, `Distance  ${Math.floor(state.distance)} m   •   Best  ${Math.floor(best)}`, 24, PALETTE.text);
  titleText(ctx, 480, `Rank this run:  ${rankFor(state.score)}`, 22, PALETTE.muted);
  const blink = Math.floor(time * 2) % 2 === 0;
  if (blink) titleText(ctx, 560, '— PRESS R OR ENTER TO RUN AGAIN —', 24, PALETTE.gold);
  ctx.restore();
}

function rankFor(score) {
  if (score >= 12000) return 'Grand Gobbler — top of the flock';
  if (score >= 8000) return 'Featherweight Champion';
  if (score >= 4500) return 'Brave Barn Runner';
  if (score >= 2000) return 'Plucky Chick';
  return 'Fresh Out of the Coop';
}
