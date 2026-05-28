"use client";

import { useDeckStore } from "@/store/deck-store";
import { TopBar } from "./TopBar";
import { SlidePanel } from "../panels/SlidePanel";
import { SlideCanvas } from "../slides/SlideCanvas";
import { EditPanel } from "../panels/EditPanel";
import { ElementPalette } from "../ui/ElementPalette";

export function EditorLayout() {
  const showElementPalette = useDeckStore((s) => s.showElementPalette);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-fill-1">
      {/* Top Bar */}
      <TopBar />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Slide thumbnails */}
        <SlidePanel />

        {/* Center — Slide canvas (scaling handled internally) */}
        <SlideCanvas />

        {/* Right — Edit panel */}
        <EditPanel />
      </div>

      {/* Bottom Sheet — Element Palette */}
      {showElementPalette && <ElementPalette />}
    </div>
  );
}
