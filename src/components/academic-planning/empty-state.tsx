import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

interface EmptyStateProps {
  onAddSemester: () => void;
}

export function EmptyState({ onAddSemester }: EmptyStateProps) {
  const { tr, t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 rounded-2xl border-dashed border-border/80 bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary shadow-inner">
        <GraduationCap className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">{tr(t.academicPlanning.emptyTitle)}</h3>
      <p className="text-muted-foreground mb-8 max-w-md text-base">
        {tr(t.academicPlanning.emptyDesc)}
      </p>
      <Button onClick={onAddSemester} size="lg" className="gap-2 shadow-sm rounded-full px-8">
        <Plus className="h-5 w-5" />
        {tr(t.academicPlanning.addFirstSemester)}
      </Button>
    </div>
  );
}
