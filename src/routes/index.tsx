import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, CalendarClock, CheckSquare, Mail, MessagesSquare, NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bloom — Calm tasks & AI workplace assistant" },
      { name: "description", content: "Organise tasks by category and let AI write emails, summarise meetings, plan your week and research topics." },
      { property: "og:title", content: "Bloom — Calm tasks & AI workplace assistant" },
      { property: "og:description", content: "Organise tasks by category and let AI write emails, summarise meetings, plan your week and research topics." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: CheckSquare, title: "Tasks & categories", text: "Add, complete and organise everything in one calm list." },
  { icon: Mail, title: "Smart emails", text: "Formal, friendly or persuasive drafts in seconds." },
  { icon: NotebookPen, title: "Meeting summaries", text: "Decisions, action items and deadlines, extracted." },
  { icon: CalendarClock, title: "AI planner", text: "Prioritised daily or weekly schedules." },
  { icon: BookOpenText, title: "Research assistant", text: "Summaries, insights and recommendations." },
  { icon: MessagesSquare, title: "Workplace chat", text: "Ask anything, in saved conversations." },
];

function Index() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" width={36} height={36} className="size-9" />
          <span className="font-display text-2xl font-semibold">Bloom</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link to={signedIn ? "/dashboard" : "/auth"}>{signedIn ? "Open dashboard" : "Sign in"}</Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-16 text-center md:pt-24">
        <p className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Your gentle productivity space
        </p>
        <h1 className="text-5xl leading-tight md:text-7xl">
          Do the work that matters, <em className="text-blush">calmly.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Tasks, emails, meeting notes, schedules and research — with an AI assistant that keeps you in control.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to={signedIn ? "/dashboard" : "/auth"}>Get started — it's free</Link>
        </Button>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="surface p-6">
            <f.icon className="mb-3 size-6 text-blush" />
            <h3 className="text-xl">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
