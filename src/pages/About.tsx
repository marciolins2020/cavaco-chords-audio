import { Music2, Guitar, Zap, Heart } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import rzdLogo from "@/assets/logo-rzd-final.png";
import juninhoPhoto from "@/assets/juninho-rezende.png";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src={rzdLogo} 
              alt="RZD Music" 
              className="w-20 h-20 object-contain"
            />
            <h1 className="text-4xl md:text-5xl font-bold">Sobre o Projeto</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            O primeiro dicionário digital completo e interativo de acordes para cavaquinho
          </p>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Áudio em Tempo Real</h3>
            <p className="text-muted-foreground">
              Ouça cada acorde tocado com síntese de áudio profissional, simulando o som autêntico do cavaquinho
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Guitar className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">33+ Acordes</h3>
            <p className="text-muted-foreground">
              Coleção completa com variações, desde acordes básicos até tensões avançadas para jazz e bossa
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">100% Gratuito</h3>
            <p className="text-muted-foreground">
              Acesso completo e ilimitado a todos os recursos, sem mensalidades ou compras dentro do app
            </p>
          </Card>
        </section>

        {/* Mentor */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Music2 className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Mentoria Musical</h2>
            </div>
            
            <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
              {/* Foto do Juninho */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl">
                  <img 
                    src={juninhoPhoto}
                    alt="Juninho Rezende tocando cavaquinho"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-primary mb-1">
                    Juninho Rezende
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Músico Cavaquinista · Autor · Mentor
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Juninho Rezende</strong> é músico cavaquinista brasileiro 
                com vasta experiência no ensino do instrumento e presença digital consolidada através da 
                <strong className="text-primary"> RZD Music</strong>.
              </p>
              
              <p>
                Autor do renomado dicionário <strong className="text-foreground">"5000 Acordes para Cavaquinho"</strong>, 
                Juninho dedica sua carreira a tornar o aprendizado do cavaquinho acessível e prazeroso para músicos 
                de todos os níveis.
              </p>
              
              <p>
                Neste projeto, ele valida os voicings, aprova o conteúdo técnico e assina a curadoria completa 
                desta plataforma, garantindo a excelência e precisão de cada acorde apresentado.
              </p>
              
              <blockquote className="border-l-4 border-primary bg-primary/5 px-6 py-4 my-6 rounded-r-lg">
                <p className="italic text-lg text-foreground">
                  "Meu objetivo é levar o cavaquinho a todos, com clareza, dedicação e muito prazer musical."
                </p>
                <footer className="text-sm mt-2">— Juninho Rezende</footer>
              </blockquote>

                <div className="bg-card border border-border rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-foreground mb-2">Powered by RZD Music</h4>
                  <p className="text-sm">
                    Plataforma educacional dedicada ao ensino de cavaquinho, violão e teoria musical, 
                    com foco em samba, choro e música popular brasileira.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Technical Info */}
        <section className="max-w-3xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Especificações Técnicas</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Afinação</h3>
                <p className="text-muted-foreground">D-G-B-D (Ré-Sol-Si-Ré) - Padrão brasileiro</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Recursos</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Diagramas interativos com dedilhado</li>
                  <li>Múltiplas variações por acorde</li>
                  <li>Modo canhoto/destro</li>
                  <li>Sistema de favoritos com persistência</li>
                  <li>Busca rápida por nome</li>
                  <li>Indicadores de dificuldade</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tecnologia</h3>
                <p className="text-muted-foreground">
                  Desenvolvido com React, TypeScript e Tone.js para síntese de áudio em tempo real
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-border">
          <div className="flex flex-col items-center gap-2 mb-4">
            <img 
              src={rzdLogo} 
              alt="RZD Music" 
              className="w-14 h-14 object-contain opacity-90"
            />
            <p className="text-lg font-bold">
              Powered by <span className="text-primary">RZD Music</span>
            </p>
          </div>
          <p className="text-muted-foreground">
            © 2024 Dicionário de Acordes de Cavaquinho
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Mentoria: Juninho Rezende · Tecnologia: RedMaxx
          </p>
        </footer>
      </main>
    </div>
  );
};

export default About;
