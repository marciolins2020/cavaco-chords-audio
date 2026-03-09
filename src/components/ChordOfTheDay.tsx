import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ChordDiagram from "./ChordDiagram";
import { useApp } from "@/contexts/AppContext";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { playChord, initAudio } from "@/lib/audio";

const TIPS = [
  "Mantenha os dedos próximos aos trastes para um som mais limpo.",
  "Pratique transições lentas antes de acelerar.",
  "Use o polegar como apoio atrás do braço do cavaquinho.",
  "Toque cada corda individualmente para verificar se todas soam.",
  "A pestana exige pressão uniforme — pratique devagar.",
  "Ouça a diferença entre dedilhado e simultâneo para treinar o ouvido.",
  "Comece pelo acorde mais fácil da progressão e adicione os outros.",
];

export const ChordOfTheDay = () => {
  const { chordDatabase } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  const { chord, tip } = useMemo(() => {
    const today = new Date();
    const dayIndex = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
    const chords = chordDatabase.chords.filter(c => c.variations && c.variations.length > 0);
    if (chords.length === 0) return { chord: null, tip: TIPS[0] };
    const selected = chords[dayIndex % chords.length];
    const selectedTip = TIPS[dayIndex % TIPS.length];
    return { chord: selected, tip: selectedTip };
  }, [chordDatabase]);

  if (!chord) return null;

  const variation = chord.variations?.[0];
  if (!variation) return null;
  const suffixInfo = SUFFIX_MAP[chord.suffix];
  const chordId = chord.root + (suffixInfo?.quality || chord.suffix);

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await initAudio();
      await playChord(variation.frets, "strum");
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-card"
    >
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        {/* Left: badge + diagram */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 bg-accent/10 rounded-md text-xs font-semibold text-accent tracking-wide uppercase">
            Acorde do Dia
          </span>
          <div className="w-36 sm:w-40">
            <ChordDiagram
              frets={variation.frets}
              fingers={variation.fingers}
              barre={variation.barre}
              startFret={variation.startFret}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePlay}
            disabled={isPlaying}
            className={`transition-smooth ${isPlaying ? "animate-pulse" : ""}`}
            aria-label={`Ouvir acorde ${chord.root}`}
          >
            {isPlaying ? "♪ Tocando..." : "▶ Ouvir"}
          </Button>
        </div>

        {/* Right: info */}
        <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
          <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            <span className="text-foreground">{chord.root}</span>
            {chord.suffix !== "M" && (
              <span className="text-muted-foreground ml-1 text-2xl font-normal">
                {suffixInfo?.quality || chord.suffix}
              </span>
            )}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {variation.barre ? "Acorde com pestana — " : "Acorde aberto — "}
            {chord.variations.length} {chord.variations.length === 1 ? "posição disponível" : "posições disponíveis"}.
          </p>

          <div className="p-3 rounded-md bg-secondary border border-border">
            <p className="text-[11px] font-semibold text-accent mb-1 uppercase tracking-wider">Dica do dia</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
          </div>

          <Link to={`/chord/${chordId}`}>
            <Button variant="outline" size="sm" className="mt-1">
              Ver detalhes →
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};