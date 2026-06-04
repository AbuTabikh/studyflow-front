import { apiClient } from "@/lib/api-client";
import { TaskItem } from "@/types/tasks";
import { taskFromApi, taskToApi } from "@/lib/api/mappers";

const ok = () => typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const TaskService = {
  async list(): Promise<Partial<TaskItem>[]> {
    if (!ok()) return [];
    try {
      const data = await apiClient.get<any[]>("/tasks");
      return Array.isArray(data) ? data.map(taskFromApi) : [];
    } catch { return []; }
  },

  async create(task: TaskItem): Promise<number | null> {
    if (!ok()) return null;
    try {
      const res = await apiClient.post<any>("/tasks", taskToApi(task));
      return res?.id ?? null;
    } catch { return null; }
  },

  async update(task: TaskItem): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(task.id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.put(`/tasks/${numId}`, taskToApi(task)); } catch { /* silent */ }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/tasks/${numId}`); } catch { /* silent */ }
  },
};
