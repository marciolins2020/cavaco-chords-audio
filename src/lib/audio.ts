import * as Tone from "tone";

const BASE_FREQ: Record<1 | 2 | 3 | 4, number> = {
  4: 146.83, // D3
  3: 196.00, // G3
  2: 246.94, // B3
  1: 293.66  // D4
};

const fretToFreq = (stringIndex: 1 | 2 | 3 | 4, fret: number): number | null => {
  if (fret < 0) return null;
  return BASE_FREQ[stringIndex] * Math.pow(2, fret / 12);
};

let audioContext: Tone.PolySynth | null = null;
let reverb: Tone.Reverb | null = null;
let filter: Tone.Filter | null = null;

function getSynth() {
  if (!audioContext) {
    // Cria reverb para simular a caixa acústica do cavaquinho
    reverb = new Tone.Reverb({
      decay: 0.8,
      preDelay: 0.01,
      wet: 0.25
    }).toDestination();
    
    // Filtro passa-alta para dar brilho metálico característico
    filter = new Tone.Filter({
      type: "highpass",
      frequency: 400,
      rolloff: -12
    }).connect(reverb);
    
    // Synth configurado para soar como cordas de metal do cavaquinho
    audioContext = new Tone.PolySynth(Tone.Synth, {
      volume: -8,
      oscillator: { 
        type: "triangle8", // Mais harmônicos para som metálico
      },
      envelope: { 
        attack: 0.002,      // Ataque muito rápido (cordas de metal)
        decay: 0.4,         // Decay rápido
        sustain: 0.05,      // Sustain curto
        release: 0.8        // Release natural
      }
    }).connect(filter);
  }
  return audioContext;
}

export async function initAudio(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log("Áudio inicializado com sucesso");
  }
  getSynth(); // Garante que o synth existe
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  try {
    const synth = getSynth();
    const now = Tone.now();
    const strings: (1 | 2 | 3 | 4)[] = [4, 3, 2, 1];
    const freqs = strings
      .map((s, i) => fretToFreq(s, frets[i]))
      .filter((f): f is number => f !== null);

    if (freqs.length === 0) {
      throw new Error("Nenhuma nota válida para tocar");
    }

    console.log("Tocando frequências:", freqs);

    if (mode === "block") {
      // Modo simultâneo (blocos) - todas as notas juntas
      synth.triggerAttackRelease(freqs, "8n", now);
    } else {
      // Modo dedilhado (strum) - simula rasgueado rápido do cavaquinho
      const delay = 0.04; // Delay mais rápido para simular rasgueado típico
      freqs.forEach((f, i) => {
        synth.triggerAttackRelease(f, "8n", now + i * delay);
      });
    }
  } catch (error) {
    console.error("Erro ao tocar acorde:", error);
    throw error;
  }
}
