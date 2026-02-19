import type { DrawnCard, ReadingSection } from "@/lib/types";

const archetypeMap: Record<string, { en: string; ml: string }> = {
  fool: { en: "explorer", ml: "അന്വേഷകൻ" },
  magician: { en: "craftsperson", ml: "സൃഷ്ടിശീലൻ" },
  high_priestess: { en: "intuitive thinker", ml: "അന്തര്ജ്ഞാനിയൻ" },
  empress: { en: "nurturer", ml: "പരിപാലകൻ" },
  emperor: { en: "organizer", ml: "ക്രമവത്കരകൻ" },
  hierophant: { en: "traditional guide", ml: "പരമ്പരാഗത മാർഗദർശി" },
  lovers: { en: "connector", ml: "ബന്ധങ്ങളെ വിലമതിക്കുന്നവൻ" },
  chariot: { en: "driver", ml: "മുന്നോട്ട് നീക്കുന്നവൻ" },
  strength: { en: "steady heart", ml: "ശാന്തശക്തിയുള്ളവൻ" },
  hermit: { en: "reflector", ml: "സ്വയംചിന്തകൻ" },
  wheel_of_fortune: { en: "adaptive spirit", ml: "മാറ്റത്തെ സ്വീകരിക്കുന്നവൻ" },
  justice: { en: "balancer", ml: "തുല്യത പാലിക്കുന്നവൻ" },
  hanged_man: { en: "reframer", ml: "പുതിയ ദൃഷ്ടികോണം കണ്ടെത്തുന്നവൻ" },
  death: { en: "transformer", ml: "മാറ്റം കൊണ്ടുവരുന്നവൻ" },
  temperance: { en: "harmonizer", ml: "സമന്വയിപ്പിക്കുന്നവൻ" },
  devil: { en: "intense seeker", ml: "തീവ്ര ആഗ്രഹങ്ങളുള്ളവൻ" },
  tower: { en: "breaker of old patterns", ml: "പഴയ പാറ്റേണുകൾ തകർക്കുന്നവൻ" },
  star: { en: "hope carrier", ml: "പ്രതീക്ഷ കൈവഹിക്കുന്നവൻ" },
  moon: { en: "dream walker", ml: "സ്വപ്നങ്ങളുടെ യാത്രികൻ" },
  sun: { en: "radiant optimist", ml: "പ്രകാശമുള്ള പ്രത്യാശാവാദി" },
  judgement: { en: "awakener", ml: "ജാഗ്രതയുണർത്തുന്നവൻ" },
  world: { en: "completer", ml: "സമാപ്തിയിലേക്കു കൊണ്ടുപോകുന്നവൻ" }
};

export function computeBehaviour(cards: DrawnCard[]): ReadingSection {
  const archetypes = cards
    .map((c) => archetypeMap[c.card.id])
    .filter(Boolean)
    .slice(0, 3);

  const keywordEn = cards.flatMap((c) => c.card.keywords_en).slice(0, 5);
  const keywordMl = cards.flatMap((c) => c.card.keywords_ml).slice(0, 5);

  const reversedCount = cards.filter((c) => c.reversed).length;
  const polarityEn =
    reversedCount >= 2
      ? "You may be overthinking and resisting flow."
      : "Your energy is mostly forward and expressive.";
  const polarityMl =
    reversedCount >= 2
      ? "നിങ്ങൾ അധികം ആലോചിച്ച് പ്രവാഹത്തെ തടയുന്ന സാഹചര്യം കാണുന്നു."
      : "നിങ്ങളുടെ ഊർജം മുന്നോട്ടുള്ള പ്രകടനത്തിലേക്കാണ് പോകുന്നത്.";

  return {
    en: `Behaviour shows a blend of ${
      archetypes.map((a) => a.en).join(", ") || "adaptive instincts"
    }. Key traits right now: ${keywordEn.join(", ")}. ${polarityEn}`,
    ml: `സ്വഭാവത്തിൽ ${
      archetypes.map((a) => a.ml).join(", ") || "മാറ്റത്തെ സ്വീകരിക്കുന്ന പ്രവണത"
    } എന്ന മിശ്രണം കാണുന്നു. ഇപ്പോഴത്തെ പ്രധാന ഗുണങ്ങൾ: ${keywordMl.join(", ")}. ${polarityMl}`
  };
}
