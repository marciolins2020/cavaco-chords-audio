import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { ChatWidget } from "./components/ChatWidget";
import { InstallPrompt } from "./components/InstallPrompt";
import Index from "./pages/Index";
import ChordDetail from "./pages/ChordDetail";
import ChordIdentifier from "./pages/ChordIdentifier";
import Favorites from "./pages/Favorites";
import HarmonicFieldPage from "./pages/HarmonicFieldPage";
import PracticePage from "./pages/PracticePage";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import InstallPage from "./pages/InstallPage";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import TunerPage from "./pages/TunerPage";
import NotFound from "./pages/NotFound";
import DiagnosticsPage from "./pages/DiagnosticsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
              <Route path="/chord/:id" element={<RequireAuth><ChordDetail /></RequireAuth>} />
              <Route path="/identifier" element={<RequireAuth><ChordIdentifier /></RequireAuth>} />
              <Route path="/favoritos" element={<RequireAuth><Favorites /></RequireAuth>} />
              <Route path="/campo-harmonico" element={<RequireAuth><HarmonicFieldPage /></RequireAuth>} />
              <Route path="/pratica" element={<RequireAuth><PracticePage /></RequireAuth>} />
              <Route path="/sobre" element={<RequireAuth><About /></RequireAuth>} />
              <Route path="/instalar" element={<RequireAuth><InstallPage /></RequireAuth>} />
              <Route path="/perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/ranking" element={<RequireAuth><LeaderboardPage /></RequireAuth>} />
              <Route path="/afinador" element={<RequireAuth><TunerPage /></RequireAuth>} />
              <Route path="/diagnostico" element={<RequireAuth><DiagnosticsPage /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatWidget />
            <InstallPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
