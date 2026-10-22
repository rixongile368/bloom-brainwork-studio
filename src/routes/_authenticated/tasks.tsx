import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, PRIORITIES, tasksQuery, type Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Bloom" }, { name: "description", content: "Add, complete and organise tasks by category." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tasksQuery),
  component: TasksPage,
});

const priorityStyle: Record<string, string> = {
  high: "bg-blush text-blush-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-secondary text-secondary-foreground",
};

function TasksPage() {
  const qc = useQueryClient();
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Work");
  const [priority, setPriority] = useState<string>("medium");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [showDone, setShowDone] = useState(true);

  const onError = (e: Error) => toast.error(e.message);
  const refresh = () => qc.invalidateQueries({ queryKey: tasksQuery.queryKey });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({ title: title.trim(), category, priority, due_date: due || null });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setDue("");
      refresh();
    },
    onError,
  });

  const toggle = useMutation({
    mutationFn: async (t: Task) => {
      const { error } = await supabase.from("tasks").update({ completed: !t.completed }).eq("id", t.id);
      if (error) throw error;
    },
    onMutate: async (t) => {
      qc.setQueryData(tasksQuery.queryKey, (old) => old?.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    },
    onSettled: refresh,
    onError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) add.mutate();
  };

  const visible = tasks.filter((t) => (filter === "All" || t.category === filter) && (showDone || !t.completed));

  return (
    <div>
      <PageHeader title="Tasks" description="Keep everything gently organised." />
      <form onSubmit={submit} className="surface mb-6 grid gap-3 p-4 md:grid-cols-[1fr_140px_120px_160px_auto]">
        <Input placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
        <Button type="submit" disabled={add.isPending || !title.trim()}><Plus /> Add</Button>
      </form>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c)}>
            {c}
            <span className="opacity-60">{c === "All" ? tasks.length : tasks.filter((t) => t.category === c).length}</span>
          </Button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={showDone} onCheckedChange={(v) => setShowDone(!!v)} /> Show completed
        </label>
      </div>

      <div className="surface divide-y">
        {visible.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No tasks here yet.</p>}
        {visible.map((t) => (
          <div key={t.id} className="group flex items-center gap-3 px-4 py-3">
            <Checkbox checked={t.completed} onCheckedChange={() => toggle.mutate(t)} aria-label={`Mark ${t.title} complete`} />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate", t.completed && "text-muted-foreground line-through")}>{t.title}</p>
              <p className="text-xs text-muted-foreground">
                {t.category}{t.due_date ? ` · due ${new Date(t.due_date + "T00:00").toLocaleDateString()}` : ""}
              </p>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-xs capitalize", priorityStyle[t.priority])}>{t.priority}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(t.id)} aria-label="Delete task" className="opacity-60 group-hover:opacity-100">
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
