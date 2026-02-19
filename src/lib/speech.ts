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

export function pickVoice(lang: "en-US" | "ml-IN"): SpeechSynthesisVoice | null {
  if (!hasSpeechSupport()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase())) ??
    null
  );
}

export function speak(params: SpeakParams): { usedFallback: boolean } {
  if (!hasSpeechSupport()) {
    params.onEnd?.();
    return { usedFallback: Boolean(params.fallbackText) };
  }
  const preferred = pickVoice(params.lang);
  const usedFallback = !preferred && Boolean(params.fallbackText);
  const utterance = new SpeechSynthesisUtterance(
    preferred ? params.text : params.fallbackText ?? params.text
  );
  utterance.lang = preferred ? params.lang : "en-US";
  if (preferred) utterance.voice = preferred;
  utterance.onstart = () => params.onStart?.();
  utterance.onend = () => params.onEnd?.();
  utterance.onboundary = (e) => {
    if ("charIndex" in e) {
      const word = utterance.text.slice(0, e.charIndex).split(" ").at(-1) ?? "";
      params.onBoundary?.(word);
    }
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return { usedFallback };
}

export function speakAsync(params: SpeakParams): Promise<{ usedFallback: boolean }> {
  return new Promise((resolve) => {
    if (!hasSpeechSupport()) {
      params.onEnd?.();
      resolve({ usedFallback: Boolean(params.fallbackText) });
      return;
    }

    const preferred = pickVoice(params.lang);
    const usedFallback = !preferred && Boolean(params.fallbackText);
    const utterance = new SpeechSynthesisUtterance(
      preferred ? params.text : params.fallbackText ?? params.text
    );
    utterance.lang = preferred ? params.lang : "en-US";
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => params.onStart?.();
    utterance.onend = () => {
      params.onEnd?.();
      resolve({ usedFallback });
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
