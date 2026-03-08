import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { ChordEntry } from "@/types/chords";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { makeChordId, makeChordDisplayName } from "@/lib/chordIds";

/**
 * Returns the unified chord list derived from chordDatabase (AppContext).
 * All components should use this instead of convertedChords directly.
 */
export function useChordList(): ChordEntry[] {
  const { chordDatabase } = useApp();

  return useMemo(() => {
    return chordDatabase.chords.map((chord): ChordEntry => {
      const suffixInfo = SUFFIX_MAP[chord.suffix] || {
        quality: chord.suffix,
        intervals: chord.intervals || ["1", "3", "5"],
        description: chord.suffix
      };

      return {
        id: makeChordId(chord.root, chord.suffix),
        root: chord.root,
        quality: suffixInfo.quality || chord.suffix,
        notes: chord.notes || [],
        intervals: chord.intervals || suffixInfo.intervals,
        variations: chord.variations.map((variation, idx) => ({
          frets: variation.frets,
          fingers: variation.fingers.map((f: number) => f === 0 ? null : f) as [number | null, number | null, number | null, number | null],
          barre: variation.barre,
          startFret: variation.startFret,
          label: idx === 0 ? "Principal" : `Posição ${idx + 1}`
        })),
        tags: [],
        difficulty: 3 as 1 | 2 | 3 | 4 | 5
      };
    });
  }, [chordDatabase]);
}
