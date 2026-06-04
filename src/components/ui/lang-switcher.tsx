"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";

export function LangSwitcher({ className }: { className?: string }) {
  const { state, updateState } = useAppState();
  const currentLang = state.userProfile?.language ?? "en";

  const toggle = () => {
    const next = currentLang === "en" ? "ar" : "en";
    updateState((prev) => ({
      ...prev,
      userProfile: { ...prev.userProfile, language: next },
    }));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={`gap-1.5 font-semibold text-sm ${className ?? ""}`}
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      {currentLang === "en" ? "العربية" : "English"}
    </Button>
  );
}
