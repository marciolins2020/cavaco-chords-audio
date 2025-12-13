import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PitchDetector, CAVAQUINHO_STRINGS, findClosestString } from '@/lib/pitchDetection';
import { audioService } from '@/lib/audio';

const TunerPage = () => {
  const [isListening, setIsListening] = useState(false);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [closestString, setClosestString] = useState<ReturnType<typeof findClosestString> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const detectorRef = useRef<PitchDetector | null>(null);
  const animationRef = useRef<number | null>(null);

  const updatePitch = useCallback(() => {
    if (detectorRef.current?.listening) {
      const pitch = detectorRef.current.detectPitch();
      if (pitch && pitch > 100 && pitch < 1000) {
        setFrequency(pitch);
        setClosestString(findClosestString(pitch));
      }
      animationRef.current = requestAnimationFrame(updatePitch);
    }
  }, []);

  const startListening = async () => {
    setError(null);
    detectorRef.current = new PitchDetector();
    const success = await detectorRef.current.start();
    
    if (success) {
      setIsListening(true);
      animationRef.current = requestAnimationFrame(updatePitch);
    } else {
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    detectorRef.current?.stop();
    setIsListening(false);
    setFrequency(null);
    setClosestString(null);
  };

  const playReferenceNote = (freq: number) => {
    audioService.playReferenceNote(freq);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      detectorRef.current?.stop();
    };
  }, []);

  const getCentsIndicator = () => {
    if (!closestString) return null;
    const { cents, isInTune } = closestString;
    
    if (isInTune) {
      return (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-green-500 text-2xl font-bold"
        >
          ✓ Afinado!
        </motion.div>
      );
    }

    const direction = cents > 0 ? 'Alto' : 'Baixo';
    const color = Math.abs(cents) > 20 ? 'text-red-500' : 'text-yellow-500';
    
    return (
      <div className={`text-xl font-medium ${color}`}>
        {direction} ({cents > 0 ? '+' : ''}{cents.toFixed(0)} cents)
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Afinador de Cavaquinho
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Afinação D-G-B-D • Toque uma corda e ajuste até ficar verde
          </p>

          {/* Main Tuner Display */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-6">
                {/* Frequency Display */}
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-foreground">
                    {frequency ? `${frequency.toFixed(1)}` : '---'}
                  </div>
                  <div className="text-muted-foreground text-lg">Hz</div>
                </div>

                {/* Detected String */}
                {closestString && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary">
                      {closestString.string.name}
                    </div>
                    <div className="text-muted-foreground">
                      Alvo: {closestString.string.frequency.toFixed(2)} Hz
                    </div>
                  </motion.div>
                )}

                {/* Cents Indicator */}
                <div className="h-12 flex items-center justify-center">
                  {getCentsIndicator()}
                </div>

                {/* Visual Meter */}
                {closestString && (
                  <div className="w-full max-w-md">
                    <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div className="flex-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30" />
                      </div>
                      {/* Center marker */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-green-500 transform -translate-x-1/2" />
                      {/* Current position */}
                      <motion.div
                        className="absolute top-0 bottom-0 w-3 bg-foreground rounded-full shadow-lg"
                        animate={{
                          left: `${50 + Math.max(-50, Math.min(50, closestString.cents))}%`,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ transform: 'translateX(-50%)' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Baixo</span>
                      <span>Afinado</span>
                      <span>Alto</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Start/Stop Button */}
                <Button
                  onClick={isListening ? stopListening : startListening}
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  className="gap-2"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      Parar
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Iniciar Afinador
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reference Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notas de Referência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CAVAQUINHO_STRINGS.map((string) => (
                  <Button
                    key={string.note}
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-1"
                    onClick={() => playReferenceNote(string.frequency)}
                  >
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{string.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {string.frequency.toFixed(0)} Hz
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TunerPage;
