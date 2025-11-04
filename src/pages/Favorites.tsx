import { Heart, Guitar } from "lucide-react";
import ChordCard from "@/components/ChordCard";
import Header from "@/components/Header";
import { ChordEntry } from "@/types/chords";
import { useApp } from "@/contexts/AppContext";
import { convertedChords } from "@/lib/chordConverter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { favorites } = useApp();
  
  const favoriteChords = convertedChords.filter(chord => favorites.includes(chord.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary fill-current" />
            <h1 className="text-3xl md:text-4xl font-bold">Meus Favoritos</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {favorites.length === 0
              ? "Você ainda não tem acordes favoritos"
              : `${favorites.length} ${favorites.length === 1 ? "acorde salvo" : "acordes salvos"}`}
          </p>
        </div>

        {favoriteChords.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {favoriteChords.map((chord) => (
              <ChordCard key={chord.id} chord={chord} />
            ))}
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
