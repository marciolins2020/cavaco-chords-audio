import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Bell, TestTube } from "lucide-react";
import { useNotificationReminders } from "@/hooks/useNotificationReminders";
import { Badge } from "@/components/ui/badge";

const DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

export const ReminderSettings = () => {
  const {
    settings,
    permission,
    updateSettings,
    toggleReminder,
    testNotification,
  } = useNotificationReminders();

  const toggleDay = (day: number) => {
    const newDays = settings.days.includes(day)
      ? settings.days.filter((d) => d !== day)
      : [...settings.days, day].sort();
    updateSettings({ days: newDays });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Lembretes de Prática</h3>
      </div>

      <div className="space-y-6">
        {/* Status da permissão */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <p className="font-medium text-sm">Status das Notificações</p>
            <p className="text-xs text-muted-foreground mt-1">
              {permission === "granted"
                ? "Ativadas"
                : permission === "denied"
                ? "Bloqueadas pelo navegador"
                : "Não configuradas"}
            </p>
          </div>
          <Badge
            variant={permission === "granted" ? "default" : "secondary"}
          >
            {permission === "granted" ? "✓" : "○"}
          </Badge>
        </div>

        {/* Toggle principal */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="reminder-enabled">Ativar Lembretes</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Receba notificações para manter seu streak
            </p>
          </div>
          <Switch
            id="reminder-enabled"
            checked={settings.enabled}
            onCheckedChange={toggleReminder}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Horário */}
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Horário do Lembrete</Label>
              <Input
                id="reminder-time"
                type="time"
                value={settings.time}
                onChange={(e) => updateSettings({ time: e.target.value })}
                className="max-w-[200px]"
              />
            </div>

            {/* Dias da semana */}
            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <Button
                    key={day.value}
                    variant={
                      settings.days.includes(day.value) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleDay(day.value)}
                    className="w-14"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.days.length === 7
                  ? "Todos os dias"
                  : settings.days.length === 0
                  ? "Nenhum dia selecionado"
                  : `${settings.days.length} dias selecionados`}
              </p>
            </div>

            {/* Testar notificação */}
            <Button
              variant="outline"
              className="w-full"
              onClick={testNotification}
              disabled={permission !== "granted"}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Notificação
            </Button>
          </>
        )}

        {permission === "denied" && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            <p className="font-medium mb-1">Notificações Bloqueadas</p>
            <p className="text-xs">
              Para ativar, vá nas configurações do navegador e permita
              notificações para este site.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
