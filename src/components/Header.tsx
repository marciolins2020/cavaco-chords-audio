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
import { Menu, Music, Target, Trophy, AudioLines, Piano, Star, Info, Hand, Sun, Moon, User, ChevronDown } from "lucide-react";

const Header = () => {
  const { leftHanded, setLeftHanded, favorites } = useApp();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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
              <Button variant="ghost" size="sm" className="md:hidden" aria-label="Abrir menu de navegação">
                <Menu className="h-4 w-4" />
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
                  <Button variant={isActive("/") ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <Music className="h-4 w-4" /> Acordes
                  </Button>
                </Link>
                <Link to="/pratica" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/pratica") ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <Target className="h-4 w-4" /> Modo Prática
                  </Button>
                </Link>
                <Link to="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/ranking") ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <Trophy className="h-4 w-4" /> Ranking
                  </Button>
                </Link>
                <Link to="/afinador" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/afinador") ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <AudioLines className="h-4 w-4" /> Afinador
                  </Button>
                </Link>
                <Link to="/campo-harmonico" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/campo-harmonico") ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <Piano className="h-4 w-4" /> Campo Harmônico
                  </Button>
                </Link>
                <Link to="/favoritos" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/favoritos") ? "default" : "ghost"} className="w-full justify-start relative gap-2">
                    <Star className="h-4 w-4" /> Favoritos
                    {favorites.length > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/sobre" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/sobre") ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <Info className="h-4 w-4" /> Sobre
                  </Button>
                </Link>

                <div className="my-4 border-t" />

                <Button
                  variant={leftHanded ? "default" : "outline"}
                  onClick={() => { setLeftHanded(!leftHanded); setMobileMenuOpen(false); }}
                  className="w-full justify-start gap-2"
                >
                  <Hand className="h-4 w-4" /> {leftHanded ? "Canhoto" : "Destro"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileMenuOpen(false); }}
                  className="w-full justify-start gap-2"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                </Button>

                {user ? (
                  <>
                    <div className="my-4 border-t" />
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                    <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" /> Meu Perfil
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
                        Entrar / Criar Conta
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
          <nav className="hidden md:flex items-center gap-1.5">
            <Link to="/"><Button variant={isActive("/") ? "default" : "ghost"} size="sm">Acordes</Button></Link>
            <Link to="/pratica"><Button variant={isActive("/pratica") ? "default" : "ghost"} size="sm">Prática</Button></Link>
            <Link to="/ranking"><Button variant={isActive("/ranking") ? "default" : "ghost"} size="sm">Ranking</Button></Link>
            <Link to="/afinador"><Button variant={isActive("/afinador") ? "default" : "ghost"} size="sm">Afinador</Button></Link>

            {/* "Mais" dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={(isActive("/campo-harmonico") || isActive("/favoritos") || isActive("/sobre")) ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-1"
                >
                  Mais <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <Link to="/campo-harmonico">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <Piano className="h-4 w-4" /> Campo Harmônico
                  </DropdownMenuItem>
                </Link>
                <Link to="/favoritos">
                  <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                    <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Favoritos</span>
                    {favorites.length > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {favorites.length}
                      </span>
                    )}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link to="/sobre">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <Info className="h-4 w-4" /> Sobre
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLeftHanded(!leftHanded)} className="cursor-pointer gap-2">
                  <Hand className="h-4 w-4" /> {leftHanded ? "Canhoto" : "Destro"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-border mx-0.5" />

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-2"
              title={theme === "dark" ? "Tema Claro" : "Tema Escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-2 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/perfil"><DropdownMenuItem className="cursor-pointer">Meu Perfil</DropdownMenuItem></Link>
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth"><Button variant="default" size="sm">Entrar</Button></Link>
            )}
          </nav>

          {/* Mobile Quick Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <Link to="/perfil"><Button variant="ghost" size="sm" className="px-2"><User className="h-4 w-4" /></Button></Link>
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
