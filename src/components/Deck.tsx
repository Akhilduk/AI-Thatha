"use client";

import { motion, useMotionValue } from "framer-motion";
import { useMemo, useState } from "react";

interface DeckProps {
  onReady: () => void;
}

export function Deck({ onReady }: DeckProps) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const x = useMotionValue(0);
  const cards = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="relative h-56 w-44 card-3d">
        {cards.map((idx) => (
          <div
            key={idx}
            style={{
              transform: `translate3d(${idx * 0.2}px, ${idx * -0.2}px, ${idx * -1.5}px) rotateZ(${idx * 0.35}deg)`
            }}
            className="absolute inset-0 rounded-xl border border-amber-200/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-xl"
          />
        ))}
        <motion.div
          drag="x"
          dragConstraints={{ left: -120, right: 120 }}
          style={{ x }}
          whileTap={{ scale: 1.03, rotate: 4 }}
          className="absolute inset-0 cursor-grab rounded-xl border border-amber-400/35 bg-gradient-to-br from-amber-200/20 via-orange-200/10 to-red-900/20 shadow-2xl active:cursor-grabbing"
          onDrag={(_, info) => {
            const delta = Math.abs(info.delta.x);
            setProgress((p) => {
              const next = Math.min(100, p + delta * 0.22);
              if (next >= 100 && !ready) {
                setReady(true);
                onReady();
              }
              return next;
            });
          }}
        >
          <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-amber-50/90">
            Drag To Shuffle
          </div>
        </motion.div>
      </div>
      <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-zinc-900/70">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-amber-100/80">{ready ? "Deck charged." : "Shuffle energy building..."}</p>
    </div>
  );
}
