import { Course, WeeklyPlan } from "@/types/course";
import { TaskItem } from "@/types/tasks";
import { PlannerSemester } from "@/types/academic-planning";
import { LearningPlan } from "@/types/self-learning";
import { ReflectionEntry } from "@/types/reflections";
import { toDateOnly } from "@/lib/utils/date-utils";

function normalizeWeeklyPlanForApi(weeklyPlan: WeeklyPlan[]) {
  const today = toDateOnly(new Date())!;
  return (weeklyPlan || []).map((week) => ({
    ...week,
    studyTasks: (week.studyTasks || []).map((st) => ({
      ...st,
      dueDate: toDateOnly(st.dueDate),
    })),
    assignments: (week.assignments || []).map((a) => ({
      ...a,
      dueDate: toDateOnly(a.dueDate) ?? today,
    })),
    exams: (week.exams || []).map((e) => ({
      ...e,
      date: toDateOnly(e.date) ?? today,
    })),
  }));
}

// ── Courses ─────────────────────────────────────────────────────────────────

export function courseFromApi(a: any): Partial<Course> {
  return {
    id: String(a.id),
    title: a.title ?? "",
    instructor: a.instructor ?? "",
    credits: a.credits ?? 3,
    durationWeeks: a.duration_weeks ?? 16,
    code: a.code ?? "",
    description: a.description ?? "",
    imageUrl: a.image_url ?? "",
    status: a.status ?? "planned",
    semesterId: a.semester_id ? String(a.semester_id) : "",
    numericGrade: a.numeric_grade ?? undefined,
    weeklyPlan: Array.isArray(a.weekly_plan) ? a.weekly_plan : (a.weekly_plan ? JSON.parse(a.weekly_plan) : []),
    resources: Array.isArray(a.resources) ? a.resources : (a.resources ? JSON.parse(a.resources) : []),
  };
}

// Used when creating a course (includes semester_id)
export function courseCreateToApi(c: Course | Omit<Course, "id">) {
  const base = courseToApi(c as Course);
  const semId = (c as Course).semesterId;
  return {
    ...base,
    semester_id: semId ? (parseInt(semId, 10) || null) : null,
  };
}

