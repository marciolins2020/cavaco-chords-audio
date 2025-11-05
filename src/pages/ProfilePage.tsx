import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/hooks/usePractice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ACHIEVEMENTS, getLevelInfo } from "@/utils/achievements";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { User, Trophy, Target, Calendar, Zap, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

export default function ProfilePage() {
  const { user } = useAuth();
  const { stats, sessions } = usePractice(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Entre para ver seu perfil</h2>
            <p className="text-muted-foreground mb-6">
              Faça login para acessar suas estatísticas e conquistas
            </p>
            <Link to="/auth">
              <Button size="lg">Fazer Login</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(stats);
  const successRate = stats.totalAttempts > 0 
    ? ((stats.totalSuccesses / stats.totalAttempts) * 100).toFixed(1)
    : "0";

  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    stats.achievements.includes(a.id)
  );

  const chartData = [
    { name: "Tentativas", value: stats.totalAttempts },
    { name: "Acertos", value: stats.totalSuccesses },
    { name: "Dominados", value: stats.chordsMastered.length },
  ];

  const pieData = [
    { name: "Acertos", value: stats.totalSuccesses },
    { name: "Erros", value: stats.totalAttempts - stats.totalSuccesses },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"];

  // Histórico recente de prática
  const recentSessions = Object.values(sessions)
    .sort((a, b) => b.lastPracticed.getTime() - a.lastPracticed.getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header do Perfil */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user.user_metadata?.full_name || "Músico"}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-sm">
                    {levelInfo.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.chordsMastered.length} acordes dominados
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progresso do Nível */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Progresso de Nível</span>
              <span className="text-muted-foreground">{levelInfo.progress.toFixed(0)}%</span>
            </div>
            <Progress value={levelInfo.progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {levelInfo.nextMilestone}
            </p>
          </div>
        </Card>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.consecutiveDays}</p>
                <p className="text-xs text-muted-foreground">Dias Seguidos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.fastestTransition 
                    ? (stats.fastestTransition / 1000).toFixed(1) + "s"
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground">Mais Rápido</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.achievements.length}</p>
                <p className="text-xs text-muted-foreground">Conquistas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estatísticas Gerais
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Acertos vs Erros
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Conquistas */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Conquistas ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = stats.achievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    unlocked
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30 border-border opacity-50"
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className="font-semibold text-sm mb-1">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                  {unlocked && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Desbloqueado
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Histórico Recente */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico de Prática</h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.chordId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold">
                      {session.chordId}
                    </div>
                    <div>
                      <p className="font-medium">{session.chordId}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.successes}/{session.attempts} acertos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.mastered && (
                      <Badge variant="default" className="mb-1">Dominado</Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.lastPracticed).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma prática registrada ainda</p>
              <Link to="/pratica">
                <Button variant="outline" className="mt-4">
                  Começar a Praticar
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
