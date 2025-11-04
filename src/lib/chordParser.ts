const NOTE = "(?:A|B|C|D|E|F|G)(?:#|b)?";
const QUALITIES = [
  "maj7", "m7b5", "dim7", "m7", "7", "maj", "m", "sus4", "sus2",
  "6", "9", "add9", "5", "aug", "dim"
];

export function parseChordName(input: string) {
  const s = input.trim().replace(/\s+/g, "");
  const pattern = `^(${NOTE})(${QUALITIES.join("|")})?$`;
  const m = s.match(new RegExp(pattern, "i"));
  
  if (!m) return null;
  
  return {
    root: m[1].toUpperCase(),
    quality: (m[2] || "").toLowerCase()
  };
}
