import { useState } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InteractiveFretboard } from "@/components/InteractiveFretboard";
import ChordDiagram from "@/components/ChordDiagram";
import { ChordEntry } from "@/types/chords";
import { convertedChords } from "@/lib/chordConverter";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { calculateChordDistance, arraysEqual, getDifficultyInfo } from "@/utils/chordAnalysis";
import { useApp } from "@/contexts/AppContext";

interface Note {
  string: number;
  fret: number;
  finger: number;
}

interface ChordMatch {
  exact?: ChordEntry;
  similar: ChordEntry[];
  confidence: number;
}

export default function ChordIdentifier() {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [result, setResult] = useState<ChordMatch | null>(null);
  const navigate = useNavigate();
  const { addToHistory } = useApp();

  // Convert notes to frets array
  const convertNotesToFrets = (notes: Note[]): [number, number, number, number] => {
    const frets: [number, number, number, number] = [0, 0, 0, 0];
    notes.forEach(note => {
      frets[4 - note.string] = note.fret;
    });
    return frets;
  };

  // Identify chord from selected notes
  const identifyChord = (notes: Note[]) => {
    if (notes.length === 0) {
      setResult(null);
      return;
    }

    const userFrets = convertNotesToFrets(notes);

    // Look for exact match
    const exactMatch = convertedChords.find(chord =>
      chord.variations.some(variation => 
        arraysEqual(variation.frets, userFrets)
      )
    );

    if (exactMatch) {
      setResult({
        exact: exactMatch,
        similar: [],
        confidence: 100
      });
      return;
    }

    // Find similar chords (fuzzy matching)
    const chordsWithDistance = convertedChords.map(chord => {
      const minDistance = Math.min(
        ...chord.variations.map(variation => 
          calculateChordDistance(userFrets, variation.frets)
        )
      );
      return { chord, distance: minDistance };
    });

    const similar = chordsWithDistance
      .filter(item => item.distance <= 8) // Apenas acordes razoavelmente próximos
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(item => item.chord);

    const bestDistance = chordsWithDistance[0]?.distance || 10;
    const confidence = Math.max(0, Math.min(100, 100 - bestDistance * 10));

    setResult({
      similar,
      confidence
    });
  };

  const handleNotesChange = (notes: Note[]) => {
    setSelectedNotes(notes);
    identifyChord(notes);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🎯 Identificador de Acordes</h1>
            <p className="text-muted-foreground text-lg">
              Clique no braço para montar um acorde e descubra qual é!
            </p>
          </div>

          {/* Interactive Fretboard */}
          <div className="mb-8">
            <InteractiveFretboard onNotesChange={handleNotesChange} />
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {result.exact ? (
                // Exact match
                <div className="bg-card border-2 border-primary rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-4xl">✅</span>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Você está tocando: {result.exact.root}
                        <span className="text-primary">{result.exact.quality}</span>
                      </h2>
                      <p className="text-muted-foreground">
                        Notas: {result.exact.notes.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-shrink-0">
                      <ChordDiagram
                        frets={result.exact.variations[0].frets}
                        fingers={result.exact.variations[0].fingers}
                        barre={result.exact.variations[0].barre}
                        startFret={result.exact.variations[0].startFret}
                        label={`${result.exact.root}${result.exact.quality}`}
                      />
                    </div>

                     <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">📊 Informações</h3>
                        <div className="space-y-2 text-sm">
                          {result.exact.difficulty && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Dificuldade:</span>
                              <span>{getDifficultyInfo(result.exact.difficulty).emoji}</span>
                              <span className="font-medium">{getDifficultyInfo(result.exact.difficulty).label}</span>
                            </div>
                          )}
                          <p>
                            <span className="text-muted-foreground">Intervalos:</span>{' '}
                            {result.exact.intervals.join(', ')}
                          </p>
                          {result.exact.tags && result.exact.tags.length > 0 && (
                            <p>
                              <span className="text-muted-foreground">Tags:</span>{' '}
                              {result.exact.tags.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToHistory(result.exact!.id, "identifier");
                          navigate(`/chord/${result.exact!.id}`);
                        }}
                        className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Ver Detalhes Completos
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Similar matches
                <div className="bg-card border-2 border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-4xl">🤔</span>
                    <div>
                      <h2 className="text-2xl font-bold">Quase lá!</h2>
                      <p className="text-muted-foreground">
                        Você pode estar tocando um destes acordes:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.similar.map(chord => (
                      <button
                        key={chord.id}
                        onClick={() => {
                          addToHistory(chord.id, "identifier");
                          navigate(`/chord/${chord.id}`);
                        }}
                        className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-accent transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold">
                            {chord.root}
                            <span className="text-muted-foreground">{chord.quality}</span>
                          </h3>
                          {chord.difficulty && (
                            <span className="text-xs">
                              {'⭐'.repeat(chord.difficulty)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {chord.notes.join(', ')}
                        </p>
                        <div className="flex justify-center">
                          <ChordDiagram
                            frets={chord.variations[0].frets}
                            fingers={chord.variations[0].fingers}
                            barre={chord.variations[0].barre}
                            startFret={chord.variations[0].startFret}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!result && (
            <div className="bg-accent/50 rounded-xl p-6 text-center">
              <h3 className="font-semibold mb-2">💡 Como usar:</h3>
              <ol className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto text-left">
                <li>1. Clique nas cordas e casas para montar o acorde</li>
                <li>2. Clique novamente para remover uma nota</li>
                <li>3. O sistema identificará automaticamente o acorde</li>
                <li>4. Use "Limpar" para recomeçar</li>
              </ol>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
