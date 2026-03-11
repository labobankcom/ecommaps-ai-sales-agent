"use client";

import type { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const MARKDOWN_LINK_RE = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gim;
const RAW_URL_RE = /https?:\/\/[^\s)]+/gim;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*]\(([^)\s]+)\)/gim;
const PARTIAL_IMAGE_RE = /!\[[^\]]*]\([^)]*$/gim;
const PARTIAL_LINK_RE = /\[[^\]]*]\([^)]*$/gim;

function cleanupAssistantMarkdown(raw: string): string {
  return raw.replace(MARKDOWN_LINK_RE, "$1").replace(/\n{3,}/g, "\n\n").trim();
}

function cleanupStreamingText(raw: string): string {
  return cleanupAssistantMarkdown(raw)
    .replace(MARKDOWN_IMAGE_RE, "")
    .replace(PARTIAL_IMAGE_RE, "")
    .replace(PARTIAL_LINK_RE, "")
    .replace(RAW_URL_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const MarkdownMessageRenderer: FC<{ text: string; isStreaming?: boolean }> = ({ text, isStreaming = false }) => {
  const finalText = isStreaming ? cleanupStreamingText(text) || "..." : cleanupAssistantMarkdown(text);
  if (!finalText) return null;

  return (
    <div className="space-y-2 text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap break-words text-sm leading-7">{children}</p>,
          strong: ({ children }) => <strong className="font-extrabold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children }) => <span className="font-semibold text-primary">{children}</span>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pr-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pr-5">{children}</ol>,
          li: ({ children }) => <li className="break-words">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="rounded-lg border-r-4 border-primary/40 bg-muted/50 px-3 py-2 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) =>
            !className ? (
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">{children}</code>
            ) : (
              <code className="block overflow-x-auto rounded-xl border bg-background p-3 font-mono text-xs leading-6">{children}</code>
            ),
          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-xl border bg-background">
              <table className="w-full min-w-[460px] border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/70">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-right font-bold">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
          img: ({ src, alt }) => (
            <img
              src={src ?? ""}
              alt={alt ?? "صورة"}
              className="my-2 h-44 w-full rounded-xl border bg-background object-cover"
              loading="lazy"
            />
          ),
        }}
      >
        {finalText}
      </ReactMarkdown>
    </div>
  );
};
