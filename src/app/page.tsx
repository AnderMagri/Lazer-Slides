"use client";

import { useDeckStore } from "@/store/deck-store";
import { LandingScreen } from "@/components/ui/LandingScreen";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PresentMode } from "@/components/slides/PresentMode";

export default function Home() {
  const mode = useDeckStore((s) => s.mode);

  if (mode === "landing") return <LandingScreen />;
  if (mode === "present") return <PresentMode />;
  return <EditorLayout />;
}
