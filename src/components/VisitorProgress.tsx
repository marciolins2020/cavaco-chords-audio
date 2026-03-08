import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const STORAGE_KEY = "rzd-explored-chords";

export function VisitorProgress() {
  const { user } = useAuth();
  const { history } = useApp();
  const [explored, setExplored] = useState(0);

  useEffect(() => {
    // Track unique chords explored via localStorage for anonymous users
    const stored = localStorage.getItem(STORAGE_KEY);
    const set: Set<string> = stored ? new Set(JSON.parse(stored)) : new Set();
    
    // Add any new history entries
    history.forEach(h => set.add(h.chordId));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    setExplored(set.size);
  }, [history]);

  // Don't show if logged in or no chords explored
  if (user || explored < 2) return null;

  const message = explored < 5
    ? `Você já explorou ${explored} acordes! Continue descobrindo.`
    : explored < 15
    ? `${explored} acordes explorados! Crie uma conta para salvar seu progresso.`
    : `Incrível! ${explored} acordes! Crie uma conta para não perder nada.`;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎸</span>
        <div>
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">
            Salve favoritos, acompanhe XP e entre no ranking.
          </p>
        </div>
      </div>
      <Link to="/auth" className="flex-shrink-0">
        <Button size="sm" className="whitespace-nowrap">
          Criar conta grátis
        </Button>
      </Link>
    </div>
  );
}
