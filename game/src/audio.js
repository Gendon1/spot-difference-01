// All sounds are synthesized with WebAudio: no audio files, no network. A tiny helper
// plays a short tone with an envelope, and each game event composes a few of them.

export function createSoundBank() {
  let context = null;
  let enabled = true;

  function ensureContext() {
    if (context === null) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(frequency, startAt, duration, type, volume) {
    const audio = ensureContext();
    if (audio === null || !enabled) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, audio.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(volume, audio.currentTime + startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + startAt + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(audio.currentTime + startAt);
    oscillator.stop(audio.currentTime + startAt + duration + 0.05);
  }

  /** A bright two-note chime when a difference is found. */
  function playFound() {
    tone(880, 0, 0.18, 'sine', 0.25);
    tone(1318, 0.09, 0.28, 'sine', 0.22);
  }

  /** A low buzz when the player clicks empty space. */
  function playWrong() {
    tone(160, 0, 0.16, 'square', 0.08);
    tone(120, 0.08, 0.2, 'square', 0.08);
  }

  /** A soft rising shimmer when a hint reveals a spot. */
  function playHint() {
    tone(523, 0, 0.12, 'triangle', 0.15);
    tone(784, 0.08, 0.16, 'triangle', 0.15);
    tone(1046, 0.16, 0.22, 'triangle', 0.12);
  }

  /** A short click for buttons and the scene select. */
  function playClick() {
    tone(660, 0, 0.06, 'triangle', 0.12);
  }

  /** A little fanfare when a scene is cleared. */
  function playSceneClear() {
    tone(523, 0, 0.14, 'triangle', 0.18);
    tone(659, 0.12, 0.14, 'triangle', 0.18);
    tone(784, 0.24, 0.2, 'triangle', 0.18);
    tone(1046, 0.36, 0.34, 'triangle', 0.2);
  }

  /** A ticking warning when the timer drops under ten seconds. */
  function playTick() {
    tone(1200, 0, 0.05, 'square', 0.05);
  }

  return {
    playFound,
    playWrong,
    playHint,
    playClick,
    playSceneClear,
    playTick,
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    get enabled() {
      return enabled;
    },
  };
}
