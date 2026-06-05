"use client";

import { useEffect, useRef } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { CourseService } from "@/services/course.service";
import { TaskService } from "@/services/task.service";
import { SemesterService } from "@/services/semester.service";
import { LearningPlanService } from "@/services/learning-plan.service";
import { ReflectionService } from "@/services/reflection.service";
import { apiClient } from "@/lib/api-client";
import { Course, WeeklyPlan, StudyTask, Assignment, Exam } from "@/types/course";
import { TaskItem } from "@/types/tasks";
import { Notification } from "@/types/notifications";

/**
 * Loads all user data from MySQL on dashboard mount.
 * Merges API data with localStorage: API fields take priority,
 * rich frontend-only fields (weeklyPlan, etc.) are kept from localStorage.
 */
export function useApiSync() {
  const { state, updateState } = useAppState();
  const synced = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("studyflow_auth_token");
    if (!token || synced.current) return;
    synced.current = true;

    (async () => {
      const [apiCourses, apiTasks, apiSemesters, apiPlans, apiReflections, apiNotifications] =
        await Promise.all([
          CourseService.list(),
          TaskService.list(),
          SemesterService.list(),
          LearningPlanService.list(),
          ReflectionService.list(),
          apiClient.get<any[]>("/notifications").catch(() => []),
        ]);

      updateState((prev) => {
        // ── Courses: merge API basic fields + reconstruct weeklyPlan from tasks ──
        const localById = Object.fromEntries(prev.courses.map((c) => [c.id, c]));

        // Cast apiTasks to full TaskItem (all have id from API)
        const fullApiTasks = apiTasks as TaskItem[];

        // Group course tasks by course_id and week_number
        const courseTasksByWeek: Record<string, Record<number, TaskItem[]>> = {};
        fullApiTasks.forEach((t: TaskItem) => {
          if (t.linkedCourseId && t.linkedWeekNumber) {
            if (!courseTasksByWeek[t.linkedCourseId]) courseTasksByWeek[t.linkedCourseId] = {};
            const wn = t.linkedWeekNumber;
            if (!courseTasksByWeek[t.linkedCourseId][wn]) courseTasksByWeek[t.linkedCourseId][wn] = [];
            courseTasksByWeek[t.linkedCourseId][wn].push(t);
          }
        });

        const mergedCourses: Course[] = apiCourses.map((apiC) => {
          const local = localById[apiC.id!] ?? {};
          // Start with local weeklyPlan (fallback) or empty
          let weeklyPlan: WeeklyPlan[] = (local.weeklyPlan ?? []);

          // Inject items from tasks table into weeklyPlan
          const courseWeekTasks: Record<number, TaskItem[]> = courseTasksByWeek[apiC.id!] ?? {};
          if (Object.keys(courseWeekTasks).length > 0) {
            const allWeekNumbers = new Set([
              ...weeklyPlan.map(w => w.weekNumber),
              ...Object.keys(courseWeekTasks).map(Number),
            ]);
            weeklyPlan = Array.from(allWeekNumbers).sort((a,b) => a - b).map(wn => {
              const existing = weeklyPlan.find(w => w.weekNumber === wn) ?? {
                weekNumber: wn, title: `Week ${wn} Content`,
                studyTasks: [], assignments: [], exams: [], completed: false,
              };
              const dbTasks = courseWeekTasks[wn] ?? [];
              // Merge: DB tasks override local tasks with the same id
              const dbIds = new Set(dbTasks.map(t => t.id));
              const localStudy   = existing.studyTasks.filter(t => !dbIds.has(t.id));
              const localAssign  = existing.assignments.filter(a => !dbIds.has(a.id));
              const localExam    = existing.exams.filter(e => !dbIds.has(e.id));

              const newStudy: StudyTask[]   = dbTasks.filter(t => t.type === "study-task").map(t => ({ id: t.id, title: t.title, completed: t.status === "done", dueDate: t.dueDate }));
              const newAssign: Assignment[] = dbTasks.filter(t => t.type === "assignment" || t.type === "quiz").map(t => ({ id: t.id, title: t.title, description: t.description, dueDate: t.dueDate ?? new Date().toISOString().slice(0,10), status: (t.status === "done" ? "submitted_on_time" : "pending") as Assignment["status"] }));
              const newExam: Exam[]         = dbTasks.filter(t => t.type === "exam").map(t => ({ id: t.id, title: t.title, date: t.dueDate ?? "", time: t.dueTime ?? "09:00", duration: 60, completed: t.status === "done" }));

              return {
                ...existing,
                studyTasks:  [...localStudy,  ...newStudy],
                assignments: [...localAssign, ...newAssign],
                exams:       [...localExam,   ...newExam],
              };
            });
          }

          const resources = (apiC.resources?.length) ? apiC.resources : (local.resources ?? []);
          return {
            assignments: [], exams: [], academicEvents: [], upcomingTasks: [],
            ...local, ...apiC, weeklyPlan, resources,
          } as Course;
        });
        // Keep localStorage-only courses (not yet in DB, e.g. UUID ids)
        const apiIds = new Set(apiCourses.map((c) => c.id));
        const localOnlyCourses = prev.courses.filter((c) => !apiIds.has(c.id));

        // ── Tasks: general tasks (no course_id) from API ──
        const apiTasksFull: TaskItem[] = fullApiTasks
          .filter(t => !t.linkedCourseId)
          .map((apiT) => {
            const local = prev.tasks.find((t) => t.id === apiT.id) ?? {};
            return { ...local, ...apiT } as TaskItem;
          });
        const apiTaskIds = new Set(fullApiTasks.map(t => t.id));
        const localOnlyTasks = prev.tasks.filter(
          (t) => !apiTaskIds.has(t.id) && !t.linkedCourseId && t.sourceModule !== "general"
        );

        // ── Semesters ──
        const apiSemIds = new Set(apiSemesters.map((s) => s.id));
        const localOnlySems = prev.academicPlanning.semesters.filter(
          (s) => !apiSemIds.has(s.id)
        );

        // ── Learning Plans ──
        const apiPlanIds = new Set(apiPlans.map((p) => p.id));
        const localOnlyPlans = prev.selfLearningPlans.filter(
          (p) => !apiPlanIds.has(p.id)
        );

        // ── Reflections ──
        const apiRefIds = new Set(apiReflections.map((r) => r.id));
        const localOnlyRefs = prev.reflections.filter(
          (r) => !apiRefIds.has(r.id)
        );

        // ── Notifications ──
        const apiNotifs: Notification[] = Array.isArray(apiNotifications)
          ? apiNotifications.map((n: any) => ({
              id:          String(n.id),
              title:       n.title ?? "",
              message:     n.message ?? "",
              type:        (n.type ?? "system") as any,
              read:        !!n.read_at,
              createdAt:   n.created_at ?? new Date().toISOString(),
              targetRoute: n.target_route ?? "/dashboard",
              targetId:    n.target_id ? String(n.target_id) : undefined,
            }))
          : [];

        return {
          ...prev,
          courses: [...mergedCourses, ...localOnlyCourses],
          tasks: [...apiTasksFull, ...localOnlyTasks],
          academicPlanning: {
            ...prev.academicPlanning,
            semesters: [...apiSemesters, ...localOnlySems],
          },
          selfLearningPlans: [...apiPlans, ...localOnlyPlans],
          reflections: [...apiReflections, ...localOnlyRefs],
          notifications: apiNotifs,
        };
      });
    })();
  }, []);
}
