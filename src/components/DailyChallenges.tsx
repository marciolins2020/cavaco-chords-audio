import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Sparkles } from "lucide-react";
import { useDailyChallenges, DailyChallenge } from "@/hooks/useDailyChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Confetti = () => {
  const particles = Array.from({ length: 30 });
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${50 + (Math.random() - 0.5) * 20}%`,
            top: "50%",
            backgroundColor: [
              "hsl(var(--primary))",
              "hsl(var(--secondary))",
              "#FFD700",
              "#FF69B4",
              "#00CED1",
            ][Math.floor(Math.random() * 5)],
          }}
          initial={{ scale: 0, y: 0, x: 0 }}
          animate={{
            scale: [0, 1, 0],
            y: [0, (Math.random() - 0.5) * 200],
            x: [(Math.random() - 0.5) * 300],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

const ChallengeCard = ({ challenge }: { challenge: DailyChallenge }) => {
  const progress = (challenge.current_progress / challenge.target_value) * 100;
  const [justCompleted, setJustCompleted] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(challenge.completed);

  useEffect(() => {
    if (challenge.completed && !prevCompleted) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2000);
    }
    setPrevCompleted(challenge.completed);
  }, [challenge.completed, prevCompleted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card
        className={`p-4 transition-all relative overflow-hidden ${
          challenge.completed
            ? "bg-primary/5 border-primary/30 shadow-lg"
            : "hover:shadow-md"
        }`}
      >
        <AnimatePresence>
          {justCompleted && <Confetti />}
        </AnimatePresence>
        <div className="flex items-start gap-3">
          <motion.div
            className="text-4xl"
            animate={
              challenge.completed
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            {challenge.icon}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-sm mb-1">{challenge.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
              {challenge.completed && (
                <Badge variant="default" className="bg-primary">
                  ✓
                </Badge>
              )}
              {challenge.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="ml-2"
                >
                  <Sparkles className="w-4 h-4 text-primary fill-primary" />
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {challenge.current_progress} / {challenge.target_value}
                </span>
                <div className="flex items-center gap-1 text-yellow-600 font-medium">
                  <Zap className="w-3 h-3 fill-yellow-600" />
                  <span>+{challenge.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {challenge.completed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none rounded-lg"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export const DailyChallenges = () => {
  const { user } = useAuth();
  const { challenges, loading } = useDailyChallenges(user?.id);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.completed ? c.xp_reward : 0), 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Desafios Diários</h3>
          {completedCount > 0 && (
            <Badge variant="secondary">
              {completedCount}/{challenges.length}
            </Badge>
          )}
        </div>
        {totalXP > 0 && (
          <div className="flex items-center gap-1 text-yellow-600 font-semibold">
            <Zap className="w-5 h-5 fill-yellow-600" />
            <span>+{totalXP} XP</span>
          </div>
        )}
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum desafio disponível</p>
          <p className="text-sm mt-1">Volte amanhã para novos desafios!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ChallengeCard challenge={challenge} />
            </motion.div>
          ))}
        </div>
      )}

      {completedCount === challenges.length && challenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 text-center"
        >
          <p className="font-semibold text-primary mb-1">
            🎉 Todos os desafios completos!
          </p>
          <p className="text-sm text-muted-foreground">
            Você ganhou {totalXP} XP hoje. Volte amanhã para novos desafios!
          </p>
        </motion.div>
      )}
    </Card>
  );
};
