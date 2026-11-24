// Procedural Web Audio API synthesizer for gentle children's game feedback
// and a warm, relaxing procedural Lofi chillhop background music loop.

interface LofiChord {
  root: number;
  notes: number[];
  melody: number[];
}

// Classic cozy study-lofi progression: Dm9 -> G13 -> Cmaj9 -> Am9
const LOFI_PROGRESSION: LofiChord[] = [
  {
    root: 73.42, // D2
    notes: [146.83, 174.61, 220.0, 261.63, 329.63], // D3, F3, A3, C4, E4
    melody: [523.25, 587.33, 659.25, 440.0], // C5, D5, E5, A4
  },
  {
    root: 98.0, // G2
    notes: [174.61, 220.0, 246.94, 329.63], // F3, A3, B3, E4
    melody: [587.33, 493.88, 659.25, 440.0], // D5, B4, E5, A4
  },
  {
    root: 65.41, // C2
    notes: [130.81, 164.81, 196.0, 246.94, 293.66], // C3, E3, G3, B3, D4
    melody: [659.25, 587.33, 523.25, 392.0], // E5, D5, C5, G4
  },
  {
    root: 55.0, // A1
    notes: [130.81, 164.81, 196.0, 246.94, 329.63], // C3, E3, G3, B3, E4 (Am9)
    melody: [440.0, 523.25, 587.33, 659.25], // A4, C5, D5, E5
  },
];

