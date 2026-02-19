"use client";

import { motion } from "framer-motion";
import { TarotCardArt } from "@/components/TarotCardArt";
import type { DrawnCard } from "@/lib/types";

interface CardRevealProps {
  cards: DrawnCard[];
}

export function CardReveal({ cards }: CardRevealProps) {
  return (
    <div className="grid w-full gap-3 md:grid-cols-3">
      {cards.map((draw, idx) => (
        <motion.div
          key={draw.slot}
          initial={{ opacity: 0, y: 24, rotateY: 180 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 0.6, delay: idx * 0.24 }}
          className="card-3d relative h-[290px]"
        >
          <div className="absolute inset-0 rounded-xl border border-amber-200/30 bg-gradient-to-b from-zinc-950/95 to-zinc-900/95 p-3 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{draw.slot}</p>
            <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-amber-50">{draw.card.name_en}</h3>
            <p className="line-clamp-1 text-xs text-amber-100/90">{draw.card.name_ml}</p>
            <div className="mt-2">
              <TarotCardArt id={draw.card.id} reversed={draw.reversed} />
            </div>
            <p className="mt-2 rounded-md bg-black/30 px-2 py-1 text-center text-xs text-amber-200">
              {draw.reversed ? "Reversed / തിരിഞ്ഞത്" : "Upright / നേരായത്"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
