"use client";

import { useDeckStore } from "@/store/deck-store";
import { SlideRenderer } from "./SlideRenderer";
import { ColumnPicker } from "../ui/ColumnPicker";
import { useSlideScale } from "@/hooks/useSlideScale";

// ─── Per-column width options ───
const TWO_COL_OPTIONS = [50, 70] as const;
const THREE_COL_OPTIONS = [33, 50] as const;

function computeWidths(columns: number, targetCol: number, targetWidth: number): number[] {
  if (columns === 2) {
    const other = 100 - targetWidth;
    return targetCol === 0 ? [targetWidth, other] : [other, targetWidth];
  }
  // 3 columns — give targetCol the chosen width, split remainder equally
  const remainder = 100 - targetWidth;
  const each = Math.round(remainder / (columns - 1));
  const widths = Array.from({ length: columns }, (_, i) =>
    i === targetCol ? targetWidth : each
  );
  // Fix rounding so they sum to 100
  const diff = 100 - widths.reduce((a, b) => a + b, 0);
  if (diff !== 0) {
    const fixIdx = targetCol === 0 ? 1 : 0;
    widths[fixIdx] += diff;
  }
  return widths;
}

export function SlideCanvas() {
  const project = useDeckStore((s) => s.project);
  const activeSlideId = useDeckStore((s) => s.activeSlideId);
  const updateSlide = useDeckStore((s) => s.updateSlide);
  const { containerRef, scale, slideWidth, slideHeight } = useSlideScale();

  if (!project || !activeSlideId) return null;

  const slide = project.slides.find((s) => s.id === activeSlideId);
  if (!slide) return null;

  const showPicker = slide.type === "column" && !slide.layoutChosen;

  // Column width tabs — for multi-column slides
  const showColumnTabs =
    slide.type === "column" && slide.columns >= 2 && slide.layoutChosen;
  const widths = slide.columnWidths || Array.from(
    { length: slide.columns },
    () => Math.round(100 / slide.columns)
  );
  const options = slide.columns === 2 ? TWO_COL_OPTIONS : THREE_COL_OPTIONS;

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center overflow-hidden">
      {/* Per-column width tabs */}
      {showColumnTabs && (
        <div
          className="flex gap-3 mb-2 shrink-0 px-6"
          style={{ width: slideWidth * scale }}
        >
          {widths.map((w, colIndex) => (
            <div
              key={colIndex}
              className="flex items-center justify-center gap-0.5 h-7"
              style={{ width: `${w}%`, flexBasis: `${w}%` }}
            >
              {options.map((opt) => {
                const isActive = w === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const newWidths = computeWidths(slide.columns, colIndex, opt);
                      updateSlide(slide.id, { columnWidths: newWidths });
                    }}
                    className={`h-6 px-2 text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-accent-primary text-text-on-brand"
                        : "bg-fill-2 border border-stroke-1 text-text-3 hover:text-text-1 hover:bg-alt-1"
                    }`}
                  >
                    {opt}%
                  </button>
                );
              })}
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
