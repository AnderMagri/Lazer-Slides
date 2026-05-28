"use client";

import { useState, useRef } from "react";
import { useDeckStore } from "@/store/deck-store";
import { Plus, FolderOpen, Sparkle } from "@phosphor-icons/react";

export function LandingScreen() {
  const [projectName, setProjectName] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createProject = useDeckStore((s) => s.createProject);
  const loadProject = useDeckStore((s) => s.loadProject);
  const claudeConnected = useDeckStore((s) => s.claudeConnected);

  const handleCreate = () => {
    if (projectName.trim()) createProject(projectName.trim());
  };

  const handleCreateWithClaude = () => {
    createProject("New Presentation");
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadProject(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-fill-1 relative">
      {/* Claude connection status (top right) */}
      <div
        className={`absolute top-4 right-4 flex items-center gap-2 h-9 px-3 text-ui-sm transition-all ${
          claudeConnected
            ? "text-accent-primary bg-accent-primary/10 border border-accent-primary/30"
            : "text-text-3 bg-fill-2 border border-stroke-1"
        }`}
        title={claudeConnected ? "Claude Code is connected via MCP" : "Claude Code not connected"}
      >
        <span className="relative flex items-center justify-center">
          <Sparkle size={16} weight="fill" />
          {claudeConnected && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          )}
        </span>
        {claudeConnected ? "Claude connected" : "Claude offline"}
      </div>

      <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl" style={{ background: "var(--lazer-gradient)" }} />
          <h1 className="text-h2 text-text-1">Lazer Slides</h1>
          <p className="text-ui-md text-text-2 text-center">On-brand presentations, every time.</p>
        </div>

        {/* Actions */}
        {!showNewForm ? (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-accent-primary text-text-on-brand text-ui-lg font-medium transition-colors hover:bg-accent-primary-hover"
            >
              <Plus size={20} weight="bold" />
              New Presentation
            </button>
            <button
              onClick={handleCreateWithClaude}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-accent-primary text-accent-primary text-ui-lg font-medium transition-colors hover:bg-accent-primary hover:text-text-on-brand"
            >
              <Sparkle size={20} weight="fill" />
              Create with Claude
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-stroke-1 text-text-2 text-ui-lg transition-colors hover:bg-alt-1 hover:text-text-1"
            >
              <FolderOpen size={20} />
              Open Existing
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoad} className="hidden" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <input
              type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Project name..." autoFocus
              className="w-full h-12 px-4 rounded-xl bg-fill-2 border border-stroke-1 text-text-1 text-ui-lg placeholder:text-text-3 outline-none focus:border-accent-primary transition-colors"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNewForm(false)} className="flex-1 h-10 rounded-lg border border-stroke-1 text-text-2 text-ui-md transition-colors hover:bg-alt-1">Cancel</button>
              <button onClick={handleCreate} disabled={!projectName.trim()} className="flex-1 h-10 rounded-lg bg-accent-primary text-text-on-brand text-ui-md font-medium transition-colors hover:bg-accent-primary-hover disabled:opacity-40 disabled:cursor-not-allowed">Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
