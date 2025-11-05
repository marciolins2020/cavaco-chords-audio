import { useState } from "react";
import { Heart, Guitar, Filter, Download } from "lucide-react";
import ChordCard from "@/components/ChordCard";
import Header from "@/components/Header";
import { ChordEntry } from "@/types/chords";
import { useApp } from "@/contexts/AppContext";
import { convertedChords } from "@/lib/chordConverter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDifficultyInfo } from "@/utils/chordAnalysis";

const Favorites = () => {
  const { favorites } = useApp();
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  
  const favoriteChords = convertedChords.filter(chord => favorites.includes(chord.id));

  // Filtrar por dificuldade e tag
  const filteredChords = favoriteChords.filter(chord => {
    if (difficultyFilter && chord.difficulty !== difficultyFilter) return false;
    if (tagFilter && (!chord.tags || !chord.tags.includes(tagFilter))) return false;
    return true;
  });

  // Coletar todas as tags únicas
  const allTags = Array.from(
    new Set(favoriteChords.flatMap(c => c.tags || []))
  );

  // Estatísticas
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
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary fill-current" />
              <h1 className="text-3xl md:text-4xl font-bold">Meus Favoritos</h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            {favorites.length === 0
              ? "Você ainda não tem acordes favoritos"
              : `${favorites.length} ${favorites.length === 1 ? "acorde salvo" : "acordes salvos"}`}
          </p>
        </div>

        {favoriteChords.length > 0 ? (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Por Dificuldade
                </h3>
                <div className="space-y-2">
                  {stats.byDifficulty.filter(s => s.count > 0).map(({ difficulty, count }) => (
                    <div key={difficulty} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getDifficultyInfo(difficulty as any).emoji}
                        <span>{getDifficultyInfo(difficulty as any).label}</span>
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Tônicas Favoritas
                </h3>
                <div className="space-y-2">
                  {stats.byRoot.map(([root, count]) => (
                    <div key={root} className="flex items-center justify-between text-sm">
                      <span className="font-bold">{root}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Total de Acordes
                </h3>
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua coleção está crescendo! 🎸
                </p>
              </Card>
            </div>

            {/* Filtros */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                <h3 className="font-semibold">Filtros</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={difficultyFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficultyFilter(null)}
                >
                  Todas
                </Button>
                {[1, 2, 3, 4, 5].map(d => (
                  <Button
                    key={d}
                    variant={difficultyFilter === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficultyFilter(d)}
                  >
                    {getDifficultyInfo(d as any).emoji} Nível {d}
                  </Button>
                ))}
              </div>

              {allTags.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Por Tag:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={tagFilter === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTagFilter(null)}
                    >
                      Todas
                    </Button>
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant={tagFilter === tag ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTagFilter(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Acordes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredChords.length} de {favoriteChords.length} acordes
                </p>
              </div>
              
              {filteredChords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum acorde encontrado com os filtros selecionados
                  </p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Guitar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-6">
              Comece a adicionar seus acordes favoritos clicando no ícone de coração
            </p>
            <Link to="/">
              <Button>
                Ver todos os acordes
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
