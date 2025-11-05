import { Hand, Heart, Info, Music2, Target, User, LogOut, LogIn, Menu, Moon, Sun, Trophy } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useTheme } from "next-themes";

const Header = () => {
  const { leftHanded, setLeftHanded, favorites } = useApp();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === "/";
  const isFavorites = location.pathname === "/favoritos";
  const isHarmonicField = location.pathname === "/campo-harmonico";
  const isPractice = location.pathname === "/pratica";
  const isAbout = location.pathname === "/sobre";
  const isRanking = location.pathname === "/ranking";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={rzdLogo} alt="RZD" className="h-8 w-auto" />
                  <span>Menu</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isHome ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Music2 className="w-4 h-4 mr-2" />
                    Acordes
                  </Button>
                </Link>
                
                <Link to="/pratica" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isPractice ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Modo Prática
                  </Button>
                </Link>
                
                <Link to="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isRanking ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Ranking
                  </Button>
                </Link>
                
                <Link to="/campo-harmonico" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isHarmonicField ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Music2 className="w-4 h-4 mr-2" />
                    Campo Harmônico
                  </Button>
                </Link>
                
                <Link to="/favoritos" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isFavorites ? "default" : "ghost"}
                    className="w-full justify-start relative"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Favoritos
                    {favorites.length > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <Link to="/sobre" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isAbout ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Sobre
                  </Button>
                </Link>

                <div className="my-4 border-t" />

                <Button
                  variant={leftHanded ? "default" : "outline"}
                  onClick={() => {
                    setLeftHanded(!leftHanded);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Hand className="w-4 h-4 mr-2" />
                  {leftHanded ? "Canhoto" : "Destro"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                </Button>

                 {user ? (
                  <>
                    <div className="my-4 border-t" />
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                    <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="my-4 border-t" />
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-start">
                        <LogIn className="w-4 h-4 mr-2" />
                        Entrar
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/">
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
              >
                <Target className="w-4 h-4 mr-2" />
                Prática
              </Button>
            </Link>
            
            <Link to="/ranking">
              <Button
                variant={isRanking ? "default" : "ghost"}
                size="sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
              </Button>
            </Link>
            
            <Link to="/campo-harmonico">
              <Button
                variant={isHarmonicField ? "default" : "ghost"}
                size="sm"
              >
                <Music2 className="w-4 h-4 mr-2" />
                Campo
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
                <Info className="w-4 h-4 mr-2" />
                Sobre
              </Button>
            </Link>

            <div className="h-6 w-px bg-border mx-1" />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Perfil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-2 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/perfil">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Entrar</span>
                </Button>
              </Link>
            )}

            <Button
              variant={leftHanded ? "default" : "outline"}
              size="sm"
              onClick={() => setLeftHanded(!leftHanded)}
              className="transition-all"
            >
              <Hand className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">
                {leftHanded ? "Canhoto" : "Destro"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="transition-all"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </nav>

          {/* Mobile Quick Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Link to="/favoritos">
              <Button
                variant={isFavorites ? "default" : "ghost"}
                size="sm"
                className="relative px-2"
              >
                <Heart className="w-4 h-4" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="px-2">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="px-2">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
