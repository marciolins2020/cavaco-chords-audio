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
      volume: -8,
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.5 }
    }).toDestination();
  }
  return audioContext;
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  try {
    // Importante: iniciar o contexto de áudio com interação do usuário
    await Tone.start();
    
    const synth = getSynth();
    const now = Tone.now();
    const strings: (1 | 2 | 3 | 4)[] = [4, 3, 2, 1];
    const freqs = strings
      .map((s, i) => fretToFreq(s, frets[i]))
      .filter((f): f is number => f !== null);

    if (freqs.length === 0) {
      throw new Error("Nenhuma nota válida para tocar");
    }

    if (mode === "block") {
      synth.triggerAttackRelease(freqs, "8n", now);
    } else {
      const delay = 0.05;
      freqs.forEach((f, i) => {
        synth.triggerAttackRelease(f, "8n", now + i * delay);
      });
    }
  } catch (error) {
    console.error("Erro ao tocar acorde:", error);
    throw error;
  }
}
