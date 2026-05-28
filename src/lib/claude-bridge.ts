/**
 * Claude Bridge — Exposes the Lazer Slides deck store on `window.__lazerSlides`
 * so Claude Code can interact with the app via browser tools.
 *
 * Usage from Claude (via browser javascript_tool or preview_eval):
 *   __lazerSlides.addSlide("column")
 *   __lazerSlides.addElement(columnId, "heading")
 *   __lazerSlides.updateElement(elementId, { text: "New Title" })
 *   __lazerSlides.getState()  // returns full editor state
 */

import { useDeckStore } from "@/store/deck-store";

export interface LazerSlidesBridge {
  // Read state
  getState: () => ReturnType<typeof useDeckStore.getState>;
  getProject: () => ReturnType<typeof useDeckStore.getState>["project"];
  getActiveSlide: () => {
    slide: ReturnType<typeof useDeckStore.getState>["project"] extends { slides: (infer S)[] } | null ? S | undefined : never;
    id: string | null;
  };

  // Project
  createProject: (name: string) => void;
  saveProject: () => string;

  // Slides
  addSlide: (type: "cover" | "title" | "column" | "end") => void;
  deleteSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Record<string, unknown>) => void;
  setSlideColumns: (slideId: string, columns: 1 | 2 | 3) => void;
  setActiveSlide: (slideId: string) => void;

  // Elements
  addElement: (columnId: string, type: string) => void;
  updateElement: (elementId: string, updates: Record<string, unknown>) => void;
  deleteElement: (elementId: string) => void;
  moveElement: (elementId: string, direction: "up" | "down") => void;

  // Slide type & columns
  changeSlideType: (slideId: string, newType: "cover" | "title" | "column" | "end") => void;
  setColumnWidth: (slideId: string, columnIndex: number, delta: number) => void;

  // Mode
  setMode: (mode: "landing" | "editor" | "present") => void;
}

declare global {
  interface Window {
    __lazerSlides?: LazerSlidesBridge;
  }
}

export function initClaudeBridge() {
  if (typeof window === "undefined") return;

  const bridge: LazerSlidesBridge = {
    getState: () => useDeckStore.getState(),
    getProject: () => useDeckStore.getState().project,
    getActiveSlide: () => {
      const state = useDeckStore.getState();
      const slide = state.project?.slides.find(
        (s) => s.id === state.activeSlideId
      );
      return { slide: slide as never, id: state.activeSlideId };
    },

    createProject: (name) => useDeckStore.getState().createProject(name),
    saveProject: () => useDeckStore.getState().saveProject(),

    addSlide: (type) => useDeckStore.getState().addSlide(type),
    deleteSlide: (id) => useDeckStore.getState().deleteSlide(id),
    updateSlide: (id, updates) => useDeckStore.getState().updateSlide(id, updates),
    setSlideColumns: (id, cols) => useDeckStore.getState().setSlideColumns(id, cols),
    setActiveSlide: (id) => useDeckStore.getState().setActiveSlide(id),
    changeSlideType: (id, type) => useDeckStore.getState().changeSlideType(id, type),
    setColumnWidth: (id, colIdx, delta) => useDeckStore.getState().setColumnWidth(id, colIdx, delta),

    addElement: (colId, type) =>
      useDeckStore.getState().addElement(colId, type as never),
    updateElement: (id, updates) =>
      useDeckStore.getState().updateElement(id, updates as never),
    deleteElement: (id) => useDeckStore.getState().deleteElement(id),
    moveElement: (id, dir) => useDeckStore.getState().moveElement(id, dir),

    setMode: (mode) => useDeckStore.getState().setMode(mode),
  };

  window.__lazerSlides = bridge;

  // Log availability
  console.log(
    "%c🎯 Lazer Slides Bridge active — window.__lazerSlides",
    "color: #ff4da6; font-weight: bold;"
  );
}
