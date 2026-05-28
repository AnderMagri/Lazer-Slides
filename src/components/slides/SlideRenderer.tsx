"use client";

import type { Slide, SlideElement } from "@/types/deck";
import { useDeckStore } from "@/store/deck-store";
import { Plus, Warning, ArrowsOutSimple, ArrowsInSimple } from "@phosphor-icons/react";
import { ElementRenderer } from "./ElementRenderer";
import { useRef, useState, useEffect } from "react";

interface Props {
  slide: Slide;
  isEditor?: boolean;
}

/** Detects if an element's scrollHeight exceeds its clientHeight. */
function useOverflowDetector(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, isOverflowing };
}

function ColumnContainer({
  col,
  colIndex,
  slide,
  isEditor,
  activeElementId,
  setActiveElement,
  openElementPalette,
  updateElement,
  widthPercent,
}: {
  col: { id: string; elements: SlideElement[] };
  colIndex: number;
  slide: Slide;
  isEditor: boolean;
  activeElementId: string | null;
  setActiveElement: (id: string) => void;
  openElementPalette: (columnId: string) => void;
  updateElement: (id: string, updates: Partial<SlideElement>) => void;
  widthPercent: number;
}) {
  const hasExpandedElements = col.elements.some(
    (el) => el.sizing === "expand"
  );

  const { ref: overflowRef, isOverflowing } = useOverflowDetector([
    col.elements.length,
    col.elements.map((e) => e.id).join(","),
  ]);

  return (
    <div
      key={col.id}
      className="flex flex-col overflow-hidden relative"
      style={{ width: `${widthPercent}%` }}
    >
      {/* Elements — clipped to prevent overflow */}
      <div
        ref={overflowRef}
        className={`flex-1 flex flex-col ${
          hasExpandedElements ? "" : "justify-start"
        } gap-0 p-4 overflow-hidden`}
      >
        {col.elements.map((element) => (
          <div
            key={element.id}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditor) setActiveElement(element.id);
            }}
            className={`shrink-0 relative ${
              element.sizing === "expand"
                ? "flex-1 flex items-center justify-center min-h-0"
                : ""
            } ${
              isEditor
                ? `cursor-pointer transition-all ${
                    activeElementId === element.id
                      ? "ring-2 ring-accent-primary/50 ring-offset-1 ring-offset-fill-1"
                      : "hover:ring-1 hover:ring-stroke-2/50 hover:ring-offset-1 hover:ring-offset-fill-1"
                  }`
                : ""
            }`}
          >
            <ElementRenderer element={element} />

            {/* Floating sizing badge (H) — editor only, active element */}
            {isEditor && activeElementId === element.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateElement(element.id, {
                    sizing: element.sizing === "expand" ? "hug" : "expand",
                  });
                }}
                className="absolute -top-2 -right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-accent-primary text-text-on-brand text-[10px] shadow-elevation-1 hover:scale-110 transition-transform"
                title={element.sizing === "expand" ? "Hug content" : "Expand to fill"}
              >
                {element.sizing === "expand" ? (
                  <ArrowsInSimple size={12} weight="bold" />
                ) : (
                  <ArrowsOutSimple size={12} weight="bold" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Overflow indicator (editor only) */}
      {isEditor && isOverflowing && (
        <div className="absolute bottom-8 left-0 right-0 pointer-events-none">
          <div className="h-12 bg-gradient-to-t from-fill-1 to-transparent" />
          <div className="flex items-center justify-center gap-1 py-1 bg-fill-1">
            <Warning size={12} className="text-status-warning" />
            <span className="text-ui-xs text-status-warning">
              Content overflows
            </span>
          </div>
        </div>
      )}

      {/* Add element button (editor only) */}
      {isEditor && (
        <button
          onClick={() => openElementPalette(col.id)}
          className="flex items-center justify-center gap-1 py-2 mx-4 mb-3 border border-dashed border-stroke-1 text-text-3 text-ui-xs hover:border-accent-primary hover:text-accent-primary transition-colors shrink-0"
        >
          <Plus size={12} />
          Add Element
        </button>
      )}
    </div>
  );
}

export function SlideRenderer({ slide, isEditor = false }: Props) {
  const openElementPalette = useDeckStore((s) => s.openElementPalette);
  const setActiveElement = useDeckStore((s) => s.setActiveElement);
  const activeElementId = useDeckStore((s) => s.activeElementId);
  const updateElement = useDeckStore((s) => s.updateElement);

  // ─── Cover Slide ───
  if (slide.type === "cover") {
    return (
      <div className="w-full h-full bg-fill-1 flex items-center justify-center p-[var(--slide-padding-x)]">
        <div className="flex flex-col items-center gap-4 text-center max-w-[80%]">
          <h1 className="text-display-hero text-text-1 break-words">{slide.title}</h1>
          <p className="text-h2 text-text-2 break-words">{slide.subtitle}</p>
          <p className="text-body text-text-3 break-words">{slide.context}</p>
        </div>
      </div>
    );
  }

  // ─── Title Slide ───
  if (slide.type === "title") {
    return (
      <div className="w-full h-full bg-fill-1 flex flex-col justify-end p-[var(--slide-padding-x)] relative">
        <div className="absolute top-12 left-12 w-1 h-12 rounded-full bg-accent-primary" />
        <div className="flex flex-col gap-3 max-w-[70%]">
          <span className="text-label-sm text-accent-primary uppercase tracking-widest">
            {slide.sectionLabel}
          </span>
          <h2 className="text-display-title text-text-1 break-words">{slide.title}</h2>
          <p className="text-body-lg text-text-2 break-words">{slide.subtitle}</p>
        </div>
      </div>
    );
  }

  // ─── End Slide ───
  if (slide.type === "end") {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "var(--accent-primary)" }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-display-hero text-text-on-brand break-words">
            {slide.title}
          </h2>
          <p className="text-body-lg text-text-on-brand opacity-70 break-words">
            {slide.contactInfo}
          </p>
        </div>
      </div>
    );
  }

  // ─── Column Slide ───
  const widths = slide.columnWidths || Array.from(
    { length: slide.columns },
    () => Math.round(100 / slide.columns)
  );

  return (
    <div className="w-full h-full bg-fill-1 flex flex-col overflow-hidden">
      {/* Slide title bar */}
      <div className="flex items-center justify-between px-10 py-4 shrink-0">
        <span className="text-body-sm text-text-2 break-words">
          {slide.title || "Slide Title"}
        </span>
        {isEditor && slide.columns > 1 && (
          <span className="text-label-sm text-text-3">
            {slide.columns} columns
          </span>
        )}
      </div>

      {/* Column area */}
      <div className="flex-1 flex gap-3 px-6 pb-6 min-h-0">
        {slide.columnData.map((col, colIndex) => (
          <ColumnContainer
            key={col.id}
            col={col}
            colIndex={colIndex}
            slide={slide}
            isEditor={isEditor}
            activeElementId={activeElementId}
            setActiveElement={setActiveElement}
            openElementPalette={openElementPalette}
            updateElement={updateElement}
            widthPercent={widths[colIndex] ?? Math.round(100 / slide.columns)}
          />
        ))}
      </div>
    </div>
  );
}
