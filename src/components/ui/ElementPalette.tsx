"use client";

import { useState } from "react";
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
  ListBullets,
  ListNumbers,
  Rows,
} from "@phosphor-icons/react";
import type { SlideElement, ElementCategory } from "@/types/deck";
import { ELEMENT_CATEGORIES } from "@/types/deck";

const ELEMENT_ICONS: Record<SlideElement["type"], React.ReactNode> = {
  heading: <TextH size={22} />,
  "body-text": <TextAlignLeft size={22} />,
  quote: <Quotes size={22} />,
  stat: <Hash size={22} />,
  "bullet-list": <ListBullets size={22} />,
  "numbered-list": <ListNumbers size={22} />,
  image: <Image size={22} />,
  card: <Cards size={22} />,
  chart: <ChartBar size={22} />,
  "person-card": <UserCircle size={22} />,
  "icon-text": <Star size={22} />,
  row: <Rows size={22} />,
  divider: <Minus size={22} />,
  spacer: <ArrowsOutLineVertical size={22} />,
};

const ELEMENT_LABELS: Record<SlideElement["type"], string> = {
  heading: "Heading",
  "body-text": "Body",
  quote: "Quote",
  stat: "Stat",
  "bullet-list": "Bullets",
  "numbered-list": "Numbers",
  image: "Image",
  card: "Card",
  chart: "Chart",
  "person-card": "Person",
  "icon-text": "Icon+Text",
  row: "Row",
  divider: "Divider",
  spacer: "Spacer",
};

const TAB_ORDER: ElementCategory[] = ["text", "media", "layout"];

export function ElementPalette() {
  const showElementPalette = useDeckStore((s) => s.showElementPalette);
  const targetColumnId = useDeckStore((s) => s.targetColumnId);
  const addElement = useDeckStore((s) => s.addElement);
  const closeElementPalette = useDeckStore((s) => s.closeElementPalette);
  const [activeTab, setActiveTab] = useState<ElementCategory>("text");

  if (!targetColumnId) return null;

  const currentTypes = ELEMENT_CATEGORIES[activeTab].types;

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

          {/* Full-width bottom bar */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 bg-fill-2 border-t border-stroke-1 shadow-elevation-3 z-50"
          >
            {/* Header row — title + close */}
            <div className="flex items-center justify-between px-8 pt-6 pb-3">
              <h3 className="text-h3 text-text-1">Elements</h3>
              <button
                onClick={closeElementPalette}
                className="w-8 h-8 flex items-center justify-center text-text-2 hover:text-text-1 hover:bg-alt-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category tabs — stacked below title */}
            <div className="flex items-center gap-1 px-8 pb-4">
              {TAB_ORDER.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-1.5 text-ui-xs font-medium transition-colors ${
                    activeTab === cat
                      ? "bg-accent-primary text-text-on-brand"
                      : "bg-fill-1 border border-stroke-1 text-text-2 hover:text-text-1 hover:bg-alt-1"
                  }`}
                >
                  {ELEMENT_CATEGORIES[cat].label}
                </button>
              ))}
            </div>

            {/* Element grid */}
            <div className="flex gap-3 px-8 pb-8 flex-wrap">
              {currentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => addElement(targetColumnId, type)}
                  className="flex flex-col items-center gap-1.5 w-20 py-3 bg-fill-1 border border-stroke-1 shadow-elevation-1 text-text-2 hover:text-accent-primary hover:border-accent-primary transition-all"
                >
                  {ELEMENT_ICONS[type]}
                  <span className="text-ui-xs">{ELEMENT_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
