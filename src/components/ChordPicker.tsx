import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChordEntry } from "@/types/chords";

interface ChordPickerProps {
  chords: ChordEntry[];
  masteredChords?: string[];
  onSelect: (chord: ChordEntry) => void;
}

const ROOT_ORDER = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function displayName(chord: ChordEntry): string {
  const quality = chord.quality === "" ? "" : chord.quality;
  return `${chord.root}${quality}`;
}

export function ChordPicker({ chords, masteredChords = [], onSelect }: ChordPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);

  // Filter chords that have at least one variation
  const validChords = useMemo(
    () => chords.filter((c) => c.variations && c.variations.length > 0),
    [chords]
  );

  // Group by root
  const grouped = useMemo(() => {
    const map = new Map<string, ChordEntry[]>();
    for (const chord of validChords) {
      const list = map.get(chord.root) || [];
      list.push(chord);
      map.set(chord.root, list);
    }
    return map;
  }, [validChords]);

  // Available roots in order
  const roots = useMemo(
    () => ROOT_ORDER.filter((r) => grouped.has(r)),
    [grouped]
  );

  // Filtered chords
  const filtered = useMemo(() => {
    let list = selectedRoot ? grouped.get(selectedRoot) || [] : validChords;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          displayName(c).toLowerCase().includes(q) ||
          c.root.toLowerCase().includes(q) ||
          c.quality.toLowerCase().includes(q)
      );
    }
    return list;
  }, [validChords, grouped, selectedRoot, search]);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Escolher Acorde</h3>

      {/* Search */}
      <Input
        placeholder="Buscar acorde... (ex: Am7, G, Dm)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {/* Root filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Button
          size="sm"
          variant={selectedRoot === null ? "default" : "outline"}
          onClick={() => setSelectedRoot(null)}
          className="h-8 text-xs px-2.5"
        >
          Todos
        </Button>
        {roots.map((root) => (
          <Button
            key={root}
            size="sm"
            variant={selectedRoot === root ? "default" : "outline"}
            onClick={() => setSelectedRoot(root)}
            className="h-8 text-xs px-2.5 min-w-[2.5rem]"
          >
            {root}
          </Button>
        ))}
      </div>

      {/* Chord grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filtered.map((chord) => {
          const isMastered = masteredChords.includes(chord.id);
          return (
            <button
              key={chord.id}
              onClick={() => onSelect(chord)}
              className={`relative p-3 rounded-lg border-2 text-center transition-all hover:scale-105 hover:shadow-md ${
                isMastered
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="font-bold text-sm">{displayName(chord)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {chord.variations.length} var.
              </div>
              {isMastered && (
                <Badge variant="default" className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  ✓
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">
          Nenhum acorde encontrado.
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {filtered.length} acordes disponíveis
      </p>
    </Card>
  );
}
