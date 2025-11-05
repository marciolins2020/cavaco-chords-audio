import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/hooks/usePractice";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DataExport = () => {
  const { user } = useAuth();
  const { favorites, history } = useApp();
  const { stats, sessions } = usePractice(user?.id || "");

  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: user?.email,
        id: user?.id,
      },
      statistics: stats,
      practiceSessions: sessions,
      favorites,
      history,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rzd-data-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Dados exportados com sucesso!");
  };

  const exportToCSV = () => {
    const sessionArray = Object.values(sessions);
    
    if (sessionArray.length === 0) {
      toast.error("Nenhuma sessão de prática para exportar");
      return;
    }

    const headers = ["Data", "Acorde", "Tentativas", "Acertos", "Taxa de Sucesso", "Dominado"];
    const rows = sessionArray.map((session) => [
      new Date(session.lastPracticed).toLocaleDateString("pt-BR"),
      session.chordId,
      session.attempts,
      session.successes,
      `${((session.successes / session.attempts) * 100).toFixed(1)}%`,
      session.mastered ? "Sim" : "Não",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rzd-practice-sessions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Sessões exportadas em CSV!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar Dados
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON}>
          <Download className="w-4 h-4 mr-2" />
          Exportar JSON (completo)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV (sessões)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
