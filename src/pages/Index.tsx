import { useState, useMemo } from "react";
import { Music2, Guitar } from "lucide-react";
import ChordCard from "@/components/ChordCard";
import Header from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { convertedChords } from "@/lib/chordConverter";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Use converted chords from cavaquinho-source.json
  const allChords = convertedChords;

  const filteredChords = useMemo(() => {
    if (!searchQuery.trim()) return allChords;
    
    const query = searchQuery.toLowerCase();
    return allChords.filter((chord) => {
      const fullName = (chord.root + chord.quality).toLowerCase();
      const tags = chord.tags?.join(" ").toLowerCase() || "";
      return fullName.includes(query) || tags.includes(query);
    });
  }, [searchQuery, allChords]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary border border-primary/20">
              <span className="animate-pulse">🎸</span>
              <span>Por Professor Juninho Rezende</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Dicionário de Acordes
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Aprenda todos os acordes de cavaquinho com diagramas profissionais,
              áudio e múltiplas posições
            </p>

            {/* Search Bar with Autocomplete */}
            <SearchBar onSearch={setSearchQuery} className="max-w-2xl mx-auto" />

            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <button
                onClick={() => navigate("/identifier")}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-semibold"
              >
                🎯 Identificar Acorde no Braço
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <span>Ou busque rápido:</span>
              {["C", "Dm", "G7", "Am", "F#m"].map((chord) => (
                <button
                  key={chord}
                  onClick={() => setSearchQuery(chord)}
                  className="px-3 py-1 bg-accent hover:bg-accent/80 rounded-full transition-colors"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chords Grid */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {searchQuery ? "Resultados da busca" : "Acordes disponíveis"}
          </h2>
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
            <Guitar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">
              Nenhum acorde encontrado para "{searchQuery}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
