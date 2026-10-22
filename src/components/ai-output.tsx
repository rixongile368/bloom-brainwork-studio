import { Check, Copy, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AiOutput({
  value,
  onChange,
  loading,
  emptyLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  emptyLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="surface flex min-h-[420px] flex-col p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg">Result</h3>
        {value && !loading && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>
              {editing ? <Eye /> : <Pencil />}
              {editing ? "Preview" : "Edit"}
            </Button>
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              Copy
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1">
        {loading ? (
          <Shimmer className="text-sm">Thinking it through…</Shimmer>
        ) : !value ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : editing ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[340px] font-mono text-sm"
          />
        ) : (
          <MessageResponse className="text-sm">{value}</MessageResponse>
        )}
      </div>
      <AiDisclaimer className="mt-4 border-t pt-3" />
    </div>
  );
}
