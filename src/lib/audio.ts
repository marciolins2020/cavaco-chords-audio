import { TUNING_FREQUENCIES } from '@/constants/chordDatabase';

// Audio Service otimizado para timbre de CAVAQUINHO
// Som brilhante, agudo, metálico - característico do instrumento

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bodyResonance: BiquadFilterNode | null = null;
  private brightnessBoost: BiquadFilterNode | null = null;
  private isInitialized = false;

  constructor() {}

  private async init(): Promise<boolean> {
    // Sempre tentar resumir se estiver suspenso
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        console.log('AudioContext resumed successfully');
      } catch (e) {
        console.error("Audio resume failed", e);
        return false;
      }
    }

    if (this.isInitialized && this.ctx) {
      return true;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('AudioContext not supported');
        return false;
      }

      this.ctx = new AudioContextClass();
      
      // Tentar resumir imediatamente
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      
      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;

      // CAVAQUINHO: Corpo pequeno = ressonância mais alta (~800-1200Hz)
      // Reduzido para não mascarar diferenças entre cordas
      this.bodyResonance = this.ctx.createBiquadFilter();
      this.bodyResonance.type = 'peaking';
      this.bodyResonance.frequency.value = 1000;
      this.bodyResonance.Q.value = 1.2;
      this.bodyResonance.gain.value = 4;

      // BRILHO: Boost nos agudos para som metálico das cordas de aço
      this.brightnessBoost = this.ctx.createBiquadFilter();
      this.brightnessBoost.type = 'highshelf';
      this.brightnessBoost.frequency.value = 3000;
      this.brightnessBoost.gain.value = 6;

      // Presença: realça a "mordida" do ataque
      const presence = this.ctx.createBiquadFilter();
      presence.type = 'peaking';
      presence.frequency.value = 2500;
      presence.Q.value = 1.5;
      presence.gain.value = 4;

      // Compressor suave
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -15;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;

      // Cadeia: Sources -> BodyResonance -> Brightness -> Presence -> Master -> Compressor -> Dest
      this.bodyResonance.connect(this.brightnessBoost);
      this.brightnessBoost.connect(presence);
      presence.connect(this.masterGain);
      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);

      this.isInitialized = true;
      console.log('AudioService initialized, state:', this.ctx.state);
      return true;
    } catch (e) {
      console.error('Failed to initialize AudioService:', e);
      return false;
    }
  }

  private getFrequency(stringIndex: number, fret: number): number {
    // Cavaquinho uma oitava acima para som mais agudo
    const openFreq = TUNING_FREQUENCIES[stringIndex];
    if (fret < 0) return 0;
    return openFreq * Math.pow(2, fret / 12);
  }

  private playTone(freq: number, startTime: number, duration: number, velocity: number, stringIndex?: number) {
    if (!this.ctx || !this.bodyResonance) return;
    if (freq === 0) return;

    // Normalizar posição da corda (0=grave, 1=agudo) para variar timbre
    const stringPos = stringIndex !== undefined ? stringIndex / 3 : 0.5;

    // === OSCILADOR PRINCIPAL (fundamental) ===
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    // Mais detune nas graves para "grossura", menos nas agudas para clareza
    osc1.detune.setValueAtTime((Math.random() - 0.5) * (14 - stringPos * 8), startTime);

    // === OSCILADOR HARMÔNICO (oitava acima) ===
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    osc2.detune.setValueAtTime((Math.random() - 0.5) * 6, startTime);

    // === OSCILADOR DE ATAQUE (ruído metálico inicial) ===
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(freq * 3, startTime);
    
    // Mixer
    const oscMix = this.ctx.createGain();
    const osc2Gain = this.ctx.createGain();
    const osc3Gain = this.ctx.createGain();
    
    // Cordas agudas = mais harmônicos (brilho), graves = mais fundamental
    osc2Gain.gain.value = 0.15 + stringPos * 0.3;
    osc3Gain.gain.value = 0.08 + stringPos * 0.15;
    
    // Ataque metálico
    osc3Gain.gain.setValueAtTime(0.12 + stringPos * 0.15, startTime);
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

    // === FILTRO POR CORDA (diferenciação principal) ===
    const stringFilter = this.ctx.createBiquadFilter();
    stringFilter.type = 'lowpass';
    // Cordas graves: cutoff mais baixo = som mais escuro
    // Cordas agudas: cutoff mais alto = som mais brilhante e metálico
    const baseCutoff = 4000 + stringPos * 10000;
    stringFilter.Q.value = 1.5 + stringPos * 2;
    
    stringFilter.frequency.setValueAtTime(baseCutoff, startTime);
    stringFilter.frequency.exponentialRampToValueAtTime(baseCutoff * 0.3, startTime + 0.1);
    stringFilter.frequency.exponentialRampToValueAtTime(baseCutoff * 0.08, startTime + duration);

    // === RESSONÂNCIA POR CORDA (simula espessura diferente) ===
    const stringResonance = this.ctx.createBiquadFilter();
    stringResonance.type = 'peaking';
    // Cada corda ressoa em frequência diferente
    stringResonance.frequency.setValueAtTime(freq * 1.5, startTime);
    stringResonance.Q.value = 3;
    stringResonance.gain.value = 3 + stringPos * 2;

    // === ENVELOPE ===
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0, startTime);
    amp.gain.linearRampToValueAtTime(velocity, startTime + 0.002);
    amp.gain.setValueAtTime(velocity * 0.9, startTime + 0.01);
    // Cordas agudas decaem mais rápido (corda mais fina = menos sustain)
    const decayTime = 0.15 + (1 - stringPos) * 0.1;
    amp.gain.exponentialRampToValueAtTime(velocity * 0.4, startTime + decayTime);
    amp.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // === CONEXÕES ===
    osc1.connect(oscMix);
    osc2.connect(osc2Gain);
    osc2Gain.connect(oscMix);
    osc3.connect(osc3Gain);
    osc3Gain.connect(oscMix);
    
    oscMix.connect(stringFilter);
    stringFilter.connect(stringResonance);
    stringResonance.connect(amp);
    amp.connect(this.bodyResonance);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
    osc3.stop(startTime + 0.1);

    setTimeout(() => {
      try {
        osc1.disconnect(); osc2.disconnect(); osc3.disconnect();
        osc2Gain.disconnect(); osc3Gain.disconnect();
        oscMix.disconnect(); stringFilter.disconnect();
        stringResonance.disconnect(); amp.disconnect();
      } catch (e) {}
    }, (duration + 0.5) * 1000);
  }

  public async playChord(frets: number[], mode: 'strum' | 'block') {
    const ready = await this.init();
    if (!ready || !this.ctx) {
      console.error('AudioService not ready');
      return;
    }

    const now = this.ctx.currentTime;
    
    // Strum com velocidade natural - delay entre cordas
    const strumSpeed = mode === 'strum' ? 0.12 : 0.03;

    const activeNotes = frets
      .map((fret, stringIndex) => ({ fret, stringIndex }))
      .filter(n => n.fret >= 0);

    console.log('Playing chord:', frets, 'active notes:', activeNotes.length);

    activeNotes.forEach((note) => {
      const freq = this.getFrequency(note.stringIndex, note.fret);
      
      const humanize = Math.random() * 0.008;
      const noteTime = now + (note.stringIndex * strumSpeed) + humanize;

      const velocity = 0.6 + (Math.random() * 0.15);
      const sustain = 0.8;

      this.playTone(freq, noteTime, sustain, velocity, note.stringIndex);
    });
  }

  public async playReferenceNote(frequency: number) {
    const ready = await this.init();
    if (!ready || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    this.playTone(frequency, now, 2.0, 0.5);
  }

  public async playNote(stringIndex: number, fret: number) {
    const ready = await this.init();
    if (!ready || !this.ctx) return;

    const freq = this.getFrequency(stringIndex, fret);
    if (freq > 0) {
      this.playTone(freq, this.ctx.currentTime, 1.0, 0.7, stringIndex);
    }
  }

  // === Feedback Sounds ===

  async playSuccess(): Promise<void> {
    const ok = await this.init();
    if (!ok || !this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.18, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
      osc.connect(g).connect(this.ctx!.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.3);
    });
  }

  async playFavorite(): Promise<void> {
    const ok = await this.init();
    if (!ok || !this.ctx) return;
    const t = this.ctx.currentTime;
    [880, 1318.5].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.15, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
      osc.connect(g).connect(this.ctx!.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.2);
    });
  }

  async playXP(): Promise<void> {
    const ok = await this.init();
    if (!ok || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.exponentialRampToValueAtTime(1318.5, t + 0.06);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  async playError(): Promise<void> {
    const ok = await this.init();
    if (!ok || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 150;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

export const audioService = new AudioService();

export async function initAudio(): Promise<void> {}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  audioService.playChord(frets, mode);
}
