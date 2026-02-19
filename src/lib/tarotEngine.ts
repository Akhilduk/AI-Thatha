import { majorArcana } from "@/data/tarot";
import { computeBehaviour } from "@/lib/behaviourEngine";
import type { DrawnCard, ReadingApiPayload, ReadingResult, ReadingSlot, TarotCard } from "@/lib/types";

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

export function drawCards(rng: () => number): DrawnCard[] {
  const slots: ReadingSlot[] = ["past", "present", "future"];
  return pickUniqueCards(rng, 3).map((card, i) => ({
    slot: slots[i],
    card,
    reversed: rng() < 0.5
  }));
}

export function buildLocalReading(cards: DrawnCard[], payload: ReadingApiPayload): ReadingResult {
  const selected = majorArcana.find((c) => c.id === payload.selectedCardId) ?? cards[1]?.card ?? cards[0].card;
  const behaviour = computeBehaviour(cards);

  const enPrefix = `${payload.name || "Seeker"}, ${selected.name_en} guides your path today.`;
  const mlPrefix = `${payload.name || "സാധകൻ"}, ${selected.name_ml} ഇന്ന് നിങ്ങളുടെ വഴി കാണിക്കുന്നു.`;

  return {
    cardId: selected.id,
    cards,
    past: {
      en: `${enPrefix} Your past shows ${cards[0].card.meaning_upright_en}`,
      ml: `${mlPrefix} ഭൂതകാലത്തിൽ ${cards[0].card.meaning_upright_ml}`
    },
    present: {
      en: `In the present, ${cards[1].card.name_en} asks for ${cards[1].card.meaning_upright_en}`,
      ml: `ഇപ്പോൾ ${cards[1].card.name_ml} നിങ്ങളോട് ${cards[1].card.meaning_upright_ml} ആവശ്യപ്പെടുന്നു`
    },
    future: {
      en: `Your future opens through ${cards[2].card.name_en}: ${cards[2].card.meaning_upright_en}`,
      ml: `ഭാവി ${cards[2].card.name_ml} വഴി തുറക്കുന്നു: ${cards[2].card.meaning_upright_ml}`
    },
    behaviour,
    advice: {
      en: payload.dob
        ? `Since your birth date is ${payload.dob}, move with patience and ritual discipline.`
        : "Move with patience, compassion, and ritual discipline.",
      ml: payload.dob
        ? `നിങ്ങളുടെ ജനനത്തിയതി ${payload.dob} ആയതിനാൽ ക്ഷമയോടെ മുന്നേറുക.`
        : "ക്ഷമയോടും കരുണയോടും കൂടി മുന്നേറുക."
    },
    funnyParrotLines: {
      en: ["I saw your future. It asked for chai first.", "Parrot verdict: less overthinking, more dancing."],
      ml: ["ഭാവി നോക്കി… ആദ്യം ചായ വേണമെന്ന് പറഞ്ഞു.", "താത്തയുടെ ഉത്തരവ്: ഒവർതിങ്കിംഗ് കുറച്ച് ചിരി കൂട്ടൂ."]
    },
    metadata: {
      tone: "cinematic_kerala_jyothisham",
      luckyColor: "Brass Gold",
      luckyTimeWindow: "6:30 PM - 7:30 PM",
      dobUsed: Boolean(payload.dob)
    }
  };
}
