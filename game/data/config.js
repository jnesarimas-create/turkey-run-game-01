// GOBBLE BREAK — every tuning number, colour and rule in one place.
// Logical playfield is a fixed 1280x720; the renderer scales it to the window.
const FIELD = { width: 1280, height: 720, groundY: 600 };

/** Fixed simulation step: 60 updates a second whatever the display rate. */
const STEP = 1 / 60;

const TURKEY = {
  x: 220,
  w: 64,
  h: 58,
  duckH: 38,
  jumpVel: -880,
  gravity: 2600,
  glideGravity: 900,
  fastFall: 2200,
  coyote: 0.11,
  jumpBuffer: 0.12,
  invulnerable: 1.2,
  dashTime: 0.35,
  dashSpeed: 520,
  dashCooldown: 1.6,
};

const RUN = {
  baseSpeed: 320,
  speedPerMetre: 0.12,
  maxSpeed: 560,
  farmerStartGap: 170,
  farmerCatchGap: 46,
  farmerFallBack: 90,
};

const LIVES = 3;

const SCORE = {
  perMetre: 1,
  corn: 50,
  feather: 25,
  closeCall: 150,
  closeCallPx: 28,
};

const COMBO = { max: 5, window: 4 };

const PALETTE = {
  skyTop: '#2D1B3D',
  skyMid: '#9E3B33',
  skyLow: '#F2994A',
  ground: '#5B3A29',
  groundTop: '#8A5A33',
  fence: '#7A4A2B',
  barn: '#8E3B2F',
  text: '#FFF3D6',
  muted: '#E8C9A0',
  panel: 'rgba(45,27,61,0.82)',
  gold: '#F2C94C',
  red: '#E5534B',
  green: '#7FB069',
};

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
const BEST_KEY = 'gobble-break.best';

const ZONES = [
  { id: 'barnyard', label: 'Golden Barnyard', from: 0, to: 350 },
  { id: 'kitchen', label: 'Farmhouse Kitchen', from: 350, to: 700 },
  { id: 'banquet', label: 'Grand Banquet — Freedom Fence', from: 700, to: Infinity },
];

function zoneAt(distance) {
  for (const z of ZONES) if (distance >= z.from && distance < z.to) return z;
  return ZONES[ZONES.length - 1];
}
