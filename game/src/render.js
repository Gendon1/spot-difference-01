// Everything the player sees. The two picture panels are painted once per scene into
// offscreen canvases (left: picture A, right: picture B with all differences applied) and
// blitted every frame; markers, the timer, the counter and the screens are drawn on top.

import { FIELD, FONT, HINTS_PER_SCENE, MARK_COLOUR, PALETTE, PANEL, SCENE_TIME } from './config.js';
import { SCENES } from './scenes.js';
import {
  SCREEN_PLAY,
  SCREEN_SCENE_DONE,
  SCREEN_SELECT,
  SCREEN_TITLE,
  SCREEN_WIN,
  appliedDiffs,
  currentScene,
  diffsLeft,
  foundCount,
} from './state.js';

export { SCREEN_PLAY, SCREEN_SCENE_DONE, SCREEN_SELECT, SCREEN_TITLE, SCREEN_WIN };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const panelCache = { sceneIndex: -1, left: null, right: null };

  function fitCanvas() {
    const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
    canvas.width = FIELD.width;
    canvas.height = FIELD.height;
    canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
    canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
  }

  function paintPanel(scene, applied) {
    const off = document.createElement('canvas');
    off.width = PANEL.width;
    off.height = PANEL.height;
    scene.paint(off.getContext('2d'), applied);
    return off;
  }

  function panelsFor(sceneIndex) {
    if (panelCache.sceneIndex !== sceneIndex) {
      const scene = SCENES[sceneIndex];
      panelCache.left = paintPanel(scene, new Set());
      panelCache.right = paintPanel(scene, appliedDiffs(scene));
      panelCache.sceneIndex = sceneIndex;
    }
    return panelCache;
  }

  function drawMarker(x, y, r, colour, pulse) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r * (pulse ?? 1), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPanels(state, now) {
    const panels = panelsFor(state.sceneIndex);
    const scene = currentScene(state);
    ctx.drawImage(panels.left, PANEL.leftX, PANEL.y);
    ctx.drawImage(panels.right, PANEL.rightX, PANEL.y);
    // Panel frames and A/B badges.
    for (const x of [PANEL.leftX, PANEL.rightX]) {
      ctx.strokeStyle = PALETTE.panelEdge;
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 2, PANEL.y - 2, PANEL.width + 4, PANEL.height + 4);
    }
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('A', PANEL.leftX + 10, PANEL.y + 28);
    ctx.fillText('B', PANEL.rightX + 10, PANEL.y + 28);
    // Found differences are circled on both panels.
    for (const diff of scene.diffs) {
      if (!state.found.has(diff.id)) continue;
      drawMarker(PANEL.leftX + diff.x, PANEL.y + diff.y, diff.r * 0.8, MARK_COLOUR);
      drawMarker(PANEL.rightX + diff.x, PANEL.y + diff.y, diff.r * 0.8, MARK_COLOUR);
    }
    // Hinted differences pulse gently until they are found.
    const pulse = 0.9 + 0.18 * Math.sin(now / 220);
    for (const diff of scene.diffs) {
      if (!state.found.has(diff.id) && state.hinted.has(diff.id)) {
        drawMarker(PANEL.leftX + diff.x, PANEL.y + diff.y, diff.r * 0.8, PALETTE.accent2, pulse);
        drawMarker(PANEL.rightX + diff.x, PANEL.y + diff.y, diff.r * 0.8, PALETTE.accent2, pulse);
      }
    }
    // When time runs out, the missed differences are circled in red.
    if (state.screen === SCREEN_SCENE_DONE && !state.sceneCleared) {
      for (const diff of scene.diffs) {
        if (state.found.has(diff.id)) continue;
        ctx.setLineDash([8, 6]);
        drawMarker(PANEL.leftX + diff.x, PANEL.y + diff.y, diff.r * 0.8, PALETTE.bad);
        drawMarker(PANEL.rightX + diff.x, PANEL.y + diff.y, diff.r * 0.8, PALETTE.bad);
        ctx.setLineDash([]);
      }
    }
    // A wrong click flashes a red X where it landed.
    if (state.wrongFlash && now < state.wrongFlash.until) {
      const px = PANEL.leftX + state.wrongFlash.x;
      const py = PANEL.y + state.wrongFlash.y;
      ctx.strokeStyle = PALETTE.bad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px - 12, py - 12);
      ctx.lineTo(px + 12, py + 12);
      ctx.moveTo(px + 12, py - 12);
      ctx.lineTo(px - 12, py + 12);
      ctx.stroke();
    }
  }

  function drawHud(state) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, 64);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 24px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('PASAR MALAM', 24, 40);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `18px ${FONT}`;
    ctx.fillText(currentScene(state).name, 240, 40);
    // Timer bar.
    const barX = 560;
    const barW = 220;
    const fraction = Math.max(0, state.timeLeft / SCENE_TIME);
    ctx.fillStyle = '#3d2b5c';
    roundRect(ctx, barX, 22, barW, 20, 10);
    ctx.fill();
    ctx.fillStyle = state.timeLeft <= 10 ? PALETTE.timerLow : PALETTE.timerOk;
    roundRect(ctx, barX, 22, barW * fraction, 20, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 18px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(state.timeLeft)} dtk`, barX + barW / 2, 60);
    // Score and hints.
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText(`Skor ${state.score}`, 1010, 40);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `18px ${FONT}`;
    const hints = '★'.repeat(state.hintsLeft) + '☆'.repeat(HINTS_PER_SCENE - state.hintsLeft);
    ctx.fillText(`Petunjuk ${hints}`, 1240, 40);
  }

  function drawCounter(state) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 540, FIELD.width, 60);
    const scene = currentScene(state);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 26px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `Ditemukan ${foundCount(state)} dari ${scene.diffs.length}   •   Sisa ${diffsLeft(state)}`,
      FIELD.width / 2,
      578,
    );
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.fillText('Klik perbedaan di gambar A atau B  •  H = petunjuk  •  Tab = pindah panel  •  Enter = tandai  •  P = jeda', FIELD.width / 2, 636);
  }

  function drawCursor(cursor) {
    if (!cursor.visible) return;
    const baseX = cursor.panel === 'left' ? PANEL.leftX : PANEL.rightX;
    const x = baseX + cursor.x;
    const y = PANEL.y + cursor.y;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 22);
    ctx.stroke();
  }

  function dimOverlay(alpha) {
    ctx.fillStyle = `rgba(10, 6, 20, ${alpha})`;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function centredPanel(y, height) {
    ctx.fillStyle = 'rgba(34, 26, 51, 0.96)';
    roundRect(ctx, 290, y, 700, height, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 2;
    roundRect(ctx, 290, y, 700, height, 18);
    ctx.stroke();
  }

  function drawTitle(state, best) {
    drawPanels(state, performance.now());
    dimOverlay(0.55);
    centredPanel(150, 420);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 64px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('PASAR MALAM', FIELD.width / 2, 240);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `26px ${FONT}`;
    ctx.fillText('Cari Perbedaannya!', FIELD.width / 2, 282);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `19px ${FONT}`;
    ctx.fillText('Dua gambar kembar, 8 perbedaan tersembunyi di setiap adegan.', FIELD.width / 2, 322);
    ctx.fillText('Lima adegan pasar malam — dari warung sate sampai panggung dangdut.', FIELD.width / 2, 350);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText('Klik atau tekan Enter untuk mulai', FIELD.width / 2, 420);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `18px ${FONT}`;
    ctx.fillText('90 detik per adegan  •  3 petunjuk per adegan', FIELD.width / 2, 452);
    ctx.fillText('Temukan semuanya untuk bonus waktu', FIELD.width / 2, 478);
    if (best > 0) {
      ctx.fillStyle = PALETTE.accent;
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillText(`Skor terbaik: ${best}`, FIELD.width / 2, 500);
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.fillText('Suara: M untuk bisu  •  Dibuat dengan gambar dan suara asli, tanpa unduhan', FIELD.width / 2, 534);
  }

  function drawSelect(state) {
    dimOverlay(0.9);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Pilih Adegan', FIELD.width / 2, 110);
    SCENES.forEach((scene, index) => {
      const y = 150 + index * 104;
      ctx.fillStyle = index === state.sceneIndex ? '#3d2b5c' : '#2a2140';
      roundRect(ctx, 340, y, 600, 84, 12);
      ctx.fill();
      ctx.strokeStyle = index === state.sceneIndex ? PALETTE.accent : '#4a3a6a';
      ctx.lineWidth = 2;
      roundRect(ctx, 340, y, 600, 84, 12);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text;
      ctx.font = `bold 24px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${index + 1}. ${scene.name}`, 368, y + 36);
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `17px ${FONT}`;
      ctx.fillText(`${scene.diffs.length} perbedaan  •  90 detik`, 368, y + 64);
    });
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `17px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Panah atas/bawah untuk memilih, Enter untuk bermain', FIELD.width / 2, 690);
  }

  function drawSceneDone(state) {
    dimOverlay(0.6);
    centredPanel(190, 300);
    const scene = currentScene(state);
    ctx.fillStyle = state.sceneCleared ? PALETTE.good : PALETTE.bad;
    ctx.font = `bold 38px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(state.sceneCleared ? 'Adegan Selesai!' : 'Waktu Habis!', FIELD.width / 2, 260);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `22px ${FONT}`;
    ctx.fillText(
      state.sceneCleared
        ? `Semua ${scene.diffs.length} perbedaan di ${scene.name} ketemu.`
        : `Kamu menemukan ${foundCount(state)} dari ${scene.diffs.length} perbedaan.`,
      FIELD.width / 2,
      306,
    );
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText(`Skor ${state.score}`, FIELD.width / 2, 356);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `19px ${FONT}`;
    const next = state.sceneIndex + 1 < SCENES.length ? 'Enter: adegan berikutnya' : 'Enter: lihat hasil akhir';
    ctx.fillText(next, FIELD.width / 2, 410);
    ctx.fillText('Esc: kembali ke menu', FIELD.width / 2, 444);
  }

  function drawWin(state, best) {
    dimOverlay(0.85);
    centredPanel(140, 440);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 52px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('PASAR MALAM', FIELD.width / 2, 220);
    ctx.fillText('SELESAI!', FIELD.width / 2, 282);
    const stars = state.totalFound >= 40 ? '★★★' : state.totalFound >= 32 ? '★★☆' : state.totalFound >= 24 ? '★☆☆' : '☆☆☆';
    ctx.fillStyle = '#ffe14d';
    ctx.font = `44px ${FONT}`;
    ctx.fillText(stars, FIELD.width / 2, 346);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `24px ${FONT}`;
    ctx.fillText(`Kamu menemukan ${state.totalFound} dari 40 perbedaan.`, FIELD.width / 2, 396);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillText(`Skor akhir: ${state.score}`, FIELD.width / 2, 440);
    if (best > 0) {
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `19px ${FONT}`;
      ctx.fillText(`Skor terbaik: ${best}`, FIELD.width / 2, 474);
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `19px ${FONT}`;
    ctx.fillText('Enter: main lagi  •  Esc: menu utama', FIELD.width / 2, 522);
  }

  function drawPaused() {
    dimOverlay(0.6);
    centredPanel(240, 180);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Jeda', FIELD.width / 2, 320);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `19px ${FONT}`;
    ctx.fillText('P atau Esc untuk lanjut', FIELD.width / 2, 364);
  }

  return {
    fitCanvas,
    draw(state, screen, cursor, best, now) {
      ctx.fillStyle = PALETTE.backdrop;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      if (screen === SCREEN_TITLE) {
        drawTitle(state, best);
        return;
      }
      if (screen === SCREEN_SELECT) {
        drawSelect(state);
        return;
      }
      drawHud(state);
      drawPanels(state, now);
      drawCounter(state);
      drawCursor(cursor);
      if (screen === SCREEN_SCENE_DONE) drawSceneDone(state);
      else if (screen === SCREEN_WIN) drawWin(state, best);
      else if (screen === 'paused') drawPaused();
    },
  };
}
