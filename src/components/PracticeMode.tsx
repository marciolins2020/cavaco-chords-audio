import { useState, useEffect, useRef } from "react";
import { ChordEntry } from "@/types/chords";
import { InteractiveFretboard } from "./InteractiveFretboard";
import ChordDiagram from "./ChordDiagram";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { arraysEqual, getDifficultyInfo } from "@/utils/chordAnalysis";
import { CheckCircle, XCircle, Eye, EyeOff, Timer, Trophy } from "lucide-react";

interface Note {
  string: number;
  fret: number;
  finger: number;
}

interface PracticeModeProps {
  chord: ChordEntry;
  onSuccess: (time: number) => void;
  onAttempt: (success: boolean) => void;
  currentAttempts?: number;
  currentSuccesses?: number;
}

export function PracticeMode({
  chord,
  onSuccess,
  onAttempt,
  currentAttempts = 0,
  currentSuccesses = 0,
}: PracticeModeProps) {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetVariation = chord.variations[0];
  const successRate = currentAttempts > 0 ? (currentSuccesses / currentAttempts) * 100 : 0;

  // Iniciar timer ao começar
  useEffect(() => {
    setStartTime(Date.now());
    
    timerRef.current = setInterval(() => {
      if (startTime) {
        setElapsedTime(Date.now() - startTime);
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  const convertNotesToFrets = (notes: Note[]): number[] => {
    const frets = [0, 0, 0, 0];
    notes.forEach((note) => {
      frets[4 - note.string] = note.fret;
    });
    return frets;
  };

  const checkAnswer = () => {
    const userFrets = convertNotesToFrets(selectedNotes);
    const isCorrect = arraysEqual(userFrets, targetVariation.frets);

    setFeedback(isCorrect ? "correct" : "incorrect");
    onAttempt(isCorrect);

    if (isCorrect && startTime) {
      const timeTaken = Date.now() - startTime;
      onSuccess(timeTaken);
      
      setTimeout(() => {
        setFeedback(null);
        setSelectedNotes([]);
        setStartTime(Date.now());
      }, 2000);
    } else {
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  const handleTryAgain = () => {
    setSelectedNotes([]);
    setFeedback(null);
    setShowHint(false);
    setStartTime(Date.now());
  };

  return (
    <div className="space-y-6">
      {/* Header com informações do acorde */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {chord.root}
              <span className="text-primary">{chord.quality}</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Notas: {chord.notes.join(", ")}</span>
              {chord.difficulty && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {getDifficultyInfo(chord.difficulty).emoji}
                    <span>{getDifficultyInfo(chord.difficulty).label}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-mono">
              <Timer className="w-4 h-4" />
              <span>{(elapsedTime / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{currentAttempts}</div>
            <div className="text-xs text-muted-foreground">Tentativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{currentSuccesses}</div>
            <div className="text-xs text-muted-foreground">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{successRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Taxa</div>
          </div>
        </div>

        {/* Barra de progresso para dominância */}
        {currentSuccesses < 3 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso para dominar:</span>
              <span className="font-bold">{currentSuccesses}/3</span>
            </div>
            <Progress value={(currentSuccesses / 3) * 100} />
          </div>
        )}

        {currentSuccesses >= 3 && (
          <Badge className="mt-4 w-full justify-center" variant="default">
            <Trophy className="w-4 h-4 mr-2" />
            Acorde Dominado!
          </Badge>
        )}
      </Card>

      {/* Instruções */}
      <Card className="p-4 bg-accent/30">
        <p className="text-sm font-medium mb-2">🎯 Desafio:</p>
        <p className="text-sm text-muted-foreground">
          Monte o acorde {chord.root}{chord.quality} no braço abaixo. Clique nas
          cordas e casas para posicionar os dedos.
        </p>
      </Card>

      {/* Braço Interativo */}
      <InteractiveFretboard
        onNotesChange={setSelectedNotes}
        showHints={showHint}
        className="animate-fade-in"
      />

      {/* Controles */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={checkAnswer}
          disabled={selectedNotes.length === 0 || feedback !== null}
          size="lg"
          className="min-w-[150px]"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Verificar
        </Button>

        <Button
          onClick={() => setShowDiagram(!showDiagram)}
          variant="outline"
          size="lg"
        >
          {showDiagram ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showDiagram ? "Ocultar" : "Ver"} Resposta
        </Button>

        {feedback === "incorrect" && (
          <Button onClick={handleTryAgain} variant="secondary" size="lg">
            Tentar Novamente
          </Button>
        )}
      </div>

      {/* Diagrama de resposta */}
      {showDiagram && (
        <Card className="p-6 bg-secondary/20 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 text-center">Resposta Correta:</h3>
          <div className="flex justify-center">
            <ChordDiagram
              frets={targetVariation.frets}
              fingers={targetVariation.fingers}
              barre={targetVariation.barre}
              startFret={targetVariation.startFret}
            />
          </div>
        </Card>
      )}

      {/* Feedback Visual */}
      {feedback && (
        <Card
          className={`p-6 text-center animate-scale-in ${
            feedback === "correct"
              ? "bg-success/10 border-success"
              : "bg-destructive/10 border-destructive"
          }`}
        >
          {feedback === "correct" ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-3 text-success" />
              <h3 className="text-2xl font-bold text-success mb-2">
                Perfeito! 🎉
              </h3>
              <p className="text-muted-foreground">
                Você acertou em {(elapsedTime / 1000).toFixed(1)} segundos!
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-3 text-destructive" />
              <h3 className="text-2xl font-bold text-destructive mb-2">
                Quase lá! 💪
              </h3>
              <p className="text-muted-foreground">
                Tente novamente ou clique em "Ver Resposta" para ajuda.
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
