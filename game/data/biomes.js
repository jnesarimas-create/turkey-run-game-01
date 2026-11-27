// The three biomes Barnaby runs through. Each zone changes the scenery, the
// obstacle mix and the mood of the music (see audio/sound.js).
const BIOMES = {
  barnyard: {
    id: 'barnyard',
    label: 'Golden Barnyard',
    sky: ['#2D1B3D', '#7A3B4D', '#F2994A'],
    hills: ['#6B3A5E', '#4A2A44'],
    props: ['fence', 'barn', 'hay', 'pumpkin'],
    obstacles: ['oven', 'knife', 'counter'],
    music: { root: 220, mode: 'major', tempo: 112 },
    blurb: 'Dusk over the farm. The oven is lit and Farmer Jed is already running.',
  },
  kitchen: {
    id: 'kitchen',
    label: 'Farmhouse Kitchen',
    sky: ['#241533', '#8E3B2F', '#E07840'],
    hills: ['#5E2A3A', '#3E1E2E'],
    props: ['counter', 'pot', 'window', 'pan'],
    obstacles: ['oven', 'knife', 'counter', 'gravy'],
    music: { root: 196, mode: 'minor', tempo: 128 },
    blurb: 'Hot tiles, hotter ovens. Gravy puddles slick the floor — jump them.',
  },
  banquet: {
    id: 'banquet',
    label: 'Grand Banquet — Freedom Fence',
    sky: ['#1B1030', '#6B2B4D', '#F2C94C'],
    hills: ['#4A2547', '#2E1838'],
    props: ['table', 'candle', 'fence', 'gate'],
    obstacles: ['oven', 'knife', 'counter', 'gravy'],
    music: { root: 246.9, mode: 'major', tempo: 140 },
    blurb: 'The long table is set. One last fence and Barnaby is free.',
  },
};

function biomeAt(distance) {
  if (distance < 350) return BIOMES.barnyard;
  if (distance < 700) return BIOMES.kitchen;
  return BIOMES.banquet;
}
