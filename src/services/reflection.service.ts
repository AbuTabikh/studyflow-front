import { apiClient } from "@/lib/api-client";
import { ReflectionEntry } from "@/types/reflections";
import { reflectionFromApi, reflectionToApi } from "@/lib/api/mappers";

const ok = () => typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const ReflectionService = {
  async list(): Promise<ReflectionEntry[]> {
    if (!ok()) return [];
    try {
      const data = await apiClient.get<any[]>("/reflections");
      return Array.isArray(data) ? data.map(reflectionFromApi) : [];
    } catch { return []; }
  },

  async create(reflection: ReflectionEntry): Promise<number | null> {
    if (!ok()) return null;
    try {
      const res = await apiClient.post<any>("/reflections", reflectionToApi(reflection));
      return res?.id ?? null;
    } catch { return null; }
  },

  async update(id: string, reflection: ReflectionEntry): Promise<string | null> {
    if (!ok()) return null;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      // UUID reflection — never reached the DB yet, create it now
      const newId = await ReflectionService.create(reflection);
      return newId ? String(newId) : null;
    }
    try {
      await apiClient.put(`/reflections/${numId}`, reflectionToApi(reflection));
      return null;
    } catch (err: any) {
      if (err?.status === 404) {
        // Reflection doesn't exist for this user — re-create it
        const newId = await ReflectionService.create(reflection);
        return newId ? String(newId) : null;
      }
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/reflections/${numId}`); } catch { /* silent */ }
  },
};
