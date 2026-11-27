# Gobble Break — The Great Thanksgiving Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/jnesarimas-create/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/jnesarimas-create/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A make.fun `turkey-run-game-01` entry: a complete HTML5 Canvas 2D
side-scrolling runner. Barnaby the turkey escapes Farmer Jed, the roasting
oven and the carving knife, running 1000 m from the Golden Barnyard through
the Farmhouse Kitchen to the Grand Banquet's Freedom Fence.

## Play

Open `game/index.html` in a desktop browser (or `node serve.ts`, then
http://localhost:8080). No network requests, no external fonts or libraries —
vanilla HTML/CSS/classic scripts (no modules, so it runs from file:// too), Canvas 2D, procedural Web Audio.

- **W / ↑ / Space** (or left mouse hold) — jump; hold to flutter-glide- **S / ↓** — duck / fast-fall
- **A / D** — run left / right
- **Shift / E** (or right mouse click) — feather dash
- **P / Esc** — pause, **M** — mute, **R / Enter** — restart (from pause or end screen)

HUD: score, distance (m), 3 lives, dash gauge, combo (x1–x5), zone label.
Close calls (a knife within 28 px) pay +150. Hit-stop, screen shake, 1.2 s
invulnerability blink, 110 ms coyote time, 120 ms jump buffer.

## Structure

- `main.ts` — entry program: copies `game/` + `screenshots/` to `/output`,
  writes `dossier.json` via the vendored make.fun library.
- `serve.ts` — local static server for the game (`node serve.ts`,
  then http://localhost:8080).
- `game/main.js` — boot + fixed-timestep loop (1/60 s, dt clamped).
- `game/data/` — tuning (`config.js`) and biomes (`biomes.js`).
- `game/engine/` — deterministic RNG, best-score storage, keyboard+mouse
  input, the world rules (`world.js`).
- `game/entities/` — turkey physics, farmer pursuit, obstacle waves,
  pickups.
- `game/render/` — parallax storybook backgrounds, Canvas-drawn sprites,
  HUD and screens.
- `game/audio/sound.js` — procedural Web Audio (gobbles, whooshes, oven
  crackle, pickup chimes, zone music).
- `game/shots.js` — deterministic screenshot scenes (`?shot=cover|title|
  kitchen|end&seed=1`), played forward by an autopilot from a fresh world.

## Screenshots

1. `01-gameplay-cover.png` — live run: turkey, Farmer Jed, oven, knife
2. `02-title-screen.png` — title screen over the animated barnyard
3. `03-kitchen-gauntlet.png` — Farmhouse Kitchen, counter + gravy + knife
4. `04-end-screen.png` — end screen after a run

## Verify

```sh
MAKEFUN_OUTPUT_DIR=out1 node main.ts
MAKEFUN_OUTPUT_DIR=out2 node main.ts
diff -rq out1 out2   # must be empty (deterministic)
```
