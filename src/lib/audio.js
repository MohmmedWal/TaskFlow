/**
 * Lightweight native Web Audio API sound effects synthesizer.
 * Operates purely client-side with zero external assets or MP3 network requests.
 */
export function playAppSound(type = 'success') {
  try {
    const prefs = JSON.parse(localStorage.getItem('taskflow_user_prefs') || '{}');
    if (prefs.soundEffects === false) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Pleasant upward chord chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'action') {
      // Soft gentle tap
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }
  } catch {
    // Non-blocking in case user browser blocks AudioContext autoplay
  }
}

