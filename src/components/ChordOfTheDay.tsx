import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ChordDiagram from "./ChordDiagram";
import { useApp } from "@/contexts/AppContext";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { playChord, initAudio } from "@/lib/audio";
import { useState } from "react";

const TIPS = [
  "Mantenha os dedos próximos aos trastes para um som mais limpo.",
  "Pratique transições lentas antes de acelerar.",
  "Use o polegar como apoio atrás do braço do cavaquinho.",
  "Toque cada corda individualmente para verificar se todas soam.",
  "A pestana exige pressão uniforme — pratique devagar.",
  "Ouça a diferença entre strum e block para treinar o ouvido.",
  "Comece pelo acorde mais fácil da progressão e adicione os outros.",
];

export const ChordOfTheDay = () => {
  const { chordDatabase } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  const { chord, tip } = useMemo(() => {
    const today = new Date();
    const dayIndex = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
    const chords = chordDatabase.chords;
    const selected = chords[dayIndex % chords.length];
    const selectedTip = TIPS[dayIndex % TIPS.length];
    return { chord: selected, tip: selectedTip };
  }, [chordDatabase]);

  if (!chord) return null;

  const variation = chord.variations[0];
  const suffixInfo = SUFFIX_MAP[chord.suffix];
  const displayName = chord.suffix === "M" ? chord.root : `${chord.root}${suffixInfo?.quality || chord.suffix}`;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Left: badge + diagram */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary border border-primary/20">
            Acorde do Dia
          </div>
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
            onClick={handlePlay}
            disabled={isPlaying}
          >
            Ouvir
          </Button>
        </div>

        {/* Right: info */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <h3 className="text-3xl sm:text-4xl font-bold">
            <span className="text-primary">{chord.root}</span>
            {chord.suffix !== "M" && (
              <span className="text-muted-foreground ml-1 text-2xl">
                {suffixInfo?.quality || chord.suffix}
              </span>
            )}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {variation.barre ? "Acorde com pestana — " : "Acorde aberto — "}
            {chord.variations.length} {chord.variations.length === 1 ? "posição disponível" : "posições disponíveis"}.
          </p>

          <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-xs font-semibold text-primary mb-1">DICA DO DIA</p>
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>

          <Link to={`/chord/${chordId}`}>
            <Button variant="outline" size="sm" className="mt-2">
              Ver detalhes
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
