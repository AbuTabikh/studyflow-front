"use client";

import { useAppState } from "@/hooks/use-app-state";
import { t, translate, type Lang } from "./translations";

export function useTranslation() {
  const { state } = useAppState();
  const lang: Lang = (state.userProfile?.language ?? "en") as Lang;

  return {
    lang,
    isRtl: lang === "ar",
    tr: (key: { en: string; ar: string }) => translate(key, lang),
    t,
  };
}
