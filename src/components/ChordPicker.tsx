import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ChordDiagram from "@/components/ChordDiagram";
import { ChordEntry } from "@/types/chords";

interface ChordPickerProps {
  chords: ChordEntry[];
  masteredChords?: string[];
  onSelect: (chord: ChordEntry) => void;
}

const ROOT_ORDER = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

type ChordCategory = "major" | "minor" | "seventh" | "diminished" | "other";

function getChordCategory(quality: string): ChordCategory {
  const q = quality.toLowerCase();
  if (q === "" || q === "m" || q === "major") {
    return q === "m" ? "minor" : "major";
  }
  if (q.includes("dim") || q.includes("°")) return "diminished";
  if (q.includes("7") || q.includes("9") || q.includes("11") || q.includes("13")) return "seventh";
  if (q.includes("m") && !q.includes("maj") && !q.includes("add")) return "minor";
  return "other";
}

const CATEGORY_STYLES: Record<ChordCategory, { border: string; bg: string; label: string; indicator: string }> = {
  major:      { border: "border-foreground/30", bg: "bg-foreground/5",   label: "M",   indicator: "bg-foreground" },
  minor:      { border: "border-secondary/40",  bg: "bg-secondary/8",   label: "m",   indicator: "bg-secondary" },
  seventh:    { border: "border-warning/30",     bg: "bg-warning/5",     label: "7",   indicator: "bg-warning" },
  diminished: { border: "border-destructive/25", bg: "bg-destructive/5", label: "dim", indicator: "bg-destructive" },
  other:      { border: "border-accent/20",      bg: "bg-accent/5",      label: "…",   indicator: "bg-accent" },
};

function displayName(chord: ChordEntry): string {
  const quality = chord.quality === "" ? "" : chord.quality;
  return `${chord.root}${quality}`;
}

export function ChordPicker({ chords, masteredChords = [], onSelect }: ChordPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);

  const validChords = useMemo(
    () => chords.filter((c) => c.variations && c.variations.length > 0),
    [chords]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ChordEntry[]>();
    for (const chord of validChords) {
      const list = map.get(chord.root) || [];
      list.push(chord);
      map.set(chord.root, list);
    }
    return map;
  }, [validChords]);

  const roots = useMemo(
    () => ROOT_ORDER.filter((r) => grouped.has(r)),
    [grouped]
  );

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

      <Input
        placeholder="Buscar acorde... (ex: Am7, G, Dm)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

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

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filtered.map((chord) => {
          const isMastered = masteredChords.includes(chord.id);
          const mainVar = chord.variations[0];
          const category = getChordCategory(chord.quality);
          const style = CATEGORY_STYLES[category];

          return (
            <HoverCard key={chord.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button
                  onClick={() => onSelect(chord)}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all hover:scale-105 hover:shadow-lg group ${
                    isMastered
                      ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                      : `${style.border} ${style.bg} hover:border-foreground/40`
                  }`}
                >
                  {/* Category indicator dot */}
                  <div className={`absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full ${style.indicator} opacity-60`} />

                  <div className="font-bold text-sm group-hover:text-foreground transition-colors">
                    <span>{chord.root}</span>
                    <span className="text-muted-foreground text-xs">{chord.quality || ""}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {chord.variations.length} var.
                  </div>
                  {isMastered && (
                    <Badge variant="default" className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      ✓
                    </Badge>
                  )}
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="top" className="w-auto p-3" sideOffset={8}>
                <div className="text-center">
                  <div className="font-bold text-sm mb-0.5">{displayName(chord)}</div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 mb-1.5">
                    {category === "major" ? "Maior" : category === "minor" ? "Menor" : category === "seventh" ? "Sétima" : category === "diminished" ? "Diminuto" : "Outro"}
                  </Badge>
                  {chord.notes.length > 0 && (
                    <div className="text-[10px] text-muted-foreground mb-2">
                      {chord.notes.join(" · ")}
                    </div>
                  )}
                  <div className="flex justify-center scale-90">
                    <ChordDiagram
                      frets={mainVar.frets}
                      fingers={mainVar.fingers}
                      barre={mainVar.barre}
                      startFret={mainVar.startFret}
                    />
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
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
