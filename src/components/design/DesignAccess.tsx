"use client";

/**
 * Design Access Panel — Brand owners use this to control the visual system.
 *
 * Sections (to be built out):
 *  - Colors: primary, secondary, neutrals, gradients
 *  - Typography: font families, scale overrides
 *  - Backgrounds: canvas effect per slide type, intensity, speed, colors
 *  - Layout: default column widths, padding, spacing
 *  - Preview: live slide preview with current theme applied
 */

import { useDeckStore } from "@/store/deck-store";
import { ArrowLeft } from "@phosphor-icons/react";
import type { ThemeConfig, BackgroundEffect } from "@/types/deck";
import { DEFAULT_THEME } from "@/types/deck";

const EFFECT_OPTIONS: { value: BackgroundEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "gradient-orbs", label: "Gradient Orbs" },
  { value: "particle-mesh", label: "Particle Mesh" },
  { value: "aurora", label: "Aurora Waves" },
];

export function DesignAccess() {
  const project = useDeckStore((s) => s.project);
  const updateProject = useDeckStore((s) => s.updateProject);
  const setMode = useDeckStore((s) => s.setMode);

  if (!project) return null;

  const theme: ThemeConfig = project.theme ?? DEFAULT_THEME;

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    updateProject({ theme: { ...theme, ...updates } });
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-fill-1">
      {/* Top bar */}
      <div className="flex items-center justify-between h-12 px-4 bg-fill-2 border-b border-stroke-1 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("editor")}
            className="flex items-center justify-center w-8 h-8 text-text-2 hover:text-text-1 hover:bg-alt-1 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-ui-md font-medium text-text-1">Design Access</span>
          <span className="text-ui-xs text-text-3 bg-alt-1 px-2 py-0.5">ADMIN</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8 px-6 flex flex-col gap-8">

          {/* ─── Colors ─── */}
          <Section title="Brand Colors" description="Primary palette used across all slides">
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Primary"
                value={theme.colors.primary}
                onChange={(v) => updateTheme({ colors: { ...theme.colors, primary: v } })}
              />
              <ColorField
                label="Secondary"
                value={theme.colors.secondary}
                onChange={(v) => updateTheme({ colors: { ...theme.colors, secondary: v } })}
              />
              <ColorField
                label="Background"
                value={theme.colors.background}
                onChange={(v) => updateTheme({ colors: { ...theme.colors, background: v } })}
              />
              <ColorField
                label="Surface"
                value={theme.colors.surface}
                onChange={(v) => updateTheme({ colors: { ...theme.colors, surface: v } })}
              />
              <ColorField
                label="Text"
                value={theme.colors.text}
                onChange={(v) => updateTheme({ colors: { ...theme.colors, text: v } })}
              />
              <ColorField
                label="Text Secondary"
                value={theme.colors.textSecondary}
                onChange={(v) => updateTheme({ colors: { ...theme.colors, textSecondary: v } })}
              />
            </div>
          </Section>

          {/* ─── Typography ─── */}
          <Section title="Typography" description="Font families for display, body, and code">
            <div className="flex flex-col gap-3">
              <FieldRow label="Display Font">
                <input
                  type="text"
                  value={theme.typography.displayFont}
                  onChange={(e) => updateTheme({ typography: { ...theme.typography, displayFont: e.target.value } })}
                  className="input-field"
                />
              </FieldRow>
              <FieldRow label="Body Font">
                <input
                  type="text"
                  value={theme.typography.bodyFont}
                  onChange={(e) => updateTheme({ typography: { ...theme.typography, bodyFont: e.target.value } })}
                  className="input-field"
                />
              </FieldRow>
              <FieldRow label="Mono Font">
                <input
                  type="text"
                  value={theme.typography.monoFont}
                  onChange={(e) => updateTheme({ typography: { ...theme.typography, monoFont: e.target.value } })}
                  className="input-field"
                />
              </FieldRow>
            </div>
          </Section>

          {/* ─── Cover Background ─── */}
          <Section title="Cover Slide Background" description="Canvas animation shown behind the cover slide">
            <BackgroundFields
              config={theme.coverBackground}
              onChange={(bg) => updateTheme({ coverBackground: bg })}
            />
          </Section>

          {/* ─── End Background ─── */}
          <Section title="End Slide Background" description="Canvas animation shown behind the closing slide">
            <BackgroundFields
              config={theme.endBackground}
              onChange={(bg) => updateTheme({ endBackground: bg })}
            />
          </Section>

        </div>
      </div>
    </div>
  );
}

// ─── Shared UI pieces ───

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-ui-lg font-medium text-text-1">{title}</h2>
        <p className="text-ui-sm text-text-2 mt-0.5">{description}</p>
      </div>
      <div className="border border-stroke-1 bg-fill-2 p-4">
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-ui-xs font-medium text-text-2 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border border-stroke-1 bg-transparent cursor-pointer shrink-0"
      />
      <div className="flex flex-col">
        <span className="text-ui-xs font-medium text-text-2">{label}</span>
        <span className="text-ui-xs text-text-3 font-mono">{value}</span>
      </div>
    </label>
  );
}

function BackgroundFields({
  config,
  onChange,
}: {
  config: ThemeConfig["coverBackground"];
  onChange: (bg: ThemeConfig["coverBackground"]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <FieldRow label="Effect">
        <select
          value={config.effect}
          onChange={(e) => onChange({ ...config, effect: e.target.value as BackgroundEffect })}
          className="input-field"
        >
          {EFFECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FieldRow>

      {config.effect !== "none" && (
        <>
          <FieldRow label={`Intensity — ${Math.round(config.intensity * 100)}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(config.intensity * 100)}
              onChange={(e) => onChange({ ...config, intensity: parseInt(e.target.value) / 100 })}
              className="w-full accent-accent-primary"
            />
          </FieldRow>

          <FieldRow label={`Speed — ${Math.round(config.speed * 100)}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(config.speed * 100)}
              onChange={(e) => onChange({ ...config, speed: parseInt(e.target.value) / 100 })}
              className="w-full accent-accent-primary"
            />
          </FieldRow>

          <FieldRow label="Colors">
            <div className="flex gap-2">
              {config.colors.map((color, i) => (
                <input
                  key={i}
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const colors = [...config.colors];
                    colors[i] = e.target.value;
                    onChange({ ...config, colors });
                  }}
                  className="w-8 h-8 border border-stroke-1 bg-transparent cursor-pointer"
                />
              ))}
            </div>
          </FieldRow>
        </>
      )}
    </div>
  );
}
