"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PlanStatus } from "@/types/self-learning";
import { useTranslation } from "@/lib/i18n/use-translation";

interface FiltersProps {
  statusFilter: PlanStatus | "all";
  setStatusFilter: (v: PlanStatus | "all") => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  sortBy: "newest" | "oldest" | "most-progress" | "least-progress" | "nearest-end";
  setSortBy: (v: "newest" | "oldest" | "most-progress" | "least-progress" | "nearest-end") => void;
  categories: string[];
}

export function SelfLearningFilters({
  statusFilter, setStatusFilter, categoryFilter, setCategoryFilter,
  search, setSearch, sortBy, setSortBy, categories
}: FiltersProps) {
  const { tr, t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 h-10 rounded-xl"
          placeholder={tr(t.selfLearning.searchPlans)}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={(v: PlanStatus | "all") => setStatusFilter(v)}>
        <SelectTrigger className="h-10 w-[140px] rounded-xl"><SelectValue placeholder={tr(t.tasks.status)} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{tr(t.tasksPage.allStatus)}</SelectItem>
          <SelectItem value="active">{tr(t.selfLearning.active)}</SelectItem>
          <SelectItem value="planned">{tr(t.selfLearning.planned)}</SelectItem>
          <SelectItem value="paused">{tr(t.selfLearning.paused)}</SelectItem>
          <SelectItem value="completed">{tr(t.selfLearning.completed)}</SelectItem>
        </SelectContent>
      </Select>

      {categories.length > 0 && (
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-10 w-[150px] rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tr(t.selfLearning.allCategories)}</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
        <SelectTrigger className="h-10 w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{tr(t.tasksPage.newestFirst)}</SelectItem>
          <SelectItem value="oldest">{tr(t.tasksPage.oldestFirst)}</SelectItem>
          <SelectItem value="most-progress">{tr(t.selfLearning.mostProgress)}</SelectItem>
          <SelectItem value="least-progress">{tr(t.selfLearning.leastProgress)}</SelectItem>
          <SelectItem value="nearest-end">{tr(t.selfLearning.nearestEnd)}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
