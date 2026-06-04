"use client";

import { useEffect } from "react";
import { AppStore } from "@/lib/store/app-store";

export function LanguageApplier() {
  useEffect(() => {
    const apply = (lang: string) => {
      const isAr = lang === "ar";
      document.documentElement.lang = lang;
      document.documentElement.dir = isAr ? "rtl" : "ltr";
      if (isAr) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    };

    // Apply on mount
    const state = AppStore.get();
    apply(state.userProfile?.language ?? "en");

    // Watch for state changes
    const unsubscribe = AppStore.subscribe((newState) => {
      apply(newState.userProfile?.language ?? "en");
    });

    // Watch for changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "studyflow_app_state" && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        apply(parsed.userProfile?.language ?? "en");
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
