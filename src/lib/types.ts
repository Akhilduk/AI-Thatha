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

export interface ReadingResult {
  cards: DrawnCard[];
  past: ReadingSection;
  present: ReadingSection;
  future: ReadingSection;
  behaviour: ReadingSection;
}
