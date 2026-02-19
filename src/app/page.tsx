"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CameraCapture } from "@/components/CameraCapture";
import { CardReveal } from "@/components/CardReveal";
import { Deck } from "@/components/Deck";
import { ParrotScene } from "@/components/ParrotScene";
import { ResultShare } from "@/components/ResultShare";
import { Subtitles } from "@/components/Subtitles";
import { t, visibleLanguages } from "@/lib/i18n";
import { makeRng } from "@/lib/rng";
import { speakAsync } from "@/lib/speech";
import { buildLocalReading, drawCards } from "@/lib/tarotEngine";
import type { AppLanguage, ReadingApiPayload, ReadingResult, ReadingSlot } from "@/lib/types";

type Screen = "landing" | "setup" | "shuffle" | "reveal" | "results";

const resultTabs: Array<ReadingSlot | "behaviour" | "advice"> = ["past", "present", "future", "behaviour", "advice"];

export default function Page() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("both");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [allowImageUpload, setAllowImageUpload] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [shuffleReady, setShuffleReady] = useState(false);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [subtitles, setSubtitles] = useState<string[]>([t("both", "landingLine")]);
  const [talking, setTalking] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof resultTabs)[number]>("present");
  const [saveCount, setSaveCount] = useState(0);

  const sectionText = useMemo(() => {
    if (!reading) return { title: "", en: "", ml: "" };
    if (activeTab === "behaviour") return { title: "Behaviour", en: reading.behaviour.en, ml: reading.behaviour.ml };
    if (activeTab === "advice") return { title: "Advice", en: reading.advice.en, ml: reading.advice.ml };
    return { title: activeTab, en: reading[activeTab].en, ml: reading[activeTab].ml };
  }, [reading, activeTab]);

  useEffect(() => {
    if (screen !== "reveal" || !reading) return;
    let cancelled = false;

    const run = async () => {
      const lines = [reading.past, reading.present, reading.future, reading.behaviour, reading.advice];
      setTalking(true);
      for (const line of lines) {
        if (cancelled) return;
        const spoken = language === "ml" ? line.ml : line.en;
        const shown = visibleLanguages(language).map((lng) => (lng === "ml" ? line.ml : line.en));
        setSubtitles(shown);
        await speakAsync({
          text: spoken,
          fallbackText: line.en,
          lang: language === "ml" ? "ml-IN" : "en-US",
          onStart: () => setTalking(true),
          onEnd: () => setTalking(false)
        });
      }
      if (!cancelled) setScreen("results");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [screen, reading, language]);

  const requestReading = async () => {
    const rng = makeRng(`${name}-${dob || "na"}`, false);
    const cards = drawCards(rng);
    const selectedCardId = cards[1].card.id;
    const payload: ReadingApiPayload = {
      name,
      dob,
      selectedCardId,
      includeImageForAi: allowImageUpload,
      imageBase64: allowImageUpload ? photo : null
    };

    setSubtitles(["ശരി… നോക്കട്ടെ 🦜", `${name}, the parrot has picked ${cards[1].card.name_en}.`]);
    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("reading_failed");
      const data = (await response.json()) as ReadingResult;
      setReading({ ...data, cards });
    } catch {
      setReading(buildLocalReading(cards, payload));
    }
    setScreen("reveal");
  };

  const saveSession = () => {
    if (!reading) return;
    const current = JSON.parse(localStorage.getItem("jyothisham-sessions") ?? "[]") as Array<Record<string, unknown>>;
    current.unshift({ id: Date.now(), name, dob, reading, createdAt: new Date().toISOString() });
    localStorage.setItem("jyothisham-sessions", JSON.stringify(current.slice(0, 10)));
    setSaveCount((s) => s + 1);
  };

  return (
    <main className="h-screen w-screen overflow-hidden p-3 md:p-4">
      <div className="mx-auto grid h-full max-w-7xl gap-3 lg:grid-cols-[1.1fr_1fr]">
        <section className="flex min-h-0 flex-col gap-3 rounded-xl border border-white/15 bg-black/25 p-3">
          <div className="min-h-0 flex-1">
            <ParrotScene talking={talking || screen === "landing"} stage={screen} className="h-full" />
          </div>
          <Subtitles lines={subtitles} />
        </section>

        <section className="min-h-0 rounded-xl border border-white/15 bg-black/25 p-3">
          <AnimatePresence mode="wait">
            {screen === "landing" && (
              <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center text-center">
                <h1 className="text-2xl text-amber-50">Jyothisham Parrot Tarot</h1>
                <p className="mt-2 text-amber-100/80">Temple glow, cards, and a talkative Kerala parrot.</p>
                <button type="button" onClick={() => setScreen("setup")} className="mt-5 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-zinc-900">{t(language, "startReading")}</button>
              </motion.div>
            )}

            {screen === "setup" && (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col gap-3">
                <label className="text-sm text-amber-200">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-white/20 bg-zinc-900/70 px-3 py-2" placeholder="Anjali" />
                <label className="text-sm text-amber-200">DOB *</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="rounded-md border border-white/20 bg-zinc-900/70 px-3 py-2" />
                <div className="flex gap-2">
                  {(["en", "ml", "both"] as const).map((lang) => (
                    <button key={lang} type="button" onClick={() => setLanguage(lang)} className={`rounded-md px-2 py-1 text-xs ${language === lang ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"}`}>{lang}</button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={cameraEnabled} onChange={(e) => setCameraEnabled(e.target.checked)} />Enable local camera capture</label>
                <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={allowImageUpload} onChange={(e) => setAllowImageUpload(e.target.checked)} />I consent to upload image for AI reading</label>
                <CameraCapture enabled={cameraEnabled} onCapture={setPhoto} />
                <button type="button" disabled={!name || !dob} onClick={() => setScreen("shuffle")} className="mt-auto rounded-lg bg-amber-500 px-5 py-2 font-semibold text-zinc-900 disabled:opacity-40">Next</button>
              </motion.div>
            )}

            {screen === "shuffle" && (
              <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col">
                <Deck onReady={() => setShuffleReady(true)} />
                <button type="button" disabled={!shuffleReady} onClick={() => void requestReading()} className="mt-auto rounded-lg bg-amber-500 px-5 py-2 font-semibold text-zinc-900 disabled:opacity-40">{t(language, "draw")}</button>
              </motion.div>
            )}

            {screen === "reveal" && reading && (
              <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col">
                <CardReveal cards={reading.cards} />
              </motion.div>
            )}

            {screen === "results" && reading && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col">
                <div className="text-xs text-amber-200">Lucky color: {reading.metadata.luckyColor} · Lucky time: {reading.metadata.luckyTimeWindow}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resultTabs.map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-md px-2 py-1 text-xs ${activeTab === tab ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"}`}>{tab}</button>
                  ))}
                </div>
                <div className="mt-2 rounded-xl border border-white/15 bg-black/30 p-3">
                  <h3 className="text-sm font-semibold text-amber-200 capitalize">{sectionText.title}</h3>
                  {visibleLanguages(language).includes("en") && <p className="mt-1 text-sm text-amber-50/90">{sectionText.en}</p>}
                  {visibleLanguages(language).includes("ml") && <p className="mt-1 text-sm text-amber-50/90">{sectionText.ml}</p>}
                </div>
                <ul className="mt-2 list-disc pl-5 text-xs text-amber-100">
                  {(language === "ml" ? reading.funnyParrotLines.ml : reading.funnyParrotLines.en).map((line, idx) => <li key={idx}>{line}</li>)}
                </ul>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ResultShare name={name} reading={reading} />
                  <button type="button" onClick={saveSession} className="rounded-md border border-white/20 px-3 py-2 text-xs">Save Session</button>
                  <button type="button" onClick={() => setScreen("shuffle")} className="rounded-md border border-white/20 px-3 py-2 text-xs">Draw Again</button>
                </div>
                {saveCount > 0 && <p className="mt-2 text-xs text-emerald-300">Saved locally ({saveCount}).</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
