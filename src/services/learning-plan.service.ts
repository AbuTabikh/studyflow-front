import { apiClient } from "@/lib/api-client";
import { LearningPlan } from "@/types/self-learning";
import { learningPlanFromApi, learningPlanToApi } from "@/lib/api/mappers";

const ok = () => typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const LearningPlanService = {
  async list(): Promise<LearningPlan[]> {
    if (!ok()) return [];
    try {
      const data = await apiClient.get<any[]>("/learning-plans");
      return Array.isArray(data) ? data.map(learningPlanFromApi) : [];
    } catch { return []; }
  },

  async create(plan: LearningPlan): Promise<number | null> {
    if (!ok()) return null;
    try {
      const res = await apiClient.post<any>("/learning-plans", learningPlanToApi(plan));
      return res?.id ?? null;
    } catch { return null; }
  },

  async update(id: string, plan: LearningPlan): Promise<string | null> {
    if (!ok()) return null;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      // UUID plan — never reached the DB yet, create it now
      const newId = await LearningPlanService.create(plan);
      return newId ? String(newId) : null;
    }
    try {
      await apiClient.put(`/learning-plans/${numId}`, learningPlanToApi(plan));
      return null;
    } catch (err: any) {
      if (err?.status === 404) {
        // Plan doesn't exist for this user — re-create it
        const newId = await LearningPlanService.create(plan);
        return newId ? String(newId) : null;
      }
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/learning-plans/${numId}`); } catch { /* silent */ }
  },
};
