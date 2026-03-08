import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { makeChordId, makeChordDisplayName } from "@/lib/chordIds";

interface ChordSearchResult {
  id: string;
  root: string;
  quality: string;
  displayName: string;
  notes: string[];
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

// Enharmonic equivalents
const ENHARMONICS: Record<string, string> = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
};

// Suffix normalization for user input
const INPUT_SUFFIX_MAP: Record<string, string> = {
  'major': 'M', 'maj': 'M', 'maior': 'M',
  'minor': 'm', 'min': 'm', 'menor': 'm', '-': 'm',
  'dom7': '7', 'dominant7': '7',
  'min7': 'm7', 'minor7': 'm7', 'menor7': 'm7', '-7': 'm7',
  'major7': 'maj7', 'maior7': 'maj7',
  'dim7': 'dim', 'diminuto': 'dim', 'º': 'dim', 'o': 'dim',
  'half-dim': 'm7b5', 'ø': 'm7b5', 'm7-5': 'm7b5', 'm7(b5)': 'm7b5',
  'aug': '5+', 'aumentado': '5+', '+': '5+', '#5': '5+',
  'sus': 'sus4',
  '9th': '9', 'nona': '9',
  'add2': 'add9',
};

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ChordSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { chordDatabase } = useApp();

  // Build searchable chord list from the SAME source as ChordDetail/Index
  const searchableChords = useMemo((): ChordSearchResult[] => {
    return chordDatabase.chords.map((chord) => {
      const suffixInfo = SUFFIX_MAP[chord.suffix] || {
        quality: chord.suffix,
        intervals: ["1", "3", "5"],
        description: chord.suffix
      };
      const id = makeChordId(chord.root, chord.suffix);
      const displayName = makeChordDisplayName(chord.root, chord.suffix);
      return {
        id,
        root: chord.root,
        quality: suffixInfo.quality,
        suffix: chord.suffix,
        displayName,
        notes: chord.notes || [],
      };
    });
  }, [chordDatabase]);

  // Smart search
  const smartSearch = (searchQuery: string): ChordSearchResult[] => {
    if (!searchQuery) return [];

    // First, translate Portuguese note names to standard notation
    let normalized = searchQuery.trim();
    
    // Portuguese note names → standard
    const PT_NOTES: Record<string, string> = {
      'dó': 'C', 'do': 'C', 'ré': 'D', 're': 'D', 'mi': 'E',
      'fá': 'F', 'fa': 'F', 'sol': 'G', 'lá': 'A', 'la': 'A', 'si': 'B',
    };
    
    // Portuguese qualifier words
    const PT_QUALIFIERS: Record<string, string> = {
      'maior': '', 'menor': 'm', 'com sétima': '7', 'sétima': '7',
      'com sétima maior': 'maj7', 'sétima maior': 'maj7',
      'menor com sétima': 'm7', 'diminuto': 'dim', 'aumentado': '5+',
      'sexta': '6', 'nona': '9', 'suspensa': 'sus4', 'suspenso': 'sus4',
    };

    // Try to match Portuguese input like "Sol com sétima", "Ré menor"
    const lowerInput = normalized.toLowerCase();
    let ptRoot: string | null = null;
    let ptRemainder = '';
    
    // Sort by length descending to match "sol" before "si" wouldn't matter but "dó" before "do"
    const sortedNotes = Object.entries(PT_NOTES).sort((a, b) => b[0].length - a[0].length);
    for (const [ptName, stdNote] of sortedNotes) {
      if (lowerInput.startsWith(ptName)) {
        ptRoot = stdNote;
        ptRemainder = lowerInput.slice(ptName.length).trim();
        // Remove leading "com" if present
        ptRemainder = ptRemainder.replace(/^com\s+/, '');
        break;
      }
    }

    if (ptRoot) {
      // Try to match qualifier
      let ptSuffix = 'M'; // default major
      const sortedQualifiers = Object.entries(PT_QUALIFIERS).sort((a, b) => b[0].length - a[0].length);
      for (const [ptQual, stdSuffix] of sortedQualifiers) {
        if (ptRemainder.includes(ptQual)) {
          ptSuffix = stdSuffix || 'M';
          break;
        }
      }
      
      // Check for sharp/flat
      if (ptRemainder.includes('sustenido') || ptRemainder.includes('#')) {
        ptRoot += '#';
      } else if (ptRemainder.includes('bemol') || ptRemainder.includes('b')) {
        ptRoot += 'b';
      }
      
      normalized = ptRoot + (ptSuffix === 'M' ? '' : ptSuffix);
    } else {
      // Standard notation path
      normalized = normalized
        .replace(/maior/gi, '')
        .replace(/menor/gi, 'm')
        .replace(/bemol/gi, 'b')
        .replace(/sustenido/gi, '#')
        .replace(/\s+/g, '')
        .trim();
    }

    const rootMatch = normalized.match(/^([A-Ga-g])([#b])?/);
    if (!rootMatch) return [];

    const inputRoot = rootMatch[0].charAt(0).toUpperCase() + (rootMatch[0].slice(1) || '');
    const rawSuffix = normalized.slice(rootMatch[0].length) || '';
    const normalizedSuffix = INPUT_SUFFIX_MAP[rawSuffix.toLowerCase().replace(/[()]/g, '')] || rawSuffix;

    // Exact match first
    let results = searchableChords.filter(chord => {
      return chord.root.toUpperCase() === inputRoot.toUpperCase() &&
             chord.quality.toLowerCase() === normalizedSuffix.toLowerCase();
    });

    // Partial match
    if (results.length === 0) {
      results = searchableChords.filter(chord => {
        const fullName = (chord.root + chord.quality).toLowerCase();
        return fullName.includes(normalized.toLowerCase());
      });
    }

    // Enharmonic search
    if (results.length === 0) {
      const enharmonic = ENHARMONICS[inputRoot];
      if (enharmonic) {
        results = searchableChords.filter(chord => {
          return chord.root.toUpperCase() === enharmonic.toUpperCase() &&
                 chord.quality.toLowerCase() === normalizedSuffix.toLowerCase();
        });
      }
    }

    // If just a root with no suffix, show all chords for that root
    if (results.length === 0 && !rawSuffix) {
      results = searchableChords.filter(chord =>
        chord.root.toUpperCase() === inputRoot.toUpperCase()
      );
    }

    // Sort: exact first
    results.sort((a, b) => {
      const aExact = (a.root + a.quality).toLowerCase() === normalized.toLowerCase();
      const bExact = (b.root + b.quality).toLowerCase() === normalized.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return results.slice(0, 10);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed.length >= 1) {
        const filtered = smartSearch(trimmed);
        setSuggestions(filtered);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, searchableChords]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) selectChord(suggestions[selectedIndex]);
        else if (suggestions.length > 0) selectChord(suggestions[0]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  const selectChord = (chord: ChordSearchResult) => {
    setQuery(chord.displayName);
    setShowSuggestions(false);
    navigate(`/chord/${chord.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) selectChord(suggestions[0]);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" aria-hidden="true">🔍</span>
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
            placeholder="Digite o acorde (ex: C, Dm7, G7, Am, F#m)"
            aria-label="Buscar acorde"
            className="w-full pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
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
                {chord.notes.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {chord.notes.join(', ')}
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
            Tente: C, Dm, G7, Am, F#m, Bbmaj7
          </p>
        </div>
      )}
    </div>
  );
}
