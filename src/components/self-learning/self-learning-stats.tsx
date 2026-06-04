"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type SelfLearningStats as StatsType } from "@/types/self-learning";
import { BookOpen, Zap, CheckCircle2, CalendarCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface StatsProps { stats: StatsType; }

export function SelfLearningStats({ stats }: StatsProps) {
  const { tr, t } = useTranslation();
  const cards = [
    { key: "total", title: tr(t.selfLearning.statsTotal), subtitle: tr(t.selfLearning.statsTotalDesc), icon: BookOpen, color: "text-violet-600", bg: "bg-violet-500/10" },
    { key: "active", title: tr(t.selfLearning.active), subtitle: tr(t.selfLearning.statsActiveDesc), icon: Zap, color: "text-blue-600", bg: "bg-blue-500/10" },
    { key: "completed", title: tr(t.selfLearning.completed), subtitle: tr(t.selfLearning.statsCompletedDesc), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { key: "upcomingMilestones", title: tr(t.selfLearning.statsMilestones), subtitle: tr(t.selfLearning.statsMilestonesDesc), icon: CalendarCheck, color: "text-orange-600", bg: "bg-orange-500/10" },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, title, subtitle, icon: Icon, color, bg }) => (
        <Card key={key} className="border shadow-sm bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{stats[key as keyof StatsType]}</div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
