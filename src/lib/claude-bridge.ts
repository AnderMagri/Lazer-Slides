/**
 * Claude Bridge — Exposes the Lazer Slides deck store on `window.__lazerSlides`
 * so Claude Code can interact with the app via browser tools.
 *
 * Usage from Claude (via browser javascript_tool or preview_eval):
 *   __lazerSlides.ping()              // confirm connection, starts heartbeat
 *   __lazerSlides.addSlide("column")
 *   __lazerSlides.addElement(columnId, "heading")
 *   __lazerSlides.updateElement(elementId, { text: "New Title" })
 *   __lazerSlides.getState()          // returns full editor state
 */

import { useDeckStore } from "@/store/deck-store";

const HEARTBEAT_TIMEOUT = 15_000; // 15 seconds without ping = disconnected

export interface LazerSlidesBridge {
  // Connection
  ping: () => string;
  disconnect: () => void;
  isConnected: () => boolean;

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

  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

  function resetHeartbeat() {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    useDeckStore.getState().setClaudeConnected(true);
    heartbeatTimer = setTimeout(() => {
      useDeckStore.getState().setClaudeConnected(false);
    }, HEARTBEAT_TIMEOUT);
  }

  function clearHeartbeat() {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
    useDeckStore.getState().setClaudeConnected(false);
  }

  const bridge: LazerSlidesBridge = {
    // ─── Connection ───
    ping: () => {
      resetHeartbeat();
      return "🟢 connected";
    },
    disconnect: () => {
      clearHeartbeat();
      return;
    },
    isConnected: () => useDeckStore.getState().claudeConnected,

    // ─── Read State ───
    getState: () => useDeckStore.getState(),
    getProject: () => useDeckStore.getState().project,
    getActiveSlide: () => {
      const state = useDeckStore.getState();
      const slide = state.project?.slides.find(
        (s) => s.id === state.activeSlideId
      );
      return { slide: slide as never, id: state.activeSlideId };
    },

    // ─── Project ───
    createProject: (name) => useDeckStore.getState().createProject(name),
    saveProject: () => useDeckStore.getState().saveProject(),

    // ─── Slides ───
    addSlide: (type) => useDeckStore.getState().addSlide(type),
    deleteSlide: (id) => useDeckStore.getState().deleteSlide(id),
    updateSlide: (id, updates) => useDeckStore.getState().updateSlide(id, updates),
    setSlideColumns: (id, cols) => useDeckStore.getState().setSlideColumns(id, cols),
    setActiveSlide: (id) => useDeckStore.getState().setActiveSlide(id),
    changeSlideType: (id, type) => useDeckStore.getState().changeSlideType(id, type),
    setColumnWidth: (id, colIdx, delta) => useDeckStore.getState().setColumnWidth(id, colIdx, delta),

    // ─── Elements ───
    addElement: (colId, type) =>
      useDeckStore.getState().addElement(colId, type as never),
    updateElement: (id, updates) =>
      useDeckStore.getState().updateElement(id, updates as never),
    deleteElement: (id) => useDeckStore.getState().deleteElement(id),
    moveElement: (id, dir) => useDeckStore.getState().moveElement(id, dir),

    // ─── Mode ───
    setMode: (mode) => useDeckStore.getState().setMode(mode),
  };

  window.__lazerSlides = bridge;

  // Log availability
  console.log(
    "%c🎯 Lazer Slides Bridge ready — window.__lazerSlides.ping() to connect",
    "color: #ff4da6; font-weight: bold;"
  );
}
