import { apiClient } from "@/lib/api-client";
import { Course } from "@/types/course";
import { courseFromApi, courseToApi, courseCreateToApi } from "@/lib/api/mappers";

const ok = () => typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const CourseService = {
  async list(): Promise<Partial<Course>[]> {
    if (!ok()) return [];
    try {
      const data = await apiClient.get<any[]>("/courses");
      return Array.isArray(data) ? data.map(courseFromApi) : [];
    } catch { return []; }
  },

  async create(course: Omit<Course, "id">): Promise<number | null> {
    if (!ok()) return null;
    try {
      const res = await apiClient.post<any>("/courses", courseCreateToApi(course));
      return res?.id ?? null;
    } catch { return null; }
  },

  async update(id: string, course: Course): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) { console.warn("[CourseService] non-numeric id, skipping update:", id); return; }
    try {
      await apiClient.put(`/courses/${numId}`, courseToApi(course));
    } catch (err) {
      console.error("[CourseService] update failed for course", numId, err);
    }
  },

  async delete(id: string): Promise<void> {
    if (!ok()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try { await apiClient.delete(`/courses/${numId}`); } catch { /* silent */ }
  },
};
