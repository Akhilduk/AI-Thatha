import { NextResponse } from "next/server";
import { majorArcana } from "@/data/tarot";
import { buildLocalReading } from "@/lib/tarotEngine";
import type { ReadingApiPayload, ReadingResult } from "@/lib/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseReading(data: unknown): ReadingResult | null {
  if (!isRecord(data)) return null;
  if (typeof data.cardId !== "string") return null;
  if (!isRecord(data.en) || !isRecord(data.ml) || !isRecord(data.metadata)) return null;
  const reqKeys = ["past", "present", "future", "behavior", "advice"] as const;
  for (const key of reqKeys) {
    if (typeof data.en[key] !== "string" || typeof data.ml[key] !== "string") return null;
  }
  if (!Array.isArray(data.en.funny_parrot_lines) || !Array.isArray(data.ml.funny_parrot_lines)) return null;

  const selected = majorArcana.find((c) => c.id === data.cardId) ?? majorArcana[0];
  return {
    cardId: data.cardId,
    cards: [
      { slot: "past", card: selected, reversed: false },
      { slot: "present", card: selected, reversed: false },
      { slot: "future", card: selected, reversed: false }
    ],
    past: { en: String(data.en.past), ml: String(data.ml.past) },
    present: { en: String(data.en.present), ml: String(data.ml.present) },
    future: { en: String(data.en.future), ml: String(data.ml.future) },
    behaviour: { en: String(data.en.behavior), ml: String(data.ml.behavior) },
    advice: { en: String(data.en.advice), ml: String(data.ml.advice) },
    funnyParrotLines: {
      en: data.en.funny_parrot_lines.map(String),
      ml: data.ml.funny_parrot_lines.map(String)
    },
    metadata: {
      tone: "cinematic_kerala_jyothisham",
      luckyColor: String(data.metadata.luckyColor ?? "Lamp Orange"),
      luckyTimeWindow: String(data.metadata.luckyTimeWindow ?? "6:00 PM - 7:00 PM"),
      dobUsed: true
    }
  };
}

async function generateWithOpenAI(payload: ReadingApiPayload): Promise<ReadingResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const card = majorArcana.find((c) => c.id === payload.selectedCardId);
  const prompt = `Return strict JSON only. Card: ${card?.name_en}. Name: ${payload.name}. DOB: ${payload.dob}. Malayalam must be natural Kerala style. Schema: {"cardId": string,"en":{"past":string,"present":string,"future":string,"behavior":string,"advice":string,"funny_parrot_lines":string[]},"ml":{"past":string,"present":string,"future":string,"behavior":string,"advice":string,"funny_parrot_lines":string[]},"metadata":{"tone":"cinematic_kerala_jyothisham","luckyColor":string,"luckyTimeWindow":string}}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_READING_MODEL ?? "gpt-4o-mini",
        input: attempt === 0 ? prompt : `Fix previous response into strict JSON only. ${prompt}`,
        text: { format: { type: "json_object" } }
      })
    });

    if (!response.ok) continue;
    const body = await response.json();
    const outputText = body.output_text as string | undefined;
    if (!outputText) continue;
    try {
      const parsed = parseReading(JSON.parse(outputText));
      if (parsed) return parsed;
    } catch {
      // keep retry flow
    }

    await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
  }

  return null;
}

export async function POST(req: Request) {
  const payload = (await req.json()) as ReadingApiPayload;
  const fallback = buildLocalReading(
    [
      { slot: "past", card: majorArcana[0], reversed: false },
      { slot: "present", card: majorArcana[1], reversed: false },
      { slot: "future", card: majorArcana[2], reversed: false }
    ],
    payload
  );

  try {
    const generated = await generateWithOpenAI(payload);
    return NextResponse.json(generated ?? fallback);
  } catch {
    return NextResponse.json(fallback);
  }
}
