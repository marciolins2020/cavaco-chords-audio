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
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    // Suporte para Safari e outros navegadores
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Cria um GainNode master para controlar o volume geral
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.4; // 40% do volume máximo
    
    console.log("AudioContext criado:", audioContext.sampleRate, "Hz");
  }
  return audioContext;
}

// Cria um oscilador com envelope ADSR aprimorado para simular a beliscada na corda
function playNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  isBlock: boolean
): void {
  if (!masterGain) return;
  
  // Oscilador com onda triangular (simula cordas de nylon)
  const oscillator = ctx.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // GainNode para controlar o envelope (ADSR)
  const gainNode = ctx.createGain();
  
  // Envelope ADSR aprimorado:
  // Attack: 0.01s (sobe rápido - ataque da beliscada)
  // Decay: variável (mais curto para modo block)
  // Sustain: variável (mais curto para modo block)
  // Release: variável (decaimento natural)
  
  const attackTime = 0.01;
  const decayTime = isBlock ? 0.1 : 0.3;
  const sustainLevel = isBlock ? 0.0 : 0.4;
  const releaseTime = isBlock ? 0.05 : 0.8;
  const peakGain = 0.5; // 50% de volume por nota
  
  // Curva de envelope mais natural usando exponentialRamp
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
  
  // Usa exponential ramp para decay e release (mais natural)
  gainNode.gain.exponentialRampToValueAtTime(
    Math.max(sustainLevel * peakGain, 0.001), 
    startTime + attackTime + decayTime
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001, 
    startTime + attackTime + decayTime + duration + releaseTime
  );

  // Conecta oscilador -> gain -> master gain -> destino
  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  // Agenda o início e fim
  oscillator.start(startTime);
  oscillator.stop(startTime + attackTime + decayTime + duration + releaseTime + 0.1);

  console.log(`Nota: ${frequency.toFixed(2)} Hz em ${startTime.toFixed(3)}s (${isBlock ? 'block' : 'strum'})`);
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
    const isBlock = mode === "block";
    
    // Velocidade do dedilhado (mais rápido no modo block)
    const strumDelay = isBlock ? 0.005 : 0.04;
    
    // Duração da nota (mais curta no modo block)
    const noteDuration = isBlock ? 0.1 : 1.0;
    
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

    console.log(`Tocando acorde (${mode}):`, frequencies.map(n => `${n.freq.toFixed(2)}Hz`).join(", "));

    // Toca cada corda com o delay apropriado
    frequencies.forEach(({ freq }, index) => {
      const delay = index * strumDelay;
      playNote(ctx, freq, now + delay, noteDuration, isBlock);
    });
  } catch (error) {
    console.error("Erro ao tocar acorde:", error);
    throw error;
  }
}
