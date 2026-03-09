import { useState, useEffect, useMemo } from "react";
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

// Calcula as notas REAIS que soam quando você toca a posição específica no cavaquinho
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
  const { isFavorite, toggleFavorite, addToHistory, chordDatabase } = useApp();

  // Build a set of all valid chord IDs for slug resolution
  const chordIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const c of chordDatabase.chords) {
      set.add(makeChordId(c.root, c.suffix));
    }
    return set;
  }, [chordDatabase]);

  // Resolve the URL id to a canonical chord ID (handles aliases/enharmonics)
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
          quality: chordDef.suffix,
          intervals: ["1", "3", "5"],
          description: chordDef.suffix
        };
        const firstVariationFrets = chordDef.variations[0]?.frets || [0, 0, 0, 0];
        const actualNotes = calculateActualNotes(firstVariationFrets);

        return {
          id: chordId,
          root: chordDef.root,
          quality: suffixInfo.quality,
          notes: actualNotes,
          intervals: suffixInfo.intervals,
          variations: chordDef.variations.map((variation, idx) => ({
            frets: variation.frets,
            fingers: variation.fingers.map((f: number) => f === 0 ? null : f) as [number | null, number | null, number | null, number | null],
            barre: variation.barre,
            startFret: variation.startFret,
            label: idx === 0 ? "Principal" : `Posição ${idx + 1}`
          })),
          tags: [],
          difficulty: 3 as 1 | 2 | 3 | 4 | 5
        } as ChordEntry;
      }
    }

    return null;
  }, [resolvedId, chordDatabase]);

  // Calcula as notas da variação selecionada
  const currentVariationNotes = useMemo(() => {
    if (!chord || !chord.variations[selectedVariation]) return [];
    return calculateActualNotes(chord.variations[selectedVariation].frets);
  }, [chord, selectedVariation]);

  useEffect(() => {
    if (chord) {
      addToHistory(chord.id, "browse");
    }
  }, [chord?.id]);

  if (!chord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Acorde não encontrado</h1>
          <p className="text-muted-foreground mb-4 text-sm">
            O acorde "<span className="font-mono font-bold">{id}</span>" não está no catálogo.
            Tente formatos como <span className="font-mono">C</span>, <span className="font-mono">Dm7</span>, <span className="font-mono">G7</span> ou <span className="font-mono">F#m</span>.
          </p>
          <Link to="/">
            <Button variant="outline">← Voltar ao início</Button>
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
      toast.success(`Tocando ${chord.id} - ${mode === "strum" ? "dedilhado" : "simultâneo"}`);
    } catch (error) {
      console.error("Erro ao tocar acorde:", error);
      toast.error("Erro ao tocar o acorde");
    } finally {
      setTimeout(() => setIsPlaying(false), 800);
    }
  };

  const handleToggleFavorite = () => {
    if (chord) {
      toggleFavorite(chord.id);
      toast.success(isFavorite(chord.id) ? "Removido dos favoritos" : "Adicionado aos favoritos");
    }
  };

  const isChordFavorite = chord ? isFavorite(chord.id) : false;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Sub Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" aria-label="Voltar para a página inicial">
                ← Voltar
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={isChordFavorite ? "text-primary font-bold" : ""}
              aria-label={isChordFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              {isChordFavorite ? "★" : "☆"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Chord Header */}
          <div className="text-center mb-12">
            <div className="flex items-baseline justify-center gap-3 mb-4">
              <h1 className="text-5xl md:text-6xl font-bold">{chord.root}</h1>
              {chord.quality && (
                <span className="text-3xl md:text-4xl text-muted-foreground">{chord.quality}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Notas:</span>
                <div className="flex gap-1">
                  {currentVariationNotes.map((note, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold">Intervalos:</span> {chord.intervals.join(" - ")}
              </div>
            </div>

            {chord.tags && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {chord.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Main Diagram & Controls */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-card to-background">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <ChordDiagram
                    frets={currentVariation.frets}
                    fingers={currentVariation.fingers}
                    barre={currentVariation.barre}
                    startFret={currentVariation.startFret}
                    label={currentVariation.label}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold mb-2">Tocar acorde</h3>

                <Button
                  onClick={() => handlePlayChord("strum")}
                  disabled={isPlaying}
                  size="lg"
                  className={`w-full transition-all duration-300 ${isPlaying ? "scale-105 animate-pulse shadow-[var(--shadow-glow)]" : "hover:scale-[1.02]"}`}
                >
                  {isPlaying ? "♪ Tocando..." : "▶ Dedilhado"}
                </Button>

                <Button
                  onClick={() => handlePlayChord("block")}
                  disabled={isPlaying}
                  variant="secondary"
                  size="lg"
                  className={`w-full transition-all duration-300 ${isPlaying ? "scale-105 animate-pulse shadow-[var(--shadow-glow)]" : "hover:scale-[1.02]"}`}
                >
                  {isPlaying ? "♪ Tocando..." : "▶ Simultâneo"}
                </Button>

                {chord.difficulty && (
                  <div className="mt-4 p-4 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Dificuldade:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < chord.difficulty! ? "bg-primary" : "bg-muted"}`}
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
              <h2 className="text-2xl font-bold mb-6">Variações ({chord.variations.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {chord.variations.map((variation, index) => (
                  <Card
                    key={index}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:border-primary ${selectedVariation === index ? "border-primary shadow-[var(--shadow-glow)]" : ""}`}
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
