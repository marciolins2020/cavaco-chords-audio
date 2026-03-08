import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "rzd-onboarding-done";

const STEPS = [
  {
    title: "Bem-vindo ao RZD Music!",
    description: "Seu dicionário completo de acordes de cavaquinho, com diagramas profissionais, áudio e inteligência artificial.",
  },
  {
    title: "Explore os Acordes",
    description: "Navegue por tônicas e variações. Toque cada acorde em modo Strum ou Block direto no navegador.",
  },
  {
    title: "Modo Prática",
    description: "Treine transições de acordes, ganhe XP e suba no ranking. Desafios diários mantêm sua evolução.",
  },
  {
    title: "Afinador Integrado",
    description: "Afine seu cavaquinho usando o microfone do celular. Detecção precisa em tempo real.",
  },
  {
    title: "Favoritos e RedData A.I.",
    description: "Salve seus acordes favoritos e pergunte qualquer dúvida ao assistente RedData no canto da tela.",
  },
];

export const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto"
            style={{ background: "hsl(0 0% 0% / 0.6)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) finish(); }}
          >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl border border-border/20 bg-card p-8 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={finish}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-sm font-bold"
            >
              ✕
            </button>

            {/* Progress bar */}
            <div className="h-1 w-full rounded-full bg-muted mb-8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Step number */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="h-16 w-16 rounded-2xl flex items-center justify-center bg-primary/10 border-2 border-primary/20"
              >
                <span className="text-2xl font-bold text-primary">{step + 1}</span>
              </motion.div>
            </div>

            {/* Content */}
            <motion.div
              key={`text-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold mb-3 text-foreground">{current.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{current.description}</p>
            </motion.div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={finish}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pular tour
              </button>
              <Button onClick={next}>
                {step === STEPS.length - 1 ? "Começar!" : "Próximo"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
