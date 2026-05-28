"use client";

import type { Slide, SlideElement } from "@/types/deck";
import { useDeckStore } from "@/store/deck-store";
import { Plus, Warning, ArrowsOutSimple, ArrowsInSimple, Trash, DotsSixVertical, CaretRight, X } from "@phosphor-icons/react";
import { ElementRenderer } from "./ElementRenderer";
import { useDeckStore as useDeckStoreRaw } from "@/store/deck-store";
import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  slide: Slide;
  isEditor?: boolean;
  /** In present mode, called when user picks a slide from the list */
  onNavigateToSlide?: (index: number) => void;
}

// ─── Slide List Panel (chevron → slide list overlay) ───
function SlideListPanel({
  currentSlideId,
  onNavigate,
  onClose,
}: {
  currentSlideId: string;
  onNavigate: (slideId: string, index: number) => void;
  onClose: () => void;
}) {
  const project = useDeckStoreRaw((s) => s.project);
  if (!project) return null;

  return (
    <div className="absolute inset-0 z-30 flex" onClick={onClose}>
      {/* Panel */}
      <div
        className="w-[220px] h-full bg-fill-2/95 backdrop-blur-sm border-r border-stroke-1 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-1 shrink-0">
          <span className="text-label-sm text-text-2 uppercase tracking-wider">Slides</span>
          <button onClick={onClose} className="text-text-3 hover:text-text-1 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {project.slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id, i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                s.id === currentSlideId
                  ? "bg-alt-1 text-text-1"
                  : "text-text-2 hover:bg-alt-1 hover:text-text-1"
              }`}
            >
              <span className="text-label-sm text-text-3 w-5 shrink-0 text-right">{i + 1}</span>
              <span className="text-body-sm truncate">
                {s.title || (s.type === "column" ? "Untitled" : s.type.charAt(0).toUpperCase() + s.type.slice(1))}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Rest is transparent clickable area to dismiss */}
    </div>
  );
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
  deleteElement,
  moveElementToPosition,
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
  deleteElement: (id: string) => void;
  moveElementToPosition: (elementId: string, targetColumnId: string, targetIndex: number) => void;
  widthPercent: number;
}) {
  const hasExpandedElements = col.elements.some(
    (el) => el.sizing === "expand"
  );

  const { ref: overflowRef, isOverflowing } = useOverflowDetector([
    col.elements.length,
    col.elements.map((e) => e.id).join(","),
  ]);

  // ─── Drag & Drop ───
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData("text/plain", elementId);
    e.dataTransfer.effectAllowed = "move";
    // Add a slight delay so the drag image captures properly
    (e.target as HTMLElement).style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDropIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndex(index);
  }, []);

  const handleDragOverColumn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // If dragging over empty space, drop at end
    setDropIndex(col.elements.length);
  }, [col.elements.length]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset if leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDropIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const elementId = e.dataTransfer.getData("text/plain");
    if (!elementId) return;
    const insertAt = dropIndex ?? col.elements.length;
    moveElementToPosition(elementId, col.id, insertAt);
    setDropIndex(null);
  }, [dropIndex, col.id, col.elements.length, moveElementToPosition]);

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
        onDragOver={isEditor ? handleDragOverColumn : undefined}
        onDragLeave={isEditor ? handleDragLeave : undefined}
        onDrop={isEditor ? handleDrop : undefined}
      >
        {col.elements.map((element, index) => (
          <div key={element.id}>
            {/* Drop indicator — shows before this element */}
            {isEditor && dropIndex === index && (
              <div className="h-0.5 bg-accent-primary rounded-full mx-1 my-1 transition-all" />
            )}
            <div
              draggable={isEditor}
              onDragStart={isEditor ? (e) => handleDragStart(e, element.id) : undefined}
              onDragEnd={isEditor ? handleDragEnd : undefined}
              onDragOver={isEditor ? (e) => handleDragOver(e, index) : undefined}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditor) setActiveElement(element.id);
              }}
              className={`shrink-0 relative group ${
                element.sizing === "expand"
                  ? "flex-1 flex items-center justify-center min-h-0"
                  : ""
              } ${
                isEditor
                  ? `cursor-pointer transition-all ${
                      activeElementId === element.id
                        ? "ring-1 ring-stroke-2 ring-offset-1 ring-offset-fill-1"
                        : "hover:ring-1 hover:ring-stroke-1 hover:ring-offset-1 hover:ring-offset-fill-1"
                    }`
                  : ""
              }`}
            >
              {/* Drag handle — visible on hover */}
              {isEditor && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+2px)] z-10 w-4 h-6 flex items-center justify-center text-text-3 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                  title="Drag to reorder"
                >
                  <DotsSixVertical size={14} weight="bold" />
                </div>
              )}

              <ElementRenderer element={element} />

              {/* Floating badges — editor only, active element */}
              {isEditor && activeElementId === element.id && (
                <>
                  {/* Sizing badge (top-right) */}
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

                  {/* Delete badge (top-left) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="absolute -top-2 -left-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-fill-3 border border-stroke-1 text-text-2 text-[10px] shadow-elevation-1 hover:bg-status-error hover:text-text-on-brand hover:border-status-error hover:scale-110 transition-all"
                    title="Delete element"
                  >
                    <Trash size={12} weight="bold" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Drop indicator at end of list */}
        {isEditor && dropIndex === col.elements.length && col.elements.length > 0 && (
          <div className="h-0.5 bg-accent-primary rounded-full mx-1 my-1 transition-all" />
        )}
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

export function SlideRenderer({ slide, isEditor = false, onNavigateToSlide }: Props) {
  const openElementPalette = useDeckStore((s) => s.openElementPalette);
  const setActiveElement = useDeckStore((s) => s.setActiveElement);
  const setActiveSlide = useDeckStoreRaw((s) => s.setActiveSlide);
  const activeElementId = useDeckStore((s) => s.activeElementId);
  const updateElement = useDeckStore((s) => s.updateElement);
  const deleteElement = useDeckStore((s) => s.deleteElement);
  const moveElementToPosition = useDeckStore((s) => s.moveElementToPosition);
  const [showSlideList, setShowSlideList] = useState(false);

  // ─── Slide list chevron (shared by all slide types) ───
  const slideListChevron = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowSlideList((v) => !v);
      }}
      className={`absolute top-4 left-4 z-20 flex items-center justify-center w-7 h-7 transition-all ${
        showSlideList
          ? "text-text-1 bg-alt-2 rotate-90"
          : "text-text-3 hover:text-text-1 hover:bg-alt-1 opacity-40 hover:opacity-100"
      }`}
      title="Slide list"
    >
      <CaretRight size={14} weight="bold" />
    </button>
  );

  const slideListOverlay = showSlideList && (
    <SlideListPanel
      currentSlideId={slide.id}
      onNavigate={(slideId, index) => {
        setShowSlideList(false);
        if (onNavigateToSlide) {
          onNavigateToSlide(index);
        } else {
          setActiveSlide(slideId);
        }
      }}
      onClose={() => setShowSlideList(false)}
    />
  );

  // ─── Cover Slide ───
  if (slide.type === "cover") {
    return (
      <div className="w-full h-full bg-fill-1 flex items-center justify-center p-[var(--slide-padding-x)] relative">
        {slideListChevron}
        {slideListOverlay}
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
        {slideListChevron}
        {slideListOverlay}
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
        className="w-full h-full flex items-center justify-center relative"
        style={{ background: "var(--accent-primary)" }}
      >
        {slideListChevron}
        {slideListOverlay}
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
    <div className="w-full h-full bg-fill-1 flex flex-col overflow-hidden relative">
      {/* Slide list chevron + overlay */}
      {slideListChevron}
      {slideListOverlay}

      {/* Slide title bar */}
      <div className="flex items-center px-10 py-4 shrink-0">
        <span className="text-body-sm text-text-2 break-words">
          {slide.title || "Slide Title"}
        </span>
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
            deleteElement={deleteElement}
            moveElementToPosition={moveElementToPosition}
            widthPercent={widths[colIndex] ?? Math.round(100 / slide.columns)}
          />
        ))}
      </div>
    </div>
  );
}
