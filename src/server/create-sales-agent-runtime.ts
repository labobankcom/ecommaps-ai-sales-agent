import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";

export type CreateSalesAgentRuntimeInput = {
  model: unknown;
  systemPrompt: string;
  messages: UIMessage[];
  tools: Record<string, unknown>;
  maxSteps?: number;
};

export async function createSalesAgentRuntime({
  model,
  systemPrompt,
  messages,
  tools,
  maxSteps = 6,
}: CreateSalesAgentRuntimeInput) {
  const modelMessages = await convertToModelMessages(messages);

  return streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(maxSteps),
    toolChoice: "auto",
    tools,
  });
}
