import { useState, useMemo } from "react";
import { Search, Music2, Guitar } from "lucide-react";
import { Input } from "@/components/ui/input";
import ChordCard from "@/components/ChordCard";
import Header from "@/components/Header";
import { ChordEntry } from "@/types/chords";
import { convertedChords } from "@/lib/chordConverter";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
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
      <section className="border-b border-border bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-3">
              <Guitar className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              <h1 className="text-3xl md:text-5xl font-bold">
                Dicionário de Acordes
              </h1>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg md:text-xl text-muted-foreground">
                Cavaquinho DGBD
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Music2 className="w-5 h-5" />
                <span>Powered by RZD Music</span>
              </div>
            </div>

            {/* Search */}
            <div className="w-full max-w-xl mt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar acorde (ex: C, Am, G7)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-background border-2 focus:border-primary transition-colors"
                />
              </div>
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
