// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on screen size.

export const FIELD = { width: 1280, height: 720 };

/** One picture panel: both panels share these numbers, so a difference sits at the same spot left and right. */
export const PANEL = { width: 560, height: 400, leftX: 40, rightX: 680, y: 104 };

/** Seconds of hunting per scene, and hints a player may spend in one scene. */
export const SCENE_TIME = 90;
export const HINTS_PER_SCENE = 3;

/** Points for a found difference, for a hint, for a wrong click, and for each second left when a scene is cleared. */
export const SCORE = { find: 100, hint: -50, wrong: -10, timeBonusPerSecond: 5 };

/** How close a click must land to a difference's centre to count, in scene pixels. */
export const HIT_RADIUS = 34;

/** A found difference is circled in this colour on both panels. */
export const MARK_COLOUR = '#ffe14d';

export const PALETTE = {
  backdrop: '#171226',
  panelEdge: '#3d2b5c',
  panelGap: '#241a38',
  hud: '#221a33',
  text: '#fff6e0',
  muted: '#c9b8e8',
  accent: '#ffb03a',
  accent2: '#ff5d73',
  good: '#7be495',
  bad: '#ff6b6b',
  timerLow: '#ff6b6b',
  timerOk: '#7be495',
  button: '#ffb03a',
  buttonText: '#2a1600',
};

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'pasar-malam.best';

/** The five scenes, in the order they are played. */
export const SCENE_NAMES = [
  'Warung Sate Pakde Slamet',
  'Bianglala Senja',
  'Lorong Lampion',
  'Kios Mainan Ceria',
  'Panggung Dangdut',
];
