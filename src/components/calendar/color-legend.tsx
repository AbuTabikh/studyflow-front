"use client";

import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/use-translation";

export function ColorLegend() {
  const { tr, t } = useTranslation();
  const legend = [
    { type: tr(t.calendar.legendTask), color: "bg-blue-500", description: tr(t.calendar.legendStudyTasks) },
    { type: tr(t.calendar.legendAssignment), color: "bg-orange-500", description: tr(t.calendar.legendAssignments) },
    { type: tr(t.calendar.legendQuiz), color: "bg-yellow-500", description: tr(t.calendar.legendQuizzes) },
    {
      type: tr(t.calendar.legendExam),
      color: "bg-red-600",
      description: tr(t.calendar.legendImportant),
    },
    {
      type: tr(t.calendar.legendCompleted),
      color: "bg-green-500",
      description: tr(t.calendar.legendCompletedItems),
    },
    { type: tr(t.calendar.legendOverdue), color: "bg-red-700", description: tr(t.calendar.legendOverdueItems) },
  ];

  return (
    <Card className="p-4 border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        {tr(t.calendar.legend)}
      </h3>
      <div className="space-y-2">
        {legend.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {item.type}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
