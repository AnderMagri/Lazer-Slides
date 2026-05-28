"use client";

import { useDeckStore } from "@/store/deck-store";
import type { ColumnCount } from "@/types/deck";

interface Props {
  slideId: string;
}

export function ColumnPicker({ slideId }: Props) {
  const setSlideColumns = useDeckStore((s) => s.setSlideColumns);

  const options: { columns: ColumnCount; label: string }[] = [
    { columns: 1, label: "1 Column" },
    { columns: 2, label: "2 Columns" },
    { columns: 3, label: "3 Columns" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-alt-3 z-10">
      <div className="bg-fill-2 border border-stroke-1 rounded-2xl shadow-elevation-3 p-6 flex flex-col items-center gap-4">
        <h3 className="text-label text-text-1">Choose layout</h3>
        <div className="flex gap-3">
          {options.map((opt) => (
            <button
              key={opt.columns}
              onClick={() => setSlideColumns(slideId, opt.columns)}
              className="flex flex-col items-center gap-2 group"
            >
              {/* Visual preview */}
              <div className="w-24 h-16 rounded-lg border border-stroke-1 bg-fill-1 p-1.5 flex gap-1 group-hover:border-accent-primary transition-colors">
                {Array.from({ length: opt.columns }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-fill-3 group-hover:bg-accent-primary-subtle transition-colors"
                  />
                ))}
              </div>
              <span className="text-ui-xs text-text-2 group-hover:text-accent-primary transition-colors">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
