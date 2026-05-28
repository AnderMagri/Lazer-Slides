/**
 * Claude Bridge — Exposes the Lazer Slides deck store on `window.__lazerSlides`
 * so Claude Code can interact with the app via browser tools.
 *
 * First call: __lazerSlides.help()  — get full project docs
 * Then call:  __lazerSlides.ping()  — confirm connection
 */

import { useDeckStore } from "@/store/deck-store";
import type { AiRequest } from "@/types/deck";

const HEARTBEAT_TIMEOUT = 15_000; // 15 seconds without ping = disconnected

export interface LazerSlidesBridge {
  // Discovery
  help: () => string;
  status: () => string;

  // Connection
  ping: () => string;
  disconnect: () => void;
  isConnected: () => boolean;

  // AI Requests
  getAiRequests: () => AiRequest[];
  resolveAiRequest: (requestId: string) => void;
  clearAiRequests: () => void;

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

// ─── Manifest — everything Claude needs to know ───

function buildHelp(): string {
  return `
╔══════════════════════════════════════════════════════════════╗
║  LAZER SLIDES — AI-Powered Presentation Builder             ║
║  by Lazer Technologies                                      ║
╚══════════════════════════════════════════════════════════════╝

🎯 WHAT IS THIS?
Lazer Slides is a presentation builder for creating on-brand slide decks.
You (Claude) are connected via the MCP bridge at window.__lazerSlides.
The user can click ✦ sparkle buttons on text fields to request your help.

📡 CONNECTION
  ping()                    → Confirm connection (call regularly to stay "connected")
  disconnect()              → Disconnect cleanly
  isConnected()             → Check connection status
  status()                  → Get current project summary

🧠 AI REQUEST QUEUE
  When the user clicks ✦ on a text field, a request is queued.
  getAiRequests()           → Array of pending requests [{id, elementId, field, currentValue, context, status}]
  resolveAiRequest(id)      → Mark request as done (call after updating the element)
  clearAiRequests()         → Clear all requests

  Workflow:
  1. Check getAiRequests() for pending requests
  2. Read the request's currentValue and context
  3. Generate improved content
  4. Call updateElement(elementId, { [field]: newValue })
  5. Call resolveAiRequest(requestId)

📊 PROJECT
  createProject(name)       → Create new project (switches to editor mode)
  saveProject()             → Returns JSON string of project
  getState()                → Full Zustand store state
  getProject()              → Just the project object
  getActiveSlide()          → { slide, id } of currently active slide

📑 SLIDE TYPES
  "cover"   → Hero slide: title, subtitle, context (centered, large text)
  "title"   → Section divider: sectionLabel, title, subtitle (bottom-left, accent bar)
  "column"  → Content slide: 1-3 columns with elements (the main workhorse)
  "end"     → Closing slide: title, contactInfo (accent background)

  addSlide(type)                    → Add slide at end
  deleteSlide(slideId)              → Remove slide
  setActiveSlide(slideId)           → Navigate to slide
  changeSlideType(slideId, type)    → Convert slide type (preserves compatible data)
  updateSlide(slideId, updates)     → Update slide fields (title, subtitle, etc.)
  setSlideColumns(slideId, 1|2|3)   → Set column count (column slides only)
  setColumnWidth(slideId, colIdx, delta) → Adjust column width by delta%

  Column width presets (2-column slides):
    updateSlide(slideId, { columnWidths: [50, 50] })  → Equal
    updateSlide(slideId, { columnWidths: [70, 30] })  → Wide left
    updateSlide(slideId, { columnWidths: [30, 70] })  → Wide right

🧩 ELEMENT TYPES (for addElement)
  Text:   "heading", "body-text", "quote", "bullet-list", "numbered-list", "stat"
  Media:  "image", "card", "chart", "person-card", "icon-text"
  Layout: "divider", "spacer"

  addElement(columnId, type)        → Add element to column
  updateElement(elementId, updates) → Update element fields
  deleteElement(elementId)          → Remove element
  moveElement(elementId, "up"|"down") → Reorder element

📝 ELEMENT UPDATE FIELDS
  heading:       { text, style: "h1"|"h2"|"h3"|"display-mega"|"display-hero"|"display-title", showBadge, badgeText }
  body-text:     { text, style: "body"|"body-lg"|"body-sm" }
  quote:         { text, attribution }
  stat:          { value: "100%", label: "Metric name", layout: "stacked"|"inline" }
  bullet-list:   { items: ["item 1", "item 2", ...] }
  numbered-list: { items: ["step 1", "step 2", ...], startNumber: 1 }
  icon-text:     { icon: "Star"|"Lightning"|"Heart"|..., text, layout: "horizontal"|"vertical" }
  card:          { title, body, image?: "data:image/..." }
  image:         { src, alt, fit: "cover"|"contain"|"fill", isBackground }
  person-card:   { name, role, avatar }
  chart:         { chartType: "bar"|"line", data: [{label, value}] }
  divider:       { color: "brand"|"accent"|"neutral" }
  spacer:        { size: "sm"|"md"|"lg" }

  All elements also have: { sizing: "hug"|"expand" }

🎨 AVAILABLE ICONS (for icon-text)
  Star, Lightning, Heart, Eye, Shield, Gear, Rocket, Target,
  Trophy, Flag, Bell, Chat, Clock, Fire, Globe, Lock, MagnifyingGlass, User

🖥️ MODE
  setMode("landing")  → Back to home screen
  setMode("editor")   → Editor view
  setMode("present")  → Full-screen presentation

💡 QUICK START — Build a 3-slide deck:
  __lazerSlides.ping()
  __lazerSlides.createProject("My Deck")
  // Slide 1 is already a cover slide
  __lazerSlides.updateSlide(slides[0].id, { title: "Big Idea", subtitle: "The pitch" })
  // Add content slide
  __lazerSlides.addSlide("column")
  // Set 2 columns, get columnData[0].id and columnData[1].id
  __lazerSlides.setSlideColumns(slideId, 2)
  __lazerSlides.updateSlide(slideId, { layoutChosen: true })
  __lazerSlides.addElement(col1Id, "heading")
  __lazerSlides.updateElement(elementId, { text: "Key Points" })
  // Add end slide
  __lazerSlides.addSlide("end")

⚠️ IMPORTANT NOTES
  - Always call ping() first to show "Claude connected" in the UI
  - After setSlideColumns(), call updateSlide(id, { layoutChosen: true })
  - After addSlide("column"), re-read getState() to get the new slide's columnData IDs
  - Column slides start with 1 column. Call setSlideColumns() then layoutChosen: true
  - Element IDs change when you re-read state — always use fresh state
  - The user sees sparkle ✦ buttons only when you're connected (ping heartbeat)
`.trim();
}

function buildStatus(): string {
  const state = useDeckStore.getState();
  const { project, mode, activeSlideId, activeElementId, claudeConnected, aiRequests } = state;

  if (!project) {
    return `Mode: ${mode} | No project loaded | Claude: ${claudeConnected ? "connected" : "offline"}`;
  }

  const slide = project.slides.find(s => s.id === activeSlideId);
  const pendingRequests = aiRequests.filter(r => r.status === "pending");

  const lines = [
    `Project: "${project.name}" (${project.slides.length} slides)`,
    `Mode: ${mode} | Claude: ${claudeConnected ? "🟢 connected" : "⚪ offline"}`,
    `Active slide: ${slide ? `#${project.slides.indexOf(slide) + 1} ${slide.type}` : "none"} (${activeSlideId ?? "—"})`,
    `Active element: ${activeElementId ?? "none"}`,
    `AI requests pending: ${pendingRequests.length}`,
    ``,
    `Slides:`,
    ...project.slides.map((s, i) => {
      const elements = s.type === "column"
        ? s.columnData.reduce((sum, col) => sum + col.elements.length, 0)
        : 0;
      return `  ${i + 1}. [${s.type}] "${s.title || "(untitled)"}"${s.type === "column" ? ` — ${s.columns}col, ${elements} elements` : ""}`;
    }),
  ];

  if (pendingRequests.length > 0) {
    lines.push(``, `Pending AI requests:`);
    pendingRequests.forEach(r => {
      lines.push(`  ✦ ${r.field} on ${r.elementId}: "${r.currentValue.substring(0, 50)}${r.currentValue.length > 50 ? "…" : ""}"`);
      lines.push(`    Context: ${r.context}`);
    });
  }

  return lines.join("\n");
}

// ─── Bridge Init ───

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
    // ─── Discovery ───
    help: () => buildHelp(),
    status: () => buildStatus(),

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

    // ─── AI Requests ───
    getAiRequests: () => useDeckStore.getState().aiRequests,
    resolveAiRequest: (id) => useDeckStore.getState().resolveAiRequest(id),
    clearAiRequests: () => useDeckStore.getState().clearAiRequests(),

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

  // Listen for ping messages from the Chrome extension / Claude Code
  // This enables auto-connect: if Claude is already watching this tab,
  // it can postMessage to trigger an instant connection.
  window.addEventListener("message", (event) => {
    if (event.data?.type === "lazer-slides-ping") {
      bridge.ping();
    }
  });

  // Dispatch a custom event so any listening extension/script knows the bridge is ready
  window.dispatchEvent(new CustomEvent("lazer-slides-bridge-ready", {
    detail: { bridge: "__lazerSlides", version: "1.0" },
  }));

  // Also set a DOM marker that Claude Code can detect when it first inspects the page
  document.documentElement.setAttribute("data-lazer-slides-bridge", "ready");

  // Log availability — Claude Code sees this in the console
  console.log(
    "%c🎯 Lazer Slides Bridge ready — call __lazerSlides.help() for docs, __lazerSlides.ping() to connect",
    "color: #ff4da6; font-weight: bold;"
  );
}
