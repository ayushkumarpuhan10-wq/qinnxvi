let audioCtx: AudioContext | null = null;

// Global synced feedback preferences so every LiquidGlass control respects Settings
let globalHapticsEnabled = true;
let globalSoundEnabled = true;

export function setFeedbackPreferences(opts: { hapticsEnabled?: boolean; soundEnabled?: boolean }) {
  if (opts.hapticsEnabled !== undefined) globalHapticsEnabled = opts.hapticsEnabled;
  if (opts.soundEnabled !== undefined) globalSoundEnabled = opts.soundEnabled;
}

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type HapticKind =
  | 'tap'
  | 'selection'
  | 'tabSnap'
  | 'tick'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'double'
  | 'pulse'
  | 'toggleOn'
  | 'toggleOff'
  | 'success'
  | 'celebrate'
  | 'rankReveal'
  | 'error';

/**
 * Fires an ultra-short low-frequency tactile micro-thud (<18ms) when sound is enabled
 * so desktop & iOS browsers without navigator.vibrate still feel physical glass detents.
 */
function playTactileDetent(kind: HapticKind) {
  if (!globalSoundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const thump = (freq: number, startOffset: number, dur: number, vol: number, endFreq?: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + startOffset;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq ?? Math.max(42, freq * 0.55), t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.01);
    };

    switch (kind) {
      case 'tap':
      case 'selection':
      case 'tabSnap':
        thump(170, 0, 0.014, 0.032, 90);
        break;
      case 'tick':
        thump(240, 0, 0.01, 0.025, 140);
        break;
      case 'light':
      case 'toggleOff':
        thump(145, 0, 0.018, 0.04, 72);
        break;
      case 'medium':
        thump(125, 0, 0.024, 0.055, 60);
        break;
      case 'heavy':
        thump(95, 0, 0.032, 0.075, 44);
        break;
      case 'toggleOn':
        thump(130, 0, 0.016, 0.04, 80);
        thump(195, 0.038, 0.018, 0.05, 120);
        break;
      case 'double':
        thump(140, 0, 0.018, 0.048, 70);
        thump(165, 0.055, 0.02, 0.055, 85);
        break;
      case 'pulse':
        thump(110, 0, 0.024, 0.055, 55);
        thump(115, 0.075, 0.026, 0.06, 55);
        break;
      case 'success':
        thump(150, 0, 0.02, 0.05, 85);
        thump(240, 0.055, 0.026, 0.06, 150);
        break;
      case 'celebrate':
        thump(150, 0, 0.02, 0.05, 90);
        thump(210, 0.055, 0.022, 0.055, 130);
        thump(290, 0.115, 0.03, 0.07, 190);
        break;
      case 'rankReveal':
        thump(95, 0, 0.028, 0.06, 52);
        thump(135, 0.075, 0.028, 0.065, 78);
        thump(190, 0.15, 0.032, 0.075, 110);
        thump(275, 0.23, 0.042, 0.085, 165);
        break;
      case 'error':
        thump(88, 0, 0.03, 0.065, 48);
        thump(76, 0.065, 0.035, 0.07, 42);
        break;
    }
  } catch {
    // Ignore blocked audio context before user gesture
  }
}

export function triggerHaptic(pattern: HapticKind = 'light', enabled?: boolean) {
  const isEnabled = enabled ?? globalHapticsEnabled;
  if (!isEnabled) return;

  playTactileDetent(pattern);

  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    switch (pattern) {
      case 'tick':
        navigator.vibrate(5);
        break;
      case 'tap':
      case 'selection':
      case 'tabSnap':
        navigator.vibrate(9);
        break;
      case 'light':
      case 'toggleOff':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(28);
        break;
      case 'heavy':
        navigator.vibrate(46);
        break;
      case 'toggleOn':
        navigator.vibrate([12, 24, 24]);
        break;
      case 'double':
        navigator.vibrate([16, 36, 22]);
        break;
      case 'pulse':
        navigator.vibrate([20, 48, 22]);
        break;
      case 'success':
        navigator.vibrate([18, 38, 34]);
        break;
      case 'celebrate':
        navigator.vibrate([20, 32, 28, 32, 56]);
        break;
      case 'rankReveal':
        navigator.vibrate([18, 42, 26, 42, 40, 48, 72]);
        break;
      case 'error':
        navigator.vibrate([48, 34, 48, 34, 64]);
        break;
    }
  } catch {
    // Ignore on unsupported browsers
  }
}

export function playTimerChime(
  kind: 'done' | 'work' | 'rest' | 'tick' | 'bubble' = 'done',
  enabled?: boolean
) {
  const isEnabled = enabled ?? globalSoundEnabled;
  if (!isEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const playTone = (freq: number, start: number, dur: number, vol = 0.14, endFreq?: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
      }
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    if (kind === 'done') {
      playTone(587.33, now, 0.18);
      playTone(880, now + 0.14, 0.28);
    } else if (kind === 'work') {
      playTone(740, now, 0.14);
      playTone(987.77, now + 0.12, 0.22);
    } else if (kind === 'rest') {
      playTone(523.25, now, 0.18);
      playTone(392, now + 0.15, 0.24);
    } else if (kind === 'bubble') {
      playTone(480, now, 0.09, 0.1, 860);
      playTone(760, now + 0.07, 0.11, 0.09, 1120);
    } else {
      playTone(660, now, 0.06, 0.07);
    }
  } catch {
    // Ignore audio context blocks
  }
}

export function sendLocalNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch {
      // Ignore notification failure inside iframe
    }
  }
}
