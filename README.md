# @ecommaps/ai-sales-agent

Composable sales agent kit for Ecommaps storefronts.

![npm version](https://img.shields.io/npm/v/@ecommaps/ai-sales-agent)

## 1. Positioning

This package provides:
- server-side sales agent runtime and tool factories
- React UI primitives for chat rendering
- markdown-safe response rendering and reasoning display

It is designed for buyer-facing assistants, not merchant admin agents.

## 2. Installation

```bash
pnpm add @ecommaps/ai-sales-agent
```

## 3. Exports

### `@ecommaps/ai-sales-agent/server`

- `buildSalesSkillProfile`
- `buildSalesAgentTools`
- `createSalesAgentRuntime`

### `@ecommaps/ai-sales-agent/react`

- `AIAssistantShell`
- `ReasoningBlock`
- `MarkdownMessageRenderer`
- `ProductCard`
- `CollectionCard`
- `PromotionCard`

### `@ecommaps/ai-sales-agent/next`

Re-exports server + react entry points for Next.js integration convenience.

## 4. Minimal server integration

```ts
import { openai } from "@ai-sdk/openai";
import {
  buildSalesAgentTools,
  buildSalesSkillProfile,
  createSalesAgentRuntime,
} from "@ecommaps/ai-sales-agent/server";

const tools = buildSalesAgentTools({
  client: ecommapsClient,
  getOrCreateCartId,
});

const { systemPromptBlock } = buildSalesSkillProfile({
  store,
  isFirstAssistantTurn: true,
});

const result = await createSalesAgentRuntime({
  model: openai("gpt-4o-mini"),
  systemPrompt: systemPromptBlock,
  messages,
  tools,
});
```

## 5. Operational expectations

- Requires AI SDK v6 compatible flow.
- Requires `@ecommaps/client` and `@ecommaps/storefront-kit`.
- OpenAI key and Ecommaps API key remain separate by design.

## 6. Scope guard

The package is optimized for:
- product search and recommendation
- cart operations
- promotion explanation
- legal/store pages summary

Out-of-scope questions should be redirected back to shopping context.
