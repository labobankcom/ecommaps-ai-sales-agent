import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { EcommapsClient, EcommapsProduct } from "@ecommaps/client";
import { classifyPromotionStatus, normalizeProductCard, resolveVariantSelection } from "@ecommaps/storefront-kit";

type BuildSalesAgentToolsInput = {
  client: EcommapsClient;
  getOrCreateCartId: () => Promise<string>;
};

function isUuid(value?: string | null): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function buildSalesAgentTools({ client, getOrCreateCartId }: BuildSalesAgentToolsInput) {
  return {
    getStoreProfile: tool({
      description: "الحصول على هوية المتجر ومعلوماته الأساسية.",
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        const store = await client.store.retrieve();
        return {
          name: store.name,
          description: store.description,
          logo_url: store.logo_url,
          currency: store.currency ?? "DZD",
          social_links: Array.isArray(store.social_links) ? store.social_links : [],
        };
      },
    }),

    searchProductsSmart: tool({
      description: "بحث ذكي عن المنتجات.",
      inputSchema: zodSchema(
        z.object({
          query: z.string().min(1),
          color: z.string().optional(),
          size: z.string().optional(),
          limit: z.number().int().min(1).max(12).default(6),
        }),
      ),
      execute: async ({ query, color, size, limit }) => {
        const response = await client.products.search(query, { limit: Math.max(limit * 2, 8) });
        let data = response.data as EcommapsProduct[];

        if (color || size) {
          data = data.filter((product) => {
            const variants = Array.isArray(product.variants) ? product.variants : [];
            return variants.some((variant) => {
              const result = resolveVariantSelection(product, {
                color,
                size,
                variant_id: typeof variant.id === "string" ? variant.id : undefined,
              });
              return Boolean(result.variant_id);
            });
          });
        }

        return {
          success: true,
          total: data.length,
          products: data.slice(0, limit).map((product) => normalizeProductCard(product)),
        };
      },
    }),

    addToCart: tool({
      description: "إضافة منتج إلى السلة مع اختيار متغير دقيق.",
      inputSchema: zodSchema(
        z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1).max(20).default(1),
          variant_id: z.string().optional(),
          color: z.string().optional(),
          size: z.string().optional(),
        }),
      ),
      execute: async ({ product_id, quantity, variant_id, color, size }) => {
        let product: EcommapsProduct | null = null;
        let providedVariantId = variant_id;

        if (isUuid(product_id)) {
          const list = await client.products.list({ limit: 150 });
          product = list.data.find((item) => item.id === product_id) ?? null;
        } else {
          try {
            product = await client.products.retrieve(product_id);
          } catch {
            product = null;
          }
        }

        if (!product && isUuid(providedVariantId)) {
          const list = await client.products.list({ limit: 150 });
          const byVariant = list.data.find((item) =>
            Array.isArray(item.variants) && item.variants.some((variant) => variant.id === providedVariantId),
          );
          if (byVariant) product = byVariant;
        }

        if (!product) {
          return { success: false, error: "المنتج غير موجود", cart_id: null, cart: null };
        }

        const selection = resolveVariantSelection(product, {
          variant_id: providedVariantId,
          color,
          size,
        });

        if (selection.requires_selection) {
          return {
            success: false,
            requires_variant_selection: true,
            ...selection,
            cart_id: null,
            cart: null,
          };
        }

        const cartId = await getOrCreateCartId();
        await client.cart.addItem(cartId, {
          product_id: product.id,
          variant_id: selection.variant_id ?? undefined,
          quantity,
        });
        const cart = await client.cart.retrieve(cartId);

        return {
          success: true,
          message: "تمت إضافة المنتج إلى السلة",
          cart_id: cart.id,
          cart,
          resolved_variant_id: selection.variant_id ?? null,
          requires_variant_selection: false,
          selection_source: selection.selection_source,
        };
      },
    }),

    getAvailableDiscounts: tool({
      description: "جلب عروض وتخفيضات المتجر مع تصنيف الحالة.",
      inputSchema: zodSchema(
        z.object({
          cart_total: z.number().min(0).default(0),
          coupon_code: z.string().optional(),
        }),
      ),
      execute: async ({ cart_total, coupon_code }) => {
        const automaticResult = await client.store.coupons.validate({
          code: "",
          cart_total,
          items: [],
        });

        const explicit = coupon_code
          ? await client.store.coupons.validate({
              code: coupon_code,
              cart_total,
              items: [],
            }).catch(() => ({ valid: false, applied_discounts: [], message: "invalid" }))
          : null;

        const promotions = (automaticResult.applied_discounts ?? []).map((promotion) => {
          const classification = classifyPromotionStatus(
            {
              code: promotion.code ?? null,
              min_order_amount: promotion.min_order_amount ?? null,
              starts_at: promotion.starts_at ?? null,
              expires_at: promotion.expires_at ?? null,
              promotion_type: promotion.promotion_type ?? null,
            },
            {
              cartTotal: cart_total,
              enteredCode: coupon_code,
              explicitValidationPassed: explicit?.valid ?? null,
            },
          );

          return {
            ...promotion,
            status: classification.status,
            status_reason: classification.reason,
          };
        });

        return {
          success: true,
          checked_coupon: coupon_code ?? null,
          checked_coupon_valid: explicit?.valid ?? null,
          checked_coupon_message: explicit?.message ?? null,
          promotions,
        };
      },
    }),

    getStorePagesSmart: tool({
      description: "جلب صفحات المتجر وإرجاع بطاقات موجزة للسياسات والمعلومات.",
      inputSchema: zodSchema(
        z.object({
          query: z.string().min(1),
          limit: z.number().int().min(1).max(12).default(6),
        }),
      ),
      execute: async ({ query, limit }) => {
        const pages = await client.store.pages.list();
        const normalizedQuery = query.toLowerCase().trim();

        const scored = pages
          .map((page) => {
            const haystack = `${page.title ?? ""} ${page.slug ?? ""} ${page.description ?? ""} ${page.body ?? ""}`.toLowerCase();
            const score = normalizedQuery
              .split(/\s+/)
              .filter(Boolean)
              .reduce((acc, token) => (haystack.includes(token) ? acc + 1 : acc), 0);
            return { page, score };
          })
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        const items = scored.map((entry) => ({
          id: entry.page.id,
          title: entry.page.title,
          slug: entry.page.slug,
          description: entry.page.description ?? null,
          snippet: (entry.page.body ?? "").slice(0, 260),
          image: entry.page.featured_image ?? entry.page.image_url ?? null,
          url: `/pages/${entry.page.slug}`,
        }));

        return {
          success: true,
          query,
          total_pages: pages.length,
          matched_pages: items.length,
          pages: items,
        };
      },
    }),
  };
}
