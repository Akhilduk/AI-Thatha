import { majorArcana } from "@/data/tarot";
import { computeBehaviour } from "@/lib/behaviourEngine";
import type { DrawnCard, ReadingResult, ReadingSection, ReadingSlot, TarotCard } from "@/lib/types";

function pickUniqueCards(rng: () => number, count: number): TarotCard[] {
  const pool = [...majorArcana];
  const result: TarotCard[] = [];
  for (let i = 0; i < count; i += 1) {
    const idx = Math.floor(rng() * pool.length);
    const selected = pool.splice(idx, 1)[0];
    result.push(selected);
  }
  return result;
}

function buildSection(card: DrawnCard, slot: ReadingSlot): ReadingSection {
  const modeEn = card.reversed ? card.card.meaning_reversed_en : card.card.meaning_upright_en;
  const modeMl = card.reversed ? card.card.meaning_reversed_ml : card.card.meaning_upright_ml;

  const slotPrefixEn: Record<ReadingSlot, string> = {
    past: "Past signal:",
    present: "Present signal:",
    future: "Future signal:"
  };
  const slotPrefixMl: Record<ReadingSlot, string> = {
    past: "ഭൂതസൂചന:",
    present: "ഇപ്പോഴത്തെ സൂചന:",
    future: "ഭാവിസാധ്യത:"
  };

  return {
    en: `${slotPrefixEn[slot]} ${card.card.name_en} ${
      card.reversed ? "(Reversed)" : "(Upright)"
    } suggests ${modeEn}`,
    ml: `${slotPrefixMl[slot]} ${card.card.name_ml} ${
      card.reversed ? "(തിരിഞ്ഞത്)" : "(നേരായത്)"
    } എന്ന രീതിയിൽ ${modeMl}`
  };
}

export function generateReading(rng: () => number): ReadingResult {
  const slots: ReadingSlot[] = ["past", "present", "future"];
  const cards = pickUniqueCards(rng, 3).map((card, i) => ({
    slot: slots[i],
    card,
    reversed: rng() < 0.5
  })) satisfies DrawnCard[];

  const pastCard = cards.find((c) => c.slot === "past") as DrawnCard;
  const presentCard = cards.find((c) => c.slot === "present") as DrawnCard;
  const futureCard = cards.find((c) => c.slot === "future") as DrawnCard;

  return {
    cards,
    past: buildSection(pastCard, "past"),
    present: buildSection(presentCard, "present"),
    future: buildSection(futureCard, "future"),
    behaviour: computeBehaviour(cards)
  };
}
