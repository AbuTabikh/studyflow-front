"use client";

import { t, translate, type Lang } from "./translations";

const LANG: Lang = "en";

export function useTranslation() {
  return {
    lang: LANG,
    isRtl: false,
    tr: (key: { en: string; ar: string }) => translate(key, LANG),
    t,
  };
}
