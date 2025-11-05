import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PracticeSession } from "@/types/practice";
import { TrendingUp } from "lucide-react";
import { format, subDays, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProgressEvolutionProps {
  sessions: Record<string, PracticeSession>;
}

export const ProgressEvolution = ({ sessions }: ProgressEvolutionProps) => {
  const sessionArray = Object.values(sessions);

  // Dados semanais (últimas 4 semanas)
  const getWeeklyData = () => {
    const weeks = eachWeekOfInterval({
      start: subWeeks(new Date(), 3),
      end: new Date(),
    }, { weekStartsOn: 0 });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const weekSessions = sessionArray.filter((s) => {
        const date = new Date(s.lastPracticed);
        return date >= weekStart && date <= weekEnd;
      });

      const totalAttempts = weekSessions.reduce((sum, s) => sum + s.attempts, 0);
      const totalSuccesses = weekSessions.reduce((sum, s) => sum + s.successes, 0);
      const successRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;

      return {
        week: format(weekStart, "dd/MMM", { locale: ptBR }),
        tentativas: totalAttempts,
        acertos: totalSuccesses,
        taxa: parseFloat(successRate.toFixed(1)),
        acordesPraticados: new Set(weekSessions.map(s => s.chordId)).size,
      };
    });
  };

  // Dados mensais (últimos 30 dias)
  const getMonthlyData = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return days.map((day) => {
      const daySessions = sessionArray.filter((s) => {
        const sessionDate = new Date(s.lastPracticed);
        return format(sessionDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });

      const totalAttempts = daySessions.reduce((sum, s) => sum + s.attempts, 0);
      const totalSuccesses = daySessions.reduce((sum, s) => sum + s.successes, 0);
      const successRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;

      return {
        dia: format(day, "dd/MM", { locale: ptBR }),
        tentativas: totalAttempts,
        acertos: totalSuccesses,
        taxa: parseFloat(successRate.toFixed(1)),
        acordesPraticados: new Set(daySessions.map(s => s.chordId)).size,
      };
    });
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  // Comparação entre períodos
  const getComparison = (data: any[]) => {
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.taxa, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.taxa, 0) / secondHalf.length;
    const improvement = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;

    return {
      improvement: improvement.toFixed(1),
      trend: improvement > 0 ? "positiva" : improvement < 0 ? "negativa" : "estável",
    };
  };

  const weeklyComparison = getComparison(weeklyData);
  const monthlyComparison = getComparison(monthlyData);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Evolução do Progresso</h3>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Tendência</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                weeklyComparison.trend === "positiva" ? "text-green-600" : 
                weeklyComparison.trend === "negativa" ? "text-red-600" : "text-muted-foreground"
              }`}>
                {weeklyComparison.trend === "positiva" ? "↑" : weeklyComparison.trend === "negativa" ? "↓" : "→"}
                {" "}{Math.abs(parseFloat(weeklyComparison.improvement))}%
              </span>
              <span className="text-xs text-muted-foreground">vs. período anterior</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="taxa" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Taxa de Acerto (%)"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="acordesPraticados" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Acordes Praticados"
                dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Tendência</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                monthlyComparison.trend === "positiva" ? "text-green-600" : 
                monthlyComparison.trend === "negativa" ? "text-red-600" : "text-muted-foreground"
              }`}>
                {monthlyComparison.trend === "positiva" ? "↑" : monthlyComparison.trend === "negativa" ? "↓" : "→"}
                {" "}{Math.abs(parseFloat(monthlyComparison.improvement))}%
              </span>
              <span className="text-xs text-muted-foreground">vs. período anterior</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="dia" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="taxa" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Taxa de Acerto (%)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="tentativas" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="Tentativas Totais"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
