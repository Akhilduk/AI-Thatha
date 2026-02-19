import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text, language } = (await req.json()) as { text: string; language: "en" | "ml" };
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ fallback: true }, { status: 200 });
  }

  const resp = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: language === "ml" ? "alloy" : "verse",
      input: text,
      format: "mp3"
    })
  });

  if (!resp.ok) {
    return NextResponse.json({ fallback: true }, { status: 200 });
  }

  const arrayBuffer = await resp.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return NextResponse.json({ fallback: false, audioBase64: base64, mimeType: "audio/mpeg" });
}
