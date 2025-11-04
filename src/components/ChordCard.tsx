import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Heart } from "lucide-react";
import { ChordEntry } from "@/types/chords";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChordDiagram from "./ChordDiagram";
import { playChord, initAudio } from "@/lib/audio";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

type Props = {
  chord: ChordEntry;
};

const ChordCard: React.FC<Props> = ({ chord }) => {
  const mainVariation = chord.variations[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const { isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(chord.id);

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await initAudio(); // Inicializa no gesto do usuário
      await playChord(mainVariation.frets, "strum");
    } catch (error) {
      console.error("Erro ao tocar acorde:", error);
      toast.error("Erro ao tocar o acorde");
    } finally {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(chord.id);
  };
  
  return (
    <Link to={`/chord/${chord.id}`}>
      <Card className="p-4 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-glow)] cursor-pointer group bg-card relative">
        <div className="flex flex-col items-center gap-3">
          {/* Header com nome e ações */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                {chord.root}
              </h3>
              {chord.quality && (
                <span className="text-lg text-muted-foreground">{chord.quality}</span>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFavorite}
              >
                <Heart className={`h-4 w-4 ${favorite ? "fill-current text-primary" : ""}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isPlaying ? "text-primary" : ""}`}
                onClick={handlePlay}
                disabled={isPlaying}
              >
                <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>
          
          <div className="w-32 opacity-80 group-hover:opacity-100 transition-opacity">
            <ChordDiagram
              frets={mainVariation.frets}
              fingers={mainVariation.fingers}
              barre={mainVariation.barre}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            {chord.variations.length} variações
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ChordCard;
