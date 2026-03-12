# Changelog

## 0.1.1

- **Fix:** "Maximum update depth exceeded" error by memoizing `react-markdown` plugins and components.
- **Fix:** 500 server error by adding fallback for outdated AI SDK version `toDataStreamResponse`.
- **Improvement:** Expand cart intent guards and fallback behaviors for smarter cart operations.

## 0.1.0

- Initial release.
- Added server exports:
  - `buildSalesSkillProfile`
  - `buildSalesAgentTools`
  - `createSalesAgentRuntime`
- Added React exports:
  - `AIAssistantShell`
  - `ReasoningBlock`
  - `MarkdownMessageRenderer`
  - tool cards for products, collections, promotions
