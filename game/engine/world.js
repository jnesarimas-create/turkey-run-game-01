// The world: pure rules, no drawing and no browser in it. step() advances one
// fixed 1/60s step and returns event flags, so the caller can react (sound,
// shake, announcements) without the world knowing about screens or sound.
// Nothing here allocates after createWorld returns.

const EVENT_HIT = 1;
const EVENT_CORN = 2;
const EVENT_OVER = 4;
const EVENT_CLOSE = 8;
const EVENT_ZONE = 16;
const EVENT_FEATHER = 32;

function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function createWorld(random) {
  const turkey = createTurkey();
  const farmer = createFarmer();
  const obstacles = [];
  const pickups = [];
  const state = {
    turkey, farmer, obstacles, pickups,
    score: 0, distance: 0, lives: LIVES, level: 1, elapsed: 0,
    combo: 1, comboTimer: 0, dashGauge: 1, speed: RUN.baseSpeed,
    waveTimer: 1.2, cornTimer: 2.2, featherTimer: 14,
    shake: 0, hitStop: 0, flash: 0, lastCloseCall: 0,
    zone: zoneAt(0), escaped: false, over: false, cause: '',
  };

  function reset() {
    const t = createTurkey();
    Object.assign(turkey, t);
    const f = createFarmer();
    Object.assign(farmer, f);
    obstacles.length = 0;
    pickups.length = 0;
    state.score = 0; state.distance = 0; state.lives = LIVES; state.level = 1;
    state.elapsed = 0; state.combo = 1; state.comboTimer = 0; state.dashGauge = 1;
    state.speed = RUN.baseSpeed; state.waveTimer = 1.2; state.cornTimer = 2.2;
    state.featherTimer = 14; state.shake = 0; state.hitStop = 0; state.flash = 0;
    state.zone = zoneAt(0); state.escaped = false; state.over = false; state.cause = '';
  }

  function spawnWave() {
    const wave = WAVES[Math.floor(random() * WAVES.length)];
    const baseX = FIELD.width + 60;
    for (const part of wave) {
      if (part.kind === 'corn') {
        pickups.push(...cornLine(baseX + part.dx, part.y, 3));
        continue;
      }
      const size = obstacleSize(part.kind);
      const y = part.y !== undefined ? part.y : FIELD.groundY - size.h;
      obstacles.push({
        kind: part.kind, x: baseX + part.dx, y, w: size.w, h: size.h,
        active: true, flame: !!part.flame, telegraph: part.kind === KIND_KNIFE ? 0.65 : 0,
        passed: false, closeCounted: false,
      });
    }
    // A feather sometimes trails a hard wave.
    if (random() < 0.35) pickups.push(featherAt(baseX + 320, FIELD.groundY - 130));
  }

  function speed() {
    return Math.min(RUN.maxSpeed, RUN.baseSpeed + state.distance * RUN.speedPerMetre);
  }

  function hit(cause) {
    if (turkey.invulnerable > 0 || turkey.dashTime > 0) return 0;
    state.lives -= 1;
    turkey.invulnerable = TURKEY.invulnerable;
    farmer.gap = Math.max(RUN.farmerCatchGap + 8, farmer.gap - 55);
    state.combo = 1;
    state.comboTimer = 0;
    state.shake = 0.35;
    state.hitStop = 0.09;
    state.flash = 0.25;
    farmer.angry = 1;
    if (state.lives <= 0) {
      state.over = true;
      state.cause = cause;
      return EVENT_HIT | EVENT_OVER;
    }
    return EVENT_HIT;
  }

  function step(dt, input, harmless) {
    let events = 0;
    if (state.hitStop > 0) {
      state.hitStop -= dt;
      return 0; // hit-stop: the world freezes for a beat
    }
    state.elapsed += dt;
    state.speed = speed();
    const dx = state.speed * dt;
    state.distance += dx / 10; // 10 px ~ 1 m at the base scroll
    state.score += SCORE.perMetre * (dx / 10);
    state.level = 1 + Math.floor(state.distance / 200);

    const zone = zoneAt(state.distance);
    if (zone.id !== state.zone.id) {
      state.zone = zone;
      events |= EVENT_ZONE;
    }

    // --- turkey physics ---
    const t = turkey;
    t.coyote = t.grounded ? TURKEY.coyote : Math.max(0, t.coyote - dt);
    t.jumpBuffer = Math.max(0, t.jumpBuffer - dt);
    if (input.jumpPressed) t.jumpBuffer = TURKEY.jumpBuffer;
    if (t.jumpBuffer > 0 && (t.grounded || t.coyote > 0)) {
      t.vy = TURKEY.jumpVel;
      t.grounded = false;
      t.coyote = 0;
      t.jumpBuffer = 0;
    }
    t.ducking = input.duck && t.grounded;
    // Hold jump to flutter-glide: lighter gravity the whole time airborne.
    const grav = !t.grounded && input.jumpHeld ? TURKEY.glideGravity
      : !t.grounded && input.duck ? TURKEY.fastFall : TURKEY.gravity;
    t.vy += grav * dt;
    t.y += t.vy * dt;
    if (t.y >= FIELD.groundY - turkeyHeight(t)) {
      t.y = FIELD.groundY - turkeyHeight(t);
      t.vy = 0;
      t.grounded = true;
    } else {
      t.grounded = false;
    }
    // Horizontal drift: A/D nudges the turkey within a corridor.
    t.x = Math.min(560, Math.max(120, t.x + input.direction * 260 * dt));
    t.flap += dt * (t.grounded ? 10 : 16);
    t.runPhase += dt * (t.grounded ? state.speed / 28 : 4);
    if (t.invulnerable > 0) t.invulnerable -= dt;
    if (t.dashCooldown > 0) t.dashCooldown -= dt;
    if (t.dashTime > 0) {
      t.dashTime -= dt;
      t.x = Math.min(560, t.x + TURKEY.dashSpeed * dt);
      farmer.gap = Math.min(220, farmer.gap + 40 * dt);
    }
    if (input.dash && t.dashGauge >= 0.5 && t.dashCooldown <= 0) {
      t.dashTime = TURKEY.dashTime;
      t.dashCooldown = TURKEY.dashCooldown;
      t.dashGauge -= 0.5;
    }
    t.dashGauge = Math.min(1, t.dashGauge + dt * 0.08);

    // --- farmer pursuit (only while actually playing, not on the title screen) ---
    farmer.runPhase += dt * 11;
    if (!harmless) farmer.gap = Math.max(RUN.farmerCatchGap, farmer.gap - dx * 0.015 - dt * 0.6);
    if (farmer.angry > 0) farmer.angry -= dt;
    if (farmer.gap <= RUN.farmerCatchGap && !harmless) {
      state.over = true;
      state.cause = 'caught';
      return events | EVENT_OVER;
    }

    // --- spawning ---
    state.waveTimer -= dt;
    if (state.waveTimer <= 0) {
      spawnWave();
      state.waveTimer = Math.max(0.9, 1.9 - state.level * 0.09) + random() * 0.5;
    }
    state.cornTimer -= dt;
    if (state.cornTimer <= 0) {
      pickups.push(...cornLine(FIELD.width + 40, FIELD.groundY - 110 - random() * 90, 3));
      state.cornTimer = 3 + random() * 2.5;
    }
    state.featherTimer -= dt;
    if (state.featherTimer <= 0) {
      pickups.push(featherAt(FIELD.width + 40, FIELD.groundY - 140));
      state.featherTimer = 16 + random() * 8;
    }

    // --- move + collide obstacles ---
    const th = turkeyHeight(t);
    for (let i = obstacles.length - 1; i >= 0; i -= 1) {
      const o = obstacles[i];
      if (!o.active) continue;
      o.x -= dx;
      if (o.telegraph > 0) o.telegraph -= dt;
      if (o.x + o.w < -80) { o.active = false; continue; }
      // Close call: a knife that just missed the turkey.
      if (!o.closeCounted && o.x + o.w < t.x && o.x + o.w > t.x - 90) {
        const gapY = Math.min(Math.abs(o.y - t.y), Math.abs((o.y + o.h) - (t.y + th)));
        if (gapY <= SCORE.closeCallPx && o.kind === KIND_KNIFE) {
          o.closeCounted = true;
          state.score += SCORE.closeCall * state.combo;
          state.lastCloseCall = state.elapsed;
          events |= EVENT_CLOSE;
        }
      }
      if (harmless) continue;
      if (o.kind === KIND_GRAVY) {
        if (overlaps(t.x, t.y, t.w, th, o.x, o.y, o.w, o.h) && t.grounded) {
          state.speed = Math.max(200, state.speed - 60 * dt);
        }
        continue;
      }
      if (overlaps(t.x + 8, t.y + 4, t.w - 16, th - 6, o.x + 6, o.y + 4, o.w - 12, o.h - 6)) {
        o.active = false;
        events |= hit(o.kind === KIND_OVEN ? 'roasted' : o.kind === KIND_KNIFE ? 'carved' : 'bonked');
        if (events & EVENT_OVER) return events;
      } else if (!o.passed && o.x + o.w < t.x) {
        o.passed = true;
        state.combo = Math.min(COMBO.max, state.combo + 1);
        state.comboTimer = COMBO.window;
      }
    }

    // --- pickups ---
    for (let i = pickups.length - 1; i >= 0; i -= 1) {
      const p = pickups[i];
      if (!p.active) continue;
      p.x -= dx;
      p.bob += dt * 4;
      if (p.x < -60) { p.active = false; continue; }
      if (harmless) continue;
      const py = p.y + Math.sin(p.bob) * 6;
      if (overlaps(t.x, t.y, t.w, th, p.x, py, p.w, p.h)) {
        p.active = false;
        if (p.kind === 'corn') {
          state.score += SCORE.corn * state.combo;
          state.combo = Math.min(COMBO.max, state.combo + 1);
          state.comboTimer = COMBO.window;
          farmer.gap = Math.min(220, farmer.gap + 18);
          events |= EVENT_CORN;
        } else {
          state.score += SCORE.feather;
          state.dashGauge = 1;
          events |= EVENT_FEATHER;
        }
      }
    }

    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 1;
    }
    if (state.shake > 0) state.shake -= dt;
    if (state.flash > 0) state.flash -= dt;

    // Escape: 1000 m and the Freedom Fence is reached.
    if (state.distance >= 1000 && !harmless) {
      state.escaped = true;
      state.over = true;
      state.cause = 'escaped';
      return events | EVENT_OVER;
    }
    return events;
  }

  reset();
  return { state, reset, step };
}
