import { createFileRoute } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Bloom" }, { name: "description", content: "Summarise meeting notes and extract action items, decisions and deadlines." }] }),
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState("");
  const ai = useAiTool("notes");
  return (
    <div>
      <PageHeader title="Meeting Notes Summarizer" description="Paste raw notes — get a summary, decisions, action items and deadlines." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface flex flex-col gap-4 p-5">
          <Textarea className="min-h-[340px] flex-1" placeholder="Paste your meeting notes or transcript here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{notes.trim() ? notes.trim().split(/\s+/).length : 0} words</span>
          </div>
          <Button disabled={ai.loading} onClick={() => ai.generate(notes)}><Wand2 /> Summarise notes</Button>
        </div>
        <AiOutput value={ai.output} onChange={ai.setOutput} loading={ai.loading} emptyLabel="Summary, decisions, action items and deadlines will appear here." />
      </div>
    </div>
  );
}
