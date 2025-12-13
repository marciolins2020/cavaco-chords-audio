// Pitch detection using autocorrelation algorithm
export class PitchDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Float32Array<ArrayBuffer> | null = null;
  private isListening = false;

  async start(): Promise<boolean> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      source.connect(this.analyser);
      this.dataArray = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;
      this.isListening = true;
      
      return true;
    } catch (error) {
      console.error('Error starting pitch detection:', error);
      return false;
    }
  }

  stop(): void {
    this.isListening = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  detectPitch(): number | null {
    if (!this.analyser || !this.dataArray || !this.isListening) return null;

    this.analyser.getFloatTimeDomainData(this.dataArray);

    // Check if there's enough signal
    let rms = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      rms += this.dataArray[i] * this.dataArray[i];
    }
    rms = Math.sqrt(rms / this.dataArray.length);
    if (rms < 0.01) return null; // Too quiet

    // Autocorrelation
    const sampleRate = this.audioContext!.sampleRate;
    const correlations = new Float32Array(this.dataArray.length);
    
    for (let lag = 0; lag < this.dataArray.length; lag++) {
      let sum = 0;
      for (let i = 0; i < this.dataArray.length - lag; i++) {
        sum += this.dataArray[i] * this.dataArray[i + lag];
      }
      correlations[lag] = sum;
    }

    // Find the first peak after the initial decline
    let foundPeak = false;
    let peakLag = 0;
    let peakValue = 0;

    // Skip the first few samples (too high frequency)
    const minLag = Math.floor(sampleRate / 1000); // 1000 Hz max
    const maxLag = Math.floor(sampleRate / 100);  // 100 Hz min

    for (let lag = minLag; lag < maxLag; lag++) {
      if (correlations[lag] > peakValue) {
        peakValue = correlations[lag];
        peakLag = lag;
        foundPeak = true;
      }
    }

    if (!foundPeak || peakLag === 0) return null;

    // Parabolic interpolation for better accuracy
    const y1 = correlations[peakLag - 1] || 0;
    const y2 = correlations[peakLag];
    const y3 = correlations[peakLag + 1] || 0;
    
    const refinedLag = peakLag + (y3 - y1) / (2 * (2 * y2 - y1 - y3));
    
    return sampleRate / refinedLag;
  }

  get listening(): boolean {
    return this.isListening;
  }
}

// Cavaquinho tuning D-G-B-D
export const CAVAQUINHO_STRINGS = [
  { name: '1ª (D)', frequency: 587.33, note: 'D5' },
  { name: '2ª (B)', frequency: 493.88, note: 'B4' },
  { name: '3ª (G)', frequency: 392.00, note: 'G4' },
  { name: '4ª (D)', frequency: 293.66, note: 'D4' },
];

export function findClosestString(frequency: number): { 
  string: typeof CAVAQUINHO_STRINGS[0]; 
  cents: number;
  isInTune: boolean;
} {
  let closest = CAVAQUINHO_STRINGS[0];
  let minDiff = Infinity;

  for (const string of CAVAQUINHO_STRINGS) {
    const diff = Math.abs(frequency - string.frequency);
    if (diff < minDiff) {
      minDiff = diff;
      closest = string;
    }
  }

  // Calculate cents difference
  const cents = 1200 * Math.log2(frequency / closest.frequency);
  const isInTune = Math.abs(cents) < 5; // Within 5 cents is considered in tune

  return { string: closest, cents, isInTune };
}
