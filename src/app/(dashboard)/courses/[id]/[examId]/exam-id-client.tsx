"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/hooks/use-app-state";
import { CourseService } from "@/services/course.service";
import { Course, Exam } from "@/types/course";
import { ExamPreparationTopic } from "@/types/exam-mode";
import { calcRevisionProgress } from "@/lib/exam-mode/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  FileText,
  Play,
  Link,
  ExternalLink,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const formatUrl = (url: string) => {
  if (!url) return "#";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

function useCountdown(targetDate?: string, targetTime?: string) {
  const getRemaining = useCallback(() => {
    if (!targetDate) return null;
    const deadline = new Date(targetDate);
    if (targetTime) {
      const [h, m] = targetTime.split(":").map(Number);
      deadline.setHours(h, m, 0, 0);
    } else {
      deadline.setHours(9, 0, 0, 0);
    }
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      isPast: false,
    };
  }, [targetDate, targetTime]);

  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(interval);
  }, [getRemaining]);
  return remaining;
}

// Helper: update exam inside course and sync to MySQL
function buildUpdatedCourse(course: Course, examId: string, updater: (e: Exam) => Exam): Course {
  const updatedWeeklyPlan = course.weeklyPlan?.map(w => ({
    ...w,
    exams: w.exams.map(e => e.id === examId ? updater(e) : e),
  }));
  const updatedTopExams = course.exams?.map(e => e.id === examId ? updater(e) : e);
  return { ...course, weeklyPlan: updatedWeeklyPlan, exams: updatedTopExams };
}

