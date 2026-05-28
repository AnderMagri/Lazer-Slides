"use client";

import { useRef, useState, useEffect } from "react";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/lib/constants";

/**
 * Measures a container element and returns the optimal scale factor
 * to fit a slide (SLIDE_WIDTH x SLIDE_HEIGHT) inside it.
 */
export function useSlideScale(padding = 48) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalc = () => {
      const { width, height } = container.getBoundingClientRect();
      const availW = width - padding * 2;
      const availH = height - padding * 2;
      if (availW <= 0 || availH <= 0) return;

      const scaleX = availW / SLIDE_WIDTH;
      const scaleY = availH / SLIDE_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };

    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    recalc();

    return () => observer.disconnect();
  }, [padding]);

  return { containerRef, scale, slideWidth: SLIDE_WIDTH, slideHeight: SLIDE_HEIGHT };
}
