"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LearningPlan, PlanStatus } from "@/types/self-learning";
import { generatePlanId } from "@/lib/self-learning/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: LearningPlan) => void;
  initialData?: LearningPlan | null;
}

const CATEGORIES = ["Programming", "Design", "Language", "Mathematics", "Science", "Business", "Arts", "Health", "Other"] as const;

export function LearningPlanFormDialog({ open, onOpenChange, onSave, initialData }: PlanFormDialogProps) {
  const { tr, t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("");
  const [targetSkill, setTargetSkill] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PlanStatus>("planned");

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? "");
      setGoal(initialData.goal);
      setCategory(initialData.category ?? "");
      setTargetSkill(initialData.targetSkill ?? "");
      setStartDate(initialData.startDate.split("T")[0]);
      setEndDate(initialData.endDate?.split("T")[0] ?? "");
      setStatus(initialData.status);
    } else if (open) {
      setTitle(""); setDescription(""); setGoal(""); setCategory("");
      setTargetSkill(""); setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate(""); setStatus("planned");
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!title.trim() || !goal.trim() || !startDate) return;
    const now = new Date().toISOString();
    onSave({
      id: initialData?.id ?? generatePlanId(),
      title: title.trim(),
      description: description.trim() || undefined,
      goal: goal.trim(),
      category: category || undefined,
      targetSkill: targetSkill.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      status,
      stages: initialData?.stages ?? [],
      milestones: initialData?.milestones ?? [],
      resources: initialData?.resources ?? [],
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    });
    onOpenChange(false);
  };

  const canSave = title.trim() && goal.trim() && startDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] h-[90vh] sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-xl">{initialData ? tr(t.selfLearning.editPlanFormTitle) : tr(t.selfLearning.newPlanFormTitle)}</DialogTitle>
          <DialogDescription>{tr(t.selfLearning.planFormDesc)}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label>{tr(t.selfLearning.planTitle)} <span className="text-red-500">*</span></Label>
            <Input placeholder={tr(t.selfLearning.planTitlePh)} value={title} onChange={e => setTitle(e.target.value)} className="h-11" autoFocus />
          </div>

          <div className="space-y-2">
            <Label>{tr(t.selfLearning.planGoalLabel)} <span className="text-red-500">*</span></Label>
            <Textarea placeholder={tr(t.selfLearning.planGoalPh)} value={goal} onChange={e => setGoal(e.target.value)} className="resize-none min-h-[70px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">{tr(t.selfLearning.planDescLabel)}</Label>
            <Textarea placeholder={tr(t.selfLearning.planDescPh)} value={description} onChange={e => setDescription(e.target.value)} className="resize-none min-h-[60px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tr(t.selfLearning.planCategory)}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10"><SelectValue placeholder={tr(t.selfLearning.planCategoryPh)} /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => {
                    const catKey = `cat${c}` as keyof typeof t.selfLearning;
                    const catVal = t.selfLearning[catKey] as { en: string; ar: string };
                    return <SelectItem key={c} value={c}>{tr(catVal)}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tr(t.selfLearning.planTargetSkill)}</Label>
              <Input placeholder={tr(t.selfLearning.planTargetSkillPh)} value={targetSkill} onChange={e => setTargetSkill(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>{tr(t.selfLearning.planStartDate)} <span className="text-red-500">*</span></Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tr(t.selfLearning.planEndDate)}</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10" min={startDate} />
            </div>
            <div className="space-y-2">
              <Label>{tr(t.tasks.status)}</Label>
              <Select value={status} onValueChange={(v: PlanStatus) => setStatus(v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">{tr(t.selfLearning.planned)}</SelectItem>
                  <SelectItem value="active">{tr(t.selfLearning.active)}</SelectItem>
                  <SelectItem value="paused">{tr(t.selfLearning.paused)}</SelectItem>
                  <SelectItem value="completed">{tr(t.selfLearning.completed)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{tr(t.actions.cancel)}</Button>
          <Button onClick={handleSave} disabled={!canSave} className="rounded-xl">{initialData ? tr(t.actions.saveChanges) : tr(t.selfLearning.createPlan)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
