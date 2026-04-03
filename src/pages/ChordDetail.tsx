import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChordDiagram from "@/components/ChordDiagram";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChordEntry } from "@/types/chords";
import { playChord, initAudio } from "@/lib/audio";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { makeChordId, resolveChordSlug } from "@/lib/chordIds";
import { ArrowLeft } from "lucide-react";

function calculateActualNotes(frets: number[]): string[] {
  const CHROMATIC = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const OPEN_STRINGS = ["D", "G", "B", "D"];
  const NOTE_TO_INDEX: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  const notes: string[] = [];
  const notesSet = new Set<string>();
  frets.forEach((fret, stringIndex) => {
    if (fret >= 0) {
      const openNote = OPEN_STRINGS[stringIndex];
      const openIndex = NOTE_TO_INDEX[openNote];
      const noteIndex = (openIndex + fret) % 12;
      const noteName = CHROMATIC[noteIndex];
      if (!notesSet.has(noteName)) {
        notes.push(noteName);
        notesSet.add(noteName);
      }
    }
  });
  return notes;
}

const ChordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { chordDatabase } = useApp();

  const chordIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const c of chordDatabase.chords) set.add(makeChordId(c.root, c.suffix));
    return set;
  }, [chordDatabase]);

  const resolvedId = useMemo(() => {
    if (!id) return null;
    return resolveChordSlug(id, chordIdSet);
  }, [id, chordIdSet]);

  const chord = useMemo(() => {
    if (!resolvedId) return null;
    for (const chordDef of chordDatabase.chords) {
      const chordId = makeChordId(chordDef.root, chordDef.suffix);
      if (chordId === resolvedId) {
        const suffixInfo = SUFFIX_MAP[chordDef.suffix] || {
          quality: chordDef.suffix, intervals: ["1", "3", "5"], description: chordDef.suffix
        };
        const firstVariationFrets = chordDef.variations[0]?.frets || [0, 0, 0, 0];
        const actualNotes = calculateActualNotes(firstVariationFrets);
        return {
          id: chordId, root: chordDef.root, quality: suffixInfo.quality,
          notes: actualNotes, intervals: suffixInfo.intervals,
          variations: chordDef.variations.map((variation, idx) => ({
            frets: variation.frets,
            fingers: variation.fingers.map((f: number) => f === 0 ? null : f) as [number | null, number | null, number | null, number | null],
            barre: variation.barre, startFret: variation.startFret,
            label: idx === 0 ? "Principal" : `Posição ${idx + 1}`
          })),
          tags: [], difficulty: 3 as 1 | 2 | 3 | 4 | 5
        } as ChordEntry;
      }
    }
    return null;
  }, [resolvedId, chordDatabase]);

  const currentVariationNotes = useMemo(() => {
    if (!chord || !chord.variations[selectedVariation]) return [];
    return calculateActualNotes(chord.variations[selectedVariation].frets);
  }, [chord, selectedVariation]);


  if (!chord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <h1 className="text-2xl font-semibold mb-2">Acorde não encontrado</h1>
          <p className="text-sm text-muted-foreground mb-6">
            O acorde "<span className="font-mono font-semibold">{id}</span>" não está no catálogo.
            Tente formatos como <span className="font-mono">C</span>, <span className="font-mono">Dm7</span>, <span className="font-mono">G7</span>.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentVariation = chord.variations[selectedVariation];
  

  const handlePlayChord = async (mode: "strum" | "block") => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await initAudio();
      await playChord(currentVariation.frets, mode);
      toast.success(`${chord.id} — ${mode === "strum" ? "dedilhado" : "simultâneo"}`);
    } catch (error) {
      console.error("Erro ao tocar acorde:", error);
      toast.error("Erro ao tocar o acorde");
    } finally {
      setTimeout(() => setIsPlaying(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Sub Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2" aria-label="Voltar para a página inicial">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Chord Header */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">{chord.root}</h1>
              {chord.quality && (
                <span className="text-3xl md:text-4xl text-muted-foreground font-normal">{chord.quality}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Notas:</span>
                <div className="flex gap-1">
                  {currentVariationNotes.map((note, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-foreground">Intervalos:</span> {chord.intervals.join(" – ")}
              </div>
            </div>

            {chord.tags && chord.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {chord.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Main Diagram & Controls */}
          <Card className="p-6 md:p-8 mb-8 bg-card border border-border shadow-card">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <div className="w-full max-w-[240px]">
                  <ChordDiagram
                    frets={currentVariation.frets}
                    fingers={currentVariation.fingers}
                    barre={currentVariation.barre}
                    startFret={currentVariation.startFret}
                    label={currentVariation.label}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Tocar acorde</h3>

                <Button
                  onClick={() => handlePlayChord("strum")}
                  disabled={isPlaying}
                  size="lg"
                  className={`w-full transition-smooth ${isPlaying ? "animate-pulse" : ""}`}
                  aria-label="Tocar dedilhado"
                >
                  {isPlaying ? "♪ Tocando..." : "▶  Dedilhado"}
                </Button>

                <Button
                  onClick={() => handlePlayChord("block")}
                  disabled={isPlaying}
                  variant="secondary"
                  size="lg"
                  className={`w-full transition-smooth ${isPlaying ? "animate-pulse" : ""}`}
                  aria-label="Tocar simultâneo"
                >
                  {isPlaying ? "♪ Tocando..." : "▶  Simultâneo"}
                </Button>

                {chord.difficulty && (
                  <div className="mt-3 p-3 bg-secondary rounded-md">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-secondary-foreground">Dificuldade</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-smooth ${
                              i < chord.difficulty! ? "bg-accent" : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Variations */}
          {chord.variations.length > 1 && (
            <div>
              <h2 className="font-semibold mb-4">
                Variações <span className="text-muted-foreground font-normal">({chord.variations.length})</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {chord.variations.map((variation, index) => (
                  <Card
                    key={index}
                    className={`p-3 cursor-pointer transition-smooth border ${
                      selectedVariation === index
                        ? "border-accent shadow-[var(--shadow-glow)]"
                        : "border-border hover:border-accent/40"
                    }`}
                    onClick={() => setSelectedVariation(index)}
                  >
                    <ChordDiagram
                      frets={variation.frets}
                      fingers={variation.fingers}
                      barre={variation.barre}
                      startFret={variation.startFret}
                      label={variation.label}
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChordDetail;