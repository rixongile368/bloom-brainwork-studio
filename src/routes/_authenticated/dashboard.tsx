import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpenText, CalendarClock, Mail, MessagesSquare, NotebookPen } from "lucide-react";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, tasksQuery } from "@/lib/tasks";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Bloom" }, { name: "description", content: "Your tasks and AI tools at a glance." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tasksQuery),
  component: Dashboard,
});

const tools = [
  { to: "/email", icon: Mail, title: "Write an email", text: "Formal, friendly or persuasive" },
  { to: "/notes", icon: NotebookPen, title: "Summarise a meeting", text: "Actions, decisions, deadlines" },
  { to: "/planner", icon: CalendarClock, title: "Plan my day", text: "Prioritised schedule" },
  { to: "/research", icon: BookOpenText, title: "Research a topic", text: "Insights & recommendations" },
  { to: "/chat", icon: MessagesSquare, title: "Ask the assistant", text: "Chat about anything work" },
] as const;

function Dashboard() {
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const done = tasks.filter((t) => t.completed).length;
  const open = tasks.filter((t) => !t.completed);
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageHeader title={greet} description="Here's how your day is shaping up." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">Open tasks</p>
          <p className="font-display text-4xl">{open.length}</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="font-display text-4xl">{done}</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="font-display text-4xl">{pct}%</p>
          <Progress value={pct} className="mt-2" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl">Up next</h2>
            <Link to="/tasks" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing open — enjoy the calm, or add a task.</p>
          ) : (
            <ul className="divide-y">
              {open.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{t.title}</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{t.category}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {c}: {open.filter((t) => t.category === c).length}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="surface group flex items-center gap-3 p-4 transition-colors hover:bg-accent">
              <t.icon className="size-5 text-blush" />
              <div className="flex-1">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.text}</p>
              </div>
              <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
      <AiDisclaimer className="mt-8" />
    </div>
  );
}
