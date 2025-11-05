import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Award, Snowflake } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  freezeCount: number;
  dailyLogs: Array<{
    practice_date: string;
    sessions_count: number;
    total_attempts: number;
  }>;
  onUseFreeze: () => void;
}

export const StreakCalendar = ({
  currentStreak,
  longestStreak,
  totalDays,
  freezeCount,
  dailyLogs,
  onUseFreeze,
}: StreakCalendarProps) => {
  const getHeatmapData = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const log = dailyLogs.find(l => l.practice_date === dateStr);
      days.push({
        date: dateStr,
        count: log ? log.sessions_count : 0,
        attempts: log ? log.total_attempts : 0,
      });
    }
    
    return days;
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/20";
    if (count <= 2) return "bg-primary/30";
    if (count <= 5) return "bg-primary/60";
    return "bg-primary";
  };

  const getMilestonesBadges = () => {
    const milestones = [
      { days: 7, emoji: "🌟", label: "Semana" },
      { days: 30, emoji: "💎", label: "Mês" },
      { days: 100, emoji: "🏆", label: "100 Dias" },
      { days: 365, emoji: "👑", label: "1 Ano" },
    ];

    return milestones.filter(m => longestStreak >= m.days);
  };

  const heatmapData = getHeatmapData();
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Sequência de Prática
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">Dias Seguidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{longestStreak}</div>
                <div className="text-xs text-muted-foreground">Recorde</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{totalDays}</div>
                <div className="text-xs text-muted-foreground">Total de Dias</div>
              </div>
            </div>
          </div>

          {freezeCount > 0 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onUseFreeze}
                className="gap-2"
              >
                <Snowflake className="w-4 h-4" />
                Usar Congelamento ({freezeCount})
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Preserve seu streak
              </p>
            </div>
          )}
        </div>

        {/* Badges de Milestones */}
        {getMilestonesBadges().length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Award className="w-5 h-5 text-muted-foreground" />
            {getMilestonesBadges().map((milestone) => (
              <Badge key={milestone.days} variant="secondary" className="gap-1">
                <span>{milestone.emoji}</span>
                <span>{milestone.label}</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Heatmap Calendar */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <TooltipProvider key={dayIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary ${getIntensityClass(day.count)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-semibold">
                            {new Date(day.date).toLocaleDateString("pt-BR")}
                          </div>
                          <div className="text-muted-foreground">
                            {day.count === 0
                              ? "Sem prática"
                              : `${day.count} sessões • ${day.attempts} tentativas`}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span>Mais</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
