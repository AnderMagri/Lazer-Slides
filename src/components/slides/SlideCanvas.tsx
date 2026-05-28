"use client";

import { useDeckStore } from "@/store/deck-store";
import { SlideRenderer } from "./SlideRenderer";
import { ColumnPicker } from "../ui/ColumnPicker";
import { useSlideScale } from "@/hooks/useSlideScale";
import { Minus, Plus } from "@phosphor-icons/react";

export function SlideCanvas() {
  const project = useDeckStore((s) => s.project);
  const activeSlideId = useDeckStore((s) => s.activeSlideId);
  const setColumnWidth = useDeckStore((s) => s.setColumnWidth);
  const { containerRef, scale, slideWidth, slideHeight } = useSlideScale();

  if (!project || !activeSlideId) return null;

  const slide = project.slides.find((s) => s.id === activeSlideId);
  if (!slide) return null;

  const showPicker = slide.type === "column" && !slide.layoutChosen;

  // Column width controls (C) — only for multi-column slides
  const showColumnControls = slide.type === "column" && slide.columns > 1 && slide.layoutChosen;
  const widths = slide.columnWidths || Array.from(
    { length: slide.columns },
    () => Math.round(100 / slide.columns)
  );

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center overflow-hidden">
      {/* Column width control bar (C) */}
      {showColumnControls && (
        <div
          className="flex items-center gap-1 mb-3 shrink-0"
          style={{ width: slideWidth * scale }}
        >
          {widths.map((w, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-1 h-7 bg-fill-2 border border-stroke-1"
              style={{ width: `${w}%` }}
            >
              <button
                onClick={() => setColumnWidth(slide.id, i, -5)}
                className="w-5 h-5 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
                title="Shrink column"
              >
                <Minus size={10} weight="bold" />
              </button>
              <span className="text-ui-xs text-text-3 min-w-[28px] text-center">
                {Math.round(w)}%
              </span>
              <button
                onClick={() => setColumnWidth(slide.id, i, 5)}
                className="w-5 h-5 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
                title="Grow column"
              >
                <Plus size={10} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scaled wrapper */}
      <div
        style={{
          width: slideWidth * scale,
          height: slideHeight * scale,
        }}
      >
        {/* Inner slide — rendered at canonical size, scaled via CSS transform */}
        <div
          className="overflow-hidden shadow-elevation-2 border border-stroke-1 relative"
          style={{
            width: slideWidth,
            height: slideHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <SlideRenderer slide={slide} isEditor />
          {showPicker && <ColumnPicker slideId={slide.id} />}
        </div>
      </div>
    </div>
  );
}
