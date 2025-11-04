import { Hand, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Link, useLocation } from "react-router-dom";
import rzdLogo from "@/assets/rzd-logo-final.png";

const Header = () => {
  const { leftHanded, setLeftHanded, favorites } = useApp();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isFavorites = location.pathname === "/favoritos";
  const isAbout = location.pathname === "/sobre";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
            <img 
              src={rzdLogo} 
              alt="RZD Music - Dicionário de Acordes para Cavaquinho" 
              className="h-14 md:h-16 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold leading-tight">
                Dicionário de Acordes
              </h1>
              <p className="text-sm text-muted-foreground">Cavaquinho DGBD</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant={isHome ? "default" : "ghost"}
                size="sm"
              >
                Acordes
              </Button>
            </Link>
            
            <Link to="/favoritos">
              <Button
                variant={isFavorites ? "default" : "ghost"}
                size="sm"
                className="relative"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link to="/sobre">
              <Button
                variant={isAbout ? "default" : "ghost"}
                size="sm"
              >
                <Info className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="hidden sm:inline">Sobre</span>
              </Button>
            </Link>

            <div className="h-6 w-px bg-border mx-1" />
            
            <Button
              variant={leftHanded ? "default" : "outline"}
              size="sm"
              onClick={() => setLeftHanded(!leftHanded)}
              className="transition-all"
            >
              <Hand className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {leftHanded ? "Canhoto" : "Destro"}
              </span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
