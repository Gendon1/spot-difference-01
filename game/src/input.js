// Mouse and keyboard input. The canvas reports clicks in logical field coordinates; this
// module translates them into scene coordinates on one of the two panels, and moves a
// keyboard cursor for players who hunt without a mouse.

import { FIELD, PANEL } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_HINT = 'hint';
export const ACTION_PAUSE = 'pause';
export const ACTION_MUTE = 'mute';
export const ACTION_NEXT = 'next';
export const ACTION_SELECT = 'select';

/** The keyboard cursor: which panel it sits on, and where in scene coordinates. */
export function createCursor() {
  return { panel: 'left', x: PANEL.width / 2, y: PANEL.height / 2, visible: false };
}

/**
 * Translate a click in field coordinates into { panel, x, y } in scene coordinates,
 * or null when the click landed outside both picture panels.
 */
export function clickToScene(fieldX, fieldY) {
  if (fieldY < PANEL.y || fieldY > PANEL.y + PANEL.height) return null;
  if (fieldX >= PANEL.leftX && fieldX < PANEL.leftX + PANEL.width) {
    return { panel: 'left', x: fieldX - PANEL.leftX, y: fieldY - PANEL.y };
  }
  if (fieldX >= PANEL.rightX && fieldX < PANEL.rightX + PANEL.width) {
    return { panel: 'right', x: fieldX - PANEL.rightX, y: fieldY - PANEL.y };
  }
  return null;
}

export function createInput(canvas, onAction) {
  const keys = new Set();
  let mouse = { x: 0, y: 0 };

  function fieldPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  }

  canvas.addEventListener('mousemove', (event) => {
    mouse = fieldPosition(event);
  });

  canvas.addEventListener('click', (event) => {
    const position = fieldPosition(event);
    mouse = position;
    onAction({ type: 'click', x: position.x, y: position.y });
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.key);
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      event.preventDefault();
      onAction({ type: ACTION_CONFIRM });
    } else if (key === 'h') {
      onAction({ type: ACTION_HINT });
    } else if (key === 'p' || key === 'escape') {
      onAction({ type: ACTION_PAUSE });
    } else if (key === 'm') {
      onAction({ type: ACTION_MUTE });
    } else if (key === 'tab') {
      event.preventDefault();
      onAction({ type: ACTION_SELECT });
    } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      onAction({ type: 'move', key });
    }
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.key);
  });

  return {
    get mouse() {
      return mouse;
    },
    get keys() {
      return keys;
    },
  };
}

/** Move the keyboard cursor one step; Tab switches it to the other panel. */
export function moveCursor(cursor, key) {
  const step = key === 'arrowup' || key === 'arrowdown' ? 22 : 26;
  if (key === 'arrowup') cursor.y = Math.max(0, cursor.y - step);
  if (key === 'arrowdown') cursor.y = Math.min(PANEL.height, cursor.y + step);
  if (key === 'arrowleft') cursor.x = Math.max(0, cursor.x - step);
  if (key === 'arrowright') cursor.x = Math.min(PANEL.width, cursor.x + step);
  cursor.visible = true;
}
