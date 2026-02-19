export interface SpeakParams {
  text: string;
  lang: "en-US" | "ml-IN";
  fallbackText?: string;
  onBoundary?: (word: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function hasSpeechSupport(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function playAudioBase64(audioBase64: string, mimeType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("audio_failed"));
    void audio.play();
  });
}

export function pickVoice(lang: "en-US" | "ml-IN"): SpeechSynthesisVoice | null {
  if (!hasSpeechSupport()) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase())) ?? null;
}

async function speakViaApi(params: SpeakParams): Promise<boolean> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: params.text, language: params.lang === "ml-IN" ? "ml" : "en" })
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { fallback: boolean; audioBase64?: string; mimeType?: string };
  if (data.fallback || !data.audioBase64 || !data.mimeType) return false;
  params.onStart?.();
  await playAudioBase64(data.audioBase64, data.mimeType);
  params.onEnd?.();
  return true;
}

export async function speakAsync(params: SpeakParams): Promise<{ usedFallback: boolean }> {
  try {
    const apiPlayed = await speakViaApi(params);
    if (apiPlayed) return { usedFallback: false };
  } catch {
    // fall through to browser speech
  }

  return new Promise((resolve) => {
    if (!hasSpeechSupport()) {
      params.onEnd?.();
      resolve({ usedFallback: true });
      return;
    }

    const preferred = pickVoice(params.lang);
    const utterance = new SpeechSynthesisUtterance(preferred ? params.text : params.fallbackText ?? params.text);
    utterance.lang = preferred ? params.lang : "en-US";
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => params.onStart?.();
    utterance.onend = () => {
      params.onEnd?.();
      resolve({ usedFallback: true });
    };
    utterance.onboundary = (e) => {
      if ("charIndex" in e) {
        const word = utterance.text.slice(0, e.charIndex).split(" ").at(-1) ?? "";
        params.onBoundary?.(word);
      }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}
