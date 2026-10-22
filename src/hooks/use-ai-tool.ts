import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import type { AiTool } from "@/lib/ai/prompts";
import { runAiTool } from "@/lib/ai/tools.functions";

export function useAiTool(tool: AiTool) {
  const run = useServerFn(runAiTool);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (input: string, options: Record<string, string> = {}) => {
    if (!input.trim()) {
      toast.error("Please add some input first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { tool, input, options } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { output, setOutput, loading, generate };
}
