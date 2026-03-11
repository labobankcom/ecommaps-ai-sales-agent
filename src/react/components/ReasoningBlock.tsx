"use client";

import { useEffect, useState, type FC } from "react";

export type ReasoningBlockProps = {
  text?: string;
  isStreaming?: boolean;
  duration?: number;
  className?: string;
};

export const ReasoningBlock: FC<ReasoningBlockProps> = ({
  text = "",
  isStreaming = false,
  duration,
  className,
}) => {
  const [open, setOpen] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) setOpen(true);
    if (!isStreaming) {
      const timer = setTimeout(() => setOpen(false), 1000);
      return () => clearTimeout(timer);
    }
    return;
  }, [isStreaming]);

  const title = isStreaming
    ? "يفكر..."
    : typeof duration === "number" && duration > 0
      ? `فكّر لمدة ${duration} ثانية`
      : "فكّر لثوانٍ قليلة";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{title}</span>
      </button>
      {open && text ? (
        <div className="mt-2 rounded-lg border bg-background p-3 text-xs leading-6 text-muted-foreground">
          {text}
        </div>
      ) : null}
    </div>
  );
};
