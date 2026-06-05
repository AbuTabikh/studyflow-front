"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LearningPlan,
  LearningStage,
  LearningMilestone,
  LearningResource,
  SelfLearningTask,
} from "@/types/self-learning";
import { StageTasksList } from "@/components/self-learning/stage-tasks";
import { calcPlanProgress, formatDate } from "@/lib/self-learning/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Target,
  Calendar,
  ChevronDown,
  Zap,
  BookOpen,
  Flag,
  PauseCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StageFormDialog } from "@/components/self-learning/stage-form-dialog";
import { MilestoneFormDialog } from "@/components/self-learning/milestone-form-dialog";
import { LearningPlanFormDialog } from "@/components/self-learning/learning-plan-form-dialog";
import { PlanResourcesPanel } from "@/components/self-learning/plan-resources-panel";
import { ReminderBadge } from "@/components/shared/reminder-badge";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useAppState } from "@/hooks/use-app-state";
import { useTranslation } from "@/lib/i18n/use-translation";
import { LearningPlanService } from "@/services/learning-plan.service";


export function SelfLearningDetailClient() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const { state, isLoaded, updateState } = useAppState();
  const { tr, t } = useTranslation();

  const STATUS_BADGE: Record<
    LearningPlan["status"],
    { label: string; className: string; icon: React.ReactNode }
  > = {
    active: {
      label: tr(t.selfLearning.active),
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0",
      icon: <Zap className="w-3 h-3" />,
    },
    planned: {
      label: tr(t.selfLearning.planned),
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0",
      icon: <BookOpen className="w-3 h-3" />,
    },
    completed: {
      label: tr(t.selfLearning.completed),
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    paused: {
      label: tr(t.selfLearning.paused),
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0",
      icon: <PauseCircle className="w-3 h-3" />,
    },
  };

  const STAGE_STATUS: Record<LearningStage["status"], { label: string; color: string }> = {
    "not-started": { label: tr(t.selfLearning.notStarted), color: "text-muted-foreground" },
    active: { label: tr(t.selfLearning.active), color: "text-blue-600 dark:text-blue-400" },
    completed: { label: tr(t.selfLearning.completed), color: "text-emerald-600 dark:text-emerald-400" },
  };

  const plan = useMemo(() => {
    return state.selfLearningPlans.find((p) => p.id === planId) || null;
  }, [state.selfLearningPlans, planId]);

  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<LearningStage | null>(null);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<LearningMilestone | null>(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);

  const persistPlan = async (updated: LearningPlan) => {
    updateState((prev) => {
      const idx = prev.selfLearningPlans.findIndex((p) => p.id === updated.id);
      if (idx === -1) return prev;
      const newPlans = [...prev.selfLearningPlans];
      newPlans[idx] = updated;
      return { ...prev, selfLearningPlans: newPlans };
    });

    const newId = await LearningPlanService.update(updated.id, updated);
    if (newId && newId !== updated.id) {
      // Plan was re-created (404 or UUID) — update state with new DB id and navigate
      updateState((prev) => ({
        ...prev,
        selfLearningPlans: prev.selfLearningPlans.map((p) =>
          p.id === updated.id ? { ...p, id: newId } : p
        ),
      }));
      router.replace(`/self-learning/${newId}`);
    }
  };

  const progress = useMemo(() => (plan ? calcPlanProgress(plan) : 0), [plan]);

  if (!isLoaded || !plan) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={5} />
      </div>
    );
  }

  const badge = STATUS_BADGE[plan.status];
  const completedStages = plan.stages.filter((s) => s.status === "completed").length;
  const completedMilestones = plan.milestones.filter((m) => m.completed).length;

  const handleSaveStage = (stage: LearningStage) => {
    const updated = {
      ...plan,
      stages: plan.stages.some((s) => s.id === stage.id)
        ? plan.stages.map((s) => (s.id === stage.id ? stage : s))
        : [...plan.stages, stage].sort((a, b) => a.order - b.order),
      updatedAt: new Date().toISOString(),
    };
    persistPlan(updated);
  };

  const handleDeleteStage = (id: string) => setStageToDelete(id);

  const confirmDeleteStage = () => {
    if (!stageToDelete || !plan) return;
    persistPlan({
      ...plan,
      stages: plan.stages.filter((s) => s.id !== stageToDelete),
      updatedAt: new Date().toISOString(),
    });
    setStageToDelete(null);
  };

  const handleCompleteStage = (id: string) => {
    const stages = plan.stages.map((s) =>
      s.id === id ? { ...s, status: "completed" as const, updatedAt: new Date().toISOString() } : s,
    );
    persistPlan({ ...plan, stages, updatedAt: new Date().toISOString() });
  };

  const handleSaveMilestone = (milestone: LearningMilestone) => {
    const updated = {
      ...plan,
      milestones: plan.milestones.some((m) => m.id === milestone.id)
        ? plan.milestones.map((m) => (m.id === milestone.id ? milestone : m))
        : [...plan.milestones, milestone],
      updatedAt: new Date().toISOString(),
    };
    persistPlan(updated);
  };

  const handleToggleMilestone = (id: string) => {
    const milestones = plan.milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m,
    );
    persistPlan({ ...plan, milestones, updatedAt: new Date().toISOString() });
  };

  const handleDeleteMilestone = (id: string) => setMilestoneToDelete(id);

  const confirmDeleteMilestone = () => {
    if (!milestoneToDelete || !plan) return;
    persistPlan({
      ...plan,
      milestones: plan.milestones.filter((m) => m.id !== milestoneToDelete),
      updatedAt: new Date().toISOString(),
    });
    setMilestoneToDelete(null);
  };

  const handleResourcesChange = (resources: LearningResource[]) => {
    persistPlan({ ...plan, resources, updatedAt: new Date().toISOString() });
  };

  const handleEditPlan = (updated: LearningPlan) => persistPlan(updated);

  const handleStageTasksChange = (stageId: string, tasks: SelfLearningTask[]) => {
    if (!plan) return;
    const hasTasks = tasks.length > 0;
    const allDone = hasTasks && tasks.every((t) => t.completed);
    const stages = plan.stages.map((s) => {
      if (s.id !== stageId) return s;
      let newStatus = s.status;
      if (allDone && s.status !== "completed") newStatus = "completed";
      else if (hasTasks && !allDone && s.status === "completed") newStatus = "active";
      return { ...s, tasks, status: newStatus, updatedAt: new Date().toISOString() };
    });
    persistPlan({ ...plan, stages, updatedAt: new Date().toISOString() });
  };

  const toggleStage = (id: string) =>
    setExpandedStages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{plan.title}</h1>
                  <Badge className={cn("gap-1 text-xs", badge.className)}>
                    {badge.icon}
                    {badge.label}
                  </Badge>
                </div>
                {plan.goal && <p className="text-muted-foreground text-sm">{plan.goal}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {plan.category && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-medium">
                      {plan.category}
                    </span>
                  )}
                  {plan.targetSkill && (
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {plan.targetSkill}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {tr(t.selfLearning.started)} {formatDate(plan.startDate)}
                  </span>
                  {plan.endDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {tr(t.selfLearning.ends)} {formatDate(plan.endDate)}
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditPlanOpen(true)} className="gap-2 rounded-xl shrink-0">
                <Pencil className="h-4 w-4" /> {tr(t.selfLearning.editPlan)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: tr(t.selfLearning.overallProgress), value: `${progress}%`, sub: tr(t.selfLearning.stagesCompleted) },
          { label: tr(t.selfLearning.stages), value: `${completedStages}/${plan.stages.length}`, sub: tr(t.selfLearning.completed) },
          { label: tr(t.selfLearning.milestones), value: `${completedMilestones}/${plan.milestones.length}`, sub: tr(t.selfLearning.achieved) },
          { label: tr(t.selfLearning.resources), value: `${plan.resources.length}`, sub: tr(t.selfLearning.attached) },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="border-border/60 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">{tr(t.selfLearning.learningProgress)}</span>
            <span className="font-bold text-foreground tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
          {progress === 100 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {tr(t.selfLearning.allStagesDone)}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">{tr(t.selfLearning.stages)}</h2>
            <Button size="sm" onClick={() => { setEditingStage(null); setStageDialogOpen(true); }} className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> {tr(t.selfLearning.addStage)}
            </Button>
          </div>

          {plan.stages.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground bg-muted/10">
              <p className="text-sm">{tr(t.selfLearning.noStagesYet)}</p>
              <Button size="sm" variant="ghost" onClick={() => setStageDialogOpen(true)} className="mt-2 gap-1">
                <Plus className="h-3.5 w-3.5" /> {tr(t.selfLearning.addFirstStage)}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {plan.stages.map((stage) => {
                const isExpanded = expandedStages.includes(stage.id);
                const ss = STAGE_STATUS[stage.status];
                return (
                  <Card key={stage.id} className={cn("border-border/60 overflow-hidden", stage.status === "completed" && "opacity-75")}>
                    <div className={cn("h-0.5", stage.status === "completed" ? "bg-emerald-500" : stage.status === "active" ? "bg-blue-500" : "bg-muted")} />
                    <div className="px-5 py-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleStage(stage.id)}
                        onKeyDown={(e) => e.key === "Enter" && toggleStage(stage.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
                      >
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-180")} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">{stage.title}</span>
                            <span className={cn("text-xs font-medium", ss.color)}>{ss.label}</span>
                          </div>
                          {stage.targetDuration && <p className="text-xs text-muted-foreground mt-0.5">{tr(t.selfLearning.durationLabel)} {stage.targetDuration}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {stage.status !== "completed" && (
                          <Button size="sm" variant="ghost" className="text-xs gap-1 h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => handleCompleteStage(stage.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> {tr(t.selfLearning.done)}
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingStage(stage); setStageDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteStage(stage.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border/50 px-5 py-4 space-y-4 bg-muted/20">
                        <div className="pb-2">
                          <StageTasksList tasks={stage.tasks || []} onTasksChange={(newTasks) => handleStageTasksChange(stage.id, newTasks)} />
                        </div>
                        {stage.description && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground">{tr(t.selfLearning.overview)}</p>
                            <p className="text-sm text-muted-foreground">{stage.description}</p>
                          </div>
                        )}
                        {stage.goals && (
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">{tr(t.selfLearning.goals)}</p>
                            <div className="text-sm text-muted-foreground whitespace-pre-line bg-background/50 p-3 rounded-lg border border-border/40 font-medium leading-relaxed">{stage.goals}</div>
                          </div>
                        )}
                        {!stage.description && !stage.goals && !stage.tasks?.length && (
                          <p className="text-sm text-muted-foreground italic">{tr(t.selfLearning.noDetailsYet)}</p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" /> {tr(t.selfLearning.milestones)}
            </h2>
            <Button size="sm" onClick={() => { setEditingMilestone(null); setMilestoneDialogOpen(true); }} className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> {tr(t.selfLearning.addMilestone)}
            </Button>
          </div>

          {plan.milestones.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground bg-muted/10">
              <p className="text-sm">{tr(t.selfLearning.noMilestonesYet)}</p>
              <Button size="sm" variant="ghost" onClick={() => setMilestoneDialogOpen(true)} className="mt-2 gap-1">
                <Plus className="h-3.5 w-3.5" /> {tr(t.selfLearning.addMilestone)}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {plan.milestones.map((m) => (
                <div key={m.id} className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all group", m.completed ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30 opacity-75" : "bg-card border-border/60 hover:border-primary/20")}>
                  <button onClick={() => handleToggleMilestone(m.id)} className="shrink-0">
                    {m.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-amber-500 transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", m.completed && "line-through text-muted-foreground")}>{m.title}</p>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.description}</p>}
                    {m.targetDate && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(m.targetDate)}
                      </p>
                    )}
                    <ReminderBadge config={m.reminderConfig} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingMilestone(m); setMilestoneDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteMilestone(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <PlanResourcesPanel resources={plan.resources} onResourcesChange={handleResourcesChange} />
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-violet-700 dark:text-violet-400">{tr(t.selfLearning.journeySummary)}</CardTitle>
              <Target className="w-4 h-4 text-violet-500" />
            </CardHeader>
            <CardContent className="space-y-4 text-sm mt-1">
              <div className="relative pl-4 border-l-2 border-violet-200 dark:border-violet-800 space-y-5">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                  <p className="text-xs font-semibold text-foreground">{tr(t.selfLearning.startedOn)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(plan.startDate)}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-950 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <p className="text-xs font-semibold text-foreground">{tr(t.selfLearning.currentlyAt)}</p>
                  {plan.stages.find((s) => s.status === "active") ? (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{plan.stages.find((s) => s.status === "active")!.title}</p>
                  ) : progress === 100 && plan.stages.length > 0 ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{tr(t.selfLearning.completedAllStages)}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{tr(t.selfLearning.planningIdle)}</p>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-violet-400 border-2 border-white dark:border-slate-950" />
                  <p className="text-xs font-semibold text-foreground">{tr(t.selfLearning.lookingAhead)}</p>
                  {plan.stages.length > 0 ? (
                    <p className="text-xs text-muted-foreground">{plan.stages.filter((s) => s.status !== "completed").length} {tr(t.selfLearning.stagesRemaining)}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{tr(t.selfLearning.addStagesToMap)}</p>
                  )}
                  {plan.milestones.filter((m) => !m.completed && m.targetDate).sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())[0] && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1 flex items-center gap-1">
                      <Flag className="w-3 h-3" /> {tr(t.selfLearning.nextLabel)} {plan.milestones.filter((m) => !m.completed && m.targetDate)[0].title}
                    </p>
                  )}
                </div>
              </div>
              {plan.description && (
                <div className="pt-3 flex flex-col gap-2 border-t border-violet-100 dark:border-violet-800/50">
                  <p className="text-xs text-muted-foreground font-semibold">{tr(t.selfLearning.goalLabel)}</p>
                  <p className="text-xs italic text-muted-foreground leading-relaxed">&quot;{plan.description}&quot;</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LearningPlanFormDialog open={editPlanOpen} onOpenChange={setEditPlanOpen} onSave={handleEditPlan} initialData={plan} />
      <StageFormDialog open={stageDialogOpen} onOpenChange={setStageDialogOpen} onSave={handleSaveStage} initialData={editingStage} planId={planId} nextOrder={plan.stages.length + 1} />
      <MilestoneFormDialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen} onSave={handleSaveMilestone} initialData={editingMilestone} planId={planId} />
      <ConfirmActionDialog isOpen={!!stageToDelete} title={tr(t.selfLearning.deleteStage)} description={tr(t.selfLearning.deleteStageMsg)} confirmText={tr(t.actions.delete)} onConfirm={confirmDeleteStage} onCancel={() => setStageToDelete(null)} />
      <ConfirmActionDialog isOpen={!!milestoneToDelete} title={tr(t.selfLearning.deleteMilestone)} description={tr(t.selfLearning.deleteMilestoneMsg)} confirmText={tr(t.actions.delete)} onConfirm={confirmDeleteMilestone} onCancel={() => setMilestoneToDelete(null)} />
    </div>
  );
}

export default SelfLearningDetailClient;
