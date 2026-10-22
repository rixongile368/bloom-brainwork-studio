import { createFileRoute } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Bloom" }, { name: "description", content: "Summarise topics or articles and get insights and recommendations." }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const [mode, setMode] = useState<"topic" | "article">("topic");
  const [depth, setDepth] = useState("standard");
  const [input, setInput] = useState("");
  const ai = useAiTool("research");

  return (
    <div>
      <PageHeader title="AI Research Assistant" description="Understand a topic or article quickly, with actionable insights." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface space-y-4 p-5">
          <div className="flex flex-wrap gap-6">
            <div className="space-y-1.5">
              <Label>Input type</Label>
              <div className="flex gap-2">
                <Button size="sm" variant={mode === "topic" ? "default" : "outline"} onClick={() => setMode("topic")}>Topic</Button>
                <Button size="sm" variant={mode === "article" ? "default" : "outline"} onClick={() => setMode("article")}>Article text</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Depth</Label>
              <div className="flex gap-2">
                {["brief", "standard", "in-depth"].map((d) => (
                  <Button key={d} size="sm" className="capitalize" variant={depth === d ? "default" : "outline"} onClick={() => setDepth(d)}>{d}</Button>
                ))}
              </div>
            </div>
          </div>
          <Textarea
            rows={12}
            placeholder={mode === "topic" ? "e.g. Benefits and risks of a 4-day work week" : "Paste the article text here…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button className="w-full" disabled={ai.loading} onClick={() => ai.generate(input, { mode, depth })}><Wand2 /> Research</Button>
        </div>
        <AiOutput value={ai.output} onChange={ai.setOutput} loading={ai.loading} emptyLabel="Overview, insights and recommendations will appear here." />
      </div>
    </div>
  );
}
