// Barnaby the turkey: physics state only, no drawing (see render/sprites.js).

function createTurkey() {
  return {
    x: TURKEY.x,
    y: FIELD.groundY - TURKEY.h,
    vy: 0,
    w: TURKEY.w,
    h: TURKEY.h,
    grounded: true,
    ducking: false,
    coyote: 0,
    jumpBuffer: 0,
    invulnerable: 0,
    dashTime: 0,
    dashCooldown: 0,
    flap: 0, // wing-flap phase, advances with speed and in the air
    runPhase: 0,
  };
}

function turkeyHeight(t) {
  return t.ducking && t.grounded ? TURKEY.duckH : TURKEY.h;
}
