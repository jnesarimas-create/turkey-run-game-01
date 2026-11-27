// The screenshot scenes behind ?shot=cover|title|kitchen|end. Each one plays
// the real rules forward from a fresh world for a fixed number of steps,
// steered by a simple autopilot (jump the oven/counter, duck the knife, chase
// corn), so the frame is what a short game really looks like and the same
// seed always gives the same frame.

const SAMPLE = 1 / 30;

function autopilot(world) {
  const s = world.state;
  const t = s.turkey;
  // Nearest obstacle ahead. Strategy: jump everything at the last safe
  // moment (dist < 180 px). A jump clears ovens, counters, gravy and even
  // head-height knives — the turkey rises above the blade — so ducking is
  // only a fallback when already airborne and a low knife is on top of us.
  let near = null;
  for (const o of s.obstacles) {
    if (!o.active) continue;
    if (o.x + o.w < t.x) continue;
    if (near === null || o.x < near.x) near = o;
  }
  if (!near) return { jumpPressed: false, jumpHeld: t.y < FIELD.groundY - 60, duck: false, direction: 0, dash: false };
  const dist = near.x - (t.x + t.w);
  if (t.grounded && dist < 220) {
    return { jumpPressed: true, jumpHeld: true, duck: false, direction: 0, dash: false };
  }
  if (!t.grounded && near.kind === 'knife' && dist < 120) {
    // Duck under a low blade — but keep holding jump so the glide stays on.
    return { jumpPressed: false, jumpHeld: true, duck: true, direction: 0, dash: false };
  }
  return { jumpPressed: false, jumpHeld: t.y < FIELD.groundY - 60, duck: false, direction: 0, dash: false };
}

function stageShot(name, world) {
  world.reset();
  if (name === 'title') {
    for (let i = 0; i < 5 / STEP; i += 1) world.step(STEP, { jumpPressed: false, jumpHeld: false, duck: false, direction: 0, dash: false }, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const seconds = name === 'end' ? 600 : name === 'kitchen' ? 60 : 40;
  const horizon = name === 'end' ? 0.25 : 1;
  let over = false;
  const onScreen = (kind) => world.state.obstacles.some(
    (o) => o.active && o.kind === kind && o.x > 100 && o.x < FIELD.width - 100);
  for (let i = 0; i < seconds / STEP; i += 1) {
    const input = autopilot(world);
    // The end-scene pilot is sloppier: it only reacts at the last moment.
    if (name === 'end' && world.state.obstacles.some((o) => o.active && o.x - world.state.turkey.x < 120)) {
      input.jumpPressed = false;
      input.duck = false;
    }
    const events = world.step(STEP, input, false);
    if (events & EVENT_OVER) { over = true; break; }
    if (name === 'kitchen' && world.state.distance >= 380) break;
    // Cover: hold the frame until the turkey, the farmer, an oven AND a
    // carving knife are all unmistakably in view at once.
    if (name === 'cover' && world.state.distance >= 60 && onScreen('oven') && onScreen('knife')) break;
  }
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: Math.floor(world.state.score) };
}
