"use client";

import { ReminderPreferences } from "@/types/settings";
import { useTranslation } from "@/lib/i18n/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BellRing, Mail, Smartphone, Bell, Clock } from "lucide-react";

interface NotificationSettingsSectionProps {
  preferences: ReminderPreferences;
  onUpdate: (updates: Partial<ReminderPreferences>) => void;
}

export function NotificationSettingsSection({ preferences, onUpdate }: NotificationSettingsSectionProps) {
  const { tr, t } = useTranslation();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">{tr(t.settingsPage.notifTitle)}</h2>
        <p className="text-sm text-muted-foreground">
          {tr(t.settingsPage.notifSubtitle)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Channels */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              {tr(t.settingsPage.deliveryChannels)}
            </CardTitle>
            <CardDescription>
              {tr(t.settingsPage.notifSubtitle)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="in-app-notif" className="flex flex-col gap-0.5 pointer-events-none">
                  <span>{tr(t.settingsPage.inAppNotif)}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{tr(t.settingsPage.dashboardBadge)}</span>
                </Label>
              </div>
              <Switch 
                id="in-app-notif" 
                checked={preferences.inAppNotificationsEnabled}
                onCheckedChange={(checked) => onUpdate({ inAppNotificationsEnabled: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email-notif" className="flex flex-col gap-0.5 pointer-events-none">
                  <span>{tr(t.settingsPage.emailAlerts)}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{tr(t.settingsPage.emailSummaries)}</span>
                </Label>
              </div>
              <Switch id="email-notif" checked={false} disabled />
            </div>

            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="push-notif" className="flex flex-col gap-0.5 pointer-events-none">
                  <span>{tr(t.settingsPage.pushNotif)}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{tr(t.settingsPage.browserNotif)}</span>
                </Label>
              </div>
              <Switch id="push-notif" checked={false} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Defaults */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {tr(t.settingsPage.reminderDefaults)}
            </CardTitle>
            <CardDescription>
              {tr(t.settingsPage.notifSubtitle)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {tr(t.settingsPage.defaultTiming)}
              </Label>
              <Select 
                value={preferences.defaultReminderTiming.toString()} 
                onValueChange={(val) => onUpdate({ defaultReminderTiming: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tr(t.settings.notifications.selectTiming)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 {tr(t.settings.notifications.minutes)}</SelectItem>
                  <SelectItem value="15">15 {tr(t.settings.notifications.minutes)}</SelectItem>
                  <SelectItem value="30">30 {tr(t.settings.notifications.minutes)}</SelectItem>
                  <SelectItem value="60">1 {tr(t.settings.notifications.hours)}</SelectItem>
                  <SelectItem value="1440">1 {tr(t.settings.notifications.days)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="pointer-events-none">{tr(t.settingsPage.globalReminders)}</Label>
              <Switch 
                checked={preferences.remindersEnabled}
                onCheckedChange={(checked) => onUpdate({ remindersEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
