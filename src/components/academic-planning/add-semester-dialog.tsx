import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlannerSemester, PlannerSemesterStatus } from "@/types/academic-planning";
import { useTranslation } from "@/lib/i18n/use-translation";

interface AddSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (semester: PlannerSemester) => void;
  initialData?: PlannerSemester | null;
}

// Fallback ID generator when uuid isn't present
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function AddSemesterDialog({ open, onOpenChange, onSave, initialData }: AddSemesterDialogProps) {
  const { tr, t } = useTranslation();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<PlannerSemesterStatus>("planned");
  const [weeksCount, setWeeksCount] = useState<number>(16);
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setStatus(initialData.status);
        setWeeksCount(initialData.weeksCount || 16);
        setAcademicYear(initialData.academicYear || "");
      } else {
        setName("");
        setStatus("planned");
        setWeeksCount(16);
        setAcademicYear("");
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      id: initialData ? initialData.id : generateId(),
      name,
      status,
      weeksCount,
      academicYear: academicYear || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{initialData ? tr(t.academicPlanning.editSemester) : tr(t.academicPlanning.addSemester)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="semester-name" className="text-muted-foreground font-semibold">{tr(t.academicPlanning.semesterName)} <span className="text-red-500">*</span></Label>
            <Input
              id="semester-name"
              placeholder={tr(t.academicPlanning.semesterNamePh)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="academic-year" className="text-muted-foreground font-semibold">{tr(t.academicPlanning.academicYear)}</Label>
              <Input
                id="academic-year"
                placeholder={tr(t.academicPlanning.academicYearPh)}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="h-11 placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weeks-count" className="text-muted-foreground font-semibold">{tr(t.academicPlanning.numWeeks)} <span className="text-red-500">*</span></Label>
              <Input
                id="weeks-count"
                type="number"
                min="1"
                max="52"
                value={weeksCount}
                onChange={(e) => setWeeksCount(parseInt(e.target.value) || 16)}
                className="h-11 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="semester-status" className="text-muted-foreground font-semibold">{tr(t.academicPlanning.timelineStatus)}</Label>
            <Select value={status} onValueChange={(val: PlannerSemesterStatus) => setStatus(val)}>
              <SelectTrigger id="semester-status" className="h-11">
                <SelectValue placeholder={tr(t.academicPlanning.selectStatus)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">{tr(t.academicPlanning.planned)}</SelectItem>
                <SelectItem value="current">{tr(t.academicPlanning.inProgress)}</SelectItem>
                <SelectItem value="completed">{tr(t.academicPlanning.completed)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl w-full sm:w-auto h-11">{tr(t.actions.cancel)}</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="rounded-xl w-full sm:w-auto h-11">{tr(t.academicPlanning.saveSemester)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
