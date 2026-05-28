"use client";

import { useDeckStore } from "@/store/deck-store";
import { SlideRenderer } from "./SlideRenderer";
import { ColumnPicker } from "../ui/ColumnPicker";
import { useSlideScale } from "@/hooks/useSlideScale";

export function SlideCanvas() {
  const project = useDeckStore((s) => s.project);
  const activeSlideId = useDeckStore((s) => s.activeSlideId);
  const { containerRef, scale, slideWidth, slideHeight } = useSlideScale();

  if (!project || !activeSlideId) return null;

  const slide = project.slides.find((s) => s.id === activeSlideId);
  if (!slide) return null;

  // Show column picker only for column slides that haven't chosen a layout yet
  const showPicker = slide.type === "column" && !slide.layoutChosen;

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden">
      {/* Scaled wrapper — participates in layout at the scaled size */}
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
