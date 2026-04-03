import { useEffect, useState } from "react";
import { Music } from "lucide-react";

const STORAGE_KEY = "rzd-explored-chords";

export function VisitorProgress() {
  const [explored, setExplored] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const set: Set<string> = stored ? new Set(JSON.parse(stored)) : new Set();
    setExplored(set.size);
  }, []);

  if (explored < 2) return null;

  const message = explored < 5
    ? `Você já explorou ${explored} acordes! Continue descobrindo.`
    : explored < 15
    ? `${explored} acordes explorados — continue praticando!`
    : `Incrível! ${explored} acordes explorados!`;

  return (
    <div className="bg-accent/8 border border-accent/15 rounded-lg p-4 flex items-center gap-3">
      <Music className="h-5 w-5 text-accent flex-shrink-0" />
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}
