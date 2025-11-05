import { useState } from "react";
import { useApp } from "@/contexts/AppContext";

interface Note {
  string: number; // 1-4 (D, B, G, D)
  fret: number;   // 0-24
  finger: number; // 0-4 (0=open, 1=index, 2=middle, 3=ring, 4=pinky)
}

interface InteractiveFretboardProps {
  onNotesChange?: (notes: Note[]) => void;
  showHints?: boolean;
  viewRange?: { start: number; end: number };
  className?: string;
}

export function InteractiveFretboard({ 
  onNotesChange, 
  showHints = false,
  viewRange = { start: 0, end: 12 },
  className = ""
}: InteractiveFretboardProps) {
  const { leftHanded } = useApp();
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [hoveredNote, setHoveredNote] = useState<{ string: number; fret: number } | null>(null);

  const strings = leftHanded ? [1, 2, 3, 4] : [4, 3, 2, 1];
  const stringNames = { 1: "D", 2: "B", 3: "G", 4: "D" };
  const frets = Array.from({ length: viewRange.end - viewRange.start + 1 }, (_, i) => i + viewRange.start);

  const handleNoteClick = (string: number, fret: number) => {
    const existingIndex = selectedNotes.findIndex(
      n => n.string === string && n.fret === fret
    );
    
    let newNotes: Note[];
    if (existingIndex >= 0) {
      // Remove se já existe
      newNotes = selectedNotes.filter((_, i) => i !== existingIndex);
    } else {
      // Remove outras notas da mesma corda e adiciona nova
      const filtered = selectedNotes.filter(n => n.string !== string);
      newNotes = [...filtered, { string, fret, finger: 0 }];
    }
    
    setSelectedNotes(newNotes);
    onNotesChange?.(newNotes);
  };

  const isNoteSelected = (string: number, fret: number) => {
    return selectedNotes.some(n => n.string === string && n.fret === fret);
  };

  const isNoteHovered = (string: number, fret: number) => {
    return hoveredNote?.string === string && hoveredNote?.fret === fret;
  };

  const clearAll = () => {
    setSelectedNotes([]);
    onNotesChange?.([]);
  };

  // Dimensões do braço
  const fretWidth = 80;
  const stringSpacing = 50;
  const width = frets.length * fretWidth + 60;
  const height = strings.length * stringSpacing + 60;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="overflow-x-auto bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg p-6 shadow-lg">
        <svg 
          width={width} 
          height={height}
          className="mx-auto"
        >
          {/* Frets */}
          {frets.map((fret, i) => (
            <line
              key={`fret-${fret}`}
              x1={i * fretWidth + 40}
              y1={20}
              x2={i * fretWidth + 40}
              y2={height - 20}
              stroke={fret === 0 ? "#000" : "#8B4513"}
              strokeWidth={fret === 0 ? 4 : 2}
              opacity={fret === 0 ? 1 : 0.5}
            />
          ))}

          {/* Strings */}
          {strings.map((stringNum, i) => (
            <line
              key={`string-${stringNum}`}
              x1={20}
              y1={i * stringSpacing + 40}
              x2={width - 20}
              y2={i * stringSpacing + 40}
              stroke="#333"
              strokeWidth={2}
            />
          ))}

          {/* String labels */}
          {strings.map((stringNum, i) => (
            <text
              key={`label-${stringNum}`}
              x={10}
              y={i * stringSpacing + 45}
              fontSize="14"
              fontWeight="bold"
              fill="currentColor"
              className="text-foreground"
            >
              {stringNames[stringNum as keyof typeof stringNames]}
            </text>
          ))}

          {/* Fret numbers */}
          {frets.map((fret, i) => (
            <text
              key={`fret-num-${fret}`}
              x={i * fretWidth + 40}
              y={15}
              fontSize="12"
              textAnchor="middle"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {fret}
            </text>
          ))}

          {/* Inlay markers */}
          {frets.filter(f => [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(f)).map((fret, _) => {
            const fretIndex = frets.indexOf(fret);
            return (
              <circle
                key={`marker-${fret}`}
                cx={(fretIndex * fretWidth + (fretIndex + 1) * fretWidth) / 2 + 20}
                cy={height / 2}
                r={fret === 12 || fret === 24 ? 6 : 4}
                fill="#D2691E"
                opacity={0.3}
              />
            );
          })}

          {/* Interactive points */}
          {frets.map((fret, fretIndex) =>
            strings.map((stringNum, stringIndex) => {
              const x = fretIndex * fretWidth + (fret === 0 ? 40 : (fretIndex * fretWidth + (fretIndex + 1) * fretWidth) / 2 + 20);
              const y = stringIndex * stringSpacing + 40;
              const isSelected = isNoteSelected(stringNum, fret);
              const isHovered = isNoteHovered(stringNum, fret);

              return (
                <g key={`note-${stringNum}-${fret}`}>
                  {/* Hover area */}
                  <circle
                    cx={x}
                    cy={y}
                    r={15}
                    fill="transparent"
                    cursor="pointer"
                    onMouseEnter={() => setHoveredNote({ string: stringNum, fret })}
                    onMouseLeave={() => setHoveredNote(null)}
                    onClick={() => handleNoteClick(stringNum, fret)}
                  />
                  
                  {/* Visual indicator */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={12}
                      fill={isSelected ? "#000" : "rgba(0,0,0,0.2)"}
                      stroke={isSelected ? "#FFD700" : "transparent"}
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  )}
                  
                  {/* Open string indicator */}
                  {fret === 0 && isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={10}
                      fill="#fff"
                      stroke="#000"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
        >
          🗑️ Limpar
        </button>
        <button
          onClick={() => setSelectedNotes([])}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          🔄 Resetar
        </button>
      </div>

      {/* Selected notes info */}
      {selectedNotes.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {selectedNotes.length} nota{selectedNotes.length !== 1 ? 's' : ''} selecionada{selectedNotes.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
