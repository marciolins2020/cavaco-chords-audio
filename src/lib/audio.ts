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

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
) {
  await Tone.start();
  const synth = new Tone.PolySynth(Tone.Synth, {
    volume: -8,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.4 }
  }).toDestination();

  const now = Tone.now();
  const strings: (1 | 2 | 3 | 4)[] = [4, 3, 2, 1];
  const freqs = strings
    .map((s, i) => fretToFreq(s, frets[i]))
    .filter((f): f is number => f !== null);

  if (mode === "block") {
    synth.triggerAttackRelease(freqs, 0.8, now);
  } else {
    const delay = 0.04;
    freqs.forEach((f, i) => {
      synth.triggerAttackRelease(f, 0.7, now + i * delay);
    });
  }
}
