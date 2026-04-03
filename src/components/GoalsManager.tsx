import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Pause, Trash2, Plus } from "lucide-react";

import { useGoals, PracticeGoal } from "@/hooks/useGoals";

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const goalTypeLabels = {
  daily_chords: "Acordes por dia",
  weekly_chords: "Acordes por semana",
  daily_time: "Minutos por dia",
  weekly_sessions: "Sessões por semana",
};

export const GoalsManager = () => {
  const { goals, loading, createGoal, deleteGoal, toggleGoalActive } = useGoals("local");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoalType, setNewGoalType] = useState<PracticeGoal["goal_type"]>("daily_chords");
  const [targetValue, setTargetValue] = useState("5");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");

  const handleCreateGoal = async () => {
    const value = parseInt(targetValue);
    if (isNaN(value) || value <= 0) return;
    const end = hasEndDate && endDate ? new Date(endDate) : undefined;
    await createGoal(newGoalType, value, end);
    setIsDialogOpen(false);
    setTargetValue("5");
    setEndDate("");
    setHasEndDate(false);
  };

  const getGoalProgress = (goal: PracticeGoal) => Math.min((goal.current_value / goal.target_value) * 100, 100);

  const activeGoals = goals.filter((g) => g.is_active && !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Metas de Prática</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
              <DialogDescription>Defina uma meta de prática para manter sua disciplina</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tipo de Meta</Label>
                <Select value={newGoalType} onValueChange={(v) => setNewGoalType(v as PracticeGoal["goal_type"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} min="1" placeholder="Ex: 5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={hasEndDate} onChange={(e) => setHasEndDate(e.target.checked)} className="rounded" />
                  <Label>Definir data final (opcional)</Label>
                </div>
                {hasEndDate && (
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                )}
              </div>
              <Button onClick={handleCreateGoal} className="w-full">Criar Meta</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma meta criada ainda</p>
          <p className="text-sm mt-1">Crie uma meta para começar a acompanhar seu progresso</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Metas Ativas</h4>
              {activeGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{goalTypeLabels[goal.goal_type]}</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {goal.current_value} / {goal.target_value}
                        {goal.end_date && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            até {format(new Date(goal.end_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleGoalActive(goal.id, false)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={getGoalProgress(goal)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2 text-right">{getGoalProgress(goal).toFixed(0)}% completo</p>
                </div>
              ))}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Metas Concluídas</h4>
              {completedGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold">{goalTypeLabels[goal.goal_type]}</h5>
                        <Badge variant="secondary" className="ml-2">Concluída</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Completado em {format(new Date(goal.completed_at!), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
