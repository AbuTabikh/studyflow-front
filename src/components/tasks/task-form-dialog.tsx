import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskItem, TaskType, TaskPriority, TaskStatus } from "@/types/tasks";
import { generateTaskId, TASK_TYPE_LABELS } from "@/lib/tasks/utils";
import { ReminderFields } from "@/components/shared/reminder-fields";
import { ReminderConfig } from "@/types/reminders";
import { getDefaultReminderConfig } from "@/lib/reminders/utils";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: TaskItem) => void;
  initialData?: TaskItem | null;
}

const TASK_TYPES: TaskType[] = ["general", "study-task", "assignment", "quiz", "exam", "self-learning-milestone"];

export function TaskFormDialog({ open, onOpenChange, onSave, initialData }: TaskFormDialogProps) {
  const { tr, t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("general");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [linkedCourseTitle, setLinkedCourseTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(getDefaultReminderConfig());
  
  // Recurrence state
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [interval, setInterval] = useState(1);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setType(initialData.type);
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setDueDate(initialData.dueDate || "");
        setDueTime(initialData.dueTime || "");
        setLinkedCourseTitle(initialData.linkedCourseTitle || "");
        setNotes(initialData.notes || "");
        setReminderConfig(initialData.reminderConfig || getDefaultReminderConfig());
        setRecurrenceEnabled(!!initialData.recurrence);
        setFrequency(initialData.recurrence?.frequency || "daily");
        setInterval(initialData.recurrence?.interval || 1);
      } else {
        setTitle("");
        setDescription("");
        setType("general");
        setPriority("medium");
        setStatus("todo");
        setDueDate("");
        setDueTime("");
        setLinkedCourseTitle("");
        setNotes("");
        setReminderConfig(getDefaultReminderConfig());
        setRecurrenceEnabled(false);
        setFrequency("daily");
        setInterval(1);
      }
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!title.trim()) return;

    const now = new Date().toISOString();
    onSave({
      id: initialData?.id ?? generateTaskId(),
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      sourceModule: initialData?.sourceModule ?? ((type === "self-learning-milestone") ? "self-learning" : (type === "general") ? "general" : "course"),
      priority,
      status,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      linkedCourseTitle: linkedCourseTitle.trim() || undefined,
      linkedCourseId: initialData?.linkedCourseId,
      linkedWeekId: initialData?.linkedWeekId,
      linkedWeekLabel: initialData?.linkedWeekLabel,
      linkedLearningPlanId: initialData?.linkedLearningPlanId,
      linkedLearningPlanTitle: initialData?.linkedLearningPlanTitle,
      recurrence: recurrenceEnabled ? { frequency, interval } : undefined,
      reminder: reminderConfig.enabled,
      reminderConfig,
      notes: notes.trim() || undefined,
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    });
    onOpenChange(false);
  };

  const isSaveDisabled = !title.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        
        <DialogHeader className="px-6 py-4 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-xl">
            {initialData ? (
              initialData.sourceModule === "self-learning" ? tr(t.tasksPage.editLearning) :
              initialData.sourceModule === "course" ? tr(t.tasksPage.editCourse) : tr(t.tasksPage.editTask)
            ) : tr(t.tasksPage.addNewTask)}
          </DialogTitle>
          <DialogDescription>
            {initialData?.sourceModule === "self-learning" ? tr(t.tasksPage.updateLearning) :
             initialData?.sourceModule === "course" ? tr(t.tasksPage.updateCourse) :
             tr(t.tasksPage.fillDetails)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="font-semibold">{tr(t.tasks.title_field)} <span className="text-red-500">*</span></Label>
            <Input
              id="task-title"
              placeholder={tr(t.tasksPage.formTitlePh)}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          {/* Description - Hide for Stage Tasks but keep for Milestones and Others */}
          {(initialData?.sourceModule !== "self-learning" || initialData?.id.startsWith("milestone-")) && (
            <div className="space-y-2">
              <Label htmlFor="task-description" className="font-semibold text-muted-foreground">{tr(t.tasks.description)}</Label>
              <span className="text-[10px] text-muted-foreground ml-2">{tr(t.tasksPage.formOptional)}</span>
              <Textarea
                id="task-description"
                placeholder={tr(t.tasksPage.formDescPh)}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="resize-none min-h-[70px]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Type - Hide for Course and Self-Learning (fixed context) */}
            {(!initialData || initialData.sourceModule === "general") && (
              <div className="space-y-2">
                <Label htmlFor="task-type" className="font-semibold">{tr(t.tasksPage.formTypeLabel)} <span className="text-red-500">*</span></Label>
                <Select value={type} onValueChange={(v: TaskType) => setType(v)}>
                  <SelectTrigger id="task-type" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{TASK_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority - Hide for Self-Learning */}
            {initialData?.sourceModule !== "self-learning" && (
              <div className="space-y-2">
                <Label htmlFor="task-priority" className="font-semibold">{tr(t.tasks.priority)} <span className="text-red-500">*</span></Label>
                <Select value={priority} onValueChange={(v: TaskPriority) => setPriority(v)}>
                  <SelectTrigger id="task-priority" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{tr(t.tasksPage.high)}</SelectItem>
                    <SelectItem value="medium">{tr(t.tasksPage.medium)}</SelectItem>
                    <SelectItem value="low">{tr(t.tasksPage.low)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="task-due-date" className="font-semibold text-muted-foreground">{tr(t.tasks.dueDate)}</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Due Time */}
            <div className="space-y-2">
              <Label htmlFor="task-due-time" className="font-semibold text-muted-foreground">{tr(t.tasksPage.formDueTime)}</Label>
              <Input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="h-10"
                disabled={!dueDate}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="task-status" className="font-semibold text-muted-foreground">{tr(t.tasks.status)}</Label>
              <Select value={status} onValueChange={(v: TaskStatus) => setStatus(v)}>
                <SelectTrigger id="task-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {initialData?.sourceModule === "self-learning" ? (
                    <>
                      <SelectItem value="todo">{tr(t.tasks.pending)}</SelectItem>
                      <SelectItem value="done">{tr(t.tasksPage.done)}</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="todo">{tr(t.tasksPage.toDo)}</SelectItem>
                      <SelectItem value="in-progress">{tr(t.tasksPage.inProgress)}</SelectItem>
                      <SelectItem value="done">{tr(t.tasksPage.done)}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Linked Course (optional) - Hide for existing Course/Self-Learning tasks */}
            {(!initialData || initialData.sourceModule === "general") && (
              <div className="space-y-2">
                <Label htmlFor="task-course" className="font-semibold text-muted-foreground">{tr(t.tasksPage.formLinkedCourse)}</Label>
                <Input
                  id="task-course"
                  placeholder={tr(t.tasksPage.formLinkedPh)}
                  value={linkedCourseTitle}
                  onChange={e => setLinkedCourseTitle(e.target.value)}
                  className="h-10 placeholder:text-muted-foreground/50"
                />
              </div>
            )}
          </div>

          {/* Notes - Hide for Self-Learning and Milestones (minimalist) */}
          {(initialData?.sourceModule !== "self-learning") && (
            <div className="space-y-2">
              <Label htmlFor="task-notes" className="font-semibold text-muted-foreground">{tr(t.tasksPage.formNotes)}</Label>
              <Textarea
                id="task-notes"
                placeholder={tr(t.tasksPage.formNotesPh)}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="resize-none min-h-[60px]"
              />
            </div>
          )}

          {/* Reminder Section - Hide for Self-Learning (minimalist) */}
          {initialData?.sourceModule !== "self-learning" && (
            <div className="space-y-2 pt-2">
              <Label className="font-semibold">{tr(t.tasksPage.formReminder)}</Label>
              <ReminderFields 
                config={reminderConfig} 
                onChange={(updates) => setReminderConfig({ ...reminderConfig, ...updates })}
              />
            </div>
          )}

          {/* Recurrence Section - Only for General Tasks */}
          {(!initialData || initialData.sourceModule === "general") && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="recurrence" className="font-semibold cursor-pointer">{tr(t.tasksPage.formRecurrence)}</Label>
                <input 
                  type="checkbox" 
                  id="recurrence"
                  checked={recurrenceEnabled}
                  onChange={(e) => setRecurrenceEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
              </div>

              {recurrenceEnabled && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tr(t.tasksPage.formFrequency)}</Label>
                    <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                      <SelectTrigger className="h-9 bg-white dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{tr(t.tasksPage.freqDaily)}</SelectItem>
                        <SelectItem value="weekly">{tr(t.tasksPage.freqWeekly)}</SelectItem>
                        <SelectItem value="monthly">{tr(t.tasksPage.freqMonthly)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tr(t.tasksPage.formInterval)}</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min={1} 
                        value={interval}
                        onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                        className="h-9 w-16 bg-white dark:bg-slate-950"
                      />
                      <span className="text-xs text-muted-foreground">
                        {frequency === "daily" ? tr(t.tasksPage.intDays) : frequency === "weekly" ? tr(t.tasksPage.intWeeks) : tr(t.tasksPage.intMonths)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl w-full sm:w-auto">{tr(t.actions.cancel)}</Button>
          <Button onClick={handleSave} disabled={isSaveDisabled} className="rounded-xl w-full sm:w-auto">
            {initialData ? tr(t.actions.saveChanges) : tr(t.tasksPage.addTask)}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}