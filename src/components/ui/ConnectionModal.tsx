"use client";

import { useEffect } from "react";
import { useDeckStore } from "@/store/deck-store";
import { Sparkle, X, ArrowSquareOut } from "@phosphor-icons/react";

interface Props {
  onClose: () => void;
  onConnected?: () => void;
}

export function ConnectionModal({ onClose, onConnected }: Props) {
  const claudeConnected = useDeckStore((s) => s.claudeConnected);

  // Auto-close when Claude connects
  useEffect(() => {
    if (claudeConnected) {
      onConnected?.();
      onClose();
    }
  }, [claudeConnected, onClose, onConnected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-fill-1/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-fill-2 border border-stroke-1 shadow-elevation-3 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center gap-6">
          {/* Listening animation */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-accent-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
            <span className="absolute inset-2 rounded-full bg-accent-primary/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
            {/* Icon */}
            <span className="relative w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Sparkle size={24} weight="fill" className="text-accent-primary" />
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-h3 text-text-1">Connect with Claude</h2>
            <p className="text-body-sm text-text-2">
              Listening for Claude Code connection…
            </p>
          </div>

          {/* Steps */}
          <div className="w-full flex flex-col gap-3">
            <Step number={1} text="Open Claude Code (terminal)" />
            <Step number={2} text='Say: "Connect to Lazer Slides in my browser"' />
            <Step number={3} text="Claude will connect automatically" />
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-stroke-1" />
            <span className="text-ui-xs text-text-3">Don&apos;t have Claude Code?</span>
            <div className="flex-1 h-px bg-stroke-1" />
          </div>

          {/* Install links */}
          <div className="w-full flex flex-col gap-2">
            <a
              href="https://claude.ai/download"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 border border-stroke-1 text-text-2 text-ui-sm hover:bg-alt-1 hover:text-text-1 transition-colors"
            >
              Get Claude Code
              <ArrowSquareOut size={14} />
            </a>
            <a
              href="https://chromewebstore.google.com/detail/claude-in-chrome/gkpbfkklahnkhhjiilbcdoellimfhfek"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 border border-stroke-1 text-text-2 text-ui-sm hover:bg-alt-1 hover:text-text-1 transition-colors"
            >
              Chrome Extension
              <ArrowSquareOut size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-accent-primary/15 text-accent-primary text-ui-xs font-medium">
        {number}
      </span>
      <span className="text-ui-sm text-text-1 pt-0.5">{text}</span>
    </div>
  );
}
