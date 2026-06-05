"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/use-app-state";
import { TaskService } from "@/services/task.service";
import { TaskItem } from "@/types/tasks";

interface TasksPanelProps {
  className?: string;
  onActiveTaskChange?: (taskId: string | null) => void;
}

export function TasksPanel({ className, onActiveTaskChange }: TasksPanelProps) {
  const { state, saveUnifiedTask, deleteUnifiedTask } = useAppState();
  const [newTaskText, setNewTaskText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Show only non-course tasks
  const tasks = (state.tasks ?? []).filter((t) => !t.linkedCourseId);

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    const now = new Date().toISOString();
    const tempTask: TaskItem = {
      id: crypto.randomUUID(),
      title: newTaskText.trim(),
      type: "general",
      priority: "medium",
      status: "todo",
      sourceModule: "general",
      createdAt: now,
      updatedAt: now,
    };
    const mysqlId = await TaskService.create(tempTask);
    const finalTask = mysqlId ? { ...tempTask, id: String(mysqlId) } : tempTask;
    saveUnifiedTask(finalTask);
    setNewTaskText("");
    setIsAdding(false);
  };

  const toggleTask = async (task: TaskItem) => {
    const newStatus: TaskItem["status"] = task.status === "done" ? "todo" : "done";
    const updated = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
    saveUnifiedTask(updated);
    const newId = await TaskService.update(updated);
    if (newId) saveUnifiedTask({ ...updated, id: newId });
  };

  const removeTask = async (task: TaskItem) => {
    deleteUnifiedTask(task);
    TaskService.delete(task.id);
    if (activeTaskId === task.id) {
      setActiveTaskId(null);
      onActiveTaskChange?.(null);
    }
  };

  const selectActiveTask = (id: string) => {
    const next = activeTaskId === id ? null : id;
    setActiveTaskId(next);
    onActiveTaskChange?.(next);
  };

  return (
    <div className={cn("rounded-lg border bg-background p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Tasks <span className="text-secondary">{tasks.length}</span>
        </h3>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => selectActiveTask(task.id)}
            className={cn(
              "group flex items-center gap-3 rounded-lg border border-dashed p-3 cursor-pointer transition-colors",
              activeTaskId === task.id
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                : "hover:border-muted-foreground/50",
            )}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleTask(task); }}
              className={cn(
                "size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                task.status === "done"
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-muted-foreground/30 hover:border-blue-500",
              )}
            >
              {task.status === "done" && <Check className="size-3" />}
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                task.status === "done" && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); removeTask(task); }}
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task..."
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
                if (e.key === "Escape") setIsAdding(false);
              }}
            />
            <Button size="sm" onClick={addTask}>
              Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
          >
            <Plus className="size-4" />
            Add here the task you will focus on
          </button>
        )}
      </div>
    </div>
  );
}
