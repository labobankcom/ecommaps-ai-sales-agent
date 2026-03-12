import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";

type StreamTextInput = Parameters<typeof streamText>[0];

export type CreateSalesAgentRuntimeInput = {
  model: StreamTextInput["model"];
  systemPrompt: string;
  messages: UIMessage[];
  tools: NonNullable<StreamTextInput["tools"]>;
  maxSteps?: number;
};

export type SalesAgentRuntimeResult = {
  toUIMessageStreamResponse: (options?: { sendReasoning?: boolean }) => Response;
};

export async function createSalesAgentRuntime({
  model,
  systemPrompt,
  messages,
  tools,
  maxSteps = 6,
}: CreateSalesAgentRuntimeInput): Promise<SalesAgentRuntimeResult> {
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(maxSteps),
    toolChoice: "auto",
    tools,
  });

  // Provide a safe wrapper to avoid 500 errors due to version drift
  const safeResult = {
    ...result,
    toUIMessageStreamResponse: (options?: { sendReasoning?: boolean }) => {
      if (typeof (result as any).toUIMessageStreamResponse === "function") {
        return (result as any).toUIMessageStreamResponse(options);
      }
      
      // Fallback for older or mismatched 'ai' versions
      if (typeof (result as any).toDataStreamResponse === "function") {
        return (result as any).toDataStreamResponse({
          sendReasoning: options?.sendReasoning,
        });
      }

      throw new Error("Neither toUIMessageStreamResponse nor toDataStreamResponse are available in the current ai sdk version.");
    }
  };

  return safeResult as unknown as SalesAgentRuntimeResult;
}
