type JsonRecord = Record<string, unknown>;

export type BuildSalesSkillProfileInput = {
  store: JsonRecord | null;
  isFirstAssistantTurn: boolean;
};

export type StoreProfileSnapshot = {
  name: unknown;
  description: unknown;
  logo_url: unknown;
  social_links: unknown[];
  primary_color: unknown;
  currency: unknown;
  shipping_providers: string[];
  shipping_note: string | null;
};

function compactText(value: unknown, max = 180): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max - 1).trim()}…`;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function extractShippingProviders(store: JsonRecord | null): string[] {
  if (!store) return [];
  const candidates = [
    store.shipping_providers,
    store.shipping_companies,
    store.shipping_methods,
    store.delivery_providers,
  ];
  return Array.from(new Set(candidates.flatMap((entry) => toStringArray(entry))));
}

function buildStoreIdentitySnippet(snapshot: StoreProfileSnapshot): string {
  const name = compactText(snapshot.name, 60) ?? "المتجر الحالي";
  const description = compactText(snapshot.description, 180);
  const currency = compactText(snapshot.currency, 12) ?? "DZD";
  const socialCount = Array.isArray(snapshot.social_links) ? snapshot.social_links.length : 0;
  const shippingLine =
    snapshot.shipping_providers.length > 0
      ? `- شركات الشحن المتاحة من بيانات المتجر: ${snapshot.shipping_providers.join("، ")}`
      : "- شركات الشحن: غير متوفرة في بيانات المتجر حاليًا.";

  return [
    "هوية المتجر الحالية:",
    `- اسم المتجر: ${name}`,
    description ? `- وصف مختصر: ${description}` : null,
    `- العملة: ${currency}`,
    socialCount > 0 ? `- عدد قنوات التواصل: ${socialCount}` : null,
    shippingLine,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSalesSkillProfile({ store, isFirstAssistantTurn }: BuildSalesSkillProfileInput): {
  systemPromptBlock: string;
  storeProfileSnapshot: StoreProfileSnapshot;
} {
  const shippingProviders = extractShippingProviders(store);
  const storeName = compactText(store?.name, 60);

  const storeProfileSnapshot: StoreProfileSnapshot = {
    name: store?.name ?? null,
    description: store?.description ?? null,
    logo_url: store?.logo_url ?? null,
    social_links: Array.isArray(store?.social_links) ? (store?.social_links as unknown[]) : [],
    primary_color: store?.primary_color ?? null,
    currency: store?.currency ?? "DZD",
    shipping_providers: shippingProviders,
    shipping_note:
      shippingProviders.length > 0
        ? "اعرض فقط الشركات المصرح بها في بيانات المتجر."
        : "لا تذكر أسماء شركات شحن من المعرفة العامة إذا لم تكن متوفرة من بيانات المتجر.",
  };

  const firstReplyRule = isFirstAssistantTurn
    ? storeName
      ? `- في أول رد فقط: عرّف نفسك بصياغة طبيعية متغيرة واذكر أنك مساعد متجر "${storeName}" ثم ابدأ البيع مباشرة.`
      : "- في أول رد فقط: عرّف نفسك بصياغة طبيعية متغيرة كمساعد المتجر ثم ابدأ البيع مباشرة."
    : "- لا تكرر المقدمة التعريفية بعد الرسالة الأولى.";

  const shippingRule =
    shippingProviders.length > 0
      ? "- عند سؤال الشحن: اعرض فقط الشركات المذكورة في بيانات المتجر ولا تضف أي أسماء أخرى."
      : "- عند سؤال الشحن: اذكر أن قائمة الشركات غير متاحة حاليًا من بيانات المتجر، ووجّه العميل للتأكيد في صفحة الدفع/التواصل.";

  const systemPromptBlock = [
    buildStoreIdentitySnippet(storeProfileSnapshot),
    "",
    "ملف مهارة المبيعات (sales_skill_profile):",
    "- أنت وكيل مبيعات تنفيذي، هدفك رفع التحويل بخطوات قصيرة وواضحة.",
    "- ابدأ دائمًا بتحديد نية العميل الشرائية (المنتج، الميزانية، اللون/المقاس، وقت الشراء).",
    "- عند التوصية: اذكر سببًا تجاريًا مختصرًا + نقطة ثقة (توفر/سعر/ميزة) + خطوة تالية واحدة.",
    "- عند أسئلة السياسات/الصفحات: قدّم جوابًا واضحًا بنقاط عملية بدل نسخ النص حرفيًا.",
    "- لا تخمّن حقائق تشغيلية (شحن/دفع/سياسات) من المعرفة العامة.",
    "- الأسئلة خارج نطاق المتجر والتجارة: اعتذر باختصار وأعد التوجيه لمساعدة الشراء داخل المتجر.",
    shippingRule,
    firstReplyRule,
  ].join("\n");

  return { systemPromptBlock, storeProfileSnapshot };
}
