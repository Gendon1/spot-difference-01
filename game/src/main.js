// Boot and the one loop: input is read every frame, the timer advances in fixed 1/60 s
// steps, and the renderer paints what is there. The game moves between five screens:
// title, scene select, play, scene done and win, plus a pause overlay.
// ?shot=start|play|play2|done|end (with &seed=N, ignored) stages that scene instead of
// running the loop, paints it twice and sets window.__shotReady for a screenshot.

import { BEST_KEY, SCENE_TIME } from './config.js';
import { SCENES } from './scenes.js';
import { createSoundBank } from './audio.js';
import {
  SCREEN_PLAY,
  SCREEN_SCENE_DONE,
  SCREEN_SELECT,
  SCREEN_TITLE,
  SCREEN_WIN,
  createGameState,
  currentScene,
  markAt,
  nextSceneIndex,
  startScene,
  tickTimer,
  useHint,
} from './state.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_SELECT,
  clickToScene,
  createCursor,
  createInput,
  moveCursor,
} from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const sounds = createSoundBank();
const state = createGameState();
const cursor = createCursor();
let screen = SCREEN_TITLE;
let paused = false;
let best = readBest();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function beginHunt(index) {
  startScene(state, index);
  screen = SCREEN_PLAY;
  paused = false;
  announce(`Adegan ${currentScene(state).name}. Temukan 8 perbedaan dalam ${SCENE_TIME} detik.`);
}

function finishScene() {
  if (state.sceneCleared) sounds.playSceneClear();
  screen = SCREEN_SCENE_DONE;
  announce(state.sceneCleared ? 'Adegan selesai!' : 'Waktu habis!');
}

function advanceAfterScene() {
  const next = nextSceneIndex(state);
  if (next === null) {
    screen = SCREEN_WIN;
    if (state.score > best) {
      best = state.score;
      saveBest(best);
    }
    announce(`Permainan selesai. Skor ${state.score}.`);
  } else {
    beginHunt(next);
  }
}

function restartAll() {
  state.score = 0;
  state.totalFound = 0;
  state.scenesDone = 0;
  beginHunt(0);
}

function handleAction(action) {
  if (action.type === 'click') {
    sounds.playClick();
    if (screen === SCREEN_TITLE) {
      beginHunt(0);
      return;
    }
    if (screen === SCREEN_SELECT) {
      const index = Math.floor((action.y - 150) / 104);
      if (index >= 0 && index < SCENES.length) beginHunt(index);
      return;
    }
    if (screen === SCREEN_SCENE_DONE) {
      advanceAfterScene();
      return;
    }
    if (screen === SCREEN_WIN) {
      restartAll();
      return;
    }
    if (screen !== SCREEN_PLAY || paused) return;
    const hit = clickToScene(action.x, action.y);
    if (hit === null) return;
    cursor.panel = hit.panel;
    cursor.x = hit.x;
    cursor.y = hit.y;
    cursor.visible = true;
    const found = markAt(state, hit.x, hit.y);
    if (found) {
      sounds.playFound();
      announce(`Ketemu: ${found.label}. ${state.found.size} dari 8.`);
      if (state.screen === SCREEN_SCENE_DONE) finishScene();
    } else {
      sounds.playWrong();
    }
    return;
  }

  if (action.type === ACTION_MUTE) {
    const enabled = sounds.toggle();
    announce(enabled ? 'Suara hidup.' : 'Suara mati.');
    return;
  }

  if (action.type === ACTION_PAUSE) {
    if (screen === SCREEN_PLAY) {
      paused = !paused;
      announce(paused ? 'Jeda.' : 'Lanjut.');
    } else if (screen === SCREEN_SELECT || screen === SCREEN_SCENE_DONE || screen === SCREEN_WIN) {
      screen = SCREEN_TITLE;
      state.screen = SCREEN_TITLE;
    }
    return;
  }

  if (action.type === ACTION_SELECT) {
    cursor.panel = cursor.panel === 'left' ? 'right' : 'left';
    cursor.visible = true;
    return;
  }

  if (action.type === 'move') {
    if (screen === SCREEN_SELECT) {
      const direction = action.key === 'arrowup' ? -1 : action.key === 'arrowdown' ? 1 : 0;
      if (direction !== 0) {
        state.sceneIndex = (state.sceneIndex + direction + SCENES.length) % SCENES.length;
      }
      return;
    }
    if (screen === SCREEN_PLAY) moveCursor(cursor, action.key);
    return;
  }

  if (action.type === ACTION_HINT) {
    if (screen !== SCREEN_PLAY || paused) return;
    const hinted = useHint(state);
    if (hinted) {
      sounds.playHint();
      announce(`Petunjuk: cari di sekitar ${hinted.label.toLowerCase()}.`);
    }
    return;
  }

  if (action.type === ACTION_CONFIRM) {
    if (screen === SCREEN_TITLE) {
      beginHunt(0);
    } else if (screen === SCREEN_SELECT) {
      beginHunt(state.sceneIndex);
    } else if (screen === SCREEN_SCENE_DONE) {
      advanceAfterScene();
    } else if (screen === SCREEN_WIN) {
      restartAll();
    } else if (screen === SCREEN_PLAY && !paused) {
      const found = markAt(state, cursor.x, cursor.y);
      if (found) {
        sounds.playFound();
        announce(`Ketemu: ${found.label}. ${state.found.size} dari 8.`);
        if (state.screen === SCREEN_SCENE_DONE) finishScene();
      } else {
        sounds.playWrong();
      }
    }
  }
}

const input = createInput(canvas, handleAction);
void input;

function runShot(name) {
  screen = stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state, screen, cursor, best, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();

  function frame(now) {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    if (screen === SCREEN_PLAY && !paused) {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        accumulator -= STEP;
        const result = tickTimer(state, STEP);
        if (result === 'timeout') {
          finishScene();
          break;
        }
        const second = Math.ceil(state.timeLeft);
        if (second !== state.lastTickSecond) {
          state.lastTickSecond = second;
          if (second <= 10 && second > 0) sounds.playTick();
        }
      }
    }
    renderer.draw(state, paused && screen === SCREEN_PLAY ? 'paused' : screen, cursor, best, now);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

renderer.fitCanvas();
window.addEventListener('resize', () => renderer.fitCanvas());

// The title screen offers the scene list on a second key: S opens it from the title.
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 's' && screen === SCREEN_TITLE && !event.repeat) {
    screen = SCREEN_SELECT;
    state.screen = SCREEN_SELECT;
    announce('Pilih adegan.');
  }
});

if (shot) runShot(shot);
else runGame();
