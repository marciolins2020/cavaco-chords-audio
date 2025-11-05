import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { ChatWidget } from "./components/ChatWidget";
import Index from "./pages/Index";
import ChordDetail from "./pages/ChordDetail";
import ChordIdentifier from "./pages/ChordIdentifier";
import Favorites from "./pages/Favorites";
import HarmonicFieldPage from "./pages/HarmonicFieldPage";
import PracticePage from "./pages/PracticePage";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chord/:id" element={<ChordDetail />} />
            <Route path="/identifier" element={<ChordIdentifier />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/campo-harmonico" element={<HarmonicFieldPage />} />
            <Route path="/pratica" element={<PracticePage />} />
            <Route path="/sobre" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ChatWidget />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
