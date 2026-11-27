// Procedural Web Audio: no audio files, no network. Gobbles, whooshes, oven
// crackle, pickup chimes and a simple autumn music loop, all synthesized.
function createSound() {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.2, slide = 0) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol = 0.15, freq = 1200) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t0);
  }

  const api = {
    unlock() {
      const c = ensure();
      if (c && c.state === 'suspended') c.resume().catch(() => {});
    },
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      if (muted) api.stopMusic();
      return muted;
    },
    jump() { tone(320, 0.14, 'triangle', 0.16, 260); },
    dash() { noise(0.22, 0.2, 2400); tone(180, 0.2, 'sawtooth', 0.1, 420); },
    hit() { tone(140, 0.3, 'sawtooth', 0.25, -80); noise(0.18, 0.22, 500); },
    corn() { tone(660, 0.09, 'sine', 0.18); setTimeout(() => tone(880, 0.12, 'sine', 0.18), 70); },
    feather() { tone(520, 0.1, 'sine', 0.16, 320); },
    closeCall() { tone(980, 0.08, 'square', 0.1); tone(1240, 0.12, 'square', 0.1); },
    zone() { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.16), i * 90)); },
    gobble() {
      // Three quick low clucks, the turkey's signature.
      [0, 110, 220].forEach((delay, i) => {
        setTimeout(() => tone(i === 2 ? 180 : 240, 0.09, 'square', 0.12, -60), delay);
      });
    },
    oven() { noise(0.5, 0.08, 300); },
    startMusic(biome) {
      api.stopMusic();
      if (!ctx || muted) return;
      const scale = biome.music.mode === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
      const root = biome.music.root;
      const beat = 60 / biome.music.tempo / 2;
      musicStep = 0;
      musicTimer = window.setInterval(() => {
        if (muted || !ctx) return;
        const degree = [0, 2, 4, 2, 5, 4, 2, 0][musicStep % 8];
        const semis = scale[degree % scale.length] + 12 * Math.floor(degree / scale.length);
        tone(root * Math.pow(2, semis / 12), beat * 0.9, 'triangle', 0.07);
        if (musicStep % 4 === 0) tone(root / 2, beat * 1.8, 'sine', 0.09);
        musicStep += 1;
      }, beat * 1000);
    },
    stopMusic() {
      if (musicTimer !== null) { window.clearInterval(musicTimer); musicTimer = null; }
    },
  };
  return api;
}
