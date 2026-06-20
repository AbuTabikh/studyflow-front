"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { Course, StudyTask, Assignment, Exam, Resource, WeeklyPlan } from "@/types/course";
import { CourseService } from "@/services/course.service";
import { TaskService } from "@/services/task.service";
import { TaskItem } from "@/types/tasks";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";
import { Card } from "@/components/ui/card";
import { CourseHeroCard } from "@/components/course-details/course-hero-card";
import { WeeklyTimeline } from "@/components/course-details/weekly-timeline";
import { UpcomingTasks } from "@/components/course-details/upcoming-tasks";
import { Resources } from "@/components/course-details/resources";

type ItemType = "study-task" | "assignment" | "quiz" | "exam";

export function CourseDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isLoaded, courses, updateCourse } = useAppState();

  const course = courses.find(c => c.id === courseId) || null;

  const syncCourse = async (updated: Course) => {
    updateCourse(updated);
    const newId = await CourseService.update(updated.id, updated);
    if (newId && newId !== updated.id) {
      updateCourse({ ...updated, id: newId });
      router.replace(`/courses/${newId}`);
    }
  };

  // Auto-sync course to DB on first load if it only has a UUID (never saved to DB).
  // This ensures course_id is numeric before the user adds tasks/assignments.
  useEffect(() => {
    if (!isLoaded || !course) return;
    if (isNaN(parseInt(course.id, 10))) {
      syncCourse(course);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, course?.id]);

  // Persists a newly added week item to MySQL as a Task row
  const persistWeekItem = async (weekNumber: number, type: ItemType, item: StudyTask | Assignment | Exam) => {
    const now = new Date().toISOString();
    // Use the course id from state (updated by syncCourse) — prefer numeric DB id over URL param
    const effectiveCourseId = course?.id ?? courseId;
    let task: TaskItem;

    if (type === "study-task") {
      const st = item as StudyTask;
      task = {
        id: st.id, title: st.title, type: "study-task", priority: "medium",
        status: st.completed ? "done" : "todo", dueDate: st.dueDate,
        sourceModule: "course", linkedCourseId: effectiveCourseId, linkedWeekNumber: weekNumber,
        createdAt: now, updatedAt: now,
      };
    } else if (type === "assignment" || type === "quiz") {
      const a = item as Assignment;
      task = {
        id: a.id, title: a.title, description: a.description, type,
        priority: "medium", status: "todo", dueDate: a.dueDate,
        sourceModule: "course", linkedCourseId: effectiveCourseId, linkedWeekNumber: weekNumber,
        createdAt: now, updatedAt: now,
      };
    } else {
      const e = item as Exam;
      task = {
        id: e.id, title: e.title, type: "exam", priority: "high",
        status: e.completed ? "done" : "todo", dueDate: e.date, dueTime: e.time,
        sourceModule: "course", linkedCourseId: effectiveCourseId, linkedWeekNumber: weekNumber,
        createdAt: now, updatedAt: now,
      };
    }

    const mysqlId = await TaskService.create(task);
    return mysqlId ? String(mysqlId) : task.id;
  };

  const getFullWeeklyPlan = (course: Course): WeeklyPlan[] => {
    const totalWeeks = course.durationWeeks || 0;
    const existingWeeks = course.weeklyPlan || [];

    return Array.from({ length: totalWeeks }, (_, i) => {
      const weekNumber = i + 1;
      const existingWeek = existingWeeks.find(w => w.weekNumber === weekNumber);
      return existingWeek || {
        weekNumber,
        title: `Week ${weekNumber} Content`,
        studyTasks: [],
        assignments: [],
        exams: [],
        completed: false
      };
    });
  };

  const handleTaskComplete = (weekNumber: number, taskId: string, completed: boolean) => {
    if (!course) return;

    const fullPlan = getFullWeeklyPlan(course);
    const updatedWeeklyPlan = fullPlan.map((w: WeeklyPlan) => {
      if (w.weekNumber !== weekNumber) return w;

      const newStudyTasks = w.studyTasks.map((t: StudyTask) => t.id === taskId ? { ...t, completed } : t);
      const allTasksDone = newStudyTasks.length > 0 && newStudyTasks.every(t => t.completed);

      let newWeekCompleted = w.completed;
      if (allTasksDone && !w.completed) {
        newWeekCompleted = true;
      } else if (!allTasksDone && w.completed) {
        newWeekCompleted = false;
      }

      return {
        ...w,
        studyTasks: newStudyTasks,
        completed: newWeekCompleted
      };
    });

    const completedCount = updatedWeeklyPlan.filter(w => w.completed).length;
    const progress = Math.round((completedCount / updatedWeeklyPlan.length) * 100);

    syncCourse({
      ...course,
      weeklyPlan: updatedWeeklyPlan,
      progress
    });
  };

  const handleAddItem = async (weekNumber: number, type: ItemType, item: StudyTask | Assignment | Exam) => {
    if (!course) return;

    // Persist to MySQL tasks table (uses existing backend, no migration needed)
    const savedId = await persistWeekItem(weekNumber, type, item);
    const savedItem = { ...item, id: savedId };

    const fullPlan = getFullWeeklyPlan(course);
    const updatedWeeklyPlan = fullPlan.map(w => {
      if (w.weekNumber !== weekNumber) return w;
      if (type === "study-task")
        return { ...w, studyTasks: [...w.studyTasks, savedItem as StudyTask] };
      if (type === "assignment" || type === "quiz")
        return { ...w, assignments: [...w.assignments, savedItem as Assignment] };
      if (type === "exam")
        return { ...w, exams: [...w.exams, savedItem as Exam] };
      return w;
    });

    syncCourse({ ...course, weeklyPlan: updatedWeeklyPlan });
  };

  const handleWeekComplete = (weekNumber: number) => {
    if (!course) return;

    const fullPlan = getFullWeeklyPlan(course);
    const updatedWeeklyPlan = fullPlan.map(w => {
      if (w.weekNumber !== weekNumber) return w;

      const newState = !w.completed;
      const newStudyTasks = newState
        ? w.studyTasks.map(t => ({...t, completed: true}))
        : w.studyTasks;

      return {
        ...w,
        completed: newState,
        studyTasks: newStudyTasks
      };
    });

    const completedCount = updatedWeeklyPlan.filter(w => w.completed).length;
    const progress = Math.round((completedCount / updatedWeeklyPlan.length) * 100);

    syncCourse({
      ...course,
      weeklyPlan: updatedWeeklyPlan,
      progress
    });
  };

  const handleAssignmentStatusChange = (weekNumber: number, assignmentId: string, newStatus: Assignment["status"]) => {
    if (!course) return;

    const fullPlan = getFullWeeklyPlan(course);
    const updatedWeeklyPlan = fullPlan.map(w => {
      if (w.weekNumber !== weekNumber) return w;

      const newAssignments = w.assignments.map(a =>
        a.id === assignmentId ? { ...a, status: newStatus } : a
      );

      return {
        ...w,
        assignments: newAssignments
      };
    });

    syncCourse({
      ...course,
      weeklyPlan: updatedWeeklyPlan
    });
  };

  const handleExamComplete = (weekNumber: number, examId: string, completed: boolean) => {
    if (!course) return;

    const fullPlan = getFullWeeklyPlan(course);
    const updatedWeeklyPlan = fullPlan.map(w => {
      if (w.weekNumber !== weekNumber) return w;
      return {
        ...w,
        exams: w.exams.map(e => e.id === examId ? { ...e, completed } : e)
      };
    });

    syncCourse({
      ...course,
      weeklyPlan: updatedWeeklyPlan
    });
  };

  const handleResourcesChange = (resources: Resource[]) => {
    if (!course) return;
    syncCourse({ ...course, resources });
  };

  if (!course || !isLoaded) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={4} />
      </div>
    );
  }

  const weeks = getFullWeeklyPlan(course);
  const allTasks = weeks.flatMap((w) => w.studyTasks);
  const allAssignments = weeks.flatMap((w) => w.assignments);
  const allExams = weeks.flatMap((w) => w.exams);

  const completedWeeks = weeks.filter(w => w.completed).length;
  const progress = weeks.length > 0 ? Math.round((completedWeeks / weeks.length) * 100) : 0;
  const derivedCourse = { ...course, progress, currentWeek: completedWeeks };

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-6 space-y-8">
        <CourseHeroCard course={derivedCourse} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Weekly Timeline</h2>
                <p className="text-slate-600 dark:text-slate-400">View all weeks and track your progress</p>
              </div>
              <WeeklyTimeline
                weeks={weeks}
                courseId={courseId}
                onTaskComplete={handleTaskComplete}
                onAddItem={handleAddItem}
                onWeekComplete={handleWeekComplete}
                onAssignmentStatusChange={handleAssignmentStatusChange}
                onExamComplete={handleExamComplete}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <UpcomingTasks
              tasks={allTasks}
              assignments={allAssignments}
              exams={allExams}
              onTaskComplete={(taskId, completed) => {
                for (const w of weeks) {
                  const task = w.studyTasks.find((t: StudyTask) => t.id === taskId);
                  if (task) { handleTaskComplete(w.weekNumber, taskId, completed); return; }
                }
              }}
            />
            <Resources
              resources={course.resources}
              onResourcesChange={handleResourcesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsClient;
