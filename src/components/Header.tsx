import { Guitar, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { leftHanded, setLeftHanded } = useApp();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Guitar className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold leading-tight">
                Acordes de Cavaquinho
              </h1>
              <p className="text-xs text-muted-foreground">RZD Music</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={leftHanded ? "default" : "outline"}
              size="sm"
              onClick={() => setLeftHanded(!leftHanded)}
              className="transition-all"
            >
              <Hand className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {leftHanded ? "Canhoto" : "Destro"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
