import React from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

export function SettingsHeader() {
  const { tr, t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{tr(t.settingsPage.title)}</h1>
      <p className="mt-1 text-muted-foreground">
        {tr(t.settingsPage.profileSubtitle)}
      </p>
    </div>
  );
}
