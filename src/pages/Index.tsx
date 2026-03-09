import { useState, useMemo } from "react";
import ChordCard from "@/components/ChordCard";
import ChordExplorer from "@/components/ChordExplorer";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ChordOfTheDay } from "@/components/ChordOfTheDay";
import { PageTransition } from "@/components/PageTransition";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ChordEntry } from "@/types/chords";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import { makeChordId } from "@/lib/chordIds";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VisitorProgress } from "@/components/VisitorProgress";

const POPULAR_ROOTS = ["C", "D", "G", "A", "E", "F"];
const BEGINNER_SUFFIXES = ["M", "m", "7"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { chordDatabase } = useApp();

  const allChords = useMemo(() => {
    return chordDatabase.chords.map((chord): ChordEntry => {
      const suffixInfo = SUFFIX_MAP[chord.suffix] || {
        quality: chord.suffix,
        intervals: ["1", "3", "5"],
        description: chord.suffix
      };
      return {
        id: makeChordId(chord.root, chord.suffix),
        root: chord.root,
        quality: suffixInfo.quality,
        notes: [],
        intervals: suffixInfo.intervals,
        variations: chord.variations.map((variation, idx) => ({
          frets: variation.frets,
          fingers: variation.fingers.map((f: number) => f === 0 ? null : f) as [number|null, number|null, number|null, number|null],
          barre: variation.barre,
          label: idx === 0 ? "Principal" : `Posição ${idx + 1}`
        })),
        tags: [],
        difficulty: 3 as 1 | 2 | 3 | 4 | 5
      };
    });
  }, [chordDatabase]);

  const filteredChords = useMemo(() => {
    if (!searchQuery.trim()) return allChords;
    const query = searchQuery.toLowerCase();
    return allChords.filter((chord) => {
      const fullName = (chord.root + chord.quality).toLowerCase();
      const tags = chord.tags?.join(" ").toLowerCase() || "";
      return fullName.includes(query) || tags.includes(query);
    });
  }, [searchQuery, allChords]);

  const popularChords = useMemo(() => {
    return allChords.filter(c => POPULAR_ROOTS.includes(c.root) && BEGINNER_SUFFIXES.some(s => {
      const suffixInfo = SUFFIX_MAP[s];
      return c.quality === (suffixInfo?.quality || s);
    }));
  }, [allChords]);

  const beginnerChords = useMemo(() => {
    return allChords.filter(c => {
      const hasNoBarre = c.variations[0] && !c.variations[0].barre;
      const isSimple = BEGINNER_SUFFIXES.some(s => {
        const suffixInfo = SUFFIX_MAP[s];
        return c.quality === (suffixInfo?.quality || s);
      });
      return hasNoBarre && isSimple;
    }).slice(0, 15);
  }, [allChords]);

  const displayedChords = searchQuery ? filteredChords : (showAll ? allChords : allChords.slice(0, 20));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <OnboardingTour />

        {/* Hero Section — search-first */}
        <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 max-w-full">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center space-y-5">
              <p className="text-xs font-medium text-accent uppercase tracking-wider">
                Por Professor Juninho Rezende
              </p>

              <h1 className="font-semibold tracking-tight">
                Dicionário de Acordes
              </h1>

              <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Todos os acordes de cavaquinho com diagramas, áudio e múltiplas posições.
              </p>

              <SearchBar onSearch={setSearchQuery} value={searchQuery} className="max-w-xl mx-auto" />

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <Button
                  onClick={() => navigate("/identifier")}
                  size="sm"
                  className="text-xs h-8 px-4"
                >
                  Identificar Acorde
                </Button>
                <Button
                  onClick={() => navigate("/pratica")}
                  variant="secondary"
                  size="sm"
                  className="text-xs h-8 px-4"
                >
                  Modo Prática
                </Button>
                <Button
                  onClick={() => navigate("/campo-harmonico")}
                  variant="secondary"
                  size="sm"
                  className="text-xs h-8 px-4"
                >
                  Campo Harmônico
                </Button>
              </div>

              {/* Quick search chips */}
              <div className="flex flex-wrap justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                <span>Busca rápida:</span>
                {["C", "Dm", "G7", "Am", "F#m"].map((chord) => (
                  <button
                    key={chord}
                    onClick={() => setSearchQuery(chord)}
                    className="px-2.5 py-0.5 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-smooth font-medium"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visitor Progress CTA */}
        <section className="container mx-auto px-4 pb-2">
          <VisitorProgress />
        </section>

        {/* Acorde do Dia */}
        <section className="container mx-auto px-4 py-4">
          <ChordOfTheDay />
        </section>

        {/* Chord Explorer */}
        <section className="container mx-auto px-4 py-6 md:py-8">
          <ChordExplorer searchQuery={searchQuery} />
        </section>

        {/* Chords Section — Tabbed */}
        <main className="container mx-auto px-4 py-6 md:py-8">
          {searchQuery ? (
            <>
              <div className="mb-6">
                <h2 className="font-semibold mb-1">Resultados da busca</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredChords.length} {filteredChords.length === 1 ? "acorde encontrado" : "acordes encontrados"}
                </p>
              </div>
              {filteredChords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {filteredChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    Nenhum acorde encontrado para "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <Tabs defaultValue="popular" className="w-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold">Acordes</h2>
                <TabsList className="h-8">
                  <TabsTrigger value="popular" className="text-xs px-3 h-7">Populares</TabsTrigger>
                  <TabsTrigger value="beginner" className="text-xs px-3 h-7">Iniciante</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-3 h-7">Todos</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="popular">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {popularChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="beginner">
                <p className="text-sm text-muted-foreground mb-4">Acordes sem pestana — ideais para quem está começando.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {beginnerChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all">
                <p className="text-sm text-muted-foreground mb-4">
                  {allChords.length} acordes no dicionário
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {displayedChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
                {!showAll && allChords.length > 20 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
                      Ver todos os {allChords.length} acordes
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;