import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChordDiagram from "./ChordDiagram";
import { playChord, initAudio } from "@/lib/audio";
import { useApp } from "@/contexts/AppContext";
import { ROOT_NOTES, CHORD_TYPES } from "@/constants/chordDatabase";
import { SUFFIX_MAP } from "@/lib/chordConverter";

const CHORD_CATEGORIES: { label: string; types: string[] }[] = [
  { label: "Básicos", types: ['M', 'm', '7', 'm7', '7M', '6', 'sus4'] },
  { label: "Com Tensão", types: ['add9', 'madd9', 'madd11', '7(9)', '7(13)', '7(b13)', '7(b9)', '7(b5)', '7(#9)', '7(#11)'] },
  { label: "Avançados", types: ['6(9)', '6(7M)', '6(7M/9)', '6(#11)', '6(9/#11)', '7M(9)', '7M(#11)', '7M(9/#11)'] },
  { label: "Menores+", types: ['m7(9)', 'm7(11)', 'm7(9/11)', 'm7(b5)', '(b5)', '(#5)'] },
  { label: "Alterados", types: ['7(b9/13)', '7(#11/13)', '7(#5/#9)'] },
];

const ALL_SUFFIX_LABELS: Record<string, string> = {
  'M': 'Maior', 'm': 'menor', '7': '7', 'm7': 'm7', '7M': '7M',
  '6': '6', 'sus4': 'sus4', 'add9': 'add9', 'madd9': 'madd9', 'madd11': 'madd11',
  '(b5)': '(b5)', '(#5)': '(#5)', 'm7(b5)': 'm7(b5)',
  '7(9)': '7(9)', '7(13)': '7(13)', '7(b13)': '7(b13)', '7(b9)': '7(b9)',
  '7(b5)': '7(b5)', '7(#9)': '7(#9)', '7(#11)': '7(#11)',
  '6(9)': '6(9)', '6(7M)': '6(7M)', '6(7M/9)': '6(7M/9)', '6(#11)': '6(#11)', '6(9/#11)': '6(9/#11)',
  '7M(9)': '7M(9)', '7M(#11)': '7M(#11)', '7M(9/#11)': '7M(9/#11)',
  'm7(9)': 'm7(9)', 'm7(11)': 'm7(11)', 'm7(9/11)': 'm7(9/11)',
  '7(b9/13)': '7(b9/13)', '7(#11/13)': '7(#11/13)', '7(#5/#9)': '7(#5/#9)',
};

const QUALITY_TO_SUFFIX: Record<string, string> = {};
for (const [suffix] of Object.entries(ALL_SUFFIX_LABELS)) {
  const suffixInfo = SUFFIX_MAP[suffix];
  const quality = suffixInfo?.quality ?? suffix;
  QUALITY_TO_SUFFIX[quality] = suffix;
}
CHORD_TYPES.forEach(t => { QUALITY_TO_SUFFIX[t] = t; });

interface ChordExplorerProps {
  searchQuery?: string;
}

