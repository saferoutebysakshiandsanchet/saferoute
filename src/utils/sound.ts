// Tactical Audio Synthesizer via Web Audio API (No external sound files required)

class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext policy bypass
    }
  }

  public playRadarBlip() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }

  public playWaypointPing() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(1040, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.25);
      osc2.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Ignore
    }
  }

  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

  public startSiren() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx || this.sirenOsc) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      
      const now = this.ctx.currentTime;
      // Oscillate frequency between 600 and 1200 Hz
      for (let i = 0; i < 20; i++) {
        osc.frequency.setValueAtTime(650, now + i * 0.8);
        osc.frequency.linearRampToValueAtTime(1150, now + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(650, now + i * 0.8 + 0.8);
      }

      gain.gain.setValueAtTime(0.2, now);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      this.sirenOsc = osc;
      this.sirenGain = gain;
    } catch {
      // Ignore
    }
  }

  public stopSiren() {
    if (this.sirenOsc && this.ctx) {
      try {
        this.sirenGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        setTimeout(() => {
          this.sirenOsc?.stop();
          this.sirenOsc?.disconnect();
          this.sirenOsc = null;
          this.sirenGain = null;
        }, 80);
      } catch {
        this.sirenOsc = null;
        this.sirenGain = null;
      }
    }
  }
}

export const soundFx = new SoundSystem();
