import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
}

const STORAGE_KEY = "rzd_reminder_settings";

export const useNotificationReminders = () => {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.enabled) {
      scheduleReminder();
    }
  }, [settings]);

  function getDefaultSettings(): ReminderSettings {
    return {
      enabled: false,
      time: "20:00",
      days: [0, 1, 2, 3, 4, 5, 6], // Todos os dias
    };
  }

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notificações não são suportadas neste navegador");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Notificações ativadas!");
      return true;
    } else {
      toast.error("Permissão de notificações negada");
      return false;
    }
  };

  const scheduleReminder = () => {
    if (!settings.enabled || permission !== "granted") return;

    const now = new Date();
    const [hours, minutes] = settings.time.split(":").map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agendar para amanhã
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeout = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      const today = now.getDay();
      if (settings.days.includes(today)) {
        showNotification();
      }
      // Reagendar para o próximo dia
      scheduleReminder();
    }, timeout);
  };

  const showNotification = () => {
    if (typeof Notification === "undefined" || permission !== "granted") return;

    const notification = new Notification("Hora de Praticar!", {
      body: "Não quebre seu streak! Pratique alguns acordes hoje.",
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: "practice-reminder",
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-fechar após 10 segundos
    setTimeout(() => notification.close(), 10000);
  };

  const updateSettings = (newSettings: Partial<ReminderSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const toggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;
    }
    updateSettings({ enabled });
  };

  const testNotification = () => {
    if (permission !== "granted") {
      toast.error("Permissão de notificação necessária");
      return;
    }
    showNotification();
  };

  return {
    settings,
    permission,
    updateSettings,
    toggleReminder,
    requestPermission,
    testNotification,
  };
};
