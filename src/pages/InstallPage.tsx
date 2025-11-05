import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Wifi, Zap, Check } from "lucide-react";
import rzdLogo from "@/assets/logo-rzd-final.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const features = [
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "Funciona Offline",
      description: "Acesse todos os acordes mesmo sem internet",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Rápido e Leve",
      description: "Carrega instantaneamente, como um app nativo",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Na Tela Inicial",
      description: "Acesso direto da sua tela inicial",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img src={rzdLogo} alt="RZD Music" className="h-24 w-auto" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Instale o RZD Acordes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Tenha acesso rápido e trabalhe offline
            </p>

            {isInstalled ? (
              <Card className="p-8 bg-success/10 border-success">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Check className="w-8 h-8 text-success" />
                  <h2 className="text-2xl font-bold text-success">App Instalado!</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  O RZD Acordes já está instalado no seu dispositivo.
                </p>
                <Button onClick={() => navigate("/")} size="lg">
                  Começar a usar
                </Button>
              </Card>
            ) : deferredPrompt ? (
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                <Button onClick={handleInstall} size="lg" className="mb-4">
                  <Download className="w-5 h-5 mr-2" />
                  Instalar Agora
                </Button>
                <p className="text-sm text-muted-foreground">
                  Clique para adicionar à sua tela inicial
                </p>
              </Card>
            ) : (
              <Card className="p-8">
                <h2 className="text-xl font-bold mb-4">Como Instalar</h2>
                <div className="text-left space-y-4 max-w-md mx-auto">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">iPhone/Safari</p>
                      <p className="text-sm text-muted-foreground">
                        Toque no ícone de compartilhar e depois em "Adicionar à Tela de Início"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Android/Chrome</p>
                      <p className="text-sm text-muted-foreground">
                        Toque no menu (três pontos) e depois em "Instalar aplicativo" ou "Adicionar à tela inicial"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Desktop</p>
                      <p className="text-sm text-muted-foreground">
                        Procure pelo ícone de instalação na barra de endereço do navegador
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <Card className="p-8 bg-accent/50">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Por que instalar?
            </h2>
            <ul className="space-y-4 max-w-2xl mx-auto">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Acesso instantâneo sem abrir o navegador</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Todos os recursos disponíveis offline</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Carregamento mais rápido que um site normal</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Interface limpa sem barras do navegador</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Atualizações automáticas em segundo plano</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
