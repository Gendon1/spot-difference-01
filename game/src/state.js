// The game's state: which screen is showing, which scene is being hunted, what has been
// found, the timer, the hints, and the score. Pure logic — it knows nothing about drawing.

import { HINTS_PER_SCENE, SCENE_TIME, SCORE } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_SELECT = 'select';
export const SCREEN_PLAY = 'play';
export const SCREEN_SCENE_DONE = 'scene-done';
export const SCREEN_WIN = 'win';

/** A fresh hunt: nothing found, full timer, full hints. */
export function createGameState() {
  return {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    hinted: new Set(),
    hintsLeft: HINTS_PER_SCENE,
    timeLeft: SCENE_TIME,
    score: 0,
    totalFound: 0,
    lastTickSecond: SCENE_TIME,
    wrongFlash: null,
    sceneCleared: false,
    scenesDone: 0,
  };
}

export function currentScene(state) {
  return SCENES[state.sceneIndex];
}

export function foundCount(state) {
  return state.found.size;
}

export function diffsLeft(state) {
  return currentScene(state).diffs.length - state.found.size;
}

/** Start hunting a scene (from the title, the select screen, or the previous scene). */
export function startScene(state, index) {
  state.sceneIndex = index;
  state.found = new Set();
  state.hinted = new Set();
  state.hintsLeft = HINTS_PER_SCENE;
  state.timeLeft = SCENE_TIME;
  state.lastTickSecond = SCENE_TIME;
  state.wrongFlash = null;
  state.sceneCleared = false;
  state.screen = SCREEN_PLAY;
}

/** The ids of a scene's differences: the right panel paints with all of them applied. */
export function appliedDiffs(scene) {
  return new Set(scene.diffs.map((diff) => diff.id));
}

/**
 * Try to mark the difference nearest to (x, y) in scene coordinates.
 * Returns the found difference, or null when nothing is close enough.
 */
export function markAt(state, x, y) {
  const scene = currentScene(state);
  let best = null;
  let bestDistance = Infinity;
  for (const diff of scene.diffs) {
    if (state.found.has(diff.id)) continue;
    const distance = Math.hypot(diff.x - x, diff.y - y);
    if (distance < diff.r && distance < bestDistance) {
      best = diff;
      bestDistance = distance;
    }
  }
  if (best === null) {
    state.score = Math.max(0, state.score + SCORE.wrong);
    state.wrongFlash = { x, y, until: performance.now() + 400 };
    return null;
  }
  state.found.add(best.id);
  state.totalFound += 1;
  state.score += SCORE.find;
  if (state.found.size === scene.diffs.length) {
    state.score += Math.round(state.timeLeft) * SCORE.timeBonusPerSecond;
    state.sceneCleared = true;
    state.scenesDone += 1;
    state.screen = SCREEN_SCENE_DONE;
  }
  return best;
}

/** Spend a hint: reveal one unfound difference with a pulsing ring. Returns it, or null. */
export function useHint(state) {
  if (state.hintsLeft <= 0) return null;
  const scene = currentScene(state);
  const remaining = scene.diffs.filter((diff) => !state.found.has(diff.id) && !state.hinted.has(diff.id));
  if (remaining.length === 0) return null;
  const picked = remaining[Math.floor(Math.random() * remaining.length)];
  state.hinted.add(picked.id);
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score + SCORE.hint);
  return picked;
}

/** Advance the timer; returns 'timeout' when the scene's time runs out. */
export function tickTimer(state, seconds) {
  if (state.screen !== SCREEN_PLAY) return null;
  state.timeLeft -= seconds;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_SCENE_DONE;
    return 'timeout';
  }
  return null;
}

/** The next scene after the current one, or null when the last scene is done. */
export function nextSceneIndex(state) {
  return state.sceneIndex + 1 < SCENES.length ? state.sceneIndex + 1 : null;
}
