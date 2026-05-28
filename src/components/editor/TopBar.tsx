"use client";

import { useState, useCallback } from "react";
import { useDeckStore } from "@/store/deck-store";
import { FloppyDisk, Play, ArrowLeft, Sparkle } from "@phosphor-icons/react";
import { ConnectionModal } from "../ui/ConnectionModal";

export function TopBar() {
  const project = useDeckStore((s) => s.project);
  const saveProject = useDeckStore((s) => s.saveProject);
  const setMode = useDeckStore((s) => s.setMode);
  const claudeConnected = useDeckStore((s) => s.claudeConnected);
  const [showConnection, setShowConnection] = useState(false);

  const handleSave = () => {
    const json = saveProject();
    if (!json) return;

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name ?? "presentation"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCloseModal = useCallback(() => {
    setShowConnection(false);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between h-12 px-4 bg-fill-2 border-b border-stroke-1 shrink-0">
        {/* Left — Back + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("landing")}
            className="flex items-center justify-center w-8 h-8 text-text-2 hover:text-text-1 hover:bg-alt-1 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-5 h-5 rounded-sm shrink-0"
            style={{ background: "var(--lazer-gradient)" }}
          />
          <span className="text-ui-md font-medium text-text-1 truncate max-w-[200px]">
            {project?.name ?? "Untitled"}
          </span>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* Claude connection — clickable when offline */}
          <button
            onClick={() => {
              if (!claudeConnected) setShowConnection(true);
            }}
            className={`flex items-center gap-2 h-8 px-3 text-ui-sm transition-all ${
              claudeConnected
                ? "text-accent-primary cursor-default"
                : "text-text-3 hover:text-accent-primary cursor-pointer"
            }`}
          >
            <span className="relative flex items-center justify-center">
              <Sparkle size={16} weight="fill" />
              {claudeConnected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              )}
            </span>
            <span className="hidden sm:inline">
              {claudeConnected ? "Claude connected" : "Connect Claude"}
            </span>
          </button>

          <div className="w-px h-5 bg-stroke-1" />

          <button
            onClick={handleSave}
            className="flex items-center gap-2 h-8 px-3 text-ui-sm text-text-2 border border-stroke-1 hover:bg-alt-1 hover:text-text-1 transition-colors"
          >
            <FloppyDisk size={16} />
            Save
          </button>
          <button
            onClick={() => setMode("present")}
            className="flex items-center gap-2 h-8 px-4 text-ui-sm font-medium bg-accent-primary text-text-on-brand hover:bg-accent-primary-hover transition-colors"
          >
            <Play size={14} weight="fill" />
            Present
          </button>
        </div>
      </div>

      {/* Connection modal */}
      {showConnection && (
        <ConnectionModal onClose={handleCloseModal} />
      )}
    </>
  );
}
