"use client";

import { useState, useRef, useEffect } from "react";
import { useDeckStore } from "@/store/deck-store";
import { Plus, FolderOpen, Sparkle, GearSix, X } from "@phosphor-icons/react";
import type { AppSettings } from "@/types/deck";

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return { claudeConnection: "mcp" };
  try {
    const raw = localStorage.getItem("lazer-slides-settings");
    return raw ? JSON.parse(raw) : { claudeConnection: "mcp" };
  } catch {
    return { claudeConnection: "mcp" };
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem("lazer-slides-settings", JSON.stringify(settings));
}

export function LandingScreen() {
  const [projectName, setProjectName] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createProject = useDeckStore((s) => s.createProject);
  const loadProject = useDeckStore((s) => s.loadProject);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

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

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-fill-1 relative">
      {/* Config gear (top right) */}
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-alt-1 transition-colors"
        title="Settings"
      >
        <GearSix size={22} />
      </button>

      {/* Settings panel */}
      {showConfig && (
        <div className="absolute top-16 right-4 w-80 bg-fill-2 border border-stroke-1 shadow-elevation-2 p-5 flex flex-col gap-4 z-20">
          <div className="flex items-center justify-between">
            <span className="text-ui-sm font-medium text-text-1">Claude Connection</span>
            <button onClick={() => setShowConfig(false)} className="text-text-3 hover:text-text-1"><X size={16} /></button>
          </div>

          {/* Connection type */}
          <div className="flex flex-col gap-2">
            <span className="text-ui-xs text-text-2 uppercase tracking-wider">Method</span>
            <div className="flex border border-stroke-1 overflow-hidden">
              {(["mcp", "api"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => updateSettings({ claudeConnection: method })}
                  className={`flex-1 py-2 text-ui-xs uppercase transition-colors ${
                    settings.claudeConnection === method
                      ? "bg-accent-primary text-text-on-brand"
                      : "text-text-2 hover:bg-alt-1"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <p className="text-ui-xs text-text-3">
              {settings.claudeConnection === "mcp"
                ? "MCP: Claude Code connects via window.__lazerSlides bridge. No API key needed."
                : "API: Enter your Anthropic API key for direct AI features."}
            </p>
          </div>

          {/* API key (only for API mode) */}
          {settings.claudeConnection === "api" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-ui-xs text-text-2 uppercase tracking-wider">API Key</span>
              <input
                type="password"
                value={settings.claudeApiKey ?? ""}
                onChange={(e) => updateSettings({ claudeApiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="input-field text-ui-sm"
              />
              <p className="text-ui-xs text-text-3">
                Stored locally in your browser. Never sent to our servers.
              </p>
            </div>
          )}
        </div>
      )}

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
