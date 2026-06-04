import { apiClient } from "@/lib/api-client";
import { TaskItem } from "@/types/tasks";

function statusToBackend(s: string) {
  if (s === "done") return "completed";
  if (s === "in-progress") return "in-progress";
  return "pending";
}

function toBackend(task: TaskItem) {
  return {
    title:       task.title,
    description: task.description || null,
    type:        task.type || "study-task",
    priority:    task.priority || "medium",
    status:      statusToBackend(task.status),
    dueDate:     task.dueDate || null,
    dueTime:     task.dueTime || null,
    course_id:   null, // course IDs are localStorage UUIDs — skip FK for now
    week_number: null,
  };
}

const isLoggedIn = () =>
  typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const TaskService = {
  async create(task: TaskItem): Promise<number | null> {
    if (!isLoggedIn()) return null;
    try {
      const res = await apiClient.post<{ id: number }>("/tasks", toBackend(task));
      return res.id ?? null;
    } catch { return null; }
  },

  async update(task: TaskItem): Promise<void> {
    if (!isLoggedIn()) return;
    const numId = parseInt(task.id, 10);
    if (isNaN(numId)) return;
    try {
      await apiClient.put(`/tasks/${numId}`, toBackend(task));
    } catch { /* silent */ }
  },

  async delete(id: string): Promise<void> {
    if (!isLoggedIn()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try {
      await apiClient.delete(`/tasks/${numId}`);
    } catch { /* silent */ }
  },
};
