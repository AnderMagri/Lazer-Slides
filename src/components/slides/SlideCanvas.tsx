"use client";

import { useDeckStore } from "@/store/deck-store";
import { SlideRenderer } from "./SlideRenderer";
import { ColumnPicker } from "../ui/ColumnPicker";
import { useSlideScale } from "@/hooks/useSlideScale";

export function SlideCanvas() {
  const project = useDeckStore((s) => s.project);
  const activeSlideId = useDeckStore((s) => s.activeSlideId);
  const updateSlide = useDeckStore((s) => s.updateSlide);
  const { containerRef, scale, slideWidth, slideHeight } = useSlideScale();

  if (!project || !activeSlideId) return null;

  const slide = project.slides.find((s) => s.id === activeSlideId);
  if (!slide) return null;

  const showPicker = slide.type === "column" && !slide.layoutChosen;

  // Column width presets — only for 2-column slides
  const showColumnPresets = slide.type === "column" && slide.columns === 2 && slide.layoutChosen;
  const widths = slide.columnWidths || [50, 50];

  const presets: { label: string; widths: number[] }[] = [
    { label: "50 / 50", widths: [50, 50] },
    { label: "70 / 30", widths: [70, 30] },
    { label: "30 / 70", widths: [30, 70] },
  ];

  const activePreset = presets.findIndex(
    (p) => p.widths[0] === widths[0] && p.widths[1] === widths[1]
  );

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center overflow-hidden">
      {/* Column width presets (A) */}
      {showColumnPresets && (
        <div
          className="flex items-center gap-1 mb-3 shrink-0"
          style={{ width: slideWidth * scale }}
        >
          {presets.map((preset, i) => (
            <button
              key={preset.label}
              onClick={() => updateSlide(slide.id, { columnWidths: [...preset.widths] })}
              className={`flex-1 h-7 text-ui-xs font-medium transition-colors ${
                activePreset === i
                  ? "bg-accent-primary text-text-on-brand"
                  : "bg-fill-2 border border-stroke-1 text-text-3 hover:text-text-1 hover:bg-alt-1"
              }`}
            >
              {preset.label}
            </button>
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
