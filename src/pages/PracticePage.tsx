import { useState } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PracticeMode } from "@/components/PracticeMode";
import { ChordPicker } from "@/components/ChordPicker";
import { TransitionTrainer } from "@/components/TransitionTrainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChordList } from "@/hooks/useChordList";
import { ChordEntry } from "@/types/chords";
import { usePractice } from "@/hooks/usePractice";
import { ACHIEVEMENTS, getLevelInfo } from "@/utils/achievements";


// Helper to display chord names nicely (CM→C, Fsm→F#m, etc.)
function displayChordName(id: string): string {
  return id
    .replace(/^([A-G])M$/, "$1")
    .replace(/s/, "#");
}

// Sequência pedagógica de acordes
const LEARNING_SEQUENCE = [
  { level: "Iniciante", chords: ["CM", "GM", "Am", "FM", "Dm", "Em", "DM"] },
  { level: "Intermediário", chords: ["AM", "EM", "C7", "G7", "D7", "Fsm", "Bm"] },
  { level: "Avançado", chords: ["C7M", "Dm7", "Em7", "F7M", "G7", "Am7", "Bdim"] },
];

export default function PracticePage() {
  const { stats, sessions, recordAttempt, resetStats } = usePractice("local");
  const [currentChord, setCurrentChord] = useState<ChordEntry | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const allChords = useChordList();

  const levelInfo = getLevelInfo(stats);
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    stats.achievements.includes(a.id)
  );

  const selectNextChord = () => {
    const allSequenceChords = LEARNING_SEQUENCE.flatMap((level) => level.chords);
    const unmasteredChords = allSequenceChords.filter(
      (chordName) => !stats.chordsMastered.includes(chordName)
    );

    if (unmasteredChords.length > 0) {
      const nextChordName = unmasteredChords[0];
      const chord = allChords.find((c) => c.id === nextChordName);
      if (chord) setCurrentChord(chord);
    } else {
      const randomChord = allChords[Math.floor(Math.random() * allChords.length)];
      setCurrentChord(randomChord);
    }
  };

  const startPracticeWithChord = (chord: ChordEntry) => {
    setCurrentChord(chord);
  };

  const handleAttempt = (success: boolean) => {
    if (currentChord) recordAttempt(currentChord.id, success);
  };

  const handleSuccess = (time: number) => {
    if (currentChord) recordAttempt(currentChord.id, true, time);
  };

  const currentSession = currentChord ? sessions[currentChord.id] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Modo Prática</h1>
            <p className="text-muted-foreground text-lg">
              Pratique acordes e desbloqueie conquistas
            </p>
          </div>

          {!currentChord ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary font-bold">♛</div>
                    <div>
                      <div className="text-2xl font-bold">{stats.chordsMastered.length}</div>
                      <div className="text-xs text-muted-foreground">Acordes Dominados</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg text-success font-bold">◎</div>
                    <div>
                      <div className="text-2xl font-bold">{stats.totalSuccesses}</div>
                      <div className="text-xs text-muted-foreground">Acertos Totais</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg text-warning font-bold">S</div>
                    <div>
                      <div className="text-2xl font-bold">{stats.consecutiveDays}</div>
                      <div className="text-xs text-muted-foreground">Dias Seguidos</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Level */}
              <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{levelInfo.level}</h3>
                    <p className="text-sm text-muted-foreground">{levelInfo.nextMilestone}</p>
                  </div>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    Nível {Math.floor(stats.chordsMastered.length / 5) + 1}
                  </Badge>
                </div>
                <Progress value={levelInfo.progress} className="h-3" />
              </Card>

              {/* Practice mode selection: Tabs */}
              <Tabs defaultValue="sequence" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sequence">Guiada</TabsTrigger>
                  <TabsTrigger value="manual">Livre</TabsTrigger>
                  <TabsTrigger value="transitions">Transições</TabsTrigger>
                </TabsList>

                <TabsContent value="sequence" className="mt-4 space-y-6">
                  {/* Learning Sequence */}
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Sequência de Aprendizado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Clique em um acorde para praticá-lo diretamente, ou use "Começar Prática" para seguir a ordem.
                    </p>
                    <div className="space-y-4">
                      {LEARNING_SEQUENCE.map((level) => (
                        <div key={level.level}>
                          <h4 className="font-semibold mb-2 text-sm">{level.level}</h4>
                          <div className="flex flex-wrap gap-2">
                            {level.chords.map((chordName) => {
                              const isMastered = stats.chordsMastered.includes(chordName);
                              const isLearned = stats.chordsLearned.includes(chordName);
                              return (
                                <Badge
                                  key={chordName}
                                  variant={isMastered ? "default" : isLearned ? "secondary" : "outline"}
                                  className="cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => {
                                    const chord = allChords.find((c) => c.id === chordName);
                                    if (chord) startPracticeWithChord(chord);
                                  }}
                                >
                                  {displayChordName(chordName)}
                                  {isMastered && " ✓"}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Start guided practice button */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button onClick={selectNextChord} size="lg" className="min-w-[200px]">
                      Começar Prática Guiada
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <ChordPicker
                    chords={allChords}
                    masteredChords={stats.chordsMastered}
                    onSelect={startPracticeWithChord}
                  />
                </TabsContent>

                <TabsContent value="transitions" className="mt-4">
                  <TransitionTrainer
                    allChords={allChords}
                    masteredChords={stats.chordsMastered}
                  />
                </TabsContent>
              </Tabs>

              {/* Achievements */}
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Conquistas ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAchievements(!showAchievements)}
                  >
                    {showAchievements ? "Ocultar" : "Ver Todas"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(showAchievements ? ACHIEVEMENTS : unlockedAchievements.slice(0, 8)).map(
                    (achievement) => {
                      const isUnlocked = stats.achievements.includes(achievement.id);
                      return (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            isUnlocked
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/30 border-muted opacity-50"
                          }`}
                        >
                          <div className="text-3xl mb-2">{achievement.icon}</div>
                          <div className="font-bold text-sm mb-1">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.description}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </Card>

              {/* Reset */}
              {stats.totalAttempts > 0 && (
                <div className="flex justify-center">
                  <Button
                    onClick={resetStats}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    Resetar Estatísticas
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Active Practice */}
              <div className="mb-6">
                <Button onClick={() => setCurrentChord(null)} variant="ghost" size="sm">
                  ← Voltar ao Dashboard
                </Button>
              </div>

              <PracticeMode
                chord={currentChord}
                onSuccess={handleSuccess}
                onAttempt={handleAttempt}
                currentAttempts={currentSession?.attempts || 0}
                currentSuccesses={currentSession?.successes || 0}
              />

              <div className="mt-6 text-center">
                <Button onClick={selectNextChord} variant="outline">
                  Próximo Acorde
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
