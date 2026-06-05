"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/use-app-state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { NotificationItem } from "./notification-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/use-translation";
import { apiClient } from "@/lib/api-client";
import { Notification } from "@/types/notifications";

function mapApiNotif(n: any): Notification {
  return {
    id:          String(n.id),
    title:       n.title ?? "",
    message:     n.message ?? "",
    type:        (n.type ?? "system") as Notification["type"],
    read:        !!n.read_at,
    createdAt:   n.created_at ?? new Date().toISOString(),
    targetRoute: n.target_route ?? "/dashboard",
    targetId:    n.target_id ? String(n.target_id) : undefined,
  };
}

export function NotificationCenter() {
  const { state, updateState } = useAppState();
  const { tr, t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    const token = localStorage.getItem("studyflow_auth_token");
    if (!token) return;
    try {
      const data = await apiClient.get<any[]>("/notifications");
      if (!Array.isArray(data)) return;
      const mapped: Notification[] = data.map(mapApiNotif);
      updateState(prev => ({ ...prev, notifications: mapped }));
    } catch { /* silent */ }
  }, [updateState]);

  // Re-fetch when popover opens
  React.useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Poll every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
    apiClient.patch(`/notifications/${id}/read`).catch(() => {});
    if (notification?.targetRoute) {
      router.push(notification.targetRoute);
      setOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
    apiClient.post("/notifications/mark-all-read").catch(() => {});
  };

  const handleClearAll = () => {
    // Delete all on the server then clear local state
    Promise.all(notifications.map(n => apiClient.delete(`/notifications/${n.id}`).catch(() => {})))
      .then(() => updateState(prev => ({ ...prev, notifications: [] })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 shadow-2xl border-primary/10" align="end">
        <div className="flex items-center justify-between p-4 bg-muted/30">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold">{tr(t.notifications.title)}</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {unreadCount > 0 ? `${unreadCount} unread` : tr(t.notifications.allCaughtUp)}
            </p>
          </div>
          <div className="flex gap-1">
            {notifications.length > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
                  onClick={handleMarkAllRead}
                  title={tr(t.notifications.markAllRead)}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500" 
                  onClick={handleClearAll}
                  title={tr(t.notifications.clearAll)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <Separator />
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{tr(t.notifications.allCaughtUp)}</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  {tr(t.notifications.noNotifications)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onClick={handleMarkAsRead} 
                  />
                ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 bg-muted/30 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs font-medium text-muted-foreground" disabled>
              End of notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
