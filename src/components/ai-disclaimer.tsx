import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-xs leading-relaxed text-muted-foreground", className)}>
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-blush" />
      <span>
        AI-generated content can be inaccurate or incomplete. Review, edit and verify outputs before
        relying on or sharing them, and avoid entering confidential or personal data.
      </span>
    </p>
  );
}
