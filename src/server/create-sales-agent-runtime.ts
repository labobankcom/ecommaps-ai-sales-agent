import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";

type StreamTextInput = Parameters<typeof streamText>[0];

export type CreateSalesAgentRuntimeInput = {
  model: StreamTextInput["model"];
  systemPrompt: string;
  messages: UIMessage[];
  tools: NonNullable<StreamTextInput["tools"]>;
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
