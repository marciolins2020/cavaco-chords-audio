import { useState } from "react";
import ChordCard from "@/components/ChordCard";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";
import { useChordList } from "@/hooks/useChordList";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDifficultyInfo } from "@/utils/chordAnalysis";
import { Star, Music } from "lucide-react";

const Favorites = () => {
  const { favorites } = useApp();
  const allChords = useChordList();
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const favoriteChords = allChords.filter(chord => favorites.includes(chord.id));

  const filteredChords = favoriteChords.filter(chord => {
    if (difficultyFilter && chord.difficulty !== difficultyFilter) return false;
    if (tagFilter && (!chord.tags || !chord.tags.includes(tagFilter))) return false;
    return true;
  });

  const allTags = Array.from(new Set(favoriteChords.flatMap(c => c.tags || [])));

  const stats = {
    total: favoriteChords.length,
    byDifficulty: [1, 2, 3, 4, 5].map(d => ({
      difficulty: d,
      count: favoriteChords.filter(c => c.difficulty === d).length,
    })),
    byRoot: Object.entries(
      favoriteChords.reduce((acc, c) => {
        acc[c.root] = (acc[c.root] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Meus Favoritos</h1>
          <p className="text-sm text-muted-foreground">
            {favorites.length === 0
              ? "Você ainda não tem acordes favoritos."
              : `${favorites.length} ${favorites.length === 1 ? "acorde salvo" : "acordes salvos"}`}
          </p>
        </div>

        {favoriteChords.length > 0 ? (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="p-4 shadow-card">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Por Dificuldade
                </h3>
                <div className="space-y-2">
                  {stats.byDifficulty.filter(s => s.count > 0).map(({ difficulty, count }) => (
                    <div key={difficulty} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getDifficultyInfo(difficulty as any).emoji}
                        <span>{getDifficultyInfo(difficulty as any).label}</span>
                      </span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 shadow-card">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Tônicas Favoritas
                </h3>
                <div className="space-y-2">
                  {stats.byRoot.map(([root, count]) => (
                    <div key={root} className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{root}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 shadow-card">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Total de Acordes
                </h3>
                <div className="text-4xl font-semibold text-foreground mb-1">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua coleção está crescendo!
                </p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 shadow-card">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Filtros</h3>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={difficultyFilter === null ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setDifficultyFilter(null)}
                >
                  Todas
                </Button>
                {[1, 2, 3, 4, 5].map(d => (
                  <Button
                    key={d}
                    variant={difficultyFilter === d ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setDifficultyFilter(d)}
                  >
                    {getDifficultyInfo(d as any).emoji} Nível {d}
                  </Button>
                ))}
              </div>

              {allTags.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Por Tag:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant={tagFilter === null ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setTagFilter(null)}
                    >
                      Todas
                    </Button>
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant={tagFilter === tag ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setTagFilter(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Chords */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Mostrando {filteredChords.length} de {favoriteChords.length}
              </p>

              {filteredChords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {filteredChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center shadow-card">
                  <p className="text-sm text-muted-foreground">
                    Nenhum acorde com os filtros selecionados.
                  </p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-base text-foreground font-medium mb-1">
              Nenhum acorde salvo ainda
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Toque na estrela em qualquer acorde para adicioná-lo aos seus favoritos.
            </p>
            <Link to="/">
              <Button size="sm">
                <Music className="h-4 w-4 mr-1.5" /> Ver acordes
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;