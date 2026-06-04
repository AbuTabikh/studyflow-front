"use client";

import { BookOpen, ListChecks, BarChart3, Route } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

export function FeaturesSection() {
  const { tr, t } = useTranslation();

  const features = [
    { icon: BookOpen,   title: tr(t.landing.features.f1title), description: tr(t.landing.features.f1desc) },
    { icon: ListChecks, title: tr(t.landing.features.f2title), description: tr(t.landing.features.f2desc) },
    { icon: BarChart3,  title: tr(t.landing.features.f3title), description: tr(t.landing.features.f3desc) },
    { icon: Route,      title: tr(t.landing.features.f4title), description: tr(t.landing.features.f4desc) },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {tr(t.landing.features.sectionTitle)}
          </h2>
          <p className="text-lg text-muted-foreground">
            {tr(t.landing.features.sectionSub)}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
