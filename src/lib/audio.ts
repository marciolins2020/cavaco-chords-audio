// Afinação padrão do Cavaquinho: D-G-B-D (da mais grave para mais aguda)
const BASE_FREQ: Record<1 | 2 | 3 | 4, number> = {
  4: 293.66, // D4 (corda mais grave)
  3: 392.00, // G4
  2: 493.88, // B4
  1: 587.33  // D5 (corda mais aguda)
};

// Calcula a frequência de uma nota em uma determinada casa
// Fórmula: f = f0 * (2 ^ (casa / 12))
const fretToFreq = (stringIndex: 1 | 2 | 3 | 4, fret: number): number | null => {
  if (fret < 0) return null; // -1 = abafado
  return BASE_FREQ[stringIndex] * Math.pow(2, fret / 12);
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
    console.log("AudioContext criado:", audioContext.sampleRate, "Hz");
  }
  return audioContext;
}

// Cria um oscilador com envelope ADSR para simular a beliscada na corda
function playNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number = 1.5
): void {
  // Oscilador com onda triangular (simula cordas de nylon)
  const oscillator = ctx.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // GainNode para controlar o envelope (ADSR)
  const gainNode = ctx.createGain();
  
  // Envelope ADSR:
  // Attack: 0.01s (sobe rápido)
  // Decay: 0.1s (cai um pouco)
  // Sustain: 0.3 (nível de sustentação)
  // Release: resto da duração (sumir suavemente)
  
  const attackTime = 0.01;
  const decayTime = 0.1;
  const sustainLevel = 0.3;
  const releaseTime = 0.4;
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, startTime + attackTime);
  gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
  gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  // Conecta oscilador -> gain -> destino
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Agenda o início e fim
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

  console.log(`Nota: ${frequency.toFixed(2)} Hz em ${startTime.toFixed(3)}s`);
}

export async function initAudio(): Promise<void> {
  const ctx = getAudioContext();
  
  // Resume o contexto se estiver suspenso (política do browser)
  if (ctx.state === 'suspended') {
    await ctx.resume();
    console.log("AudioContext retomado");
  }
  
  console.log("Áudio inicializado com sucesso");
}

export async function playChord(
  frets: [number, number, number, number],
  mode: "strum" | "block" = "strum"
): Promise<void> {
  try {
    const ctx = getAudioContext();
    
    // Resume o contexto se necessário
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    const strings: (1 | 2 | 3 | 4)[] = [4, 3, 2, 1];
    
    // Calcula as frequências de cada corda
    const frequencies = strings
      .map((stringIndex, i) => ({
        freq: fretToFreq(stringIndex, frets[i]),
        stringIndex,
        fret: frets[i]
      }))
      .filter((note) => note.freq !== null) as { freq: number; stringIndex: number; fret: number }[];

    if (frequencies.length === 0) {
      throw new Error("Nenhuma nota válida para tocar");
    }

    console.log("Tocando acorde:", frequencies.map(n => `${n.freq.toFixed(2)}Hz`).join(", "));

    if (mode === "block") {
      // Modo simultâneo: todas as notas ao mesmo tempo
      frequencies.forEach(({ freq }) => {
        playNote(ctx, freq, now, 1.5);
      });
    } else {
      // Modo dedilhado (strum): 40ms de delay entre cada corda
      const strumDelay = 0.04; // 40ms
      frequencies.forEach(({ freq }, index) => {
        playNote(ctx, freq, now + (index * strumDelay), 1.5);
      });
    }
  } catch (error) {
    console.error("Erro ao tocar acorde:", error);
    throw error;
  }
}
