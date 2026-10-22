import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const DEFAULT_MODEL = "openai/gpt-6-astra";

export function getApiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");
  return key;
}

export function createResponsesCall(
  request: Request | undefined,
  messages: ModelMessage[],
  instructions?: string,
) {
  const apiKey = getApiKey();
  const runIdFetch = createLovableAiGatewayRunIdFetch(request ? getLovableAiGatewayRunId(request) : undefined);
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(DEFAULT_MODEL),
    ...(instructions ? { instructions } : {}),
    messages,
    ...(request ? { abortSignal: request.signal } : {}),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return { result, runIdFetch };
}

export function friendlyAiError(error: unknown): string {
  const e = error as { statusCode?: number; message?: string };
  const status = e?.statusCode;
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits to keep using AI features.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  if (status === 401) return "AI is not configured correctly.";
  return e?.message ? `AI request failed: ${e.message}` : "AI request failed. Please try again.";
}
