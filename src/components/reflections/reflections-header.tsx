import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface ReflectionsHeaderProps {
  onAddReflection: () => void;
}

export function ReflectionsHeader({ onAddReflection }: ReflectionsHeaderProps) {
  const { tr, t } = useTranslation();
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm w-full">
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{tr(t.reflectionsPage.title)}</h1>
        <p className="text-muted-foreground text-lg">
          {tr(t.reflectionsPage.headerDesc)}
        </p>
      </div>
      <div className="flex w-full md:w-auto shrink-0">
        <Button onClick={onAddReflection} className="w-full sm:w-auto shadow-sm" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {tr(t.reflectionsPage.newReflection)}
        </Button>
      </div>
    </div>
  );
}
