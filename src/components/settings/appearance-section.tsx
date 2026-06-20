"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/use-app-state";
import { useTranslation } from "@/lib/i18n/use-translation";
import { AuthService } from "@/services/auth.service";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const { updateState } = useAppState();
  const { tr, t } = useTranslation();

  const themes = [
    { value: "light",  label: tr(t.settings.appearance.light),  icon: Sun },
    { value: "dark",   label: tr(t.settings.appearance.dark),   icon: Moon },
    { value: "system", label: tr(t.settings.appearance.system), icon: Monitor },
  ];

  const handleThemeChange = (thm: string) => {
    setTheme(thm);
    updateState((prev) => ({
      ...prev,
      userProfile: { ...prev.userProfile, themePreference: thm as any },
    }));
    AuthService.updateProfile({ themePreference: thm as any }).catch(() => {});
  };

  return (
    <Card className="border-border/40 shadow-sm bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{tr(t.settings.appearance.title)}</CardTitle>
        <CardDescription>{tr(t.settings.appearance.subtitle)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{tr(t.settings.appearance.theme)}</p>
          <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 max-w-sm">
            {themes.map((thm) => (
              <button
                key={thm.value}
                onClick={() => handleThemeChange(thm.value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  theme === thm.value
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-border/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <thm.icon className={cn("h-4 w-4", theme === thm.value ? "text-primary" : "text-muted-foreground/70")} />
                {thm.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
