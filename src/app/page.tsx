"use client";

import { useDeckStore } from "@/store/deck-store";
import { LandingScreen } from "@/components/ui/LandingScreen";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PresentMode } from "@/components/slides/PresentMode";
import { DesignAccess } from "@/components/design/DesignAccess";

export default function Home() {
  const mode = useDeckStore((s) => s.mode);

  if (mode === "landing") return <LandingScreen />;
  if (mode === "present") return <PresentMode />;
  if (mode === "design") return <DesignAccess />;
  return <EditorLayout />;
}