const ChordExplorer = ({ searchQuery = "" }: ChordExplorerProps) => {
  const { chordDatabase, leftHanded, setLeftHanded } = useApp();
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedType, setSelectedType] = useState("M");
  const [isPlaying, setIsPlaying] = useState(false);
  const [variationIndex, setVariationIndex] = useState(0);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) return;
    const normalized = searchQuery.replace(/\s+/g, '').trim();
    const rootMatch = normalized.match(/^([A-Ga-g])([#b])?/);
    if (!rootMatch) return;
    const root = rootMatch[0].charAt(0).toUpperCase() + (rootMatch[0].slice(1) || '');
    const suffix = normalized.slice(rootMatch[0].length) || '';
    if (ROOT_NOTES.includes(root)) {
      setSelectedRoot(root);
      setVariationIndex(0);
      if (suffix) {
        const directMatch = CHORD_TYPES.find(t => t.toLowerCase() === suffix.toLowerCase());
        if (directMatch) { setSelectedType(directMatch); return; }
        const viaSuffix = QUALITY_TO_SUFFIX[suffix] || QUALITY_TO_SUFFIX[suffix.toLowerCase()];
        if (viaSuffix && CHORD_TYPES.includes(viaSuffix)) { setSelectedType(viaSuffix); return; }
      }
      if (!suffix) setSelectedType("M");
    }
  }, [searchQuery]);

  const selectedChord = useMemo(() => {
    return chordDatabase.chords.find(c => c.root === selectedRoot && c.suffix === selectedType);
  }, [chordDatabase, selectedRoot, selectedType]);

  const handleRootChange = (root: string) => { setSelectedRoot(root); setVariationIndex(0); };
  const handleTypeChange = (type: string) => { setSelectedType(type); setVariationIndex(0); };

  const currentVariation = selectedChord?.variations[variationIndex];
  const totalVariations = selectedChord?.variations.length || 0;

  const handlePlay = async (mode: 'strum' | 'block') => {
    if (isPlaying || !currentVariation) return;
    setIsPlaying(true);
    try {
      await initAudio();
      await playChord(currentVariation.frets, mode);
    } catch (error) {
      console.error("Erro ao tocar acorde:", error);
    } finally {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Diagram panel */}
      <Card className="p-5 flex flex-col items-center gap-5 bg-card border border-border shadow-card">
        <div className="w-44 sm:w-52 md:w-60">
          {currentVariation ? (
            <ChordDiagram
              frets={currentVariation.frets}
              fingers={currentVariation.fingers}
              barre={currentVariation.barre}
              startFret={currentVariation.startFret}
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-sm text-muted-foreground">
              Selecione um acorde
            </div>
          )}
        </div>

        {totalVariations > 1 && (
          <div className="flex items-center gap-1.5">
            {selectedChord?.variations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setVariationIndex(idx)}
                className={`h-2 rounded-full transition-smooth ${
                  idx === variationIndex ? 'bg-accent w-5' : 'bg-border w-2 hover:bg-muted-foreground/40'
                }`}
                aria-label={`Variação ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 w-full max-w-xs">
          <Button
            onClick={() => handlePlay('strum')}
            disabled={isPlaying || !currentVariation}
            size="lg"
            className="flex-1"
          >
            {isPlaying ? "Tocando..." : "▶ Dedilhado"}
          </Button>
          <Button
            onClick={() => handlePlay('block')}
            disabled={isPlaying || !currentVariation}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Simultâneo
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftHanded(!leftHanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {leftHanded ? 'Canhoto ✓' : 'Destro'}
        </Button>
      </Card>

      {/* Selector panel */}
      <Card className="p-5 flex flex-col gap-5 bg-card border border-border shadow-card">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Dicionário de Acordes</span>
          <h2 className="text-2xl font-semibold tracking-tight mt-0.5">
            <span>{selectedRoot}</span>
            {selectedType !== 'M' && (
              <span className="text-muted-foreground ml-1 font-normal">{ALL_SUFFIX_LABELS[selectedType] || selectedType}</span>
            )}
          </h2>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">Tônica</h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-1 pb-2">
              {ROOT_NOTES.map(root => (
                <button
                  key={root}
                  onClick={() => handleRootChange(root)}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-smooth min-w-[44px] ${
                    selectedRoot === root
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {root}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3">
          {CHORD_CATEGORIES.map(cat => (
            <div key={cat.label}>
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">{cat.label}</h3>
              <div className="flex flex-wrap gap-1">
                {cat.types.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-smooth ${
                      selectedType === type
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {ALL_SUFFIX_LABELS[type] || type}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-3 rounded-md bg-secondary border border-border">
          <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1">Dica RZD</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Experimente as variações clicando nos pontos abaixo do diagrama.
            Use o modo "Simultâneo" para ouvir a harmonia soando ao mesmo tempo.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChordExplorer;