import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ListPlus, Wand2 } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";
import { tasksQuery } from "@/lib/tasks";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — Bloom" }, { name: "description", content: "Generate prioritised daily or weekly schedules." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tasksQuery),
  component: PlannerPage,
});

function PlannerPage() {
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const [range, setRange] = useState<"daily" | "weekly">("daily");
  const [hours, setHours] = useState("09:00-17:00");
  const [input, setInput] = useState("");
  const ai = useAiTool("planner");

  const importTasks = () => {
    const open = tasks.filter((t) => !t.completed);
    const lines = open.map((t) => `- ${t.title} [${t.category}, ${t.priority} priority${t.due_date ? `, due ${t.due_date}` : ""}]`);
    setInput((prev) => [prev.trim(), ...lines].filter(Boolean).join("\n"));
  };

  return (
    <div>
      <PageHeader title="AI Task Planner" description="Prioritise effectively and get a realistic schedule." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface space-y-4 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>Schedule</Label>
              <div className="flex gap-2">
                {(["daily", "weekly"] as const).map((r) => (
                  <Button key={r} size="sm" className="capitalize" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>{r}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hrs">Working hours</Label>
              <Input id="hrs" value={hours} onChange={(e) => setHours(e.target.value)} className="w-40" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="in">Tasks & constraints</Label>
              <Button size="xs" variant="ghost" onClick={importTasks}><ListPlus /> Import my open tasks</Button>
            </div>
            <Textarea id="in" rows={11} placeholder={"- Finish Q3 report (due Friday)\n- Team sync at 11:00\n- Gym after work"} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <Button className="w-full" disabled={ai.loading} onClick={() => ai.generate(input, { range, hours })}><Wand2 /> Build my schedule</Button>
        </div>
        <AiOutput value={ai.output} onChange={ai.setOutput} loading={ai.loading} emptyLabel="Your prioritised schedule will appear here." />
      </div>
    </div>
  );
}
