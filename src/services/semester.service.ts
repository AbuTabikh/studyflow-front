import { apiClient } from "@/lib/api-client";
import { PlannerSemester } from "@/types/academic-planning";
import { semesterFromApi, semesterToApi } from "@/lib/api/mappers";

const ok = () => typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const SemesterService = {
  async list(): Promise<PlannerSemester[]> {
    if (!ok()) return [];
    try {
      const data = await apiClient.get<any[]>("/semesters");
      return Array.isArray(data) ? data.map(semesterFromApi) : [];
    } catch { return []; }
  },

  async create(semester: PlannerSemester): Promise<number | null> {
    if (!ok()) return null;
    try {
      const res = await apiClient.post<any>("/semesters", semesterToApi(semester));
      return res?.id ?? null;
    } catch { return null; }
  },

  async update(id: string, semester: PlannerSemester): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.put(`/semesters/${numId}`, semesterToApi(semester)); } catch { /* silent */ }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/semesters/${numId}`); } catch { /* silent */ }
  },
};
