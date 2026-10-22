import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";

import type { Database, Json } from "@/integrations/supabase/types";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

const bodySchema = z.object({
  threadId: z.string().uuid(),
  messages: z.array(z.any()).min(1).max(200),
});

function userClient(token: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });
        const supabase = userClient(token);
        const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (claimsError || !userId) return new Response("Unauthorized", { status: 401 });

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid request", { status: 400 });
        const { threadId } = parsed.data;
        const messages = parsed.data.messages as UIMessage[];

        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread) return new Response("Conversation not found", { status: 404 });

        const { createResponsesCall, friendlyAiError } = await import("@/lib/ai/responses.server");
        const { withLovableAiGatewayRunIdHeader } = await import("@/lib/ai/run-id");

        const modelMessages = await convertToModelMessages(messages);
        const { result, runIdFetch } = createResponsesCall(request, modelMessages, CHAT_SYSTEM_PROMPT);

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          generateMessageId: () => crypto.randomUUID(),
          onError: (error) => friendlyAiError(error),
          onFinish: async ({ messages: all }) => {
            const base = Date.now();
            const rows = all.map((m, i) => ({
              thread_id: threadId,
              user_id: userId,
              message_id: m.id,
              role: m.role,
              parts: m.parts as unknown as Json,
              created_at: new Date(base - (all.length - i)).toISOString(),
            }));
            const { error } = await supabase
              .from("chat_messages")
              .upsert(rows, { onConflict: "thread_id,message_id", ignoreDuplicates: true });
            if (error) console.error("Failed to save chat messages", error);

            const firstUser = all.find((m) => m.role === "user");
            const firstText =
              firstUser?.parts.find((p): p is { type: "text"; text: string } => p.type === "text")?.text ?? "";
            const update: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
            if (thread.title === "New chat" && firstText) update.title = firstText.slice(0, 60);
            const { error: tErr } = await supabase.from("chat_threads").update(update).eq("id", threadId);
            if (tErr) console.error("Failed to update thread", tErr);
          },
        });
        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
