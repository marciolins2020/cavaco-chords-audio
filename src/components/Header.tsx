import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
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
import { Menu, Music, Target, Trophy, Piano, Info, Hand, Sun, Moon, ChevronDown, Search } from "lucide-react";

const Header = () => {
  const { leftHanded, setLeftHanded } = useApp();
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
                  { to: "/identifier", icon: Search, label: "Identificar Acorde" },
                  { to: "/pratica", icon: Target, label: "Modo Prática" },
                  { to: "/ranking", icon: Trophy, label: "Ranking" },
                  { to: "/campo-harmonico", icon: Piano, label: "Campo Harmônico" },
                  { to: "/sobre", icon: Info, label: "Sobre" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive(to) ? "default" : "ghost"} className="w-full justify-start gap-2.5 h-10">
                      <Icon className="h-4 w-4" /> {label}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-smooth inline-flex items-center gap-1 ${
                    isActive("/campo-harmonico") || isActive("/identifier") || isActive("/sobre")
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  Mais <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <Link to="/identifier">
                  <DropdownMenuItem className="cursor-pointer gap-2.5">
                    <Search className="h-4 w-4 text-muted-foreground" /> Identificar Acorde
                  </DropdownMenuItem>
                </Link>
                <Link to="/campo-harmonico">
                  <DropdownMenuItem className="cursor-pointer gap-2.5">
                    <Piano className="h-4 w-4 text-muted-foreground" /> Campo Harmônico
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
