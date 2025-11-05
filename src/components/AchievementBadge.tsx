import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity?: "common" | "rare" | "epic" | "legendary";
  category?: string;
}

const rarityColors = {
  common: "border-gray-400 bg-gray-50/50",
  rare: "border-blue-500 bg-blue-50/50",
  epic: "border-purple-500 bg-purple-50/50",
  legendary: "border-yellow-500 bg-yellow-50/50 shadow-lg",
};

const rarityLabels = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export const AchievementBadge = ({
  name,
  description,
  icon,
  unlocked,
  unlockedAt,
  rarity = "common",
  category,
}: AchievementBadgeProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: unlocked ? 1.05 : 1 }}
          whileTap={{ scale: unlocked ? 0.95 : 1 }}
          className="cursor-pointer"
        >
          <Card
            className={`p-4 text-center transition-all relative overflow-hidden ${
              unlocked
                ? rarityColors[rarity]
                : "bg-muted/30 border-border opacity-50 grayscale"
            }`}
          >
            {unlocked && rarity === "legendary" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}

            <div className="relative">
              <motion.div
                className="text-5xl mb-2"
                animate={
                  unlocked
                    ? {
                        rotate: [0, -10, 10, -10, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                {unlocked ? icon : <Lock className="w-12 h-12 mx-auto text-muted-foreground" />}
              </motion.div>

              <p className="font-semibold text-sm mb-1 line-clamp-1">{name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {unlocked ? description : "???"}
              </p>

              {unlocked && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    rarity === "legendary"
                      ? "bg-yellow-500/20 text-yellow-700"
                      : rarity === "epic"
                      ? "bg-purple-500/20 text-purple-700"
                      : rarity === "rare"
                      ? "bg-blue-500/20 text-blue-700"
                      : ""
                  }`}
                >
                  {rarityLabels[rarity]}
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-5xl">{unlocked ? icon : "🔒"}</span>
            <div>
              <div className="text-xl">{name}</div>
              {unlocked && (
                <Badge
                  variant="secondary"
                  className={`mt-1 ${
                    rarity === "legendary"
                      ? "bg-yellow-500/20 text-yellow-700"
                      : rarity === "epic"
                      ? "bg-purple-500/20 text-purple-700"
                      : rarity === "rare"
                      ? "bg-blue-500/20 text-blue-700"
                      : ""
                  }`}
                >
                  {rarityLabels[rarity]}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p className="text-sm">{unlocked ? description : "Continue praticando para desbloquear esta conquista!"}</p>

            {category && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{category}</Badge>
              </div>
            )}

            {unlocked && unlockedAt && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Desbloqueado em:</p>
                <p className="text-muted-foreground">
                  {new Date(unlockedAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {!unlocked && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-center">
                <p className="text-muted-foreground">
                  Continue praticando para desbloquear!
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
