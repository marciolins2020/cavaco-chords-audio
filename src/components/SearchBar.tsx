import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { convertedChords } from "@/lib/chordConverter";
import { ChordEntry } from "@/types/chords";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ChordEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Get enharmonic equivalent
  const getEnharmonicEquivalent = (note: string): string | null => {
    const equivalents: Record<string, string> = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#',
    };
    
    for (const [key, value] of Object.entries(equivalents)) {
      if (note.startsWith(key)) {
        return note.replace(key, value);
      }
    }
    
    return null;
  };

  // Smart search with normalization
  const smartSearch = (searchQuery: string): ChordEntry[] => {
    if (!searchQuery) return [];

    // Normalize input
    const normalized = searchQuery
      .replace(/maior/i, '')
      .replace(/menor/i, 'm')
      .replace(/bemol/i, 'b')
      .replace(/sustenido/i, '#')
      .trim();

    // Direct search
    let results = convertedChords.filter(chord => {
      const fullName = (chord.root + chord.quality).toLowerCase();
      return fullName.includes(normalized.toLowerCase());
    });

    // If no results, try enharmonic equivalent
    if (results.length === 0) {
      const enharmonic = getEnharmonicEquivalent(normalized);
      if (enharmonic) {
        results = smartSearch(enharmonic);
      }
    }

    return results.slice(0, 10);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 1) {
        const filtered = smartSearch(query);
        setSuggestions(filtered);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectChord(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          selectChord(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  const selectChord = (chord: ChordEntry) => {
    setQuery(chord.root + chord.quality);
    setShowSuggestions(false);
    navigate(`/chord/${chord.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      selectChord(suggestions[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Digite o acorde (ex: C, Dm7, G/B, A#m)"
            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {suggestions.map((chord, index) => (
            <button
              key={chord.id}
              onClick={() => selectChord(chord)}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors ${
                selectedIndex === index ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">
                  {chord.root}
                  <span className="text-muted-foreground">{chord.quality}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {chord.notes.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {chord.difficulty && (
                  <span className="text-xs">
                    {'⭐'.repeat(chord.difficulty)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && query.length >= 1 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-xl shadow-2xl p-4 z-50">
          <p className="text-muted-foreground text-center">
            Nenhum acorde encontrado para "<span className="font-bold">{query}</span>"
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Tente buscar por: C, Dm, G7, Am, F#m, etc.
          </p>
        </div>
      )}
    </div>
  );
}
