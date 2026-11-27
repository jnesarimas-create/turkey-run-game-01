// Pickups: corn cobs (+50, +combo) and feathers (+25, refill a dash charge).
// Corn arcs in friendly lines; feathers sit just past hard jumps as a reward.
const KIND_CORN = 'corn';
const KIND_FEATHER = 'feather';

function cornLine(x, y, count, gap = 46) {
  const out = [];
  for (let i = 0; i < count; i += 1) out.push({ kind: KIND_CORN, x: x + i * gap, y, w: 26, h: 26, active: true, bob: i * 0.7 });
  return out;
}

function featherAt(x, y) {
  return { kind: KIND_FEATHER, x, y, w: 30, h: 30, active: true, bob: 0 };
}
