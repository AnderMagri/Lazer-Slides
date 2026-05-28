"use client";

import { useEffect } from "react";
import { initClaudeBridge } from "@/lib/claude-bridge";

export function BridgeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initClaudeBridge();
  }, []);

  return <>{children}</>;
}
