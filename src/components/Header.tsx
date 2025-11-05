import { Hand, Heart, Info, Music2, Target, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import rzdLogo from "@/assets/logo-rzd-final.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { leftHanded, setLeftHanded, favorites } = useApp();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isFavorites = location.pathname === "/favoritos";
  const isHarmonicField = location.pathname === "/campo-harmonico";
  const isPractice = location.pathname === "/pratica";
  const isAbout = location.pathname === "/sobre";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img 
              src={rzdLogo} 
              alt="RZD Music - Dicionário de Acordes para Cavaquinho" 
              className="h-10 sm:h-13 md:h-16 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden md:block">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">
                Dicionário de Acordes
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">Cavaquinho DGBD</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <Link to="/" className="hidden sm:inline-block">
              <Button
                variant={isHome ? "default" : "ghost"}
                size="sm"
              >
                Acordes
              </Button>
            </Link>
            
            <Link to="/pratica">
              <Button
                variant={isPractice ? "default" : "ghost"}
                size="sm"
                className="px-2 sm:px-3"
              >
                <Target className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Prática</span>
              </Button>
            </Link>
            
            <Link to="/campo-harmonico">
              <Button
                variant={isHarmonicField ? "default" : "ghost"}
                size="sm"
                className="px-2 sm:px-3"
              >
                <Music2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Campo</span>
              </Button>
            </Link>
            
            <Link to="/favoritos">
              <Button
                variant={isFavorites ? "default" : "ghost"}
                size="sm"
                className="relative px-2 sm:px-3"
              >
                <Heart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Favoritos</span>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link to="/sobre" className="hidden md:inline-block">
              <Button
                variant={isAbout ? "default" : "ghost"}
                size="sm"
              >
                <Info className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sobre</span>
              </Button>
            </Link>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Perfil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-2 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2 px-2 sm:px-3">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Entrar</span>
                </Button>
              </Link>
            )}

            <Button
              variant={leftHanded ? "default" : "outline"}
              size="sm"
              onClick={() => setLeftHanded(!leftHanded)}
              className="transition-all px-2 sm:px-3 hidden sm:inline-flex"
            >
              <Hand className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">
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
