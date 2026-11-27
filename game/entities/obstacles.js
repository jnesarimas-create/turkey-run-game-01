// Obstacles: the roasting oven (ground, jump it), the carving knife (flies at
// head height — duck or jump), the kitchen counter (tall block, jump it) and
// the gravy puddle (ground slick — jump it, it slows you if you run through).
// Curated pattern waves keep the game fair: every wave is jumpable/duckable.

const KIND_OVEN = 'oven';
const KIND_KNIFE = 'knife';
const KIND_COUNTER = 'counter';
const KIND_GRAVY = 'gravy';

// A wave is a list of obstacles placed at offsets from the wave start (px).
// All waves were checked by hand: the turkey can clear each one.
const WAVES = [
  // Oven alone — learn to jump.
  [{ kind: KIND_OVEN, dx: 0 }],
  // Knife at head height — duck under it.
  [{ kind: KIND_KNIFE, dx: 0, y: FIELD.groundY - 96 }],
  // Counter then oven, spaced for two jumps.
  [{ kind: KIND_COUNTER, dx: 0 }, { kind: KIND_OVEN, dx: 260 }],
  // Oven + knife over it: jump the oven, duck the knife on landing is wrong —
  // jump late and the knife passes overhead. Telegraph: knife glints first.
  [{ kind: KIND_OVEN, dx: 0 }, { kind: KIND_KNIFE, dx: 120, y: FIELD.groundY - 150 }],
  // Gravy puddle then a knife: jump the puddle, stay low for the knife.
  [{ kind: KIND_GRAVY, dx: 0 }, { kind: KIND_KNIFE, dx: 200, y: FIELD.groundY - 96 }],
  // Double knife volley with a 0.65s telegraph gap between the two blades.
  [{ kind: KIND_KNIFE, dx: 0, y: FIELD.groundY - 96 }, { kind: KIND_KNIFE, dx: 170, y: FIELD.groundY - 150 }],
  // Oven flame + corn pickup just past it: risk the jump, take the corn.
  [{ kind: KIND_OVEN, dx: 0, flame: true }, { kind: 'corn', dx: 190, y: FIELD.groundY - 120 }],
  // Counter + gravy + knife: the kitchen gauntlet.
  [{ kind: KIND_COUNTER, dx: 0 }, { kind: KIND_GRAVY, dx: 240 }, { kind: KIND_KNIFE, dx: 430, y: FIELD.groundY - 96 }],
];

function obstacleSize(kind) {
  switch (kind) {
    case KIND_OVEN: return { w: 96, h: 92 };
    case KIND_KNIFE: return { w: 74, h: 18 };
    case KIND_COUNTER: return { w: 110, h: 78 };
    case KIND_GRAVY: return { w: 120, h: 14 };
    default: return { w: 40, h: 40 };
  }
}
