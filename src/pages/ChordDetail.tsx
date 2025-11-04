import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Volume2, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChordDiagram from "@/components/ChordDiagram";
import { ChordEntry } from "@/types/chords";
import { playChord } from "@/lib/audio";
import { toast } from "sonner";
import chordsData from "@/data/chords.json";

const ChordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [chord, setChord] = useState<ChordEntry | null>(null);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const chords = chordsData as ChordEntry[];
    const foundChord = chords.find((c) => c.id === id);
    setChord(foundChord || null);
  }, [id]);

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
      await playChord(currentVariation.frets, mode);
      toast.success(`Tocando ${chord.id} - ${mode === "strum" ? "dedilhado" : "simultâneo"}`);
    } catch (error) {
      toast.error("Erro ao tocar o acorde");
    } finally {
      setTimeout(() => setIsPlaying(false), 800);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
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
              onClick={toggleFavorite}
              className={isFavorite ? "text-primary" : ""}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

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
                      label={variation.label}
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChordDetail;
