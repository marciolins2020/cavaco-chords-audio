import { useState, useMemo, Suspense } from "react";
import ChordCard from "@/components/ChordCard";
import ChordExplorer from "@/components/ChordExplorer";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ChordOfTheDay } from "@/components/ChordOfTheDay";
import { ChordGridSkeleton } from "@/components/ChordCardSkeleton";
import { PageTransition } from "@/components/PageTransition";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ChordEntry } from "@/types/chords";
import { SUFFIX_MAP } from "@/lib/chordConverter";
import juninhoBg from "@/assets/juninho-header-bg.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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
        id: chord.root + suffixInfo.quality,
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
      <div className="min-h-screen bg-background">
        <Header />
        <OnboardingTour />
        
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: `url(${juninhoBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/80" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-xs sm:text-sm text-primary border border-primary/20">
                <span>Por Professor Juninho Rezende</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Dicionário de Acordes
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
                Aprenda todos os acordes de cavaquinho com diagramas profissionais,
                áudio e múltiplas posições
              </p>

              <SearchBar onSearch={setSearchQuery} className="max-w-2xl mx-auto" />

              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <button
                  onClick={() => navigate("/identifier")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold text-xs sm:text-sm"
                >
                  Identificar Acorde
                </button>
                <button
                  onClick={() => navigate("/pratica")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-success text-success-foreground rounded-xl hover:bg-success/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold text-xs sm:text-sm"
                >
                  Modo Prática
                </button>
                <button
                  onClick={() => navigate("/campo-harmonico")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold text-xs sm:text-sm"
                >
                  Campo Harmônico
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>Ou busque rápido:</span>
                {["C", "Dm", "G7", "Am", "F#m"].map((chord) => (
                  <button
                    key={chord}
                    onClick={() => setSearchQuery(chord)}
                    className="px-3 py-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-colors font-semibold"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Acorde do Dia */}
        <section className="container mx-auto px-4 py-6">
          <ChordOfTheDay />
        </section>

        {/* Chord Explorer */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <ChordExplorer />
        </section>

        {/* Chords Section - Tabbed */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          {searchQuery ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Resultados da busca</h2>
                <p className="text-muted-foreground">
                  {filteredChords.length} {filteredChords.length === 1 ? "acorde encontrado" : "acordes encontrados"}
                </p>
              </div>
              {filteredChords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    Nenhum acorde encontrado para "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <Tabs defaultValue="popular" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Acordes</h2>
                <TabsList>
                  <TabsTrigger value="popular">Populares</TabsTrigger>
                  <TabsTrigger value="beginner">Iniciante</TabsTrigger>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="popular">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {popularChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="beginner">
                <p className="text-muted-foreground mb-4 text-sm">Acordes sem pestana — ideais para quem está começando.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {beginnerChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all">
                <p className="text-muted-foreground mb-4 text-sm">
                  {allChords.length} acordes no dicionário
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {displayedChords.map((chord) => (
                    <ChordCard key={chord.id} chord={chord} />
                  ))}
                </div>
                {!showAll && allChords.length > 20 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" onClick={() => setShowAll(true)}>
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
