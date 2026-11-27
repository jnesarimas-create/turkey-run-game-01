// Storybook parallax backgrounds. Three layers scroll at different rates;
// the palette shifts with the biome (barnyard dusk, kitchen glow, banquet gold).

function sky(ctx, biome, t) {
  const g = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  g.addColorStop(0, biome.sky[0]);
  g.addColorStop(0.55, biome.sky[1]);
  g.addColorStop(1, biome.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  // Low autumn sun with a slow pulse.
  const pulse = 1 + Math.sin(t * 0.8) * 0.03;
  ctx.fillStyle = '#F6C453';
  ctx.beginPath();
  ctx.arc(1020, 150, 58 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(246,196,83,0.25)';
  ctx.beginPath();
  ctx.arc(1020, 150, 84 * pulse, 0, Math.PI * 2);
  ctx.fill();
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,243,214,0.16)';
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 340 + t * 12) % (FIELD.width + 220)) - 110;
    const cy = 70 + i * 42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 70, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, cy + 6, 52, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function hills(ctx, biome, scroll) {
  ctx.fillStyle = biome.hills[0];
  ctx.beginPath();
  ctx.moveTo(0, FIELD.groundY);
  for (let x = 0; x <= FIELD.width; x += 80) {
    const y = FIELD.groundY - 90 - Math.sin((x + scroll * 0.3) * 0.006) * 46;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(FIELD.width, FIELD.groundY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = biome.hills[1];
  ctx.beginPath();
  ctx.moveTo(0, FIELD.groundY);
  for (let x = 0; x <= FIELD.width; x += 80) {
    const y = FIELD.groundY - 34 - Math.sin((x + scroll * 0.6 + 300) * 0.008) * 22;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(FIELD.width, FIELD.groundY);
  ctx.closePath();
  ctx.fill();
}

function props(ctx, biome, scroll) {
  const offset = -(scroll % 640);
  ctx.save();
  ctx.strokeStyle = PALETTE.fence;
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i += 1) {
    const x = offset + i * 640;
    ctx.beginPath();
    ctx.moveTo(x, FIELD.groundY - 58);
    ctx.lineTo(x + 640, FIELD.groundY - 58);
    ctx.moveTo(x, FIELD.groundY - 30);
    ctx.lineTo(x + 640, FIELD.groundY - 30);
    ctx.stroke();
    for (let p = 0; p <= 4; p += 1) {
      ctx.fillStyle = PALETTE.fence;
      ctx.fillRect(x + p * 160 - 4, FIELD.groundY - 72, 8, 72);
    }
  }
  ctx.restore();
  // The barn, far in the distance.
  const barnX = 980 - (scroll * 0.15 % 1280);
  ctx.fillStyle = PALETTE.barn;
  ctx.fillRect(barnX, FIELD.groundY - 150, 150, 150);
  ctx.fillStyle = '#5E241C';
  ctx.beginPath();
  ctx.moveTo(barnX - 12, FIELD.groundY - 150);
  ctx.lineTo(barnX + 75, FIELD.groundY - 205);
  ctx.lineTo(barnX + 162, FIELD.groundY - 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#F2C94C';
  ctx.fillRect(barnX + 58, FIELD.groundY - 96, 34, 40);
}

function ground(ctx) {
  ctx.fillStyle = PALETTE.ground;
  ctx.fillRect(0, FIELD.groundY, FIELD.width, FIELD.height - FIELD.groundY);
  ctx.fillStyle = PALETTE.groundTop;
  ctx.fillRect(0, FIELD.groundY, FIELD.width, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = 0; x < FIELD.width; x += 90) {
    ctx.fillRect(x + 20, FIELD.groundY + 34, 26, 5);
    ctx.fillRect(x + 55, FIELD.groundY + 74, 18, 4);
  }
}

function drawBackground(ctx, biome, scroll, t) {
  sky(ctx, biome, t);
  hills(ctx, biome, scroll);
  props(ctx, biome, scroll);
  ground(ctx);
}
