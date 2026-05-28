"use client";

import { useDeckStore } from "@/store/deck-store";
import { FloppyDisk, Play, ArrowLeft, GearSix } from "@phosphor-icons/react";
import { useState } from "react";

export function TopBar() {
  const project = useDeckStore((s) => s.project);
  const saveProject = useDeckStore((s) => s.saveProject);
  const setMode = useDeckStore((s) => s.setMode);
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <>
      <div className="flex items-center justify-between h-12 px-4 bg-fill-2 border-b border-stroke-1 shrink-0">
        {/* Left — Back + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("landing")}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-2 hover:text-text-1 hover:bg-alt-1 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-5 h-5 rounded-md shrink-0"
            style={{ background: "var(--lazer-gradient)" }}
          />
          <span className="text-ui-md font-medium text-text-1 truncate max-w-[200px]">
            {project?.name ?? "Untitled"}
          </span>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-2 hover:text-text-1 hover:bg-alt-1 transition-colors"
            title="Settings"
          >
            <GearSix size={18} />
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 h-8 px-3 rounded-lg text-ui-sm text-text-2 border border-stroke-1 hover:bg-alt-1 hover:text-text-1 transition-colors"
          >
            <FloppyDisk size={16} />
            Save
          </button>
          <button
            onClick={() => setMode("present")}
            className="flex items-center gap-2 h-8 px-4 rounded-lg text-ui-sm font-medium bg-accent-primary text-text-on-brand hover:bg-accent-primary-hover transition-colors"
          >
            <Play size={14} weight="fill" />
            Present
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="absolute top-12 right-4 z-30 w-64 bg-fill-3 border border-stroke-1 rounded-xl shadow-elevation-2 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-ui-xs font-medium text-text-2 uppercase tracking-wider">
              Settings
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-text-3 hover:text-text-1 text-ui-sm"
            >
              ×
            </button>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-ui-xs text-text-2">Project Name</span>
            <input
              type="text"
              value={project?.name ?? ""}
              onChange={() => {}}
              className="input-field"
              readOnly
            />
          </label>
          <div className="text-ui-xs text-text-3">
            Slides: {project?.slides.length ?? 0} | Version:{" "}
            {project?.version ?? "—"}
          </div>
        </div>
      )}
    </>
  );
}
