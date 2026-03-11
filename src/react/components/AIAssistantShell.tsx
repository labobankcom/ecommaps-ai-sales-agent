"use client";

import { useMemo, useState, type FC, type ReactNode } from "react";

export type AIAssistantShellProps = {
  storeName?: string;
  storeLogo?: string | null;
  triggerIcon?: ReactNode;
  onNewChat?: () => void;
  children: ReactNode;
};

function getAgentHeaderContent(storeName?: string): { title: string; subtitle: string } {
  const normalizedStoreName = storeName?.trim();
  if (normalizedStoreName) {
    return {
      title: `وكيل المبيعات الذكي • ${normalizedStoreName}`,
      subtitle: `أتصفح منتجات ${normalizedStoreName} وأساعدك على اختيار الأنسب وإتمام الشراء عبر الشات.`,
    };
  }

  return {
    title: "وكيل المبيعات الذكي",
    subtitle: "أقترح المنتجات الأنسب وأدير رحلة الشراء خطوة بخطوة داخل المتجر.",
  };
}

export const AIAssistantShell: FC<AIAssistantShellProps> = ({
  storeName,
  storeLogo,
  triggerIcon,
  onNewChat,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const content = useMemo(() => getAgentHeaderContent(storeName), [storeName]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="فتح المساعد الذكي"
        className={`fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground shadow-2xl ring-1 ring-border/70 transition-all hover:scale-105 hover:bg-secondary/90 sm:right-6 sm:bottom-6 sm:size-16 ${isOpen ? "pointer-events-none scale-0 opacity-0" : ""}`}
      >
        {storeLogo ? (
          <img src={storeLogo} alt={storeName || "Store"} className="size-7 rounded-full object-cover sm:size-8" loading="lazy" />
        ) : (
          triggerIcon || <span className="text-lg font-black">AI</span>
        )}
      </button>

      {isOpen ? (
        <section
          className="fixed inset-2 z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[92vw] sm:max-w-[560px] md:w-[46vw] md:max-w-[560px] lg:w-[38vw] lg:max-w-[540px] xl:w-[32vw] xl:max-w-[520px] 2xl:w-[28vw] 2xl:max-w-[500px]"
          dir="rtl"
        >
          <header className="shrink-0 border-b bg-primary/95 px-4 py-3 text-primary-foreground sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white/15">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName || "Store"} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-xs font-bold">AI</span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold sm:text-lg">{content.title}</h3>
                  <p className="text-xs text-primary-foreground/90">{content.subtitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-primary-foreground/90 transition-colors hover:bg-white/15"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 flex justify-start">
              <button
                type="button"
                onClick={() => onNewChat?.()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-white/20"
              >
                محادثة جديدة
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1">{children}</div>
        </section>
      ) : null}
    </>
  );
};
