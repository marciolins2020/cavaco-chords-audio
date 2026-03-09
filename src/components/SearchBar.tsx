import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { makeChordId, makeChordDisplayName } from "@/lib/chordIds";
import { Search } from "lucide-react";

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
  value?: string;
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

export function SearchBar({ onSearch, className = "", value }: SearchBarProps) {
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const [suggestions, setSuggestions] = useState<ChordSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { chordDatabase } = useApp();

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

  const smartSearch = (searchQuery: string): ChordSearchResult[] => {
    if (!searchQuery) return [];

    let normalized = searchQuery.trim();

    const PT_NOTES: Record<string, string> = {
      'dó': 'C', 'do': 'C', 'ré': 'D', 're': 'D', 'mi': 'E',
      'fá': 'F', 'fa': 'F', 'sol': 'G', 'lá': 'A', 'la': 'A', 'si': 'B',
    };

    const PT_QUALIFIERS: Record<string, string> = {
      'maior': '', 'menor': 'm', 'com sétima': '7', 'sétima': '7',
      'com sétima maior': 'maj7', 'sétima maior': 'maj7',
      'menor com sétima': 'm7', 'diminuto': 'dim', 'aumentado': '5+',
      'sexta': '6', 'nona': '9', 'suspensa': 'sus4', 'suspenso': 'sus4',
    };

    const lowerInput = normalized.toLowerCase();
    let ptRoot: string | null = null;
    let ptRemainder = '';

    const sortedNotes = Object.entries(PT_NOTES).sort((a, b) => b[0].length - a[0].length);
    for (const [ptName, stdNote] of sortedNotes) {
      if (lowerInput.startsWith(ptName)) {
        ptRoot = stdNote;
        ptRemainder = lowerInput.slice(ptName.length).trim();
        ptRemainder = ptRemainder.replace(/^com\s+/, '');
        break;
      }
    }

    if (ptRoot) {
      let ptSuffix = 'M';
      const sortedQualifiers = Object.entries(PT_QUALIFIERS).sort((a, b) => b[0].length - a[0].length);
      for (const [ptQual, stdSuffix] of sortedQualifiers) {
        if (ptRemainder.includes(ptQual)) {
          ptSuffix = stdSuffix || 'M';
          break;
        }
      }
      if (ptRemainder.includes('sustenido') || ptRemainder.includes('#')) ptRoot += '#';
      else if (ptRemainder.includes('bemol') || ptRemainder.includes('b')) ptRoot += 'b';
      normalized = ptRoot + (ptSuffix === 'M' ? '' : ptSuffix);
    } else {
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

    let results = searchableChords.filter(chord =>
      chord.root.toUpperCase() === inputRoot.toUpperCase() &&
      chord.quality.toLowerCase() === normalizedSuffix.toLowerCase()
    );

    if (results.length === 0) {
      results = searchableChords.filter(chord => {
        const fullName = (chord.root + chord.quality).toLowerCase();
        return fullName.includes(normalized.toLowerCase());
      });
    }

    if (results.length === 0) {
      const enharmonic = ENHARMONICS[inputRoot];
      if (enharmonic) {
        results = searchableChords.filter(chord =>
          chord.root.toUpperCase() === enharmonic.toUpperCase() &&
          chord.quality.toLowerCase() === normalizedSuffix.toLowerCase()
        );
      }
    }

    if (results.length === 0 && !rawSuffix) {
      results = searchableChords.filter(chord =>
        chord.root.toUpperCase() === inputRoot.toUpperCase()
      );
    }

    results.sort((a, b) => {
      const aExact = (a.root + a.quality).toLowerCase() === normalized.toLowerCase();
      const bExact = (b.root + b.quality).toLowerCase() === normalized.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return results.slice(0, 10);
  };

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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
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
            placeholder="Buscar acorde — ex: C, Dm7, G7, Am"
            aria-label="Buscar acorde"
            className="w-full pl-12 pr-4 py-3.5 text-base rounded-lg border border-input bg-card focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-smooth placeholder:text-muted-foreground/60"
          />
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-elevated overflow-hidden z-50 max-h-[360px] overflow-y-auto">
          {suggestions.map((chord, index) => (
            <button
              key={chord.id}
              onClick={() => selectChord(chord)}
              className={`w-full px-4 py-2.5 flex items-center justify-between transition-smooth text-left ${
                selectedIndex === index ? 'bg-secondary' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base font-semibold text-foreground">
                  {chord.root}
                  <span className="text-muted-foreground font-normal">{chord.quality}</span>
                </span>
                {chord.notes.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {chord.notes.join(', ')}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && query.length >= 1 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-elevated p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum acorde para "<span className="font-semibold text-foreground">{query}</span>"
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1.5">
            Tente: C, Dm, G7, Am, F#m, Bbmaj7
          </p>
        </div>
      )}
    </div>
  );
}