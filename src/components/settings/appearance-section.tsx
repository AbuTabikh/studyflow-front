"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Monitor, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/use-app-state";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const { state, updateState } = useAppState();
  const currentLang = state.userProfile?.language ?? "en";

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const languages = [
    { value: "en", label: "English", native: "English" },
    { value: "ar", label: "Arabic", native: "العربية" },
  ];

  const setLanguage = (lang: "en" | "ar") => {
    updateState((prev) => ({
      ...prev,
      userProfile: { ...prev.userProfile, language: lang },
    }));
  };

  return (
    <Card className="border-border/40 shadow-sm bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Appearance</CardTitle>
        <CardDescription>
          Choose a theme and language that feel right for you.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Theme</p>
          <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 max-w-sm">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  theme === t.value
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-border/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <t.icon className={cn("h-4 w-4", theme === t.value ? "text-primary" : "text-muted-foreground/70")} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Language / اللغة
          </p>
          <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 max-w-sm">
            {languages.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value as "en" | "ar")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  currentLang === l.value
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-border/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span>{l.native}</span>
              </button>
            ))}
          </div>
          {currentLang === "ar" && (
            <p className="text-xs text-muted-foreground">
              سيتم تغيير اتجاه الصفحة إلى اليمين إلى اليسار
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
