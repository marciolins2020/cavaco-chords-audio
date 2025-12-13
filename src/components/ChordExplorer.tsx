import { useState, useMemo } from "react";
import { Play, Square, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChordDiagram from "./ChordDiagram";
import { playChord, initAudio } from "@/lib/audio";
import { useApp } from "@/contexts/AppContext";
import { ROOT_NOTES, CHORD_TYPES } from "@/constants/chordDatabase";
import { SUFFIX_MAP } from "@/lib/chordConverter";

// Mapa de nomes amigáveis para os tipos de acorde
const CHORD_TYPE_LABELS: Record<string, string> = {
  'M': 'Maior',
  'm': 'menor',
  '7': '7',
  'm7': 'm7',
  'maj7': 'maj7',
  '6': '6',
  'm6': 'm6',
  'dim': 'dim',
  'm7b5': 'm7(b5)',
  '5+': '(#5)',
  'sus4': 'sus4',
  '9': '9',
  'add9': 'add9'
};

const ChordExplorer = () => {
  const { chordDatabase, leftHanded, setLeftHanded } = useApp();
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedType, setSelectedType] = useState("M");
  const [isPlaying, setIsPlaying] = useState(false);
  const [variationIndex, setVariationIndex] = useState(0);

  // Encontra o acorde selecionado no banco de dados
  const selectedChord = useMemo(() => {
    return chordDatabase.chords.find(
      c => c.root === selectedRoot && c.suffix === selectedType
    );
  }, [chordDatabase, selectedRoot, selectedType]);

  // Reset variation index quando muda de acorde
  const handleRootChange = (root: string) => {
    setSelectedRoot(root);
    setVariationIndex(0);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setVariationIndex(0);
  };

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

  // Nome de exibição do acorde
  const displayName = selectedType === 'M' 
    ? selectedRoot 
    : `${selectedRoot}${CHORD_TYPE_LABELS[selectedType] || selectedType}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Painel Esquerdo - Diagrama */}
      <Card className="p-6 flex flex-col items-center gap-6 bg-card">
        {/* Diagrama Grande */}
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

        {/* Indicador de variação */}
        {totalVariations > 1 && (
          <div className="flex items-center gap-2">
            {selectedChord?.variations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setVariationIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === variationIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Variação ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Botões de Tocar */}
        <div className="flex gap-3">
          <Button
            onClick={() => handlePlay('strum')}
            disabled={isPlaying || !currentVariation}
            className="gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Play className={`h-5 w-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            Strum
          </Button>
          <Button
            onClick={() => handlePlay('block')}
            disabled={isPlaying || !currentVariation}
            variant="secondary"
            className="gap-2"
            size="lg"
          >
            <Square className="h-5 w-5" />
            Block
          </Button>
        </div>

        {/* Toggle Destro/Canhoto */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftHanded(!leftHanded)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Hand className="h-4 w-4" />
          {leftHanded ? 'Canhoto' : 'Destro'}
        </Button>
      </Card>

      {/* Painel Direito - Seletores */}
      <Card className="p-6 flex flex-col gap-6 bg-card">
        {/* Título do Acorde */}
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Dicionário de Acordes
          </span>
          <h2 className="text-3xl font-bold mt-1">
            <span className="text-primary">{selectedRoot}</span>
            {selectedType !== 'M' && (
              <span className="text-foreground ml-1">{CHORD_TYPE_LABELS[selectedType] || selectedType}</span>
            )}
          </h2>
        </div>

        {/* Seletor de Tônica */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Tônica
          </h3>
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
          {/* Indicador visual de seleção */}
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

        {/* Seletor de Variações/Tipos */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Variações
          </h3>
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

        {/* Dica RZD */}
        <div className="mt-auto p-4 rounded-xl bg-primary/10 border border-primary/20">
          <h4 className="font-bold text-primary text-sm mb-1">DICA RZD</h4>
          <p className="text-sm text-muted-foreground">
            Experimente as variações clicando nos pontos abaixo do diagrama.
            Use o modo "Block" para ouvir a harmonia soando simultaneamente.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChordExplorer;
