"use client";

import { useDeckStore } from "@/store/deck-store";
import { Plus, Trash } from "@phosphor-icons/react";
import type { SlideType } from "@/types/deck";
import { useState } from "react";

const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  cover: "Cover",
  title: "Title",
  column: "Content",
  end: "End",
};

export function SlidePanel() {
  const project = useDeckStore((s) => s.project);
  const activeSlideId = useDeckStore((s) => s.activeSlideId);
  const setActiveSlide = useDeckStore((s) => s.setActiveSlide);
  const addSlide = useDeckStore((s) => s.addSlide);
  const deleteSlide = useDeckStore((s) => s.deleteSlide);
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!project) return null;

  const handleAddSlide = (type: SlideType) => {
    addSlide(type);
    setShowAddMenu(false);
  };

  return (
    <div className="flex flex-col w-[200px] bg-fill-2 border-r border-stroke-1 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-stroke-1">
        <span className="text-ui-xs font-medium text-text-2 uppercase tracking-wider">
          Slides
        </span>
        <span className="text-ui-xs text-text-3">{project.slides.length}</span>
      </div>

      {/* Slide List */}
      <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {project.slides.map((slide, index) => (
          <div
            key={slide.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveSlide(slide.id)}
            onKeyDown={(e) => e.key === "Enter" && setActiveSlide(slide.id)}
            className={`group relative flex flex-col rounded-sm overflow-hidden transition-all cursor-pointer ${
              activeSlideId === slide.id
                ? "ring-2 ring-stroke-2"
                : "ring-1 ring-stroke-1 hover:ring-stroke-2"
            }`}
          >
            {/* Thumbnail */}
            <div className="w-full aspect-video bg-fill-1 relative">
              {/* Simplified slide preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                {slide.type === "cover" && (
                  <div className="text-center px-2">
                    <div className="text-[8px] font-bold text-text-1 truncate">
                      {slide.title}
                    </div>
                  </div>
                )}
                {slide.type === "title" && (
                  <div className="text-left px-2 w-full">
                    <div className="text-[6px] text-accent-primary mb-0.5">
                      {slide.sectionLabel}
                    </div>
                    <div className="text-[8px] font-bold text-text-1 truncate">
                      {slide.title}
                    </div>
                  </div>
                )}
                {slide.type === "column" && (
                  <div className="flex gap-0.5 w-full h-full p-1.5">
                    {Array.from({ length: slide.columns }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-fill-3 border border-stroke-1"
                      />
                    ))}
                  </div>
                )}
                {slide.type === "end" && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "var(--accent-primary)" }}
                  >
                    <div className="text-[8px] font-bold text-white">
                      {slide.title}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="flex items-center justify-between px-2 py-1 bg-fill-2">
              <span className="text-ui-xs text-text-2">
                {index + 1}. {SLIDE_TYPE_LABELS[slide.type]}
              </span>
              {project.slides.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(slide.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-status-error transition-all"
                >
                  <Trash size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Slide */}
      <div className="relative p-2 border-t border-stroke-1 overflow-visible">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center justify-center gap-2 w-full h-8 rounded-sm border border-dashed border-stroke-1 text-ui-xs text-text-2 hover:border-accent-primary hover:text-accent-primary transition-colors"
        >
          <Plus size={14} />
          Add Slide
        </button>

        {showAddMenu && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-fill-3 border border-stroke-1 rounded-sm shadow-elevation-2 overflow-hidden z-20">
            {(["cover", "title", "column", "end"] as SlideType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => handleAddSlide(type)}
                  className="w-full px-3 py-2 text-left text-ui-sm text-text-1 hover:bg-alt-1 transition-colors"
                >
                  {SLIDE_TYPE_LABELS[type]}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
