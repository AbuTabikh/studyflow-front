import { apiClient } from "@/lib/api-client";
import { Course } from "@/types/course";

function toBackend(c: Omit<Course, "id"> & { id?: string }) {
  return {
    title:          c.title,
    code:           c.code || null,
    instructor:     c.instructor || null,
    credits:        c.credits || 3,
    duration_weeks: c.durationWeeks || 16,
    description:    c.description || null,
    image_url:      c.imageUrl || null,
    status:         c.status || "planned",
    semester_id:    null, // semesters are localStorage-only for now
  };
}

const isLoggedIn = () =>
  typeof window !== "undefined" && !!localStorage.getItem("studyflow_auth_token");

export const CourseService = {
  async create(course: Omit<Course, "id">): Promise<number | null> {
    if (!isLoggedIn()) return null;
    try {
      const res = await apiClient.post<{ id: number }>("/courses", toBackend(course));
      return res.id ?? null;
    } catch { return null; }
  },

  async update(id: string, course: Course): Promise<void> {
    if (!isLoggedIn()) return;
    // id might be a MySQL int stored as string or a localStorage UUID
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return; // localStorage UUID — not in DB yet
    try {
      await apiClient.put(`/courses/${numId}`, toBackend(course));
    } catch { /* silent */ }
  },

  async delete(id: string): Promise<void> {
    if (!isLoggedIn()) return;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return;
    try {
      await apiClient.delete(`/courses/${numId}`);
    } catch { /* silent */ }
  },
};
