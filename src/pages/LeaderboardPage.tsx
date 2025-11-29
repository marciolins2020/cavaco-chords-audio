import { useState, createElement } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Flame, Music, Crown, Medal, Award, TrendingUp } from "lucide-react";
import { useLeaderboard, LeaderboardType } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<LeaderboardType>("total");
  const { entries, loading, myRank } = useLeaderboard(selectedType);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600 fill-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: "🥇 1º Lugar", variant: "default" as const, className: "bg-yellow-500 hover:bg-yellow-600" };
    if (rank === 2) return { text: "🥈 2º Lugar", variant: "secondary" as const, className: "" };
    if (rank === 3) return { text: "🥉 3º Lugar", variant: "secondary" as const, className: "bg-orange-600 hover:bg-orange-700" };
    return { text: `#${rank}`, variant: "outline" as const, className: "" };
  };

  const typeConfig = {
    total: { label: "XP Total", icon: Zap, key: "total_xp" as const },
    weekly: { label: "XP Semanal", icon: TrendingUp, key: "weekly_xp" as const },
    monthly: { label: "XP Mensal", icon: Trophy, key: "monthly_xp" as const },
    streak: { label: "Sequência", icon: Flame, key: "current_streak" as const },
  };

  const currentConfig = typeConfig[selectedType];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Ranking Global</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Compare seu progresso com outros músicos
          </p>
        </div>

        {/* My Rank Card */}
        {user && myRank && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(myRank)}
                  <div>
                    <p className="text-sm text-muted-foreground">Sua Posição</p>
                    <p className="text-2xl font-bold">
                      {myRank}º de {entries.length}
                    </p>
                  </div>
                </div>
                <Badge {...getRankBadge(myRank)} />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Type Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(Object.keys(typeConfig) as LeaderboardType[]).map((type) => {
            const config = typeConfig[type];
            const Icon = config.icon;
            return (
              <Button
                key={type}
                onClick={() => setSelectedType(type)}
                variant={selectedType === type ? "default" : "outline"}
                className="flex-1 min-w-[140px]"
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {createElement(currentConfig.icon, { className: "w-5 h-5 text-primary" })}
            <h3 className="text-xl font-semibold">Top 100 - {currentConfig.label}</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum músico no ranking ainda</p>
              <p className="text-sm mt-2">Seja o primeiro a praticar e aparecer aqui!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, index) => {
                  const isCurrentUser = user?.id === entry.user_id;
                  const rankBadge = getRankBadge(entry.rank || index + 1);
                  const value = entry[currentConfig.key];

                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                        isCurrentUser
                          ? "bg-primary/10 border-2 border-primary/30 shadow-lg"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      {/* Rank Icon */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(entry.rank || index + 1)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">
                            {entry.username || "Músico Anônimo"}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              Você
                            </Badge>
                          )}
                          {entry.rank && entry.rank <= 3 && (
                            <Badge {...rankBadge} className="text-xs" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {entry.chords_mastered} acordes
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {entry.current_streak} dias
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-bold text-lg">
                          {selectedType === "streak" ? (
                            <>
                              <Flame className="w-5 h-5 text-orange-500" />
                              {value}
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 text-primary fill-primary" />
                              {value.toLocaleString()}
                            </>
                          )}
                        </div>
                        {selectedType !== "streak" && (
                          <p className="text-xs text-muted-foreground">XP</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-muted/50 to-muted/20">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-primary mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Como funciona o ranking?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>XP Total:</strong> Soma de todo XP ganho desde o início</li>
                <li>• <strong>XP Semanal:</strong> XP ganho nos últimos 7 dias</li>
                <li>• <strong>XP Mensal:</strong> XP ganho nos últimos 30 dias</li>
                <li>• <strong>Sequência:</strong> Maior número de dias consecutivos praticando</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