export function courseToApi(c: Course) {
  return {
    title: c.title,
    code: c.code || null,
    instructor: c.instructor || null,
    credits: c.credits || 3,
    duration_weeks: c.durationWeeks || 16,
    description: c.description || null,
    image_url: c.imageUrl || null,
    status: c.status || "planned",
    // semester_id intentionally omitted — backend keeps existing value unless explicitly changed
    weekly_plan: normalizeWeeklyPlanForApi(c.weeklyPlan || []),
    resources: c.resources || [],
  };
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export function taskFromApi(a: any): Partial<TaskItem> {
  const statusMap: Record<string, string> = {
    pending: "todo", "in-progress": "in-progress", completed: "done",
  };
  return {
    id: String(a.id),
    title: a.title ?? "",
    description: a.description ?? "",
    type: a.type ?? "study-task",
    priority: a.priority ?? "medium",
    status: (statusMap[a.status] ?? "todo") as any,
    dueDate: toDateOnly(a.due_date),
    dueTime: a.due_time ?? undefined,
    sourceModule: (a.course_id ? "course" : "general") as any,
    linkedCourseId: a.course_id ? String(a.course_id) : undefined,
    linkedWeekNumber: a.week_number ?? undefined,
    createdAt: a.created_at ?? new Date().toISOString(),
    updatedAt: a.updated_at ?? new Date().toISOString(),
  };
}

export function taskToApi(t: TaskItem) {
  const statusMap: Record<string, string> = {
    todo: "pending", "in-progress": "in-progress", done: "completed",
  };

  return {
    title: t.title,
    description: t.description || null,
    type: t.type || "study-task",
    priority: t.priority || "medium",
    status: statusMap[t.status] ?? "pending",
    dueDate: toDateOnly(t.dueDate) ?? null,
    dueTime: t.dueTime || null,
    course_id: t.linkedCourseId ? (parseInt(t.linkedCourseId, 10) || null) : null,
    week_number: t.linkedWeekNumber ?? null,

    // أضف هذه الحقول هنا لكي يراها الباك إيند:
    enableReminder: !!t.reminder,
    timing: t.reminderConfig?.timingValue ?? 15,
    unit: t.reminderConfig?.timingUnit ?? 'minutes',

    is_recurring: !!t.recurrence,
    repeat_frequency: t.recurrence?.frequency ?? null,
    repeat_interval: t.recurrence?.interval ?? null,
  };
}

// ── Semesters ────────────────────────────────────────────────────────────────

export function semesterFromApi(a: any): PlannerSemester {
  return {
    id: String(a.id),
    name: a.name ?? "",
    academicYear: a.academic_year ?? "",
    weeksCount: a.num_of_weeks ?? 16,
    status: (a.status ?? "planned") as any,
  };
}

export function semesterToApi(s: PlannerSemester) {
  return {
    name: s.name,
    academic_year: s.academicYear || new Date().getFullYear().toString(),
    num_of_weeks: s.weeksCount || 16,
    status: s.status || "planned",
  };
}

// ── Learning Plans ────────────────────────────────────────────────────────────

export function learningPlanFromApi(a: any): LearningPlan {
  return {
    id: String(a.id),
    title: a.title ?? "",
    description: a.description ?? "",
    goal: a.goal ?? "",
    category: a.category ?? "",
    targetSkill: a.target_skill ?? "",
    startDate: a.start_date ?? new Date().toISOString().slice(0, 10),
    endDate: a.end_date ?? undefined,
    status: (a.status ?? "planned") as any,
    stages: Array.isArray(a.stages) ? a.stages : (a.stages ? JSON.parse(a.stages) : []),
    milestones: Array.isArray(a.milestones) ? a.milestones : (a.milestones ? JSON.parse(a.milestones) : []),
    resources: Array.isArray(a.resources) ? a.resources : (a.resources ? JSON.parse(a.resources) : []),
    createdAt: a.created_at ?? new Date().toISOString(),
    updatedAt: a.updated_at ?? new Date().toISOString(),
  };
}

export function learningPlanToApi(p: LearningPlan) {
  return {
    title: p.title,
    goal: p.goal || "",
    description: p.description || null,
    category: p.category || null,
    target_skill: p.targetSkill || null,
    start_date: p.startDate || new Date().toISOString().slice(0, 10),
    end_date: p.endDate || null,
    status: p.status || "planned",
    stages: p.stages || [],
    milestones: p.milestones || [],
    resources: p.resources || [],
  };
}

// ── Reflections ────────────────────────────────────────────────────────────

export function reflectionFromApi(a: any): ReflectionEntry {
  return {
    id: String(a.id),
    title: a.title ?? "",
    date: a.date ?? new Date().toISOString().slice(0, 10),
    mood: (a.mood ?? "neutral") as any,
    achieved: a.achievements ?? "",
    difficult: a.difficulties ?? "",
    learned: a.learnings ?? "",
    improveNext: a.improvements ?? "",
    gratitude: a.gratitude ?? "",
    tags: Array.isArray(a.tags) ? a.tags : (a.tags ? JSON.parse(a.tags) : []),
    createdAt: a.created_at ?? new Date().toISOString(),
    updatedAt: a.updated_at ?? new Date().toISOString(),
  };
}

export function reflectionToApi(r: ReflectionEntry) {
  return {
    title: r.title,
    date: r.date || new Date().toISOString().slice(0, 10),
    mood: r.mood || "neutral",
    achievements: r.achieved || null,
    difficulties: r.difficult || null,
    learnings: r.learned || null,
    improvements: r.improveNext || null,
    gratitude: r.gratitude || null,
    tags: r.tags || [],
  };
}
