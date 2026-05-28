"use client";

import type { SlideElement } from "@/types/deck";

const FIT_CLASSES = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
} as const;

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
          <h2 className={`text-${element.style} text-text-1`}>
            {element.text}
          </h2>
        </div>
      );

    case "body-text":
      return (
        <div className="py-2">
          <p className={`text-${element.style} text-text-1`}>{element.text}</p>
        </div>
      );

    case "quote":
      return (
        <div className="py-4 pl-6 border-l-2 border-accent-primary">
          <p className="text-quote text-text-1 italic">{element.text}</p>
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
          <span className="text-stat-hero text-accent-primary">
            {element.value}
          </span>
          <span className="text-body text-text-2">{element.label}</span>
        </div>
      );

    case "image":
      return (
        <div
          className={`${
            element.isBackground
              ? "absolute inset-0"
              : "py-2 w-full"
          } rounded-lg overflow-hidden bg-fill-3`}
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
          <div className="bg-fill-2 border border-stroke-1 rounded-xl p-6 shadow-elevation-1">
            <h3 className="text-h3 text-text-1 mb-2">{element.title}</h3>
            <p className="text-body-sm text-text-2">{element.body}</p>
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
                  className="w-full rounded-t-md bg-accent-primary transition-all"
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
            <div className="text-label text-text-1">{element.name}</div>
            <div className="text-ui-sm text-text-2">{element.role}</div>
          </div>
        </div>
      );

    case "icon-text":
      return (
        <div
          className={`py-2 flex ${
            element.layout === "vertical"
              ? "flex-col items-center gap-2 text-center"
              : "items-center gap-3"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-accent-primary-subtle flex items-center justify-center text-accent-primary text-ui-lg">
            ★
          </div>
          <span className="text-body-sm text-text-1">{element.text}</span>
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
