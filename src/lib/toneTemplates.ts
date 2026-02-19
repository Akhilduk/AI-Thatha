import type { ReadingResult, ToneMode } from "@/lib/types";

const funnySuffixEn = [
  "And yes, your inner crow has opinions today.",
  "Cosmic aunties are gossiping in your favor.",
  "Even the universe says: sip tea, then decide."
];
const funnySuffixMl = [
  "ഇന്ന് നിങ്ങളുടെ ഉള്ളിലെ കാക്കയ്ക്കും അഭിപ്രായമുണ്ട്.",
  "ബ്രഹ്മാണ്ഡത്തിലെ അമ്മായിമാർ നിങ്ങളുടെ പേരിൽ ചർച്ചയിലാണ്.",
  "വിശ്വവും പറയുന്നു: ഒരു ചായ കുടിച്ച് തീരുമാനം എടുക്കൂ."
];

function applyTone(text: string, tone: ToneMode, lang: "en" | "ml"): string {
  if (tone === "default") return text;
  if (tone === "short") {
    const trimmed = text.split(".")[0]?.trim();
    return trimmed ? `${trimmed}.` : text;
  }
  if (tone === "detailed") {
    return `${text} ${
      lang === "en"
        ? "Take small, consistent actions and re-check your direction by evening."
        : "ചെറിയതെങ്കിലും സ്ഥിരതയുള്ള നടപടികൾ എടുത്ത് വൈകുന്നേരത്തോടെ ദിശ വീണ്ടും പരിശോധിക്കുക."
    }`;
  }
  if (tone === "serious") {
    return `${
      lang === "en"
        ? "Reflect carefully: "
        : "ശ്രദ്ധയോടെ ആലോചിക്കുക: "
    }${text}`;
  }
  if (tone === "funny") {
    const suffixes = lang === "en" ? funnySuffixEn : funnySuffixMl;
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${text} ${suffix}`;
  }
  return text;
}

export function restyleReading(reading: ReadingResult, tone: ToneMode): ReadingResult {
  return {
    ...reading,
    past: {
      en: applyTone(reading.past.en, tone, "en"),
      ml: applyTone(reading.past.ml, tone, "ml")
    },
    present: {
      en: applyTone(reading.present.en, tone, "en"),
      ml: applyTone(reading.present.ml, tone, "ml")
    },
    future: {
      en: applyTone(reading.future.en, tone, "en"),
      ml: applyTone(reading.future.ml, tone, "ml")
    },
    behaviour: {
      en: applyTone(reading.behaviour.en, tone, "en"),
      ml: applyTone(reading.behaviour.ml, tone, "ml")
    }
  };
}