const LOFI_BPM = 74;
const SIXTEENTH_DURATION = 60 / LOFI_BPM / 4; // ~0.2027s per 16th note
const TARGET_MUSIC_GAIN = 0.22;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicEnabled: boolean = true;

  // Lofi background engine state
  private lofiMasterGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime: number = 0;
  private currentStep: number = 0; // 0..63 (4 bars * 16 sixteenths)
  private lofiRunning: boolean = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.syncMusicPlayback();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    this.syncMusicPlayback();
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  private ensureContext(allowWhenMuted = false): AudioContext | null {
    if ((!allowWhenMuted && this.muted) || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getContext(): AudioContext | null {
    return this.ensureContext(false);
  }

  /* ==========================================================================
     LOFI CHILLHOP BACKGROUND MUSIC SYNTHESIZER
     ========================================================================== */

  public ensureMusicStarted() {
    if (this.muted || !this.musicEnabled) return;
    const ctx = this.ensureContext(false);
    if (!ctx) return;

    this.initLofiBus(ctx);

    if (this.lofiMasterGain) {
      const now = ctx.currentTime;
      this.lofiMasterGain.gain.cancelScheduledValues(now);
      this.lofiMasterGain.gain.setTargetAtTime(TARGET_MUSIC_GAIN, now, 0.35);
    }

    if (!this.lofiRunning) {
      this.lofiRunning = true;
      this.nextStepTime = ctx.currentTime + 0.08;
      this.startVinylCrackle(ctx);
      this.schedulerTimer = setInterval(() => this.scheduleLofiSteps(), 75);
    }
  }

  private syncMusicPlayback() {
    if (!this.ctx) return;

    if (this.muted || !this.musicEnabled) {
      if (this.lofiMasterGain) {
        const now = this.ctx.currentTime;
        this.lofiMasterGain.gain.cancelScheduledValues(now);
        this.lofiMasterGain.gain.setTargetAtTime(0.0001, now, 0.14);
      }
      if (this.schedulerTimer) {
        clearInterval(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      this.stopVinylCrackle();
      this.lofiRunning = false;
    } else if (this.ctx.state === 'running') {
      this.ensureMusicStarted();
    }
  }

  private initLofiBus(ctx: AudioContext) {
    if (this.lofiMasterGain && this.lofiFilter) return;

    this.lofiFilter = ctx.createBiquadFilter();
    this.lofiFilter.type = 'lowpass';
    this.lofiFilter.frequency.value = 1550;
    this.lofiFilter.Q.value = 0.65;

    this.lofiMasterGain = ctx.createGain();
    this.lofiMasterGain.gain.value = 0.0001;

    this.lofiFilter.connect(this.lofiMasterGain);
    this.lofiMasterGain.connect(ctx.destination);
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private startVinylCrackle(ctx: AudioContext) {
    if (this.vinylSource || !this.lofiMasterGain) return;
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      // Soft warm tape hiss
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.03 * white) / 1.03;
      let sample = lastOut * 0.18;
      // Sparse delicate vinyl dust pops
      if (Math.random() < 0.00045) {
        sample += (Math.random() * 2 - 1) * 0.45;
      }
      data[i] = sample;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 1800;
    hp.Q.value = 0.7;

    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.055;

    src.connect(hp);
    hp.connect(crackleGain);
    crackleGain.connect(this.lofiMasterGain);
    src.start();
    this.vinylSource = src;
  }

  private stopVinylCrackle() {
    if (this.vinylSource) {
      try {
        this.vinylSource.stop();
        this.vinylSource.disconnect();
      } catch {
        // Ignore already-stopped source
      }
      this.vinylSource = null;
    }
  }

  private scheduleLofiSteps() {
    if (!this.ctx || !this.lofiFilter || this.muted || !this.musicEnabled) return;
    if (this.ctx.state !== 'running') return;

    const lookAhead = 0.22;
    while (this.nextStepTime < this.ctx.currentTime + lookAhead) {
      this.triggerLofiStep(this.ctx, this.currentStep, this.nextStepTime);
      // Gentle lofi swing on off-beat 16ths
      const swingOffset = this.currentStep % 2 === 0 ? 1.06 : 0.94;
      this.nextStepTime += SIXTEENTH_DURATION * swingOffset;
      this.currentStep = (this.currentStep + 1) % 64;
    }
  }

  private triggerLofiStep(ctx: AudioContext, step: number, time: number) {
    const barIndex = Math.floor(step / 16);
    const stepInBar = step % 16;
    const chord = LOFI_PROGRESSION[barIndex];

    // 1. Warm Rhodes Electric Piano Chords (downbeat + soft syncopated re-voicing on step 10)
    if (stepInBar === 0) {
      this.playRhodesChord(ctx, chord.notes, time, 2.55, 0.14);
    } else if (stepInBar === 10 && barIndex % 2 === 1) {
      this.playRhodesChord(ctx, chord.notes.slice(1), time, 1.05, 0.085);
    }

    // 2. Soft Warm Sub-Bass (beat 1 & syncopated "and" of beat 3)
    if (stepInBar === 0) {
      this.playLofiBass(ctx, chord.root, time, 1.35, 0.26);
    } else if (stepInBar === 10) {
      this.playLofiBass(ctx, chord.root * 1.5, time, 0.55, 0.17);
    } else if (stepInBar === 14 && barIndex === 3) {
      this.playLofiBass(ctx, chord.root * 1.122, time, 0.35, 0.14);
    }

    // 3. Soft Lofi Kick Drum (1, syncopated 7/10 pocket)
    if (stepInBar === 0 || stepInBar === 10 || (stepInBar === 7 && barIndex % 2 === 1)) {
      this.playLofiKick(ctx, time, stepInBar === 0 ? 0.32 : 0.22);
    }

    // 4. Dusty Rimshot / Brush Snare (beats 2 and 4 with slight laid-back pocket)
    if (stepInBar === 4 || stepInBar === 12) {
      this.playLofiSnare(ctx, time + 0.012, 0.14);
    }

    // 5. Soft Swung Closed Hi-Hat
    if (stepInBar % 2 === 0) {
      const accent = stepInBar % 4 === 0 ? 0.055 : 0.032;
      this.playLofiHat(ctx, time, accent);
    }

    // 6. Delicate Pentatonic Rhodes Pluck Melody (sparse, calming, never busy)
    if (
      (stepInBar === 3 && barIndex % 2 === 0) ||
      (stepInBar === 8 && barIndex === 1) ||
      (stepInBar === 6 && barIndex === 2) ||
      (stepInBar === 13 && barIndex === 3)
    ) {
      const noteIdx = (barIndex + stepInBar) % chord.melody.length;
      this.playRhodesNote(ctx, chord.melody[noteIdx], time, 1.25, 0.09);
    }
  }

  private playRhodesChord(
    ctx: AudioContext,
    freqs: number[],
    time: number,
    duration: number,
    volume: number
  ) {
    const perNoteVol = volume / Math.max(freqs.length * 0.65, 1);
    freqs.forEach((freq, idx) => {
      // Gentle arpeggiated strum (18ms apart) for human keyboard feel
      this.playRhodesNote(ctx, freq, time + idx * 0.018, duration, perNoteVol);
    });
  }

  private playRhodesNote(
    ctx: AudioContext,
    freq: number,
    time: number,
    duration: number,
    volume: number
  ) {
    if (!this.lofiFilter) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Slight tape-warble detune for cozy analog character
    const detuneCents = (Math.random() - 0.5) * 7;
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);
    osc1.detune.setValueAtTime(detuneCents, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);
    osc2.detune.setValueAtTime(detuneCents + 3, time);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.16, time);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.035);
    gain.gain.exponentialRampToValueAtTime(volume * 0.45, time + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(gain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gain);
    gain.connect(this.lofiFilter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.04);
    osc2.stop(time + duration + 0.04);
  }

  private playLofiBass(
    ctx: AudioContext,
    freq: number,
    time: number,
    duration: number,
    volume: number
  ) {
    if (!this.lofiFilter) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.lofiFilter);

    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  private playLofiKick(ctx: AudioContext, time: number, volume: number) {
    if (!this.lofiFilter) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(118, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.11);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

    osc.connect(gain);
    gain.connect(this.lofiFilter);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  private playLofiSnare(ctx: AudioContext, time: number, volume: number) {
    if (!this.lofiFilter) return;

    // Soft filtered brush noise
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1450;
    bp.Q.value = 0.9;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, time);
    noiseGain.gain.linearRampToValueAtTime(volume, time + 0.006);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);

    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(this.lofiFilter);
    noise.start(time);
    noise.stop(time + 0.15);

    // Warm woody rimshot body
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(205, time);
    body.frequency.exponentialRampToValueAtTime(125, time + 0.06);
    bodyGain.gain.setValueAtTime(volume * 0.55, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    body.connect(bodyGain);
    bodyGain.connect(this.lofiFilter);
    body.start(time);
    body.stop(time + 0.09);
  }

  private playLofiHat(ctx: AudioContext, time: number, volume: number) {
    if (!this.lofiFilter) return;

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 4800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.032);

    noise.connect(hp);
    hp.connect(gain);
    gain.connect(this.lofiFilter);
    noise.start(time);
    noise.stop(time + 0.04);
  }

  /* ==========================================================================
     INTERACTIVE SOUND EFFECTS (SFX)
     ========================================================================== */

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.16,
    delay: number = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // Ascending C-major pentatonic xylophone notes for counting objects
  public playTapNote(countIndex: number) {
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const freq = pentatonic[countIndex % pentatonic.length];
    this.playTone(freq, 0.18, 'triangle', 0.18, 0);
  }

  public playClick() {
    this.playTone(440, 0.07, 'sine', 0.1, 0);
  }

  public playHop() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCorrect() {
    this.playTone(523.25, 0.16, 'triangle', 0.17, 0);
    this.playTone(659.25, 0.16, 'triangle', 0.17, 0.08);
    this.playTone(783.99, 0.28, 'triangle', 0.2, 0.16);
  }

  public playGentleMiss() {
    this.playTone(240, 0.15, 'sine', 0.12, 0);
    this.playTone(196, 0.22, 'sine', 0.1, 0.09);
  }

  public playStickerUnlock() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.26, 'triangle', 0.16, idx * 0.085);
    });
  }

  // Celebratory grand fanfare for completing all 5 levels in a subject
  public playMasteryFanfare() {
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1174.66, 1318.51, 1567.98];
    arpeggio.forEach((freq, idx) => {
      this.playTone(freq, 0.34, 'triangle', 0.15, idx * 0.075);
    });
    // Warm sparkling triad bloom at the peak
    const chordDelay = arpeggio.length * 0.075 + 0.04;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      this.playTone(freq, 0.72, 'sine', 0.11, chordDelay);
    });
  }

  // Short cheerful sparkle chime when the character celebrates a correct answer
  public playCheer() {
    this.playTone(587.33, 0.12, 'triangle', 0.15, 0);
    this.playTone(783.99, 0.14, 'triangle', 0.16, 0.07);
    this.playTone(1046.5, 0.22, 'sine', 0.18, 0.14);
  }

  // Soft comforting chime when the character reacts sympathetically to a wrong answer
  public playEncourage() {
    this.playTone(329.63, 0.16, 'sine', 0.1, 0);
    this.playTone(293.66, 0.2, 'sine', 0.09, 0.1);
  }
}

export const soundEngine = new SoundEngine();
