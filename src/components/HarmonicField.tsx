import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChordDiagram from "@/components/ChordDiagram";
import { getHarmonicField, getAvailableKeys, FUNCTION_INFO, HarmonicFunction } from "@/utils/harmonicField";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { playChord, initAudio } from "@/lib/audio";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

interface HarmonicFieldProps {
  selectedKey?: string;
}

export function HarmonicField({ selectedKey = "C" }: HarmonicFieldProps) {
  const [currentKey, setCurrentKey] = useState(selectedKey);
  const [highlightedFunction, setHighlightedFunction] = useState<HarmonicFunction | null>(null);
  const [playingChord, setPlayingChord] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToHistory } = useApp();

  const field = getHarmonicField(currentKey);
  const availableKeys = getAvailableKeys();

  if (!field) return null;

  const handleChordClick = (chordId: string) => {
    addToHistory(chordId, "browse");
    navigate(`/chord/${chordId}`);
  };

  const handlePlayProgression = async (sequence: string[]) => {
    try {
      await initAudio();
      
      for (const chordName of sequence) {
        const chord = field.degrees.find(
          d => d.chord && (d.chord.root + d.chord.quality) === chordName
        )?.chord;
        
        if (chord && chord.variations.length > 0) {
          setPlayingChord(chordName);
          await playChord(chord.variations[0].frets, "strum");
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      setPlayingChord(null);
      toast.success("Progressão tocada!");
    } catch (error) {
      console.error("Erro ao tocar progressão:", error);
      toast.error("Erro ao tocar a progressão");
      setPlayingChord(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-muted-foreground self-center mr-2">Tom:</span>
        {availableKeys.map((key) => (
          <Button
            key={key}
            variant={currentKey === key ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentKey(key)}
            className="min-w-[3rem]"
          >
            {key}
          </Button>
        ))}
      </div>

      {/* Harmonic Field Grid */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Campo Harmônico de {field.key} Maior
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {field.degrees.map(({ degree, chord, function: func }) => {
            if (!chord) return null;

            const funcInfo = FUNCTION_INFO[func];
            const isHighlighted = highlightedFunction === func;

            return (
              <Card
                key={degree}
                className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isHighlighted ? "ring-2 ring-offset-2" : ""
                }`}
                style={{
                  borderColor: isHighlighted ? funcInfo.color : undefined,
                  backgroundColor: isHighlighted ? `${funcInfo.color}10` : undefined,
                }}
                onClick={() => handleChordClick(chord.id)}
                onMouseEnter={() => setHighlightedFunction(func)}
                onMouseLeave={() => setHighlightedFunction(null)}
              >
                <div className="text-center space-y-2">
                  <div className="text-xs font-bold text-muted-foreground">
                    {degree}
                  </div>
                  <div className="text-lg font-bold">
                    {chord.root}
                    <span className="text-sm text-muted-foreground">{chord.quality}</span>
                  </div>
                  <div className="flex justify-center">
                    <ChordDiagram
                      frets={chord.variations[0].frets}
                      fingers={chord.variations[0].fingers}
                      barre={chord.variations[0].barre}
                      startFret={0}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Function Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          {Object.entries(FUNCTION_INFO).map(([func, info]) => (
            <button
              key={func}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 hover:bg-accent transition-colors"
              style={{ borderColor: info.color }}
              onMouseEnter={() => setHighlightedFunction(func as HarmonicFunction)}
              onMouseLeave={() => setHighlightedFunction(null)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: info.color }}
              />
              <span className="font-medium">{info.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Progressions */}
      {field.progressions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center">
            🎵 Progressões Famosas em {field.key}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field.progressions.map((prog, idx) => (
              <Card key={idx} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{prog.name}</h4>
                    <p className="text-sm text-muted-foreground">{prog.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                    {prog.style}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {prog.sequence.map((chordName, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span
                        className={`font-mono font-bold px-2 py-1 rounded ${
                          playingChord === chordName
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {chordName}
                      </span>
                      {i < prog.sequence.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlayProgression(prog.sequence)}
                  disabled={playingChord !== null}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {playingChord ? "Tocando..." : "Tocar Progressão"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Educational Info */}
      {highlightedFunction && (
        <Card className="p-4 bg-accent/50 border-2" style={{ borderColor: FUNCTION_INFO[highlightedFunction].color }}>
          <h4 className="font-bold mb-2">
            {FUNCTION_INFO[highlightedFunction].label}
          </h4>
          <p className="text-sm text-muted-foreground">
            {FUNCTION_INFO[highlightedFunction].description}
          </p>
        </Card>
      )}
    </div>
  );
}
