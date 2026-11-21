# Pasar Malam — Cari Perbedaannya

[![bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Gendon1/spot-difference-01/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Gendon1/spot-difference-01/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A spot the difference game set in an Indonesian night market, for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451). Two near-identical pictures side by side, eight fair-but-hidden differences in every scene — find them all before the 90-second timer runs out.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with `node serve.ts` and open http://localhost:8080). No network, no install, no build step.

- **Click** a difference in picture A or B to mark it — found ones get a gold circle on both panels, with a chime.
- **Arrow keys** move the keyboard cursor, **Tab** switches panels, **Enter** marks a difference.
- **H** spends one of 3 hints per scene: a pulsing ring shows where to look.
- **P** pauses, **M** mutes, **S** opens the scene list from the title screen.
- Wrong clicks cost 10 points; clearing a scene earns a time bonus of 5 points per second left.

## The five scenes

1. **Warung Sate Pakde Slamet** — a satay stall at dusk, with a sleeping cat and a grill full of skewers.
2. **Bianglala Senja** — a ferris wheel against a sunset, with a ticket booth and a crescent moon to spot.
3. **Lorong Lampion** — a lantern alley with paper cranes, a banner, and a puddle full of reflections.
4. **Kios Mainan Ceria** — a toy stall with teddies, balloons, kites and a winking doll.
5. **Panggung Dangdut** — a stage with a singer, a drummer, a guitarist and a crowd with raised hands.

Every scene is drawn procedurally on canvas — no photos, no downloaded art — and every sound is synthesized with WebAudio.

## Files

- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/src/config.js` — all tuning numbers, colours and scene names.
- `game/src/scenes.js` — the five scene painters and their eight differences each.
- `game/src/state.js` — the game state: screens, scoring, timer, hints.
- `game/src/input.js` — mouse clicks and keyboard play.
- `game/src/render.js` — the panels, HUD, markers and screens.
- `game/src/audio.js` — synthesized sounds: find chime, wrong buzz, hint shimmer, fanfare.
- `game/src/shots.js` — the staged scenes behind `?shot=start|play|play2|done|end`.
- `game/src/main.js` — boot and the game loop.
- `screenshots/` — real renders of the game in a browser.
