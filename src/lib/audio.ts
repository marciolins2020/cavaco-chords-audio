import { TUNING_FREQUENCIES } from '@/constants/chordDatabase';

// Audio Service otimizado para timbre de CAVAQUINHO
// Som brilhante, agudo, metálico - característico do instrumento

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bodyResonance: BiquadFilterNode | null = null;
  private brightnessBoost: BiquadFilterNode | null = null;

  constructor() {}

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.35;

        // CAVAQUINHO: Corpo pequeno = ressonância mais alta (~800-1200Hz)
        this.bodyResonance = this.ctx.createBiquadFilter();
        this.bodyResonance.type = 'peaking';
        this.bodyResonance.frequency.value = 1000; // Mais alto que violão
        this.bodyResonance.Q.value = 2;
        this.bodyResonance.gain.value = 8;

        // BRILHO: Boost nos agudos para som metálico das cordas de aço
        this.brightnessBoost = this.ctx.createBiquadFilter();
        this.brightnessBoost.type = 'highshelf';
        this.brightnessBoost.frequency.value = 3000;
        this.brightnessBoost.gain.value = 6; // Boost em vez de corte!

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
      }
    }
    
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  private getFrequency(stringIndex: number, fret: number): number {
    // Cavaquinho uma oitava acima para som mais agudo
    const openFreq = TUNING_FREQUENCIES[stringIndex];
    if (fret < 0) return 0;
    return openFreq * Math.pow(2, fret / 12);
  }

  private playTone(freq: number, startTime: number, duration: number, velocity: number) {
    if (!this.ctx || !this.bodyResonance) return;
    if (freq === 0) return;

    // === OSCILADOR PRINCIPAL (fundamental) ===
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth'; // Rico em harmônicos
    osc1.frequency.setValueAtTime(freq, startTime);
    osc1.detune.setValueAtTime((Math.random() - 0.5) * 10, startTime);

    // === OSCILADOR HARMÔNICO (oitava acima - brilho) ===
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle'; // Mais suave para harmônico
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Oitava
    osc2.detune.setValueAtTime((Math.random() - 0.5) * 8, startTime);

    // === OSCILADOR DE ATAQUE (ruído metálico inicial) ===
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(freq * 3, startTime); // 3ª harmônica
    
    // Mixer para os osciladores
    const oscMix = this.ctx.createGain();
    const osc2Gain = this.ctx.createGain();
    const osc3Gain = this.ctx.createGain();
    
    osc2Gain.gain.value = 0.3; // Harmônico mais baixo
    osc3Gain.gain.value = 0.15; // Ataque metálico sutil
    
    // Envelope do ataque metálico (decai rápido)
    osc3Gain.gain.setValueAtTime(0.2, startTime);
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    // === FILTRO DE CORDA (simula a corda de aço) ===
    const stringFilter = this.ctx.createBiquadFilter();
    stringFilter.type = 'lowpass';
    stringFilter.Q.value = 2; // Leve ressonância para "zing"
    
    // Envelope do filtro: começa MUITO brilhante, decai para médios
    const attackBrightness = 12000; // Muito brilhante no ataque
    stringFilter.frequency.setValueAtTime(attackBrightness, startTime);
    stringFilter.frequency.exponentialRampToValueAtTime(2000, startTime + 0.08); // Decay rápido
    stringFilter.frequency.exponentialRampToValueAtTime(800, startTime + duration);

    // === ENVELOPE DE AMPLITUDE ===
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0, startTime);
    amp.gain.linearRampToValueAtTime(velocity, startTime + 0.002); // Attack MUITO rápido
    amp.gain.setValueAtTime(velocity * 0.9, startTime + 0.01); // Pequeno decay inicial
    amp.gain.exponentialRampToValueAtTime(velocity * 0.4, startTime + 0.15); // Sustain curto
    amp.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release

    // === CONEXÕES ===
    osc1.connect(oscMix);
    osc2.connect(osc2Gain);
    osc2Gain.connect(oscMix);
    osc3.connect(osc3Gain);
    osc3Gain.connect(oscMix);
    
    oscMix.connect(stringFilter);
    stringFilter.connect(amp);
    amp.connect(this.bodyResonance);

    // Start/Stop
    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
    osc3.stop(startTime + 0.1); // Ataque curto

    // Cleanup
    setTimeout(() => {
      try {
        osc1.disconnect();
        osc2.disconnect();
        osc3.disconnect();
        osc2Gain.disconnect();
        osc3Gain.disconnect();
        oscMix.disconnect();
        stringFilter.disconnect();
        amp.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }, (duration + 0.5) * 1000);
  }

  public playChord(frets: number[], mode: 'strum' | 'block') {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Strum com velocidade natural - delay entre cordas
    const strumSpeed = mode === 'strum' ? 0.08 : 0.015;

    const activeNotes = frets
      .map((fret, stringIndex) => ({ fret, stringIndex }))
      .filter(n => n.fret >= 0);

    activeNotes.forEach((note) => {
      const freq = this.getFrequency(note.stringIndex, note.fret);
      
      const humanize = Math.random() * 0.008;
      const noteTime = now + (note.stringIndex * strumSpeed) + humanize;

      // Velocity com variação natural
      const velocity = 0.6 + (Math.random() * 0.15);
      
      // Sustain curto - característico do cavaquinho
      const sustain = 0.8;

      this.playTone(freq, noteTime, sustain, velocity);
    });
  }

  public playReferenceNote(frequency: number) {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    this.playTone(frequency, now, 2.0, 0.5);
  }

  public playNote(stringIndex: number, fret: number) {
    this.init();
    if (!this.ctx) return;

    const freq = this.getFrequency(stringIndex, fret);
    if (freq > 0) {
      this.playTone(freq, this.ctx.currentTime, 1.0, 0.7);
    }
  }
}

export const audioService = new AudioService();

export async function initAudio(): Promise<void> {
  // No-op, audioService inicializa automaticamente
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  audioService.playChord(frets, mode);
}
