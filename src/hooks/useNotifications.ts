import { useState, useEffect } from "react";
import { toast } from "sonner";

export type NotificationTime = "morning" | "afternoon" | "evening" | "custom";

interface NotificationSettings {
  enabled: boolean;
  time: NotificationTime;
  customTime?: string;
  frequency: "daily" | "weekdays" | "custom";
  customDays?: number[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "evening",
  frequency: "daily",
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("rzd_notifications");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("rzd_notifications", JSON.stringify(settings));
    
    if (settings.enabled) {
      scheduleNotifications();
    }
  }, [settings]);

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast.error("Seu navegador não suporta notificações");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Notificações ativadas!");
      return true;
    } else {
      toast.error("Permissão negada para notificações");
      return false;
    }
  };

  const scheduleNotifications = () => {
    // Limpar notificações agendadas anteriores
    const existingTimeout = localStorage.getItem("rzd_notification_timeout");
    if (existingTimeout) {
      clearTimeout(Number(existingTimeout));
    }

    if (!settings.enabled || permission !== "granted") return;

    const timeMap = {
      morning: "09:00",
      afternoon: "14:00",
      evening: "19:00",
      custom: settings.customTime || "19:00",
    };

    const targetTime = timeMap[settings.time];
    const [hours, minutes] = targetTime.split(":").map(Number);

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      sendNotification();
      // Reagendar para o próximo dia
      scheduleNotifications();
    }, delay);

    localStorage.setItem("rzd_notification_timeout", String(timeoutId));
  };

  const sendNotification = () => {
    if (permission !== "granted") return;

    const messages = [
      "Hora de praticar seus acordes! 🎸",
      "Que tal tocar um pouquinho? 🎵",
      "Seus dedos estão com saudade do cavaquinho! 🎼",
      "Pratique 10 minutos hoje e veja seu progresso! 🌟",
      "O cavaquinho está te esperando! 🎶",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    const notification = new Notification("RZD Acordes", {
      body: message,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: "practice-reminder",
      requireInteraction: false,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "/pratica";
      notification.close();
    };

    setTimeout(() => notification.close(), 10000);
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };

    if (newSettings.enabled && permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) {
        updated.enabled = false;
      }
    }

    setSettings(updated);
  };

  const testNotification = () => {
    if (permission !== "granted") {
      toast.error("Permissão de notificações não concedida");
      return;
    }

    sendNotification();
    toast.success("Notificação de teste enviada!");
  };

  return {
    settings,
    permission,
    updateSettings,
    requestPermission,
    testNotification,
  };
}
