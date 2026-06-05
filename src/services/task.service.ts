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
    if (!ok()) { console.warn("[TaskService] no auth token"); return null; }
    try {
      const payload = taskToApi(task);
      const res = await apiClient.post<any>("/tasks", payload);
      return res?.id ?? null;
    } catch (err) {
      console.error("[TaskService] create ✗", err);
      return null;
    }
  },

  async update(task: TaskItem): Promise<string | null> {
    if (!ok()) return null;
    const numId = parseInt(task.id, 10);
    if (isNaN(numId)) {
      // UUID task — never reached the DB yet, create it now
      const newId = await TaskService.create(task);
      return newId ? String(newId) : null;
    }
    try {
      await apiClient.put(`/tasks/${numId}`, taskToApi(task));
      return null;
    } catch (err: any) {
      if (err?.status === 404) {
        // Task doesn't exist for this user — re-create it
        const newId = await TaskService.create(task);
        return newId ? String(newId) : null;
      }
      console.error("[TaskService] update ✗ id=", numId, err);
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/tasks/${numId}`); } catch (err) { console.error("[TaskService] delete ✗", err); }
  },
};
