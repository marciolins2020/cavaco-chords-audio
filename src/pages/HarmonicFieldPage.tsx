import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HarmonicField } from "@/components/HarmonicField";
import { Card } from "@/components/ui/card";
import { Music2 } from "lucide-react";

export default function HarmonicFieldPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Campo Harmônico</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore os campos harmônicos das principais tonalidades e aprenda progressões famosas de samba, choro e pagode
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-xl font-bold mb-3">O que é Campo Harmônico?</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                O campo harmônico é o conjunto de acordes formados a partir das notas de uma escala.
                Cada grau da escala gera um acorde com função harmônica específica.
              </p>
              <div className="grid md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-background rounded-lg">
                  <div className="font-bold text-foreground mb-1">Tônica (I)</div>
                  <p className="text-xs">Repouso e estabilidade</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <div className="font-bold text-foreground mb-1">Subdominante (IV)</div>
                  <p className="text-xs">Afastamento suave</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <div className="font-bold text-foreground mb-1">Dominante (V)</div>
                  <p className="text-xs">Tensão e resolução</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <div className="font-bold text-foreground mb-1">Preparação</div>
                  <p className="text-xs">Acordes auxiliares</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Harmonic Field Component */}
          <HarmonicField />

          {/* Tips */}
          <Card className="p-6 mt-8 bg-accent/50">
            <h3 className="font-bold mb-3">💡 Dicas do Professor Juninho:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>
                <strong>Comece pelo tom de C:</strong> É o mais fácil para entender as relações harmônicas
              </li>
              <li>
                <strong>Pratique as progressões básicas:</strong> Elas aparecem em 90% das músicas brasileiras
              </li>
              <li>
                <strong>Observe as funções:</strong> Tônica → Preparação → Subdominante → Dominante → Tônica
              </li>
              <li>
                <strong>Transponha para outros tons:</strong> Use o mesmo padrão em diferentes tonalidades
              </li>
              <li>
                <strong>Ouça as progressões:</strong> Clique em "Tocar Progressão" para memorizar os sons
              </li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
