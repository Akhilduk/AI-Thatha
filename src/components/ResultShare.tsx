"use client";

import type { ReadingResult } from "@/lib/types";

interface ResultShareProps {
  name: string;
  reading: ReadingResult;
}

export function ResultShare({ name, reading }: ResultShareProps) {
  const download = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 1200, 1600);
    grad.addColorStop(0, "#0b1020");
    grad.addColorStop(0.5, "#1f2937");
    grad.addColorStop(1, "#2b1f1c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 64px Georgia";
    ctx.fillText(`AI Thatha Reading for ${name}`, 80, 120);

    const sections: Array<[string, string]> = [
      ["Past", reading.past.en],
      ["Present", reading.present.en],
      ["Future", reading.future.en],
      ["Behaviour", reading.behaviour.en]
    ];
    ctx.font = "36px Georgia";
    let y = 240;
    sections.forEach(([title, text]) => {
      ctx.fillStyle = "#fde68a";
      ctx.fillText(title, 80, y);
      y += 54;
      ctx.fillStyle = "#f8fafc";
      const words = text.split(" ");
      let line = "";
      words.forEach((word) => {
        const trial = `${line}${word} `;
        if (ctx.measureText(trial).width > 1000) {
          ctx.fillText(line, 80, y);
          y += 46;
          line = `${word} `;
        } else {
          line = trial;
        }
      });
      ctx.fillText(line, 80, y);
      y += 90;
    });

    ctx.font = "22px Georgia";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("Entertainment only. Not medical, legal, or financial advice.", 80, 1520);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "ai-thatha-reading.png";
    link.click();
  };

  return (
    <button
      type="button"
      onClick={download}
      className="rounded-md border border-amber-300/40 bg-amber-500/20 px-3 py-2 text-sm text-amber-100 transition hover:bg-amber-500/30"
    >
      Share (Download Image)
    </button>
  );
}