export function ExamModeClient() {
  const params = useParams();
  const router = useRouter();
  const courseId  = params.id      as string;
  const examId    = params.examId  as string;

  const { isLoaded: stateLoaded, courses, updateCourse } = useAppState();

  const [course, setCourse] = useState<Course | null>(null);
  const [exam,   setExam]   = useState<Exam   | null>(null);
  const [topics, setTopics]  = useState<ExamPreparationTopic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from appState on mount
  useEffect(() => {
    if (!stateLoaded) return;
    const c = courses.find(c => c.id === courseId) ?? null;
    if (!c) { setIsLoaded(true); return; }
    setCourse(c);

    let foundExam: Exam | null = null;
    for (const week of c.weeklyPlan ?? []) {
      const e = week.exams.find(ex => ex.id === examId);
      if (e) { foundExam = e; break; }
    }
    if (!foundExam) foundExam = c.exams?.find(e => e.id === examId) ?? null;
    setExam(foundExam);

    // Topics live inside the exam object; fall back to localStorage for migration
    if (foundExam) {
      if (foundExam.topics && foundExam.topics.length > 0) {
        setTopics(foundExam.topics);
      } else {
        // One-time migration from localStorage
        try {
          const raw = localStorage.getItem("studyflow_exam_prep");
          const all = raw ? JSON.parse(raw) : {};
          const key = `${courseId}__${examId}`;
          setTopics(all[key]?.topics ?? []);
        } catch { setTopics([]); }
      }
    }
    setIsLoaded(true);
  }, [stateLoaded, courses, courseId, examId]);

  // Persist topics change: update course in state + sync to MySQL
  const persistTopics = useCallback((newTopics: ExamPreparationTopic[]) => {
    setTopics(newTopics);
    if (!course) return;
    const updatedCourse = buildUpdatedCourse(course, examId, e => ({ ...e, topics: newTopics }));
    // Keep course ref in sync for subsequent calls in same session
    setCourse(updatedCourse);
    setExam(prev => prev ? { ...prev, topics: newTopics } : prev);
    updateCourse(updatedCourse);
    CourseService.update(updatedCourse.id, updatedCourse).then((newId) => {
      if (newId) updateCourse({ ...updatedCourse, id: newId });
    });
  }, [course, examId, updateCourse]);

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const topic: ExamPreparationTopic = {
      id: generateId(),
      title: newTopicTitle.trim(),
      completed: false,
    };
    persistTopics([...topics, topic]);
    setNewTopicTitle("");
  };

  const handleToggleTopic = (topicId: string) => {
    persistTopics(topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTopic = (topicId: string) => {
    persistTopics(topics.filter(t => t.id !== topicId));
  };

  const handleToggleExamCompletion = () => {
    if (!course || !exam) return;
    const newCompleted = !exam.completed;
    const updatedCourse = buildUpdatedCourse(course, examId, e => ({ ...e, completed: newCompleted }));
    setCourse(updatedCourse);
    setExam(prev => prev ? { ...prev, completed: newCompleted } : prev);
    updateCourse(updatedCourse);
    CourseService.update(updatedCourse.id, updatedCourse).then((newId) => {
      if (newId) updateCourse({ ...updatedCourse, id: newId });
    });
  };

  const countdown = useCountdown(exam?.date, exam?.time);
  const progress  = calcRevisionProgress(topics);

  if (!isLoaded || !exam) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={4} />
      </div>
    );
  }

  if (!course || !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <GraduationCap className="w-16 h-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">Exam not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const resources = course.resources ?? [];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":   return <FileText className="h-3.5 w-3.5" />;
      case "video": return <Play    className="h-3.5 w-3.5" />;
      default:      return <Link    className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="container px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{course.title}</span>
              <span>·</span>
              <span>{course.instructor}</span>
              {exam.date && (
                <>
                  <span>·</span>
                  <span>{new Date(exam.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  {exam.time && <span>at {exam.time}</span>}
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/20">
                <GraduationCap className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              {exam.title}
              <Badge variant="outline" className="text-xs ml-2 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400">
                Exam Mode
              </Badge>
              <Button
                variant={exam.completed ? "default" : "outline"}
                size="sm"
                onClick={handleToggleExamCompletion}
                className={cn(
                  "ml-auto gap-2 transition-all",
                  exam.completed
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                    : "border-slate-200 dark:border-slate-800",
                )}
              >
                {exam.completed
                  ? <><CheckCircle2 className="h-4 w-4" /> Completed</>
                  : <><Circle       className="h-4 w-4" /> Mark as Done</>}
              </Button>
            </h1>
          </div>
        </div>

        {/* Countdown + Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time Until Exam
              </CardTitle>
            </CardHeader>
            <CardContent>
              {countdown?.isPast ? (
                <div className="text-center py-4">
                  <p className="text-lg font-bold text-muted-foreground">This exam has already passed.</p>
                  <p className="text-sm text-muted-foreground mt-1">Review your preparation notes below.</p>
                </div>
              ) : countdown ? (
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { value: countdown.days,    label: "Days"  },
                    { value: countdown.hours,   label: "Hours" },
                    { value: countdown.minutes, label: "Min"   },
                    { value: countdown.seconds, label: "Sec"   },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <div className="w-full py-3 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          {String(value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No exam date set.</p>
              )}
              {exam.duration && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Duration: {exam.duration} minutes{exam.location ? ` · Location: ${exam.location}` : ""}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Revision Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center gap-4">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-foreground tabular-nums">{progress}%</span>
                <span className="text-sm text-muted-foreground mb-1">
                  {topics.filter(t => t.completed).length} / {topics.length} topics
                </span>
              </div>
              <Progress value={progress} className="h-3 rounded-full" />
              {progress === 100 && topics.length > 0 && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All topics reviewed! You&apos;re ready.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Topics + Resources */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className={resources.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
            <Card className="border-border/60 shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Preparation Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a preparation topic e.g. Chapter 3 Review"
                    value={newTopicTitle}
                    onChange={e => setNewTopicTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddTopic(); }}
                    className="h-10"
                  />
                  <Button size="sm" onClick={handleAddTopic} disabled={!newTopicTitle.trim()} className="shrink-0 gap-1.5 h-10 px-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {topics.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No topics yet. Add the chapters or concepts you want to review.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topics.map(topic => (
                      <div
                        key={topic.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-colors group",
                          topic.completed
                            ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30"
                            : "bg-card border-border/60 hover:border-primary/20",
                        )}
                      >
                        <button onClick={() => handleToggleTopic(topic.id)} className="shrink-0">
                          {topic.completed
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            : <Circle       className="w-5 h-5 text-muted-foreground/40 hover:text-primary transition-colors" />}
                        </button>
                        <span className={cn("flex-1 text-sm font-medium", topic.completed && "line-through text-muted-foreground")}>
                          {topic.title}
                        </span>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {resources.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Related Course Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {resources.map(r => (
                    <a
                      key={r.id}
                      href={formatUrl(r.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (r.url.startsWith("data:")) {
                          e.preventDefault();
                          try {
                            const parts = r.url.split(",");
                            const mime = parts[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
                            const bstr = atob(parts[1]);
                            let n = bstr.length;
                            const u8arr = new Uint8Array(n);
                            while (n--) {
                              u8arr[n] = bstr.charCodeAt(n);
                            }
                            const blob = new Blob([u8arr], { type: mime });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, "_blank");
                          } catch (err) {
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.write(
                                `<iframe src="${r.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                              );
                            }
                          }
                        }
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors group"
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        {getResourceIcon(r.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{r.title}</p>
                        <p className="text-xs text-muted-foreground uppercase">{r.type}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamModeClient;
