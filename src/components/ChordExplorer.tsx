import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChordDiagram from "./ChordDiagram";
import { playChord, initAudio } from "@/lib/audio";
import { useApp } from "@/contexts/AppContext";
import { ROOT_NOTES, CHORD_TYPES } from "@/constants/chordDatabase";
import { SUFFIX_MAP } from "@/lib/chordConverter";

// Categorized chord types for better organization
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

// Reverse map: quality string → suffix key
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

  // React to search query changes — parse and auto-select root/type
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) return;

    const normalized = searchQuery.replace(/\s+/g, '').trim();
    const rootMatch = normalized.match(/^([A-Ga-g])([#b])?/);
    if (!rootMatch) return;

    const root = rootMatch[0].charAt(0).toUpperCase() + (rootMatch[0].slice(1) || '');
    const suffix = normalized.slice(rootMatch[0].length) || '';

    // Only update if root is valid
    if (ROOT_NOTES.includes(root)) {
      setSelectedRoot(root);
      setVariationIndex(0);

      // Try to match suffix to a chord type
      if (suffix) {
        // Direct match
        const directMatch = CHORD_TYPES.find(t => t.toLowerCase() === suffix.toLowerCase());
        if (directMatch) {
          setSelectedType(directMatch);
          return;
        }
        // Via quality map
        const viaSuffix = QUALITY_TO_SUFFIX[suffix] || QUALITY_TO_SUFFIX[suffix.toLowerCase()];
        if (viaSuffix && CHORD_TYPES.includes(viaSuffix)) {
          setSelectedType(viaSuffix);
          return;
        }
      }
      // No suffix = major
      if (!suffix) {
        setSelectedType("M");
      }
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 flex flex-col items-center gap-6 bg-card">
        <div className="w-48 sm:w-56 md:w-64">
          {currentVariation ? (
            <ChordDiagram
              frets={currentVariation.frets}
              fingers={currentVariation.fingers}
              barre={currentVariation.barre}
              startFret={currentVariation.startFret}
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-muted-foreground">
              Selecione um acorde
            </div>
          )}
        </div>

        {totalVariations > 1 && (
          <div className="flex items-center gap-2">
            {selectedChord?.variations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setVariationIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === variationIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Variação ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => handlePlay('strum')} disabled={isPlaying || !currentVariation} className="bg-primary hover:bg-primary/90" size="lg">
            {isPlaying ? "Tocando..." : "Dedilhado"}
          </Button>
          <Button onClick={() => handlePlay('block')} disabled={isPlaying || !currentVariation} variant="secondary" size="lg">
            Simultâneo
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setLeftHanded(!leftHanded)} className="text-muted-foreground hover:text-foreground">
          {leftHanded ? 'Canhoto' : 'Destro'}
        </Button>
      </Card>

      <Card className="p-6 flex flex-col gap-6 bg-card">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Dicionário de Acordes</span>
          <h2 className="text-3xl font-bold mt-1">
            <span className="text-primary">{selectedRoot}</span>
            {selectedType !== 'M' && (
              <span className="text-foreground ml-1">{ALL_SUFFIX_LABELS[selectedType] || selectedType}</span>
            )}
          </h2>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tônica</h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-1 pb-2">
              {ROOT_NOTES.map(root => (
                <button
                  key={root}
                  onClick={() => handleRootChange(root)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all min-w-[48px] ${
                    selectedRoot === root
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {root}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="h-0.5 bg-muted mt-1 relative overflow-hidden rounded-full">
            <div 
              className="absolute h-full bg-primary transition-all duration-200"
              style={{ 
                width: `${100 / ROOT_NOTES.length}%`,
                left: `${(ROOT_NOTES.indexOf(selectedRoot) / ROOT_NOTES.length) * 100}%`
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Variações</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CHORD_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedType === type
                    ? 'bg-secondary text-secondary-foreground ring-2 ring-primary/50'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {CHORD_TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 rounded-xl bg-primary/10 border border-primary/20">
          <h4 className="font-bold text-primary text-sm mb-1">DICA RZD</h4>
          <p className="text-sm text-muted-foreground">
            Experimente as variações clicando nos pontos abaixo do diagrama.
            Use o modo "Simultâneo" para ouvir a harmonia soando ao mesmo tempo.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChordExplorer;
