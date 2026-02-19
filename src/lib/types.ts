export type AppLanguage = "en" | "ml" | "both";
export type ToneMode = "default" | "funny" | "serious" | "short" | "detailed";
export type ReadingSlot = "past" | "present" | "future";

export interface TarotCard {
  id: string;
  name_en: string;
  name_ml: string;
  meaning_upright_en: string;
  meaning_reversed_en: string;
  meaning_upright_ml: string;
  meaning_reversed_ml: string;
  keywords_en: string[];
  keywords_ml: string[];
}

export interface DrawnCard {
  slot: ReadingSlot;
  card: TarotCard;
  reversed: boolean;
}

export interface ReadingSection {
  en: string;
  ml: string;
}

export interface ReadingMetadata {
  tone: "cinematic_kerala_jyothisham";
  luckyColor: string;
  luckyTimeWindow: string;
  dobUsed: boolean;
}

export interface ReadingResult {
  cardId: string;
  cards: DrawnCard[];
  past: ReadingSection;
  present: ReadingSection;
  future: ReadingSection;
  behaviour: ReadingSection;
  advice: ReadingSection;
  funnyParrotLines: { en: string[]; ml: string[] };
  metadata: ReadingMetadata;
}

export interface ReadingApiPayload {
  name: string;
  dob: string;
  selectedCardId: string;
  includeImageForAi?: boolean;
  imageBase64?: string | null;
}
