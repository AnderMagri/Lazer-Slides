"use client";

import type { SlideElement } from "@/types/deck";
import {
  Star, Lightning, Heart, Eye, Shield, Gear,
  Rocket, Target, Trophy, Flag, Bell, Chat,
  Clock, Fire, Globe, Lock, MagnifyingGlass, User,
} from "@phosphor-icons/react";

const FIT_CLASSES = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
} as const;

// Phosphor icon map — extendable
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; weight?: "fill" | "regular" }>> = {
  Star, Lightning, Heart, Eye, Shield, Gear,
  Rocket, Target, Trophy, Flag, Bell, Chat,
  Clock, Fire, Globe, Lock, MagnifyingGlass, User,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface Props {
  element: SlideElement;
}

export function ElementRenderer({ element }: Props) {
  switch (element.type) {
    case "heading":
      return (
        <div className="py-2">
          {element.showBadge && (
            <span className="inline-block text-label-sm text-accent-primary uppercase tracking-widest mb-2">
              {element.badgeText}
            </span>
          )}
          <h2 className={`text-${element.style} text-text-1 break-words [overflow-wrap:anywhere]`}>
            {element.text}
          </h2>
        </div>
      );

    case "body-text":
      return (
        <div className="py-2">
          <p className={`text-${element.style} text-text-1 break-words [overflow-wrap:anywhere]`}>
            {element.text}
          </p>
        </div>
      );

    case "quote":
      return (
        <div className="py-4 pl-6 border-l-2 border-accent-primary">
          <p className="text-quote text-text-1 italic break-words [overflow-wrap:anywhere]">
            {element.text}
          </p>
          <span className="text-body-sm text-text-2 mt-2 block">
            {element.attribution}
          </span>
        </div>
      );

    case "stat":
      return (
        <div
          className={`py-4 ${
            element.layout === "inline"
              ? "flex items-baseline gap-4"
              : "flex flex-col"
          }`}
        >
          <span className="text-stat-hero text-accent-primary break-words">
            {element.value}
          </span>
          <span className="text-body text-text-2 break-words">{element.label}</span>
        </div>
      );

    case "image":
      return (
        <div
          className={`${
            element.isBackground
              ? "absolute inset-0"
              : "py-2 w-full"
          } overflow-hidden bg-fill-3`}
        >
          {element.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={element.src}
              alt={element.alt}
              className={`w-full h-full ${FIT_CLASSES[element.fit]}`}
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-text-3 text-ui-sm">
              Click to add image
            </div>
          )}
        </div>
      );

    case "divider":
      return (
        <div className="py-3">
          <div
            className={`h-px w-full ${
              element.color === "brand"
                ? "bg-accent-primary"
                : element.color === "accent"
                ? "bg-accent-secondary"
                : "bg-stroke-1"
            }`}
          />
        </div>
      );

    case "spacer":
      return (
        <div
          className={`${
            element.size === "sm"
              ? "h-4"
              : element.size === "md"
              ? "h-8"
              : "h-16"
          }`}
        />
      );

    case "card":
      return (
        <div className="py-2">
          <div className="bg-fill-2 border border-stroke-1 p-0 shadow-elevation-1 overflow-hidden">
            {element.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={element.image} alt="" className="w-full h-28 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-h3 text-text-1 mb-2 break-words">{element.title}</h3>
              <p className="text-body-sm text-text-2 break-words">{element.body}</p>
            </div>
          </div>
        </div>
      );

    case "chart":
      return (
        <div className="py-4">
          <div className="flex items-end gap-3 h-32">
            {element.data.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full bg-accent-primary transition-all"
                  style={{ height: `${(d.value / 100) * 100}%` }}
                />
                <span className="text-ui-xs text-text-3">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "person-card":
      return (
        <div className="py-2 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-fill-3 shrink-0 overflow-hidden">
            {element.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={element.avatar}
                alt={element.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-3 text-ui-lg font-bold">
                {element.name?.[0] ?? "?"}
              </div>
            )}
          </div>
          <div>
            <div className="text-label text-text-1 break-words">{element.name}</div>
            <div className="text-ui-sm text-text-2 break-words">{element.role}</div>
          </div>
        </div>
      );

    case "icon-text": {
      const IconComp = ICON_MAP[element.icon] ?? Star;
      return (
        <div
          className={`py-2 flex ${
            element.layout === "vertical"
              ? "flex-col items-center gap-2 text-center"
              : "items-center gap-3"
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center text-accent-primary shrink-0">
            <IconComp size={24} weight="fill" />
          </div>
          <span className="text-body-sm text-text-1 break-words">{element.text}</span>
        </div>
      );
    }

    case "bullet-list":
      return (
        <div className="py-2">
          <ul className="flex flex-col gap-1.5 pl-5">
            {element.items.map((item, i) => (
              <li key={i} className="text-body text-text-1 break-words list-disc">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "numbered-list":
      return (
        <div className="py-2">
          <ol start={element.startNumber} className="flex flex-col gap-1.5 pl-5">
            {element.items.map((item, i) => (
              <li key={i} className="text-body text-text-1 break-words list-decimal">
                {item}
              </li>
            ))}
          </ol>
        </div>
      );

    default:
      return (
        <div className="py-2 text-text-3 text-ui-sm">
          Unknown element type
        </div>
      );
  }
}
