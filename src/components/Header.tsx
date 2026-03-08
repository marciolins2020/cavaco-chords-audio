import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import rzdLogo from "@/assets/logo-rzd-final.png";
import headerBg from "@/assets/juninho-header-bg.jpg";
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
  const isTuner = location.pathname === "/afinador";

  return (
    <header className="sticky top-0 z-50 border-b relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${headerBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background" />
      
      <div className="relative container mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-xs font-bold">
                ☰
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
                  <Button variant={isHome ? "default" : "ghost"} className="w-full justify-start">
                    Acordes
                  </Button>
                </Link>
                
                <Link to="/pratica" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isPractice ? "default" : "ghost"} className="w-full justify-start">
                    Modo Prática
                  </Button>
                </Link>
                
                <Link to="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isRanking ? "default" : "ghost"} className="w-full justify-start">
                    Ranking
                  </Button>
                </Link>
                
                <Link to="/afinador" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isTuner ? "default" : "ghost"} className="w-full justify-start">
                    Afinador
                  </Button>
                </Link>
                
                <Link to="/campo-harmonico" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isHarmonicField ? "default" : "ghost"} className="w-full justify-start">
                    Campo Harmônico
                  </Button>
                </Link>
                
                <Link to="/favoritos" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isFavorites ? "default" : "ghost"} className="w-full justify-start relative">
                    Favoritos
                    {favorites.length > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <Link to="/sobre" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isAbout ? "default" : "ghost"} className="w-full justify-start">
                    Sobre
                  </Button>
                </Link>

                <div className="my-4 border-t" />

                <Button
                  variant={leftHanded ? "default" : "outline"}
                  onClick={() => { setLeftHanded(!leftHanded); setMobileMenuOpen(false); }}
                  className="w-full justify-start"
                >
                  {leftHanded ? "Canhoto" : "Destro"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileMenuOpen(false); }}
                  className="w-full justify-start"
                >
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
                        Meu Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="w-full justify-start text-destructive"
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="my-4 border-t" />
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-start">
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
              alt="RZD Music" 
              className="h-10 sm:h-13 md:h-16 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden md:block">
              <p className="text-lg md:text-xl font-semibold">Cavaquinho DGBD</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/"><Button variant={isHome ? "default" : "ghost"} size="sm">Acordes</Button></Link>
            <Link to="/pratica"><Button variant={isPractice ? "default" : "ghost"} size="sm">Prática</Button></Link>
            <Link to="/ranking"><Button variant={isRanking ? "default" : "ghost"} size="sm">Ranking</Button></Link>
            <Link to="/afinador"><Button variant={isTuner ? "default" : "ghost"} size="sm">Afinador</Button></Link>
            <Link to="/campo-harmonico"><Button variant={isHarmonicField ? "default" : "ghost"} size="sm">Campo</Button></Link>
            
            <Link to="/favoritos">
              <Button variant={isFavorites ? "default" : "ghost"} size="sm" className="relative">
                Favoritos
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link to="/sobre"><Button variant={isAbout ? "default" : "ghost"} size="sm">Sobre</Button></Link>

            <div className="h-6 w-px bg-border mx-1" />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">Perfil</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-2 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/perfil"><DropdownMenuItem>Meu Perfil</DropdownMenuItem></Link>
                  <DropdownMenuItem onClick={() => signOut()}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth"><Button variant="default" size="sm">Entrar</Button></Link>
            )}

            <Button
              variant={leftHanded ? "default" : "outline"}
              size="sm"
              onClick={() => setLeftHanded(!leftHanded)}
            >
              {leftHanded ? "Canhoto" : "Destro"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Claro" : "Escuro"}
            </Button>
          </nav>

          {/* Mobile Quick Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Link to="/favoritos">
              <Button variant={isFavorites ? "default" : "ghost"} size="sm" className="relative px-2 text-xs">
                Fav
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <Link to="/perfil"><Button variant="ghost" size="sm" className="px-2 text-xs">Perfil</Button></Link>
            ) : (
              <Link to="/auth"><Button variant="default" size="sm" className="px-2 text-xs">Entrar</Button></Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
