import { TUNING_FREQUENCIES } from '@/constants/chordDatabase';

// Audio Service avançado baseado no RZD Music
// Usa sawtooth + filtros de corpo/ressonância para som mais realista de cavaquinho

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bodyFilter: BiquadFilterNode | null = null;

  constructor() {}

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        // Master Gain - previne clipping com polifonia
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;

        // Simulação de Ressonância do Corpo (O som da "madeira")
        // Cavaquinho é pequeno, ressonância em torno de 400-600Hz
        this.bodyFilter = this.ctx.createBiquadFilter();
        this.bodyFilter.type = 'peaking';
        this.bodyFilter.frequency.value = 550;
        this.bodyFilter.Q.value = 1.5;
        this.bodyFilter.gain.value = 6; // Boost nas frequências do corpo

        // High Shelf para domar agudos digitais
        const highShelf = this.ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 5000;
        highShelf.gain.value = -10;

        // Compressor de Dinâmica
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.1;

        // Cadeia: Sources -> BodyFilter -> HighShelf -> MasterGain -> Compressor -> Dest
        this.bodyFilter.connect(highShelf);
        highShelf.connect(this.masterGain);
        this.masterGain.connect(compressor);
        compressor.connect(this.ctx.destination);
      }
    }
    
    // CRÍTICO: Sempre tenta resumir contexto na interação do usuário
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  private getFrequency(stringIndex: number, fret: number): number {
    const openFreq = TUNING_FREQUENCIES[stringIndex];
    if (fret < 0) return 0;
    // Temperamento igual
    return openFreq * Math.pow(2, fret / 12);
  }

  private playTone(freq: number, startTime: number, duration: number, velocity: number) {
    if (!this.ctx || !this.bodyFilter) return;
    if (freq === 0) return;

    // 1. Oscilador fonte (Sawtooth para harmônicos de corda de aço)
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Detune leve para realismo (sensação orgânica)
    const randomDetune = (Math.random() - 0.5) * 15; // +/- 7 cents
    osc.detune.setValueAtTime(randomDetune, startTime);

    // 2. Filtro de Corda (Simula perda de energia dos harmônicos altos)
    const stringFilter = this.ctx.createBiquadFilter();
    stringFilter.type = 'lowpass';
    stringFilter.Q.value = 0.5; // Sem pico de ressonância, apenas amortecimento

    // Envelope do Filtro (Efeito de palhetada)
    // Começa brilhante, rapidamente fica abafado
    const brightness = 6000 * velocity;
    stringFilter.frequency.setValueAtTime(brightness, startTime);
    stringFilter.frequency.exponentialRampToValueAtTime(300, startTime + 0.15); // O "zing" dura 150ms

    // 3. Envelope de Amplitude
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0, startTime);
    amp.gain.linearRampToValueAtTime(velocity, startTime + 0.005); // Attack rápido
    amp.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay natural

    // Conexões
    osc.connect(stringFilter);
    stringFilter.connect(amp);
    amp.connect(this.bodyFilter); // Conecta à simulação do "Corpo"

    // Start/Stop
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);

    // Cleanup
    setTimeout(() => {
      try {
        osc.disconnect();
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
    
    // Parâmetros de strum
    // "strum" = ~40-60ms entre cordas (strum rápido)
    // "block" = ~5-10ms (quase simultâneo mas não robótico)
    const strumSpeed = mode === 'strum' ? 0.06 : 0.01;

    // Filtra cordas abafadas (-1)
    const activeNotes = frets
      .map((fret, stringIndex) => ({ fret, stringIndex }))
      .filter(n => n.fret >= 0);

    activeNotes.forEach((note, i) => {
      const freq = this.getFrequency(note.stringIndex, note.fret);
      
      // Timing
      // Adiciona aleatoriedade leve ao timing (+/- 5ms) para soar humano
      const humanize = Math.random() * 0.01;
      // Direção (Downstroke é padrão, cordas graves para agudas)
      const noteTime = now + (note.stringIndex * strumSpeed) + humanize;

      // Velocity (Volume)
      // Cordas agudas geralmente soam um pouco mais; acentos no beat?
      // Vamos randomizar levemente.
      const velocity = 0.5 + (Math.random() * 0.2);
      
      // Duration
      // Deixa as notas soarem. Sustain do cavaquinho é curto mas não zero.
      const sustain = 1.5;

      this.playTone(freq, noteTime, sustain, velocity);
    });
  }

  public playNote(stringIndex: number, fret: number) {
    this.init();
    if (!this.ctx) return;

    const freq = this.getFrequency(stringIndex, fret);
    if (freq > 0) {
      this.playTone(freq, this.ctx.currentTime, 1.5, 0.7);
    }
  }
}

export const audioService = new AudioService();

// Funções legado para compatibilidade
export async function initAudio(): Promise<void> {
  // No-op, audioService inicializa automaticamente
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  audioService.playChord(frets, mode);
}
