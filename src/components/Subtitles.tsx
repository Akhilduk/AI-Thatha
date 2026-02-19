"use client";

import { AnimatePresence, motion } from "framer-motion";

interface SubtitlesProps {
  lines: string[];
}

export function Subtitles({ lines }: SubtitlesProps) {
  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={lines.join("::")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.22 }}
          className="min-h-[52px] rounded-xl border border-amber-300/25 bg-black/45 px-3 py-2 text-center text-sm leading-relaxed text-amber-50 shadow-lg backdrop-blur-sm"
        >
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
