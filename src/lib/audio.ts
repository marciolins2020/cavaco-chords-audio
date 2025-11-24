import { TUNING_FREQUENCIES } from '@/constants/chordDatabase';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {}

  private init() {
    if (!this.ctx) {
      // Robust initialization for all browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.4;
      }
    }
    // CRITICAL FIX: Always try to resume context on user interaction
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  private getFrequency(stringIndex: number, fret: number): number {
    const openFreq = TUNING_FREQUENCIES[stringIndex];
    if (fret < 0) return 0;
    return openFreq * Math.pow(2, fret / 12);
  }

  private playTone(freq: number, startTime: number, duration: number, isBlock: boolean) {
    if (!this.ctx || !this.masterGain) return;
    if (freq === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.connect(this.masterGain);
    osc.connect(gain);

    const attack = 0.01;
    const decay = isBlock ? 0.1 : 0.3;
    const sustain = isBlock ? 0.0 : 0.4;
    const release = isBlock ? 0.05 : 0.8;
    const peakGain = 0.5;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(sustain * peakGain, startTime + attack + decay);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + attack + decay + duration + release);

    osc.start(startTime);
    osc.stop(startTime + attack + decay + duration + release + 0.1);
  }

  public playChord(frets: number[], mode: 'strum' | 'block') {
    this.init(); // Initialize checks state inside
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const isBlock = mode === 'block';
    const strumSpeed = isBlock ? 0 : 0.08;

    frets.forEach((fret, stringIndex) => {
      const freq = this.getFrequency(stringIndex, fret);
      if (fret >= 0) {
          const delay = stringIndex * strumSpeed;
          this.playTone(freq, now + delay, isBlock ? 0.1 : 1.0, isBlock);
      }
    });
  }
}

export const audioService = new AudioService();

// Legacy functions for compatibility
export async function initAudio(): Promise<void> {
  // No-op, audioService handles initialization automatically
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  audioService.playChord(frets, mode);
}
