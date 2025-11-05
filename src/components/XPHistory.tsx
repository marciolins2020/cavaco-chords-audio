import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Award, Target, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface XPEvent {
  date: string;
  xp: number;
  type: "challenge" | "achievement" | "practice";
  description: string;
  icon: string;
}

interface XPHistoryProps {
  userId: string;
  totalXP: number;
}

export const XPHistory = ({ userId, totalXP }: XPHistoryProps) => {
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [chartData, setChartData] = useState<{ date: string; xp: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    loadXPHistory();
  }, [userId, timeRange]);

  const loadXPHistory = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const now = new Date();
      let startDate = new Date();

      if (timeRange === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate.setDate(now.getDate() - 90); // 3 meses para "all"
      }

      const xpEvents: XPEvent[] = [];

      // Buscar desafios completados
      const { data: challenges } = await supabase
        .from("daily_challenges" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("updated_at", startDate.toISOString())
        .order("updated_at", { ascending: true });

      if (challenges) {
        challenges.forEach((challenge: any) => {
          xpEvents.push({
            date: new Date(challenge.updated_at).toISOString().split("T")[0],
            xp: challenge.xp_reward,
            type: "challenge",
            description: challenge.title,
            icon: challenge.icon,
          });
        });
      }

      // Buscar prática diária (estimativa de XP por prática)
      const { data: practiceLogs } = await supabase
        .from("daily_practice_log")
        .select("*")
        .eq("user_id", userId)
        .gte("practice_date", startDate.toISOString().split("T")[0])
        .order("practice_date", { ascending: true });

      if (practiceLogs) {
        practiceLogs.forEach((log: any) => {
          const practiceXP = (log.chords_practiced?.length || 0) * 10;
          if (practiceXP > 0) {
            xpEvents.push({
              date: log.practice_date,
              xp: practiceXP,
              type: "practice",
              description: `${log.chords_practiced?.length || 0} acordes praticados`,
              icon: "🎸",
            });
          }
        });
      }

      // Ordenar eventos por data
      xpEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Criar dados acumulados para o gráfico
      let cumulativeXP = 0;
      const dailyXP = new Map<string, number>();

      xpEvents.forEach((event) => {
        const current = dailyXP.get(event.date) || 0;
        dailyXP.set(event.date, current + event.xp);
      });

      const chartPoints: { date: string; xp: number }[] = [];
      const sortedDates = Array.from(dailyXP.keys()).sort();

      sortedDates.forEach((date) => {
        cumulativeXP += dailyXP.get(date) || 0;
        chartPoints.push({
          date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          xp: cumulativeXP,
        });
      });

      setEvents(xpEvents.slice(-10)); // Últimos 10 eventos
      setChartData(chartPoints);
    } catch (error) {
      console.error("Erro ao carregar histórico de XP:", error);
    } finally {
      setLoading(false);
    }
  };

  const getXPRank = (xp: number): { rank: string; color: string; nextRank: number } => {
    if (xp >= 10000) return { rank: "Lenda", color: "text-purple-500", nextRank: 0 };
    if (xp >= 5000) return { rank: "Mestre", color: "text-yellow-500", nextRank: 10000 };
    if (xp >= 2000) return { rank: "Expert", color: "text-blue-500", nextRank: 5000 };
    if (xp >= 1000) return { rank: "Avançado", color: "text-green-500", nextRank: 2000 };
    if (xp >= 500) return { rank: "Intermediário", color: "text-orange-500", nextRank: 1000 };
    return { rank: "Iniciante", color: "text-gray-500", nextRank: 500 };
  };

  const rankInfo = getXPRank(totalXP);
  const progressToNextRank = rankInfo.nextRank > 0 
    ? ((totalXP % rankInfo.nextRank) / rankInfo.nextRank) * 100 
    : 100;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Evolução de XP</h3>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {range === "week" ? "7 dias" : range === "month" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>
      </div>

      {/* Rank e Total XP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">XP Total</span>
            <Zap className="w-5 h-5 text-primary fill-primary" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{totalXP.toLocaleString()}</div>
          <Badge variant="secondary" className={rankInfo.color}>
            {rankInfo.rank}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Próximo Rank</span>
            <Award className="w-5 h-5 text-secondary" />
          </div>
          {rankInfo.nextRank > 0 ? (
            <>
              <div className="text-2xl font-bold mb-2">
                {rankInfo.nextRank - totalXP} XP
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextRank}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </>
          ) : (
            <div className="text-xl font-bold text-purple-500">
              🏆 Rank Máximo Alcançado!
            </div>
          )}
        </motion.div>
      </div>

      {/* Gráfico */}
      {chartData.length > 0 ? (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value} XP`, "Total"]}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#xpGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum dado de XP para este período</p>
          <p className="text-sm mt-1">Complete desafios para ver sua evolução!</p>
        </div>
      )}

      {/* Timeline de Eventos */}
      {events.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Atividades Recentes
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="text-2xl">{event.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{event.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <Badge 
                  variant={event.type === "challenge" ? "default" : "secondary"}
                  className="gap-1"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  +{event.xp}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
