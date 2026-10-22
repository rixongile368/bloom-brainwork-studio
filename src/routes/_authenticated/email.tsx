import { createFileRoute } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Bloom" }, { name: "description", content: "Generate professional emails in formal, friendly or persuasive tones." }] }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const [tone, setTone] = useState<string>("Formal");
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const ai = useAiTool("email");

  return (
    <div>
      <PageHeader title="Smart Email Generator" description="Describe what you need — get a polished draft you can edit." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <div className="flex gap-2">
              {TONES.map((t) => (
                <Button key={t} type="button" size="sm" variant={tone === t ? "default" : "outline"} onClick={() => setTone(t)}>{t}</Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rec">Recipient</Label>
            <Input id="rec" placeholder="e.g. Sarah, Head of Marketing" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pur">Purpose</Label>
            <Input id="pur" placeholder="e.g. Request a project deadline extension" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pts">Key points</Label>
            <Textarea id="pts" rows={7} placeholder="Bullet points, context, anything to include…" value={points} onChange={(e) => setPoints(e.target.value)} />
          </div>
          <Button className="w-full" disabled={ai.loading} onClick={() => ai.generate(points || purpose, { tone, recipient, purpose })}>
            <Wand2 /> Generate email
          </Button>
        </div>
        <AiOutput value={ai.output} onChange={ai.setOutput} loading={ai.loading} emptyLabel="Your email draft will appear here." />
      </div>
    </div>
  );
}
