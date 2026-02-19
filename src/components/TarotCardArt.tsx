"use client";

interface TarotCardArtProps {
  id: string;
  reversed: boolean;
}

const symbols: Record<string, string> = {
  fool: "0",
  magician: "I",
  high_priestess: "II",
  empress: "III",
  emperor: "IV",
  hierophant: "V",
  lovers: "VI",
  chariot: "VII",
  strength: "VIII",
  hermit: "IX",
  wheel_of_fortune: "X",
  justice: "XI",
  hanged_man: "XII",
  death: "XIII",
  temperance: "XIV",
  devil: "XV",
  tower: "XVI",
  star: "XVII",
  moon: "XVIII",
  sun: "XIX",
  judgement: "XX",
  world: "XXI"
};

export function TarotCardArt({ id, reversed }: TarotCardArtProps) {
  const token = symbols[id] ?? "?";
  return (
    <div
      className={`relative h-44 w-full overflow-hidden rounded-lg border border-amber-100/30 bg-gradient-to-b from-zinc-900 to-zinc-950 ${
        reversed ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.22),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(217,70,239,0.18),transparent_45%)]" />
      <div className="absolute inset-2 rounded-md border border-amber-200/20" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-semibold tracking-[0.2em] text-amber-100/90">
        {token}
      </div>
      <div className="absolute left-3 top-2 text-xs text-amber-200/80">{token}</div>
      <div className="absolute bottom-2 right-3 text-xs text-amber-200/80">{token}</div>
    </div>
  );
}
