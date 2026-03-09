import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { playChord, initAudio } from "@/lib/audio";
import { Play, Pause, Square, Repeat, SkipForward } from "lucide-react";

interface ChordItem {
  name: string;
  frets: number[];
}

interface AutoPlayControlsProps {
  chords: ChordItem[];
  label?: string;
  onChordHighlight?: (index: number | null) => void;
}

export function AutoPlayControls({ chords, label, onChordHighlight }: AutoPlayControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [speed, setSpeed] = useState(800);
  const [loop, setLoop] = useState(false);
  const [mode, setMode] = useState<"strum" | "block">("strum");
  const abortRef = useRef(false);
  const pauseRef = useRef(false);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    return () => { abortRef.current = true; };
  }, []);

  const stop = useCallback(() => {
    abortRef.current = true;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(null);
    onChordHighlight?.(null);
  }, [onChordHighlight]);

  const play = useCallback(async () => {
    if (chords.length === 0) return;
    await initAudio();
    abortRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);

    const doPlay = async () => {
      do {
        for (let i = 0; i < chords.length; i++) {
          if (abortRef.current) return;
          // Wait while paused
          while (pauseRef.current && !abortRef.current) {
            await new Promise(r => setTimeout(r, 100));
          }
          if (abortRef.current) return;

          setCurrentIndex(i);
          onChordHighlight?.(i);
          await playChord(chords[i].frets, mode);
          await new Promise(r => setTimeout(r, speed));
        }
      } while (loop && !abortRef.current);

      if (!abortRef.current) {
        setIsPlaying(false);
        setCurrentIndex(null);
        onChordHighlight?.(null);
      }
    };

    doPlay();
  }, [chords, speed, loop, mode, onChordHighlight]);

  const togglePause = useCallback(() => {
    setIsPaused(p => !p);
  }, []);

  const skipNext = useCallback(async () => {
    if (!isPlaying || currentIndex === null) return;
    // Force the delay to end by just playing next chord
    const nextIdx = (currentIndex + 1) % chords.length;
    setCurrentIndex(nextIdx);
    onChordHighlight?.(nextIdx);
    await playChord(chords[nextIdx].frets, mode);
  }, [isPlaying, currentIndex, chords, mode, onChordHighlight]);

  const progress = currentIndex !== null ? ((currentIndex + 1) / chords.length) * 100 : 0;

  return (
    <Card className="p-4 space-y-4 bg-card/80 backdrop-blur-sm">
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}

      {/* Chord sequence display */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {chords.map((chord, i) => (
          <span
            key={i}
            className={`font-mono text-sm px-2 py-1 rounded-md transition-all duration-200 ${
              currentIndex === i
                ? "bg-primary text-primary-foreground scale-110 shadow-md animate-pulse"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {chord.name}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      {isPlaying && (
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isPlaying ? (
          <Button onClick={play} size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" /> Tocar
          </Button>
        ) : (
          <>
            <Button onClick={togglePause} size="sm" variant="outline" className="gap-1.5">
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {isPaused ? "Retomar" : "Pausar"}
            </Button>
            <Button onClick={stop} size="sm" variant="destructive" className="gap-1.5">
              <Square className="h-3.5 w-3.5" /> Parar
            </Button>
            <Button onClick={skipNext} size="sm" variant="ghost" className="gap-1.5">
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        <Button
          onClick={() => setLoop(l => !l)}
          size="sm"
          variant={loop ? "default" : "ghost"}
          className="gap-1.5 ml-auto"
        >
          <Repeat className="h-3.5 w-3.5" />
          {loop ? "Loop ON" : "Loop"}
        </Button>

        <Button
          onClick={() => setMode(m => m === "strum" ? "block" : "strum")}
          size="sm"
          variant="outline"
        >
          {mode === "strum" ? "♪ Dedilhado" : "♫ Bloco"}
        </Button>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Velocidade:</span>
        <Slider
          value={[speed]}
          onValueChange={([v]) => setSpeed(v)}
          min={300}
          max={2000}
          step={100}
          className="flex-1"
        />
        <span className="text-xs font-mono text-muted-foreground w-14 text-right">{speed}ms</span>
      </div>
    </Card>
  );
}
