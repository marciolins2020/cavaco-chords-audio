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
import { Menu, Music, Target, Trophy, AudioLines, Piano, Star, Info, Hand, Sun, Moon, User, ChevronDown } from "lucide-react";

const Header = () => {
  const { leftHanded, setLeftHanded, favorites } = useApp();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium px-3 py-1.5 rounded-md transition-smooth ${
      isActive(path)
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Abrir menu de navegação">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={rzdLogo} alt="RZD" className="h-8 w-auto" />
                  <span className="text-base">RZD Music</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {[
                  { to: "/", icon: Music, label: "Acordes" },
                  { to: "/pratica", icon: Target, label: "Modo Prática" },
                  { to: "/ranking", icon: Trophy, label: "Ranking" },
                  { to: "/afinador", icon: AudioLines, label: "Afinador" },
                  { to: "/campo-harmonico", icon: Piano, label: "Campo Harmônico" },
                  { to: "/favoritos", icon: Star, label: "Favoritos", badge: favorites.length || undefined },
                  { to: "/sobre", icon: Info, label: "Sobre" },
                ].map(({ to, icon: Icon, label, badge }) => (
                  <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive(to) ? "default" : "ghost"} className="w-full justify-start gap-2.5 h-10">
                      <Icon className="h-4 w-4" /> {label}
                      {badge && (
                        <span className="ml-auto text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-medium">
                          {badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                ))}

                <div className="my-3 border-t" />

                <Button
                  variant={leftHanded ? "secondary" : "ghost"}
                  onClick={() => { setLeftHanded(!leftHanded); setMobileMenuOpen(false); }}
                  className="w-full justify-start gap-2.5 h-10"
                >
                  <Hand className="h-4 w-4" /> {leftHanded ? "Canhoto" : "Destro"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileMenuOpen(false); }}
                  className="w-full justify-start gap-2.5 h-10"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                </Button>

                {user ? (
                  <>
                    <div className="my-3 border-t" />
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                    <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2.5 h-10">
                        <User className="h-4 w-4" /> Meu Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="w-full justify-start text-destructive h-10"
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="my-3 border-t" />
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-10">Entrar / Criar Conta</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img
              src={rzdLogo}
              alt="RZD Music"
              className="h-9 sm:h-10 md:h-11 w-auto transition-smooth group-hover:opacity-80"
            />
            <span className="hidden md:block text-base font-semibold text-foreground tracking-tight">
              Cavaquinho DGBD
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className={navLinkClass("/")}>Acordes</Link>
            <Link to="/pratica" className={navLinkClass("/pratica")}>Prática</Link>
            <Link to="/ranking" className={navLinkClass("/ranking")}>Ranking</Link>
            <Link to="/afinador" className={navLinkClass("/afinador")}>Afinador</Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-smooth inline-flex items-center gap-1 ${
                    isActive("/campo-harmonico") || isActive("/favoritos") || isActive("/sobre")
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  Mais <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <Link to="/campo-harmonico">
                  <DropdownMenuItem className="cursor-pointer gap-2.5">
                    <Piano className="h-4 w-4 text-muted-foreground" /> Campo Harmônico
                  </DropdownMenuItem>
                </Link>
                <Link to="/favoritos">
                  <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                    <span className="flex items-center gap-2.5"><Star className="h-4 w-4 text-muted-foreground" /> Favoritos</span>
                    {favorites.length > 0 && (
                      <span className="text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-medium">
                        {favorites.length}
                      </span>
                    )}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link to="/sobre">
                  <DropdownMenuItem className="cursor-pointer gap-2.5">
                    <Info className="h-4 w-4 text-muted-foreground" /> Sobre
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLeftHanded(!leftHanded)} className="cursor-pointer gap-2.5">
                  <Hand className="h-4 w-4 text-muted-foreground" /> {leftHanded ? "Canhoto ✓" : "Destro"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-5 w-px bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Menu do usuário">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/perfil"><DropdownMenuItem className="cursor-pointer">Meu Perfil</DropdownMenuItem></Link>
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="h-8 text-sm px-4">Entrar</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Quick Actions */}
          <div className="flex md:hidden items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <Link to="/perfil">
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Meu perfil">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="h-8 text-xs px-3">Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;