import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ChordDiagram from "@/components/ChordDiagram";
import { ChordPicker } from "@/components/ChordPicker";
import { ChordEntry } from "@/types/chords";
import { audioService } from "@/lib/audio";

type Phase = "select" | "countdown" | "playing" | "results";

interface TransitionResult {
  fromChord: string;
  toChord: string;
  time: number; // ms
}

function chordDisplayName(chord: ChordEntry): string {
  return chord.quality === "" ? chord.root : `${chord.root}${chord.quality}`;
}

interface TransitionTrainerProps {
  allChords: ChordEntry[];
  masteredChords?: string[];
}

// Common transitions for suggestions
const SUGGESTED_PAIRS = [
  ["CM", "GM"], ["CM", "Am"], ["GM", "Em"], ["DM", "Am"],
  ["CM", "FM"], ["Am", "Dm"], ["GM", "CM"], ["DM", "GM"],
];

export function TransitionTrainer({ allChords, masteredChords = [] }: TransitionTrainerProps) {
  const [phase, setPhase] = useState<Phase>("select");
  const [chordA, setChordA] = useState<ChordEntry | null>(null);
  const [chordB, setChordB] = useState<ChordEntry | null>(null);
  const [selectingSlot, setSelectingSlot] = useState<"A" | "B" | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [currentChordIndex, setCurrentChordIndex] = useState(0); // 0 = A, 1 = B
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(8); // 4 transitions back and forth
  const [transitionTimes, setTransitionTimes] = useState<number[]>([]);
  const [lastTransitionTime, setLastTransitionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentChord = currentChordIndex === 0 ? chordA : chordB;
  const nextChord = currentChordIndex === 0 ? chordB : chordA;

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("playing");
      startTimeRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 50);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTransition = useCallback(() => {
    if (phase !== "playing" || !chordA || !chordB) return;

    const now = Date.now();
    const time = now - startTimeRef.current;
    setTransitionTimes((prev) => [...prev, time]);
    setLastTransitionTime(time);

    if (time < 2000) {
      audioService.playSuccess();
    } else {
      audioService.playXP();
    }

    const newRound = round + 1;
    if (newRound >= totalRounds) {
      // Done
      if (timerRef.current) clearInterval(timerRef.current);
      setRound(newRound);
      setPhase("results");
      return;
    }

    setRound(newRound);
    setCurrentChordIndex((prev) => (prev === 0 ? 1 : 0));
    startTimeRef.current = Date.now();
    setElapsed(0);
  }, [phase, round, totalRounds, chordA, chordB]);

  const startTraining = () => {
    if (!chordA || !chordB) return;
    setPhase("countdown");
    setCountdown(3);
    setRound(0);
    setCurrentChordIndex(0);
    setTransitionTimes([]);
    setLastTransitionTime(null);
  };

  const resetAll = () => {
    setPhase("select");
    setChordA(null);
    setChordB(null);
    setSelectingSlot(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSelectChord = (chord: ChordEntry) => {
    if (selectingSlot === "A") {
      setChordA(chord);
    } else if (selectingSlot === "B") {
      setChordB(chord);
    }
    setSelectingSlot(null);
  };

  const handleSuggestedPair = (pairIds: string[]) => {
    const a = allChords.find((c) => c.id === pairIds[0]);
    const b = allChords.find((c) => c.id === pairIds[1]);
    if (a && b) {
      setChordA(a);
      setChordB(b);
    }
  };

  // Average and best times
  const avgTime = transitionTimes.length > 0
    ? transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length
    : 0;
  const bestTime = transitionTimes.length > 0
    ? Math.min(...transitionTimes)
    : 0;

  const getRating = (avg: number): { label: string; emoji: string; color: string } => {
    if (avg < 1500) return { label: "Excelente!", emoji: "🔥", color: "text-success" };
    if (avg < 2500) return { label: "Muito bom!", emoji: "⭐", color: "text-primary" };
    if (avg < 4000) return { label: "Bom ritmo", emoji: "👍", color: "text-warning" };
    return { label: "Continue praticando", emoji: "💪", color: "text-muted-foreground" };
  };

  // SELECT PHASE
  if (phase === "select") {
    if (selectingSlot) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectingSlot(null)}>
            ← Voltar
          </Button>
          <p className="text-sm text-muted-foreground">
            Escolha o acorde <strong>{selectingSlot === "A" ? "inicial" : "final"}</strong>:
          </p>
          <ChordPicker
            chords={allChords}
            masteredChords={masteredChords}
            onSelect={handleSelectChord}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-2">Treino de Transições</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Pratique a troca rápida entre dois acordes. O cronômetro mede sua velocidade de transição.
          </p>

          {/* Chord slots */}
          <div className="flex items-center gap-4 justify-center mb-6">
            <button
              onClick={() => setSelectingSlot("A")}
              className={`flex-1 max-w-[200px] p-4 rounded-xl border-2 border-dashed text-center transition-all hover:border-primary ${
                chordA ? "border-primary bg-primary/5" : "border-muted-foreground/30"
              }`}
            >
              {chordA ? (
                <>
                  <div className="text-2xl font-bold">{chordDisplayName(chordA)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {chordA.notes.join(" · ")}
                  </div>
                  {chordA.variations[0] && (
                    <div className="flex justify-center mt-2 scale-75">
                      <ChordDiagram
                        frets={chordA.variations[0].frets}
                        fingers={chordA.variations[0].fingers}
                        barre={chordA.variations[0].barre}
                        startFret={chordA.variations[0].startFret}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground py-8">
                  <div className="text-3xl mb-1">+</div>
                  <div className="text-xs">Acorde A</div>
                </div>
              )}
            </button>

            <div className="text-2xl font-bold text-muted-foreground">⇄</div>

            <button
              onClick={() => setSelectingSlot("B")}
              className={`flex-1 max-w-[200px] p-4 rounded-xl border-2 border-dashed text-center transition-all hover:border-primary ${
                chordB ? "border-primary bg-primary/5" : "border-muted-foreground/30"
              }`}
            >
              {chordB ? (
                <>
                  <div className="text-2xl font-bold">{chordDisplayName(chordB)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {chordB.notes.join(" · ")}
                  </div>
                  {chordB.variations[0] && (
                    <div className="flex justify-center mt-2 scale-75">
                      <ChordDiagram
                        frets={chordB.variations[0].frets}
                        fingers={chordB.variations[0].fingers}
                        barre={chordB.variations[0].barre}
                        startFret={chordB.variations[0].startFret}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground py-8">
                  <div className="text-3xl mb-1">+</div>
                  <div className="text-xs">Acorde B</div>
                </div>
              )}
            </button>
          </div>

          <Button
            onClick={startTraining}
            disabled={!chordA || !chordB}
            size="lg"
            className="w-full"
          >
            Iniciar Treino ({totalRounds} transições)
          </Button>
        </Card>

        {/* Suggested pairs */}
        <Card className="p-6">
          <h4 className="font-bold mb-3 text-sm">Transições Sugeridas</h4>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PAIRS.map((pair) => {
              const a = allChords.find((c) => c.id === pair[0]);
              const b = allChords.find((c) => c.id === pair[1]);
              if (!a || !b) return null;
              return (
                <Button
                  key={pair.join("-")}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedPair(pair)}
                  className="text-xs"
                >
                  {chordDisplayName(a)} ⇄ {chordDisplayName(b)}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // COUNTDOWN PHASE
  if (phase === "countdown") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <div className="text-8xl font-bold text-primary mb-4">
            {countdown > 0 ? countdown : "VAI!"}
          </div>
          <p className="text-muted-foreground">Prepare-se...</p>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  if (phase === "playing" && currentChord && nextChord) {
    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={resetAll}>
            ✕
          </Button>
          <Progress value={(round / totalRounds) * 100} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground font-mono">{round}/{totalRounds}</span>
        </div>

        {/* Current chord to play */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            Toque agora
          </div>
          <div className="text-5xl font-bold mb-2">{chordDisplayName(currentChord)}</div>
          <div className="text-sm text-muted-foreground mb-4">
            {currentChord.notes.join(" · ")}
          </div>

          {currentChord.variations[0] && (
            <div className="flex justify-center mb-6">
              <ChordDiagram
                frets={currentChord.variations[0].frets}
                fingers={currentChord.variations[0].fingers}
                barre={currentChord.variations[0].barre}
                startFret={currentChord.variations[0].startFret}
              />
            </div>
          )}

          {/* Timer */}
          <div className="text-3xl font-mono font-bold mb-4">
            {(elapsed / 1000).toFixed(1)}s
          </div>

          {lastTransitionTime && (
            <div className="text-sm text-muted-foreground mb-4">
              Última troca: <strong>{(lastTransitionTime / 1000).toFixed(2)}s</strong>
            </div>
          )}

          {/* Next chord preview */}
          <div className="text-xs text-muted-foreground mb-2">Próximo:</div>
          <Badge variant="outline" className="text-lg px-4 py-1">
            {chordDisplayName(nextChord)}
          </Badge>
        </Card>

        {/* Transition button */}
        <Button
          onClick={handleTransition}
          size="lg"
          className="w-full h-16 text-xl"
        >
          Troquei! → {chordDisplayName(nextChord)}
        </Button>
      </div>
    );
  }

  // RESULTS PHASE
  if (phase === "results" && chordA && chordB) {
    const rating = getRating(avgTime);

    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="text-5xl mb-3">{rating.emoji}</div>
          <h3 className={`text-2xl font-bold mb-1 ${rating.color}`}>{rating.label}</h3>
          <p className="text-muted-foreground mb-6">
            {chordDisplayName(chordA)} ⇄ {chordDisplayName(chordB)}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">{(avgTime / 1000).toFixed(2)}s</div>
              <div className="text-xs text-muted-foreground">Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-success">{(bestTime / 1000).toFixed(2)}s</div>
              <div className="text-xs text-muted-foreground">Melhor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{transitionTimes.length}</div>
              <div className="text-xs text-muted-foreground">Transições</div>
            </div>
          </div>

          {/* Individual times */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {transitionTimes.map((time, i) => (
              <Badge
                key={i}
                variant={time < 2000 ? "default" : time < 3500 ? "secondary" : "outline"}
                className="font-mono"
              >
                {(time / 1000).toFixed(2)}s
              </Badge>
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={startTraining} size="lg">
            Treinar Novamente
          </Button>
          <Button onClick={resetAll} variant="outline" size="lg">
            Escolher Outros Acordes
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
