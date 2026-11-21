// The screenshot scenes behind ?shot=start|play|play2|end. Each one sets the real game
// state to a fixed moment — a title, a hunt part-way through, another scene further along,
// and the final screen — so the frame is what a real game looks like at that moment, and
// the same name always gives the same frame.

import { SCREEN_PLAY, SCREEN_SCENE_DONE, SCREEN_TITLE, SCREEN_WIN, startScene } from './state.js';

/**
 * Set `state` to the named scene and return the screen to draw.
 * Unknown names stage the title.
 */
export function stageShot(name, state) {
  if (name === 'play') {
    startScene(state, 0);
    state.found = new Set(['lampion-warna', 'sate-hilang', 'papan-terbalik']);
    state.timeLeft = 57;
    state.score = 300;
    state.hintsLeft = 3;
    return SCREEN_PLAY;
  }
  if (name === 'play2') {
    startScene(state, 2);
    state.found = new Set(['lampion-hilang', 'lampion-warna', 'bangau-tambah', 'jendela-gelap', 'spanduk-huruf']);
    state.hinted = new Set(['pot-bunga']);
    state.timeLeft = 34;
    state.score = 740;
    state.hintsLeft = 1;
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    startScene(state, 4);
    state.totalFound = 40;
    state.score = 5240;
    state.scenesDone = 5;
    state.screen = SCREEN_WIN;
    return SCREEN_WIN;
  }
  if (name === 'done') {
    startScene(state, 1);
    state.found = new Set(['kabin-hilang', 'kabin-warna', 'bintang-tambah', 'bulan-fase', 'bendera-arah', 'lampu-mati', 'papan-tiket', 'jeruji-hilang']);
    state.timeLeft = 41;
    state.score = 1180;
    state.sceneCleared = true;
    state.scenesDone = 2;
    state.screen = SCREEN_SCENE_DONE;
    return SCREEN_SCENE_DONE;
  }
  // ?shot=sceneN stages scene N (0-based) mid-hunt, for checking each scene renders.
  if (name.startsWith('scene')) {
    const index = Number.parseInt(name.slice(5), 10);
    if (Number.isInteger(index) && index >= 0 && index < 5) {
      startScene(state, index);
      state.found = new Set();
      state.timeLeft = 63;
      state.score = 250;
      state.hintsLeft = 2;
      return SCREEN_PLAY;
    }
  }
  state.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
