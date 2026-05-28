"use client";

import { useDeckStore } from "@/store/deck-store";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import {
  TextH,
  TextAlignLeft,
  Quotes,
  ChartBar,
  Image,
  Minus,
  ArrowsOutLineVertical,
  Cards,
  UserCircle,
  Star,
  Hash,
} from "@phosphor-icons/react";
import type { SlideElement } from "@/types/deck";

const ELEMENT_OPTIONS: {
  type: SlideElement["type"];
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "heading", label: "Heading", icon: <TextH size={24} /> },
  { type: "body-text", label: "Body", icon: <TextAlignLeft size={24} /> },
  { type: "quote", label: "Quote", icon: <Quotes size={24} /> },
  { type: "stat", label: "Stat", icon: <Hash size={24} /> },
  { type: "image", label: "Image", icon: <Image size={24} /> },
  { type: "divider", label: "Divider", icon: <Minus size={24} /> },
  {
    type: "spacer",
    label: "Spacer",
    icon: <ArrowsOutLineVertical size={24} />,
  },
  { type: "card", label: "Card", icon: <Cards size={24} /> },
  { type: "chart", label: "Chart", icon: <ChartBar size={24} /> },
  { type: "person-card", label: "Person", icon: <UserCircle size={24} /> },
  { type: "icon-text", label: "Icon+Text", icon: <Star size={24} /> },
];

export function ElementPalette() {
  const showElementPalette = useDeckStore((s) => s.showElementPalette);
  const targetColumnId = useDeckStore((s) => s.targetColumnId);
  const addElement = useDeckStore((s) => s.addElement);
  const closeElementPalette = useDeckStore((s) => s.closeElementPalette);

  if (!targetColumnId) return null;

  return (
    <AnimatePresence>
      {showElementPalette && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeElementPalette}
            className="fixed inset-0 bg-alt-3 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-fill-2 border border-stroke-1 rounded-t-2xl shadow-elevation-3 z-50"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-fill-5" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-h3 text-text-1">Elements</h3>
              <button
                onClick={closeElementPalette}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-2 hover:text-text-1 hover:bg-alt-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-2 px-5 pb-6">
              {ELEMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => addElement(targetColumnId, opt.type)}
                  className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-fill-1 border border-stroke-1 shadow-elevation-1 text-text-2 hover:text-accent-primary hover:border-accent-primary transition-all"
                >
                  {opt.icon}
                  <span className="text-ui-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
