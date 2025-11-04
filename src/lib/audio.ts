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

function getSynth() {
  if (!audioContext) {
    audioContext = new Tone.PolySynth(Tone.Synth, {
      volume: -6,
      oscillator: { 
        type: "triangle",
      },
      envelope: { 
        attack: 0.005, 
        decay: 0.3, 
        sustain: 0.1, 
        release: 1.2 
      }
    }).toDestination();
  }
  return audioContext;
}

let isAudioInitialized = false;

export async function initAudio(): Promise<void> {
  if (!isAudioInitialized) {
    await Tone.start();
    getSynth(); // Inicializa o synth
    isAudioInitialized = true;
    console.log("Áudio inicializado com sucesso");
  }
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  try {
    // Garantir que o Tone está iniciado
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log("Tone.js iniciado");
    }
    
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
      synth.triggerAttackRelease(freqs, "4n", now);
    } else {
      const delay = 0.06;
      freqs.forEach((f, i) => {
        synth.triggerAttackRelease(f, "4n", now + i * delay);
      });
    }
  } catch (error) {
    console.error("Erro ao tocar acorde:", error);
    throw error;
  }
}
