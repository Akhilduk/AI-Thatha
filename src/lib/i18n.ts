import en from "@/data/i18n/en.json";
import ml from "@/data/i18n/ml.json";
import type { AppLanguage } from "@/lib/types";

export type Dictionary = typeof en;

export function t(language: AppLanguage, key: keyof Dictionary): string {
  if (language === "ml") return ml[key];
  return en[key];
}

export function visibleLanguages(language: AppLanguage): Array<"en" | "ml"> {
  if (language === "both") return ["en", "ml"];
  return [language];
}
