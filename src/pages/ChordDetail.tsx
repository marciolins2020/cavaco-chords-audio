import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Volume2, Play, Heart } from "lucide-react";
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

const ChordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isFavorite, toggleFavorite, addToHistory, chordDatabase } = useApp();

  // Converte o banco de dados para o formato ChordEntry e encontra o acorde
  const chord = useMemo(() => {
    if (!id) return null;
    
    // Procura o acorde pelo ID no banco de dados do contexto
    for (const chordDef of chordDatabase.chords) {
      const suffixInfo = SUFFIX_MAP[chordDef.suffix] || {
        quality: chordDef.suffix,
        intervals: ["1", "3", "5"],
        description: chordDef.suffix
      };
      
      const chordId = chordDef.root + suffixInfo.quality;
      
      if (chordId === id) {
        return {
          id: chordId,
          root: chordDef.root,
          quality: suffixInfo.quality,
          notes: [],
          intervals: suffixInfo.intervals,
          variations: chordDef.variations.map((variation, idx) => ({
            frets: variation.frets,
            fingers: variation.fingers.map((f: number) => f === 0 ? null : f) as [number|null, number|null, number|null, number|null],
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
  }, [id, chordDatabase]);

  useEffect(() => {
    // Adicionar ao histórico quando visualizar um acorde
    if (chord) {
      addToHistory(chord.id, "browse");
    }
  }, [chord?.id]);

  if (!chord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acorde não encontrado</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
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
      await initAudio(); // Inicializa no gesto do usuário
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
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={isChordFavorite ? "text-primary" : ""}
            >
              <Heart className={`w-5 h-5 ${isChordFavorite ? "fill-current" : ""}`} />
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
              <h1 className="text-5xl md:text-6xl font-bold">
                {chord.root}
              </h1>
              {chord.quality && (
                <span className="text-3xl md:text-4xl text-muted-foreground">
                  {chord.quality}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
              <div>
                <span className="font-semibold">Notas:</span> {chord.notes.join(" - ")}
              </div>
              <div>
                <span className="font-semibold">Intervalos:</span> {chord.intervals.join(" - ")}
              </div>
            </div>

            {chord.tags && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {chord.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
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
                  className="w-full"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Dedilhado
                </Button>

                <Button
                  onClick={() => handlePlayChord("block")}
                  disabled={isPlaying}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Simultâneo
                </Button>

                {chord.difficulty && (
                  <div className="mt-4 p-4 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Dificuldade:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < chord.difficulty!
                                ? "bg-primary"
                                : "bg-muted"
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
              <h2 className="text-2xl font-bold mb-6">
                Variações ({chord.variations.length})
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {chord.variations.map((variation, index) => (
                  <Card
                    key={index}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:border-primary ${
                      selectedVariation === index
                        ? "border-primary shadow-[var(--shadow-glow)]"
                        : ""
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
