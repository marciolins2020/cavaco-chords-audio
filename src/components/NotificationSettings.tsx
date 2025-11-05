import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, BellOff, TestTube } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Input } from "@/components/ui/input";

export function NotificationSettings() {
  const { settings, permission, updateSettings, requestPermission, testNotification } = useNotifications();

  const handleEnableChange = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }
    updateSettings({ enabled });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <Bell className="w-5 h-5 text-primary" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              <h3 className="text-lg font-semibold">Lembretes de Prática</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Receba notificações para lembrar de praticar
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleEnableChange}
          />
        </div>

        {settings.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="notification-time">Horário</Label>
              <Select
                value={settings.time}
                onValueChange={(value) =>
                  updateSettings({ time: value as typeof settings.time })
                }
              >
                <SelectTrigger id="notification-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã (09:00)</SelectItem>
                  <SelectItem value="afternoon">Tarde (14:00)</SelectItem>
                  <SelectItem value="evening">Noite (19:00)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {settings.time === "custom" && (
                <Input
                  type="time"
                  value={settings.customTime || "19:00"}
                  onChange={(e) =>
                    updateSettings({ customTime: e.target.value })
                  }
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-frequency">Frequência</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value) =>
                  updateSettings({ frequency: value as typeof settings.frequency })
                }
              >
                <SelectTrigger id="notification-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Todos os dias</SelectItem>
                  <SelectItem value="weekdays">Dias úteis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={testNotification}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Enviar notificação de teste
            </Button>
          </div>
        )}

        {permission === "denied" && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <p className="font-medium mb-1">Notificações bloqueadas</p>
            <p className="text-xs">
              Para receber lembretes, habilite as notificações nas configurações do seu navegador.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
