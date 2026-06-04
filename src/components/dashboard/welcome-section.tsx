"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface WelcomeSectionProps {
  userName?: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  const { tr, t, lang } = useTranslation();
  const displayName = userName || tr(t.dashboard.student);

  const now = new Date();
  const today = now.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = now.getHours();
  let greeting = tr(t.dashboard.greeting.evening);
  if (hour < 12) greeting = tr(t.dashboard.greeting.morning);
  else if (hour < 18) greeting = tr(t.dashboard.greeting.afternoon);

  return (
    <div className="flex flex-col gap-1 mb-8 mt-2">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        <span className="capitalize">{greeting}</span>, {displayName}{" "}
        <span className="text-2xl inline-block wave-animation">👋</span>
      </h1>
      <span className={cn("text-sm font-medium text-muted-foreground mt-1")}>
        {today}
      </span>
    </div>
  );
}
