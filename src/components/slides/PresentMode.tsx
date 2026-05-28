"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeckStore } from "@/store/deck-store";
import { SlideRenderer } from "./SlideRenderer";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export function PresentMode() {
  const project = useDeckStore((s) => s.project);
  const setMode = useDeckStore((s) => s.setMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const slides = project?.slides ?? [];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Scale to fill viewport
  useEffect(() => {
    const recalc = () => {
      const scaleX = window.innerWidth / SLIDE_WIDTH;
      const scaleY = window.innerHeight / SLIDE_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          setMode("editor");
          break;
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, setMode]);

  if (!project || slides.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-none"
      onClick={goNext}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            width: SLIDE_WIDTH * scale,
            height: SLIDE_HEIGHT * scale,
          }}
        >
          <div
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="overflow-hidden"
          >
            <SlideRenderer slide={slides[currentIndex]} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide counter */}
      <div className="fixed bottom-4 right-4 text-ui-xs text-text-3 opacity-50">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Exit hint */}
      <div className="fixed top-4 right-4 text-ui-xs text-text-3 opacity-30 hover:opacity-80 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("editor");
          }}
          className="px-2 py-1 rounded bg-alt-2 cursor-pointer"
        >
          ESC to exit
        </button>
      </div>
    </div>
  );
}
