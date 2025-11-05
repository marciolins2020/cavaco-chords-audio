import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Star, Zap } from "lucide-react";

interface LevelProgressProps {
  level: string;
  progress: number;
  nextMilestone: string;
  totalXP: number;
  nextLevelXP: number;
}

const levelIcons: Record<string, string> = {
  "Iniciante": "🎸",
  "Aprendiz": "🎵",
  "Intermediário": "🎼",
  "Avançado": "🎹",
  "Profissional": "🏆",
  "Mestre": "👑",
};

const levelColors: Record<string, string> = {
  "Iniciante": "from-green-500 to-emerald-500",
  "Aprendiz": "from-blue-500 to-cyan-500",
  "Intermediário": "from-purple-500 to-pink-500",
  "Avançado": "from-orange-500 to-red-500",
  "Profissional": "from-yellow-500 to-amber-500",
  "Mestre": "from-gradient-start to-gradient-end",
};

export const LevelProgress = ({
  level,
  progress,
  nextMilestone,
  totalXP,
  nextLevelXP,
}: LevelProgressProps) => {
  const levelNumber = ["Iniciante", "Aprendiz", "Intermediário", "Avançado", "Profissional", "Mestre"].indexOf(level) + 1;
  
  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${levelColors[level] || "from-primary to-primary/50"} opacity-10`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-background to-muted flex items-center justify-center text-5xl border-4 border-primary/20 shadow-lg"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {levelIcons[level] || "🎸"}
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{level}</h3>
                <Badge variant="secondary" className="text-sm">
                  Nível {levelNumber}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{totalXP} XP</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>{nextLevelXP - totalXP} XP para próximo nível</span>
                </div>
              </div>
            </div>
          </div>
          
          <Trophy className="w-8 h-8 text-primary/30" />
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progresso</span>
            <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
          </div>
          
          <div className="relative">
            <Progress value={progress} className="h-4" />
            {progress > 50 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-4 rounded-full"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">{nextMilestone}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-primary">{totalXP}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-primary">{levelNumber}</div>
            <div className="text-xs text-muted-foreground">Nível Atual</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-primary">{progress.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Progresso</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
