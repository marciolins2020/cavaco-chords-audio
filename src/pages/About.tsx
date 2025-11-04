import { Music2, Guitar, Heart, Zap } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Guitar className="w-12 h-12 text-primary" />
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
        <section className="max-w-3xl mx-auto mb-16">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Music2 className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Mentoria Musical</h2>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Juninho Rezende - RZD Music
              </h3>
            </div>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Músico cavaquinista brasileiro, autor do dicionário "5000 acordes para cavaquinho". 
                Com forte atuação no ensino do instrumento e presença digital consolidada através da 
                RZD Music, Juninho valida os voicings, aprova o conteúdo técnico e assina a curadoria 
                desta plataforma.
              </p>
              
              <blockquote className="border-l-4 border-primary pl-4 py-2 italic text-lg">
                "Meu objetivo é levar o cavaquinho a todos, com clareza e prazer."
              </blockquote>
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
          <p className="text-muted-foreground">
            © 2024 Dicionário de Acordes de Cavaquinho - RZD Music
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os direitos reservados
          </p>
        </footer>
      </main>
    </div>
  );
};

export default About;
