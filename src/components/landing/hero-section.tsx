"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

export function HeroSection() {
  const { tr, t } = useTranslation();

  const tasks = [
    { task: tr(t.landing.hero.gpa) === "GPA" ? "Data Structures Assignment" : "واجب هياكل البيانات", due: tr(t.landing.hero.gpa) === "GPA" ? "Tomorrow" : "غداً",        color: "bg-destructive/20 text-destructive" },
    { task: tr(t.landing.hero.gpa) === "GPA" ? "Calculus Quiz"            : "اختبار التفاضل",        due: tr(t.landing.hero.gpa) === "GPA" ? "In 3 days" : "بعد 3 أيام",  color: "bg-secondary/20 text-secondary" },
    { task: tr(t.landing.hero.gpa) === "GPA" ? "Physics Lab Report"        : "تقرير مختبر الفيزياء",  due: tr(t.landing.hero.gpa) === "GPA" ? "Next week" : "الأسبوع القادم", color: "bg-accent text-accent-foreground" },
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              {tr(t.landing.hero.badge)}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              {tr(t.landing.hero.title1)}{" "}
              <span className="text-secondary">{tr(t.landing.hero.title2)}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              {tr(t.landing.hero.subtitle)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base">
                <Link href="/register">
                  {tr(t.landing.hero.startNow)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{tr(t.landing.hero.yourProgress)}</h3>
                <span className="text-sm text-secondary font-medium">{tr(t.landing.hero.thisSemester)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{tr(t.landing.hero.gpa)}</p>
                  <p className="text-2xl font-bold text-foreground">3.75</p>
                  <p className="text-xs text-secondary">+0.15 from last</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{tr(t.landing.hero.credits)}</p>
                  <p className="text-2xl font-bold text-foreground">78/120</p>
                  <p className="text-xs text-secondary">65% {tr(t.landing.hero.complete)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tr(t.landing.hero.thisSemester)}</span>
                  <span className="font-medium text-foreground">72%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">{tr(t.calendar.upcoming)}</h4>
                <div className="space-y-2">
                  {tasks.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{item.task}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${item.color}`}>{item.due}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
