import { useState } from "react";
import { Link } from "react-router-dom";
import { ChordEntry } from "@/types/chords";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChordDiagram from "./ChordDiagram";
import { playChord, initAudio } from "@/lib/audio";
import { toast } from "sonner";

type Props = { chord: ChordEntry };

const ChordCard: React.FC<Props> = ({ chord }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const mainVariation = chord.variations?.[0];

  if (!mainVariation) return null;

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await initAudio();
      await playChord(mainVariation.frets, "strum");
    } catch (error) {
      console.error("Erro ao tocar acorde:", error);
      toast.error("Erro ao tocar o acorde");
    } finally {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };


  return (
    <Link to={`/chord/${chord.id}`} className="group outline-none">
      <Card className="p-4 transition-smooth border border-border hover:border-accent/40 hover:shadow-[var(--shadow-elevated)] cursor-pointer bg-card relative overflow-hidden">
        {/* Top row: name + actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-foreground group-hover:text-accent transition-smooth">
              {chord.root}
            </span>
            {chord.quality && (
              <span className="text-base text-muted-foreground">{chord.quality}</span>
            )}
          </div>

          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-md ${favorite ? "text-accent" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`}
              onClick={handleFavorite}
              aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <span className="text-sm">{favorite ? "★" : "☆"}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-md transition-smooth ${
                isPlaying
                  ? "text-accent bg-accent/10 animate-pulse"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-accent/10"
              }`}
              onClick={handlePlay}
              disabled={isPlaying}
              aria-label={`Tocar acorde ${chord.root}${chord.quality}`}
            >
              <span className="text-xs">{isPlaying ? "♪" : "▶"}</span>
            </Button>
          </div>
        </div>

        {/* Diagram */}
        <div className="w-full max-w-[140px] mx-auto group-hover:opacity-100 opacity-90 transition-smooth">
          <ChordDiagram
            frets={mainVariation.frets}
            fingers={mainVariation.fingers}
            barre={mainVariation.barre}
            startFret={mainVariation.startFret}
          />
        </div>

        {/* Footer info */}
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            {chord.variations.length} {chord.variations.length === 1 ? "posição" : "posições"}
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default ChordCard;