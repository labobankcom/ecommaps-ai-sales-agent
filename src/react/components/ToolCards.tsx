"use client";

import type { FC } from "react";

function formatMoney(price: number | null | undefined, currency = "DZD") {
  if (typeof price !== "number") return "السعر عند الطلب";
  return `${price.toLocaleString("ar-DZ")} ${currency === "DZD" ? "د.ج" : currency}`;
}

export type ProductCardData = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string | null;
  price?: number | null;
  currency?: string;
  image?: string | null;
  available?: boolean;
};

export const ProductCard: FC<{ item: ProductCardData }> = ({ item }) => (
  <article className="overflow-hidden rounded-xl border bg-background shadow-sm">
    <div className="h-36 w-full bg-muted/40">
      {item.image ? (
        <img src={item.image} alt={item.name ?? "صورة المنتج"} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">لا توجد صورة</div>
      )}
    </div>
    <div className="space-y-2 p-3">
      <h4 className="line-clamp-2 text-sm font-semibold leading-6">{item.name ?? "منتج"}</h4>
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold text-primary">{formatMoney(item.price ?? null, item.currency ?? "DZD")}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] ${item.available ? "bg-zinc-200 text-zinc-800" : "bg-amber-100 text-amber-700"}`}>
          {item.available ? "متاح" : "غير متوفر"}
        </span>
      </div>
      {item.slug ? (
        <a href={`/product/${item.slug}`} className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          عرض المنتج
        </a>
      ) : null}
    </div>
  </article>
);

export type CollectionCardData = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string | null;
};

export const CollectionCard: FC<{ item: CollectionCardData }> = ({ item }) => (
  <article className="overflow-hidden rounded-xl border bg-background shadow-sm">
    <div className="h-28 w-full bg-muted/40">
      {item.image ? (
        <img src={item.image} alt={item.title ?? "صورة المجموعة"} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">بدون صورة</div>
      )}
    </div>
    <div className="space-y-2 p-3">
      <h4 className="line-clamp-2 text-sm font-semibold leading-6">{item.title ?? "مجموعة"}</h4>
      {item.description ? <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p> : null}
      {item.url ? (
        <a href={item.url} className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          تصفح المجموعة
        </a>
      ) : null}
    </div>
  </article>
);

export type PromotionCardData = {
  id?: string | null;
  code?: string | null;
  message?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_amount?: number | null;
  status?: "applied_now" | "eligible_with_conditions" | "code_required" | "invalid_code";
  status_label?: string | null;
  status_reason?: string | null;
};

export const PromotionCard: FC<{ item: PromotionCardData }> = ({ item }) => {
  const valueText =
    typeof item.discount_amount === "number"
      ? `${item.discount_amount.toLocaleString("ar-DZ")} د.ج`
      : typeof item.discount_value === "number"
        ? item.discount_type === "percentage"
          ? `${item.discount_value}%`
          : `${item.discount_value.toLocaleString("ar-DZ")} د.ج`
        : "عرض متاح";

  const statusClass =
    item.status === "applied_now"
      ? "bg-zinc-200 text-zinc-800"
      : item.status === "code_required"
        ? "bg-sky-100 text-sky-800"
        : item.status === "eligible_with_conditions"
          ? "bg-amber-100 text-amber-800"
          : "bg-rose-100 text-rose-800";

  return (
    <article className="rounded-xl border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">{item.message || item.code || "عرض ترويجي"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{valueText}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass}`}>
          {item.status_label || item.status || "متاح"}
        </span>
      </div>
      {item.status_reason ? <p className="mt-2 text-[11px] text-muted-foreground">{item.status_reason}</p> : null}
    </article>
  );
};
