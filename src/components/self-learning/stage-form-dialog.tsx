"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LearningStage, StageStatus } from "@/types/self-learning";
import { generatePlanId } from "@/lib/self-learning/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface StageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stage: LearningStage) => void;
  initialData?: LearningStage | null;
  planId: string;
  nextOrder: number;
}

export function StageFormDialog({ open, onOpenChange, onSave, initialData, planId, nextOrder }: StageFormDialogProps) {
  const { tr, t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDuration, setTargetDuration] = useState("");
  const [goals, setGoals] = useState("");
  const [status, setStatus] = useState<StageStatus>("not-started");

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title); setDescription(initialData.description ?? "");
      setTargetDuration(initialData.targetDuration ?? ""); setGoals(initialData.goals ?? "");
      setStatus(initialData.status);
    } else if (open) {
      setTitle(""); setDescription(""); setTargetDuration(""); setGoals("");
      setStatus(nextOrder === 1 ? "active" : "not-started");
    }
  }, [open, initialData, nextOrder]);

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: initialData?.id ?? generatePlanId(),
      planId, title: title.trim(),
      description: description.trim() || undefined,
      targetDuration: targetDuration.trim() || undefined,
      goals: goals.trim() || undefined,
      status, order: initialData?.order ?? nextOrder,
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? tr(t.selfLearning.editStageTitle) : tr(t.selfLearning.addStageTitle)}</DialogTitle>
          <DialogDescription>{tr(t.selfLearning.stageFormDesc)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{tr(t.selfLearning.stageTitleLabel)} <span className="text-red-500">*</span></Label>
            <Input placeholder={tr(t.selfLearning.stageTitlePh)} value={title} onChange={e => setTitle(e.target.value)} autoFocus className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">{tr(t.selfLearning.stageDescLabel)}</Label>
            <Textarea placeholder={tr(t.selfLearning.stageDescPh)} value={description} onChange={e => setDescription(e.target.value)} className="resize-none min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tr(t.selfLearning.stageDuration)}</Label>
              <Input placeholder={tr(t.selfLearning.stageDurationPh)} value={targetDuration} onChange={e => setTargetDuration(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{tr(t.tasks.status)}</Label>
              <select value={status} onChange={e => setStatus(e.target.value as StageStatus)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="not-started">{tr(t.selfLearning.notStarted)}</option>
                <option value="active">{tr(t.selfLearning.active)}</option>
                <option value="completed">{tr(t.selfLearning.completed)}</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">{tr(t.selfLearning.stageGoals)}</Label>
            <Textarea placeholder={tr(t.selfLearning.stageGoalsPh)} value={goals} onChange={e => setGoals(e.target.value)} className="resize-none min-h-[60px]" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{tr(t.actions.cancel)}</Button>
          <Button onClick={handleSave} disabled={!title.trim()} className="rounded-xl">{initialData ? tr(t.actions.saveChanges) : tr(t.selfLearning.addStageBtn)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
