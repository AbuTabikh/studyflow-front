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
      console.log("[TaskService] create →", payload);
      const res = await apiClient.post<any>("/tasks", payload);
      console.log("[TaskService] create ✓ id=", res?.id);
      return res?.id ?? null;
    } catch (err) {
      console.error("[TaskService] create ✗", err);
      return null;
    }
  },

  async update(task: TaskItem): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(task.id, 10);
    if (isNaN(numId)) { console.warn("[TaskService] update: non-numeric id", task.id); return; }
    try {
      await apiClient.put(`/tasks/${numId}`, taskToApi(task));
    } catch (err) {
      console.error("[TaskService] update ✗ id=", numId, err);
    }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/tasks/${numId}`); } catch (err) { console.error("[TaskService] delete ✗", err); }
  },
};
