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
import { generateReading } from "@/lib/tarotEngine";
import { restyleReading } from "@/lib/toneTemplates";
import type { AppLanguage, ReadingResult, ReadingSlot, ToneMode } from "@/lib/types";

type Screen = "landing" | "setup" | "shuffle" | "reveal" | "results";

const shuffleLinesEn = [
  "Nice shuffle. The parrot approves.",
  "Good rhythm. One more swirl.",
  "The deck is awake. Draw when ready."
];
const shuffleLinesMl = [
  "നല്ല ഷഫിൾ. താത്തക്ക് ഇഷ്ടമായി.",
  "റിഥം നന്നാണ്. ഒന്ന് കൂടെ.",
  "ഡെക്ക് തയ്യാറായി. ഇനി കാർഡ് എടുക്കാം."
];

const resultTabs: ReadingSlot[] = ["past", "present", "future"];

export default function Page() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("both");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [mood, setMood] = useState("curious");
  const [focus, setFocus] = useState("growth");
  const [trulyRandom, setTrulyRandom] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [shuffleReady, setShuffleReady] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [baseReading, setBaseReading] = useState<ReadingResult | null>(null);
  const [tone, setTone] = useState<ToneMode>("default");
  const [subtitles, setSubtitles] = useState<string[]>([t("both", "landingLine")]);
  const [talking, setTalking] = useState(false);
  const [fallbackNote, setFallbackNote] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<ReadingSlot | "behaviour">("present");

  const drawCooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (screen !== "shuffle") return;
    const id = window.setInterval(() => {
      setShuffleIndex((s) => (s + 1) % shuffleLinesEn.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen === "results") {
      setCooldownUntil(Date.now() + 5000);
      setActiveTab("present");
    }
  }, [screen]);

  useEffect(() => {
    if (!reading || screen !== "reveal") return;
    let cancelled = false;

    const run = async () => {
      const lines = [
        {
          en: `${name}, here is your reading.`,
          ml: `${name}, ഇതാ നിങ്ങളുടെ വായന.`
        },
        { en: reading.past.en, ml: reading.past.ml },
        { en: reading.present.en, ml: reading.present.ml },
        { en: reading.future.en, ml: reading.future.ml },
        { en: reading.behaviour.en, ml: reading.behaviour.ml }
      ];

      setTalking(true);
      for (const line of lines) {
        if (cancelled) return;
        const shown: string[] = [];
        if (language !== "ml") shown.push(line.en);
        if (language !== "en") shown.push(line.ml);
        setSubtitles(shown);

        if (voiceOn) {
          const targetLang = language === "ml" ? "ml-IN" : "en-US";
          const result = await speakAsync({
            text: language === "ml" ? line.ml : line.en,
            fallbackText: line.en,
            lang: targetLang,
            onStart: () => setTalking(true),
            onEnd: () => setTalking(false)
          });
          if (result.usedFallback) setFallbackNote(t(language, "speakFallback"));
        } else {
          await new Promise((r) => setTimeout(r, 1800));
        }
      }

      if (!cancelled) {
        setTalking(false);
        setScreen("results");
      }
    };

    void run();
    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [reading, screen, name, language, voiceOn]);

  const shuffleLine = useMemo(() => {
    if (language === "ml") return shuffleLinesMl[shuffleIndex];
    return shuffleLinesEn[shuffleIndex];
  }, [shuffleIndex, language]);

  const nextUser = () => {
    setScreen("landing");
    setName("");
    setLanguage("both");
    setCameraEnabled(false);
    setPhoto(null);
    setMood("curious");
    setFocus("growth");
    setTrulyRandom(false);
    setShuffleReady(false);
    setReading(null);
    setBaseReading(null);
    setTone("default");
    setSubtitles([t("both", "landingLine")]);
    setFallbackNote("");
    setTalking(false);
  };

  const sectionText = useMemo(() => {
    if (!reading) return { title: "", en: "", ml: "" };
    if (activeTab === "past") return { title: t(language, "past"), en: reading.past.en, ml: reading.past.ml };
    if (activeTab === "future") return { title: t(language, "future"), en: reading.future.en, ml: reading.future.ml };
    if (activeTab === "behaviour") {
      return {
        title: t(language, "behaviour"),
        en: reading.behaviour.en,
        ml: reading.behaviour.ml
      };
    }
    return { title: t(language, "present"), en: reading.present.en, ml: reading.present.ml };
  }, [reading, activeTab, language]);

  return (
    <main className="h-screen w-screen overflow-hidden p-3 md:p-4">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3">
        <header className="flex h-12 shrink-0 items-center justify-between rounded-xl border border-white/15 bg-black/30 px-4">
          <h1 className="text-sm font-semibold tracking-wide text-amber-100 md:text-base">{t(language, "appTitle")}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVoiceOn((v) => !v)}
              className="rounded-md border border-white/20 px-2 py-1 text-xs text-amber-100"
            >
              {voiceOn ? "Voice On" : "Voice Off"}
            </button>
            <button
              type="button"
              onClick={nextUser}
              className="rounded-md border border-white/20 px-2 py-1 text-xs text-amber-100"
            >
              Next User
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
          <section className="flex min-h-0 flex-col gap-3 rounded-xl border border-white/15 bg-black/25 p-3">
            <div className="min-h-0 flex-1">
              <ParrotScene talking={talking || screen === "landing"} stage={screen} className="h-full" />
            </div>
            <Subtitles lines={subtitles} />
            {fallbackNote ? <p className="text-center text-xs text-amber-300">{fallbackNote}</p> : null}
          </section>

          <section className="min-h-0 rounded-xl border border-white/15 bg-black/25 p-3">
            <AnimatePresence mode="wait">
              {screen === "landing" ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex h-full flex-col items-center justify-center text-center"
                >
                  <p className="text-xl text-amber-50">{t(language, "landingLine")}</p>
                  <p className="mt-2 text-sm text-amber-100/80">A playful Kerala-style reading experience.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.getVoices();
                      }
                      setSubtitles([t(language, "landingLine")]);
                      setScreen("setup");
                    }}
                    className="mt-5 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-zinc-900 transition hover:bg-amber-400"
                  >
                    {t(language, "startReading")}
                  </button>
                </motion.div>
              ) : null}

              {screen === "setup" ? (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex h-full flex-col gap-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <label className="col-span-2 text-sm">
                      <span className="mb-1 block text-amber-200">{t(language, "enterName")} *</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-white/20 bg-zinc-900/70 px-3 py-2"
                        placeholder="Anjali"
                      />
                    </label>

                    <fieldset>
                      <legend className="mb-1 text-sm text-amber-200">{t(language, "language")}</legend>
                      <div className="flex flex-wrap gap-2">
                        {(["en", "ml", "both"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setLanguage(lang)}
                            className={`rounded-md px-2 py-1 text-xs ${
                              language === lang ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"
                            }`}
                          >
                            {lang === "en" ? "English" : lang === "ml" ? "Malayalam" : "Both"}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="mb-1 text-sm text-amber-200">Randomness</legend>
                      <label className="inline-flex items-center gap-2 text-xs text-amber-100">
                        <input type="checkbox" checked={trulyRandom} onChange={(e) => setTrulyRandom(e.target.checked)} />
                        {trulyRandom ? t(language, "trulyRandom") : t(language, "seeded")}
                      </label>
                    </fieldset>

                    <fieldset>
                      <legend className="mb-1 text-sm text-amber-200">{t(language, "mood")}</legend>
                      <div className="flex gap-2">
                        {["calm", "curious", "bold"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMood(m)}
                            className={`rounded-md px-2 py-1 text-xs ${mood === m ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="mb-1 text-sm text-amber-200">{t(language, "focus")}</legend>
                      <div className="flex gap-2">
                        {["love", "career", "growth"].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setFocus(f)}
                            className={`rounded-md px-2 py-1 text-xs ${focus === f ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="rounded-lg border border-white/15 bg-black/20 p-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={cameraEnabled} onChange={(e) => setCameraEnabled(e.target.checked)} />
                      {t(language, "enableCamera")}
                    </label>
                    <p className="text-xs text-amber-100/80">{t(language, "cameraPrivacy")}</p>
                    <div className="mt-2">
                      <CameraCapture enabled={cameraEnabled} onCapture={setPhoto} />
                      {photo ? <p className="mt-1 text-xs text-emerald-300">Photo captured locally.</p> : null}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-amber-100/70">Step 1 of 3</span>
                    <button
                      type="button"
                      disabled={!name.trim()}
                      onClick={() => {
                        setSubtitles([`${name}, ${t(language, "shuffleHint")}.`]);
                        setScreen("shuffle");
                      }}
                      className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-zinc-900 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {screen === "shuffle" ? (
                <motion.div
                  key="shuffle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex h-full flex-col"
                >
                  <p className="mb-2 text-center text-sm text-amber-100">{t(language, "shuffleHint")}</p>
                  <div className="flex-1">
                    <Deck onReady={() => setShuffleReady(true)} />
                  </div>
                  <p className="mb-3 text-center text-xs text-amber-200">{shuffleLine}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-amber-100/70">Step 2 of 3</span>
                    <button
                      type="button"
                      disabled={!shuffleReady}
                      onClick={() => {
                        const rng = makeRng(`${name}-${mood}-${focus}`, trulyRandom);
                        const generated = generateReading(rng);
                        setBaseReading(generated);
                        setReading(generated);
                        setSubtitles([`${name}, cards drawn.`]);
                        setScreen("reveal");
                      }}
                      className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-zinc-900 disabled:opacity-40"
                    >
                      {t(language, "draw")}
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {screen === "reveal" && reading ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex h-full flex-col"
                >
                  <CardReveal cards={reading.cards} />
                  <p className="mt-2 text-center text-xs text-amber-100/80">Narrating your cards...</p>
                </motion.div>
              ) : null}

              {screen === "results" && reading ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex h-full flex-col"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {reading.cards.map((d) => (
                      <div key={d.slot} className="rounded-lg border border-white/15 bg-black/25 p-2">
                        <p className="text-[10px] uppercase tracking-widest text-amber-300">{d.slot}</p>
                        <p className="line-clamp-1 text-xs text-amber-50">{d.card.name_en}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {resultTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-md px-2 py-1 text-xs ${
                          activeTab === tab ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveTab("behaviour")}
                      className={`rounded-md px-2 py-1 text-xs ${
                        activeTab === "behaviour" ? "bg-amber-500 text-zinc-900" : "bg-zinc-900/70 text-amber-100"
                      }`}
                    >
                      behaviour
                    </button>
                  </div>

                  <div className="mt-2 rounded-xl border border-white/15 bg-black/30 p-3">
                    <h3 className="text-sm font-semibold text-amber-200">{sectionText.title}</h3>
                    {visibleLanguages(language).includes("en") ? (
                      <p className="mt-1 text-sm text-amber-50/90">{sectionText.en}</p>
                    ) : null}
                    {visibleLanguages(language).includes("ml") ? (
                      <p className="mt-2 text-sm text-amber-50/90">{sectionText.ml}</p>
                    ) : null}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTone("funny");
                        if (baseReading) setReading(restyleReading(baseReading, "funny"));
                      }}
                      className="rounded-md border border-white/20 px-2 py-1"
                    >
                      {t(language, "makeFunnier")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTone("serious");
                        if (baseReading) setReading(restyleReading(baseReading, "serious"));
                      }}
                      className="rounded-md border border-white/20 px-2 py-1"
                    >
                      {t(language, "makeSerious")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTone("short");
                        if (baseReading) setReading(restyleReading(baseReading, "short"));
                      }}
                      className="rounded-md border border-white/20 px-2 py-1"
                    >
                      {t(language, "shortVersion")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTone("detailed");
                        if (baseReading) setReading(restyleReading(baseReading, "detailed"));
                      }}
                      className="rounded-md border border-white/20 px-2 py-1"
                    >
                      {t(language, "detailedVersion")}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <ResultShare name={name} reading={reading} />
                    <button
                      type="button"
                      disabled={drawCooldownLeft > 0}
                      onClick={() => {
                        setTone("default");
                        setReading(null);
                        setBaseReading(null);
                        setShuffleReady(false);
                        setScreen("shuffle");
                      }}
                      className="rounded-md border border-white/20 px-3 py-2 text-xs disabled:opacity-45"
                    >
                      {drawCooldownLeft > 0 ? `${t(language, "drawAgain")} (${drawCooldownLeft}s)` : t(language, "drawAgain")}
                    </button>
                    <button
                      type="button"
                      onClick={nextUser}
                      className="rounded-md border border-white/20 px-3 py-2 text-xs"
                    >
                      Next User
                    </button>
                  </div>

                  <p className="mt-auto text-[11px] text-amber-100/70">
                    {t(language, "disclaimer")} {tone !== "default" ? `Tone: ${tone}.` : ""}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}
