import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const runAiTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      tool: z.enum(["email", "notes", "planner", "research"]),
      input: z.string().trim().min(1, "Please add some input").max(30000),
      options: z.record(z.string().max(500)).default({}),
    }),
  )
  .handler(async ({ data }) => {
    const { buildToolPrompt } = await import("./prompts");
    const { createResponsesCall, friendlyAiError } = await import("./responses.server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { instructions, prompt } = buildToolPrompt(data.tool, data.input, data.options);
    try {
      const { result } = createResponsesCall(getRequest(), [{ role: "user", content: prompt }], instructions);
      const text = await result.text;
      if (!text.trim()) throw new Error("The AI returned an empty response.");
      return { text };
    } catch (error) {
      throw new Error(friendlyAiError(error));
    }
  });
