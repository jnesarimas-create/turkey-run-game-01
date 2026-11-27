// All characters and obstacles are drawn with Canvas 2D paths — no images,
// no network. Barnaby: fanning tail, flapping wings, bobbing head. Farmer Jed:
// straw hat, overalls, angry run. The oven glows and the knife glints.

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurkey(ctx, t, time) {
  const h = t.ducking && t.grounded ? 38 : 58;
  const cx = t.x + t.w / 2;
  const cy = t.y + h;
  const blink = t.invulnerable > 0 && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.35;
  if (t.dashTime > 0) {
    ctx.fillStyle = 'rgba(242,201,76,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 34, cy - h / 2, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Fanning tail.
  const tailColors = ['#A0522D', '#D2691E', '#E8A33C', '#8E3B2F', '#F2994A'];
  for (let i = 0; i < 5; i += 1) {
    const a = -0.5 - i * 0.28;
    ctx.save();
    ctx.translate(cx - 22, cy - 16);
    ctx.rotate(a);
    ellipse(ctx, 0, -26, 9, 30, tailColors[i]);
    ctx.restore();
  }
  // Body.
  ellipse(ctx, cx, cy - 22, 30, 26, '#8A5230');
  ellipse(ctx, cx + 4, cy - 18, 22, 18, '#A9713F');
  // Wing, flapping.
  const flap = Math.sin(t.flap) * 0.55;
  ctx.save();
  ctx.translate(cx - 6, cy - 24);
  ctx.rotate(-0.5 + flap);
  ellipse(ctx, -14, 0, 20, 11, '#6B3A1E');
  ctx.restore();
  // Head + beak + wattle.
  ellipse(ctx, cx + 24, cy - 48, 13, 13, '#C9D2E3');
  ctx.fillStyle = '#E8A33C';
  ctx.beginPath();
  ctx.moveTo(cx + 34, cy - 50);
  ctx.lineTo(cx + 48, cy - 45);
  ctx.lineTo(cx + 34, cy - 42);
  ctx.closePath();
  ctx.fill();
  ellipse(ctx, cx + 30, cy - 38, 4, 8, PALETTE.red);
  ctx.fillStyle = '#1B1030';
  ctx.beginPath();
  ctx.arc(cx + 27, cy - 51, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // Legs, running.
  const run = Math.sin(t.runPhase) * 8;
  ctx.strokeStyle = '#E8A33C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 4);
  ctx.lineTo(cx - 8 + run, cy + 4);
  ctx.moveTo(cx + 8, cy - 4);
  ctx.lineTo(cx + 8 - run, cy + 4);
  ctx.stroke();
  ctx.restore();
}

function drawFarmer(ctx, turkey, farmer, time) {
  const x = farmerX(turkey.x, farmer.gap);
  const y = FIELD.groundY;
  const run = Math.sin(farmer.runPhase) * 10;
  ctx.save();
  // Straw hat.
  ctx.fillStyle = '#E8C96A';
  ctx.beginPath();
  ctx.ellipse(x + 34, y - 108, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + 18, y - 132, 32, 26);
  // Head, angry eyes.
  ellipse(ctx, x + 34, y - 92, 17, 18, '#E8B48A');
  ctx.fillStyle = '#1B1030';
  ctx.beginPath();
  ctx.arc(x + 28, y - 96, 2.6, 0, Math.PI * 2);
  ctx.arc(x + 40, y - 96, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1B1030';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 24, y - 102);
  ctx.lineTo(x + 32, y - 99);
  ctx.moveTo(x + 44, y - 102);
  ctx.lineTo(x + 36, y - 99);
  ctx.stroke();
  // Beard.
  ellipse(ctx, x + 34, y - 76, 13, 9, '#F3E6C8');
  // Overalls.
  ctx.fillStyle = '#3B5B8C';
  ctx.fillRect(x + 14, y - 68, 40, 44);
  ctx.fillStyle = '#E5534B';
  ctx.fillRect(x + 14, y - 68, 40, 8);
  // Arms reaching forward.
  ctx.strokeStyle = '#E8B48A';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x + 48, y - 58);
  ctx.lineTo(x + 66, y - 40);
  ctx.stroke();
  // Legs running.
  ctx.strokeStyle = '#2E3A4A';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + 22, y - 24);
  ctx.lineTo(x + 22 + run, y);
  ctx.moveTo(x + 46, y - 24);
  ctx.lineTo(x + 46 - run, y);
  ctx.stroke();
  if (farmer.angry > 0) {
    ctx.fillStyle = '#FFF3D6';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('GET BACK HERE!', x - 30, y - 148);
  }
  ctx.restore();
}

function drawObstacle(ctx, o, time) {
  ctx.save();
  if (o.kind === 'oven') {
    ctx.fillStyle = '#3A3A44';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = '#22222A';
    ctx.fillRect(o.x + 8, o.y + 8, o.w - 16, o.h - 16);
    const glow = 0.55 + Math.sin(time * 6 + o.x * 0.01) * 0.3;
    ctx.fillStyle = `rgba(255,${Math.floor(120 + glow * 80)},40,${glow})`;
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h - 22, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F2994A';
    for (let i = 0; i < 3; i += 1) {
      const fx = o.x + 22 + i * 26;
      ctx.beginPath();
      ctx.moveTo(fx, o.y + o.h - 8);
      ctx.quadraticCurveTo(fx + 6, o.y + o.h - 34 - Math.sin(time * 9 + i) * 8, fx + 12, o.y + o.h - 8);
      ctx.fill();
    }
    ctx.fillStyle = '#FFF3D6';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('OVEN', o.x + 26, o.y + 16);
  } else if (o.kind === 'knife') {
    if (o.telegraph > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(time * 20) * 0.3})`;
      ctx.beginPath();
      ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#C9CED6';
    ctx.beginPath();
    ctx.moveTo(-34, -6);
    ctx.lineTo(18, -7);
    ctx.lineTo(34, 0);
    ctx.lineTo(18, 7);
    ctx.lineTo(-34, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7A4A26';
    ctx.fillRect(-52, -7, 20, 14);
    ctx.restore();
  } else if (o.kind === 'counter') {
    ctx.fillStyle = '#6B4A2F';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = '#8A5A33';
    ctx.fillRect(o.x, o.y, o.w, 12);
    ctx.fillStyle = '#F2C94C';
    ctx.beginPath();
    ctx.arc(o.x + 28, o.y + 26, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E5534B';
    ctx.fillRect(o.x + 62, o.y + 18, 26, 22);
  } else if (o.kind === 'gravy') {
    ctx.fillStyle = '#7A4A1E';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(242,201,76,0.5)';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2 - 14, o.y + 2, 18, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPickup(ctx, p, time) {
  const y = p.y + Math.sin(p.bob) * 6;
  ctx.save();
  if (p.kind === 'corn') {
    ctx.fillStyle = '#F2C94C';
    ctx.beginPath();
    ctx.ellipse(p.x + 13, y + 13, 11, 13, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7FB069';
    ctx.beginPath();
    ctx.moveTo(p.x + 4, y + 22);
    ctx.lineTo(p.x + 13, y + 30);
    ctx.lineTo(p.x + 22, y + 22);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFF3D6';
    ctx.beginPath();
    ctx.ellipse(p.x + 15, y + 15, 14, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F2C94C';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('DASH', p.x + 2, y + 34);
  }
  ctx.restore();
}
