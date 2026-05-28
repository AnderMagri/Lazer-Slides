"use client";

import { useDeckStore } from "@/store/deck-store";
import type { SlideElement, HeadingElement, BodyTextElement, QuoteElement, StatElement, ImageElement, DividerElement, SpacerElement, CardElement, IconTextElement } from "@/types/deck";
import { Trash, ArrowUp, ArrowDown, ArrowsOutSimple, ArrowsInSimple } from "@phosphor-icons/react";

export function EditPanel() {
  const project = useDeckStore((s) => s.project);
  const activeSlideId = useDeckStore((s) => s.activeSlideId);
  const activeElementId = useDeckStore((s) => s.activeElementId);
  const updateSlide = useDeckStore((s) => s.updateSlide);
  const updateElement = useDeckStore((s) => s.updateElement);
  const deleteElement = useDeckStore((s) => s.deleteElement);
  const moveElement = useDeckStore((s) => s.moveElement);

  if (!project || !activeSlideId) return null;

  const slide = project.slides.find((s) => s.id === activeSlideId);
  if (!slide) return null;

  // Find active element across all columns
  let activeElement: SlideElement | null = null;
  if (activeElementId) {
    for (const col of slide.columnData) {
      const found = col.elements.find((el) => el.id === activeElementId);
      if (found) {
        activeElement = found;
        break;
      }
    }
  }

  return (
    <div className="w-[280px] bg-fill-2 border-l border-stroke-1 shrink-0 overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-stroke-1">
        <span className="text-ui-xs font-medium text-text-2 uppercase tracking-wider">
          {activeElement ? "Element" : "Slide"}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {activeElement ? (
          <ElementEditor
            element={activeElement}
            onUpdate={(updates) => updateElement(activeElement!.id, updates)}
            onDelete={() => deleteElement(activeElement!.id)}
            onMove={(dir) => moveElement(activeElement!.id, dir)}
          />
        ) : (
          <SlideEditor
            slide={slide}
            onUpdate={(updates) => updateSlide(slide.id, updates)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Slide Properties Editor ───

function SlideEditor({
  slide,
  onUpdate,
}: {
  slide: ReturnType<typeof useDeckStore.getState>["project"] extends { slides: (infer S)[] } | null ? S : never;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const setSlideColumns = useDeckStore((s) => s.setSlideColumns);

  return (
    <div className="flex flex-col gap-4">
      <Label text="Slide Type">
        <div className="text-ui-md text-text-1 capitalize bg-fill-1 px-3 py-2 rounded-lg border border-stroke-1">
          {slide.type}
        </div>
      </Label>

      {slide.type === "column" && (
        <Label text="Columns">
          <div className="flex rounded-lg border border-stroke-1 overflow-hidden">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSlideColumns(slide.id, n)}
                className={`flex-1 py-1.5 text-ui-xs transition-colors ${
                  slide.columns === n
                    ? "bg-accent-primary text-text-on-brand"
                    : "text-text-2 hover:bg-alt-1"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Label>
      )}

      {(slide.type === "cover" || slide.type === "title" || slide.type === "end" || slide.type === "column") && (
        <Label text="Title">
          <input
            type="text"
            value={slide.title ?? ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={slide.type === "column" ? "Slide Title" : ""}
            className="input-field"
          />
        </Label>
      )}

      {(slide.type === "cover" || slide.type === "title") && (
        <Label text="Subtitle">
          <input
            type="text"
            value={slide.subtitle ?? ""}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            className="input-field"
          />
        </Label>
      )}

      {slide.type === "cover" && (
        <Label text="Context">
          <input
            type="text"
            value={slide.context ?? ""}
            onChange={(e) => onUpdate({ context: e.target.value })}
            className="input-field"
          />
        </Label>
      )}

      {slide.type === "title" && (
        <Label text="Section Label">
          <input
            type="text"
            value={slide.sectionLabel ?? ""}
            onChange={(e) => onUpdate({ sectionLabel: e.target.value })}
            className="input-field"
          />
        </Label>
      )}

      {slide.type === "end" && (
        <Label text="Contact Info">
          <input
            type="text"
            value={slide.contactInfo ?? ""}
            onChange={(e) => onUpdate({ contactInfo: e.target.value })}
            className="input-field"
          />
        </Label>
      )}
    </div>
  );
}

// ─── Element Properties Editor ───

function ElementEditor({
  element,
  onUpdate,
  onDelete,
  onMove,
}: {
  element: SlideElement;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Actions bar */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onMove("up")}
          className="icon-btn"
          title="Move up"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={() => onMove("down")}
          className="icon-btn"
          title="Move down"
        >
          <ArrowDown size={14} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() =>
            onUpdate({
              sizing: element.sizing === "expand" ? "hug" : "expand",
            })
          }
          className="icon-btn"
          title={element.sizing === "expand" ? "Hug content" : "Expand to fill"}
        >
          {element.sizing === "expand" ? (
            <ArrowsInSimple size={14} />
          ) : (
            <ArrowsOutSimple size={14} />
          )}
        </button>
        <button
          onClick={onDelete}
          className="icon-btn text-status-error"
          title="Delete"
        >
          <Trash size={14} />
        </button>
      </div>

      {/* Sizing toggle */}
      <Label text="Sizing">
        <div className="flex rounded-lg border border-stroke-1 overflow-hidden">
          {(["hug", "expand"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdate({ sizing: mode })}
              className={`flex-1 py-1.5 text-ui-xs capitalize transition-colors ${
                element.sizing === mode
                  ? "bg-accent-primary text-text-on-brand"
                  : "text-text-2 hover:bg-alt-1"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </Label>

      {/* Type-specific fields */}
      {element.type === "heading" && (
        <HeadingFields
          element={element}
          onUpdate={onUpdate as (u: Partial<HeadingElement>) => void}
        />
      )}
      {element.type === "body-text" && (
        <BodyTextField
          element={element}
          onUpdate={onUpdate as (u: Partial<BodyTextElement>) => void}
        />
      )}
      {element.type === "quote" && (
        <QuoteFields
          element={element}
          onUpdate={onUpdate as (u: Partial<QuoteElement>) => void}
        />
      )}
      {element.type === "stat" && (
        <StatFields
          element={element}
          onUpdate={onUpdate as (u: Partial<StatElement>) => void}
        />
      )}
      {element.type === "image" && (
        <ImageFields
          element={element}
          onUpdate={onUpdate as (u: Partial<ImageElement>) => void}
        />
      )}
      {element.type === "divider" && (
        <DividerFields
          element={element}
          onUpdate={onUpdate as (u: Partial<DividerElement>) => void}
        />
      )}
      {element.type === "spacer" && (
        <SpacerFields
          element={element}
          onUpdate={onUpdate as (u: Partial<SpacerElement>) => void}
        />
      )}
      {element.type === "card" && (
        <CardFields
          element={element}
          onUpdate={onUpdate as (u: Partial<CardElement>) => void}
        />
      )}
      {element.type === "icon-text" && (
        <IconTextFields
          element={element}
          onUpdate={onUpdate as (u: Partial<IconTextElement>) => void}
        />
      )}
    </div>
  );
}

// ─── Field Components ───

function HeadingFields({ element, onUpdate }: { element: HeadingElement; onUpdate: (u: Partial<HeadingElement>) => void }) {
  return (
    <>
      <Label text="Text">
        <textarea value={element.text} onChange={(e) => onUpdate({ text: e.target.value })} className="input-field min-h-[60px] resize-y" />
      </Label>
      <Label text="Style">
        <select value={element.style} onChange={(e) => onUpdate({ style: e.target.value as HeadingElement["style"] })} className="input-field">
          <option value="display-mega">Mega</option>
          <option value="display-hero">Hero</option>
          <option value="display-title">Title</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
      </Label>
      <Label text="Badge">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={element.showBadge} onChange={(e) => onUpdate({ showBadge: e.target.checked })} className="accent-accent-primary" />
          <input type="text" value={element.badgeText} onChange={(e) => onUpdate({ badgeText: e.target.value })} placeholder="Badge text" disabled={!element.showBadge} className="input-field flex-1 disabled:opacity-40" />
        </div>
      </Label>
    </>
  );
}

function BodyTextField({ element, onUpdate }: { element: BodyTextElement; onUpdate: (u: Partial<BodyTextElement>) => void }) {
  return (
    <>
      <Label text="Text">
        <textarea value={element.text} onChange={(e) => onUpdate({ text: e.target.value })} className="input-field min-h-[100px] resize-y" />
      </Label>
      <Label text="Style">
        <select value={element.style} onChange={(e) => onUpdate({ style: e.target.value as BodyTextElement["style"] })} className="input-field">
          <option value="body-lg">Large</option>
          <option value="body">Default</option>
          <option value="body-sm">Small</option>
        </select>
      </Label>
    </>
  );
}

function QuoteFields({ element, onUpdate }: { element: QuoteElement; onUpdate: (u: Partial<QuoteElement>) => void }) {
  return (
    <>
      <Label text="Quote">
        <textarea value={element.text} onChange={(e) => onUpdate({ text: e.target.value })} className="input-field min-h-[80px] resize-y" />
      </Label>
      <Label text="Attribution">
        <input type="text" value={element.attribution} onChange={(e) => onUpdate({ attribution: e.target.value })} className="input-field" />
      </Label>
    </>
  );
}

function StatFields({ element, onUpdate }: { element: StatElement; onUpdate: (u: Partial<StatElement>) => void }) {
  return (
    <>
      <Label text="Value"><input type="text" value={element.value} onChange={(e) => onUpdate({ value: e.target.value })} className="input-field" /></Label>
      <Label text="Label"><input type="text" value={element.label} onChange={(e) => onUpdate({ label: e.target.value })} className="input-field" /></Label>
      <Label text="Layout">
        <select value={element.layout} onChange={(e) => onUpdate({ layout: e.target.value as "stacked" | "inline" })} className="input-field">
          <option value="stacked">Stacked</option>
          <option value="inline">Inline</option>
        </select>
      </Label>
    </>
  );
}

function ImageFields({ element, onUpdate }: { element: ImageElement; onUpdate: (u: Partial<ImageElement>) => void }) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) return;

    // Cap at 5MB to keep JSON exports manageable
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onUpdate({ src: dataUrl, alt: element.alt || file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Label text="Image">
        <div className="flex flex-col gap-2">
          {element.src ? (
            <div className="relative rounded-lg overflow-hidden border border-stroke-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={element.src} alt={element.alt} className="w-full h-20 object-cover" />
              <button
                onClick={() => onUpdate({ src: "" })}
                className="absolute top-1 right-1 w-5 h-5 rounded bg-fill-1/80 text-text-2 text-ui-xs flex items-center justify-center hover:text-status-error"
              >
                ×
              </button>
            </div>
          ) : null}
          <label className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-stroke-1 text-text-3 text-ui-xs cursor-pointer hover:border-accent-primary hover:text-accent-primary transition-colors">
            {element.src ? "Replace Image" : "Upload Image"}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </Label>
      <Label text="Alt text"><input type="text" value={element.alt} onChange={(e) => onUpdate({ alt: e.target.value })} className="input-field" /></Label>
      <Label text="Fit">
        <select value={element.fit} onChange={(e) => onUpdate({ fit: e.target.value as "cover" | "contain" | "fill" })} className="input-field">
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </Label>
      <Label text="Background">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={element.isBackground} onChange={(e) => onUpdate({ isBackground: e.target.checked })} className="accent-accent-primary" />
          <span className="text-ui-xs text-text-2">Use as column background</span>
        </div>
      </Label>
    </>
  );
}

function DividerFields({ element, onUpdate }: { element: DividerElement; onUpdate: (u: Partial<DividerElement>) => void }) {
  return (
    <Label text="Color">
      <select value={element.color} onChange={(e) => onUpdate({ color: e.target.value as "brand" | "accent" | "neutral" })} className="input-field">
        <option value="brand">Brand</option>
        <option value="accent">Accent</option>
        <option value="neutral">Neutral</option>
      </select>
    </Label>
  );
}

function SpacerFields({ element, onUpdate }: { element: SpacerElement; onUpdate: (u: Partial<SpacerElement>) => void }) {
  return (
    <Label text="Size">
      <select value={element.size} onChange={(e) => onUpdate({ size: e.target.value as "sm" | "md" | "lg" })} className="input-field">
        <option value="sm">Small</option>
        <option value="md">Medium</option>
        <option value="lg">Large</option>
      </select>
    </Label>
  );
}

function CardFields({ element, onUpdate }: { element: CardElement; onUpdate: (u: Partial<CardElement>) => void }) {
  return (
    <>
      <Label text="Title"><input type="text" value={element.title} onChange={(e) => onUpdate({ title: e.target.value })} className="input-field" /></Label>
      <Label text="Body"><textarea value={element.body} onChange={(e) => onUpdate({ body: e.target.value })} className="input-field min-h-[60px] resize-y" /></Label>
    </>
  );
}

function IconTextFields({ element, onUpdate }: { element: IconTextElement; onUpdate: (u: Partial<IconTextElement>) => void }) {
  return (
    <>
      <Label text="Text"><input type="text" value={element.text} onChange={(e) => onUpdate({ text: e.target.value })} className="input-field" /></Label>
      <Label text="Layout">
        <select value={element.layout} onChange={(e) => onUpdate({ layout: e.target.value as "horizontal" | "vertical" })} className="input-field">
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </Label>
    </>
  );
}

// ─── Shared UI ───

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ui-xs font-medium text-text-2 uppercase tracking-wider">{text}</span>
      {children}
    </label>
  );
}
