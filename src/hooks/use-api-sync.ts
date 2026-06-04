"use client";

import { useEffect, useRef } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { CourseService } from "@/services/course.service";
import { TaskService } from "@/services/task.service";
import { SemesterService } from "@/services/semester.service";
import { LearningPlanService } from "@/services/learning-plan.service";
import { ReflectionService } from "@/services/reflection.service";
import { apiClient } from "@/lib/api-client";
import { Course } from "@/types/course";
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
        // ── Courses: merge API basic fields + localStorage rich fields ──
        const localById = Object.fromEntries(prev.courses.map((c) => [c.id, c]));
        const mergedCourses: Course[] = apiCourses.map((apiC) => {
          const local = localById[apiC.id!] ?? {};
          return {
            // Rich defaults
            weeklyPlan: [],
            assignments: [],
            exams: [],
            resources: [],
            academicEvents: [],
            upcomingTasks: [],
            ...local,
            // API fields override
            ...apiC,
          } as Course;
        });
        // Keep localStorage-only courses (not yet in DB, e.g. UUID ids)
        const apiIds = new Set(apiCourses.map((c) => c.id));
        const localOnlyCourses = prev.courses.filter((c) => !apiIds.has(c.id));

        // ── Tasks: API is source of truth for general tasks ──
        const apiTasksFull = apiTasks.map((apiT) => {
          const local = prev.tasks.find((t) => t.id === apiT.id) ?? {};
          return { ...local, ...apiT } as TaskItem;
        });
        // Keep localStorage-only tasks (UUID ids, course/self-learning tasks)
        const apiTaskIds = new Set(apiTasks.map((t) => t.id));
        const localOnlyTasks = prev.tasks.filter(
          (t) => !apiTaskIds.has(t.id) && t.sourceModule !== "general"
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
