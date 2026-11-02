"use client";

import { IconArrowUp } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const easeOut = "ease-[cubic-bezier(0.23,1,0.32,1)]";
const press = `${easeOut} transition-[scale,background-color] duration-150 active:scale-[0.96] motion-reduce:active:scale-100`;
const swap = `${easeOut} fade-in zoom-in-95 motion-reduce:zoom-in-100 animate-in duration-150`;
const round = "size-7.5 rounded-full";

type Props = {
  draft: string;
  onDraft: (value: string) => void;
  streaming: boolean;
  onSend: () => void;
};

export function Composer({ draft, onDraft, streaming, onSend }: Props) {
  const canSend = draft.trim().length > 0 && !streaming;

  return (
    <form
      className="mx-auto flex w-full max-w-160 flex-col px-4 pt-3 pb-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <div
        className={cn(
          easeOut,
          "flex flex-col gap-2.5 rounded-3xl border border-border bg-background p-3 shadow-[0_1px_2px_oklch(0_0_0/0.04),0_8px_24px_oklch(0_0_0/0.05)] transition-[box-shadow,border-color] duration-150 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/12",
        )}
      >
        <Textarea
          aria-label="Message"
          className="field-sizing-content max-h-48 min-h-0 resize-none rounded-none border-0 bg-transparent px-1.5 py-0.5 text-sm/5 shadow-none focus-visible:ring-0 md:text-sm/5 dark:bg-transparent"
          onChange={(event) => onDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder="Ask anything about your documents…"
          rows={1}
          value={draft}
        />
        <div className="flex items-center gap-1.5">
          <div className="grow" />
          <Button
            aria-label="Send"
            className={cn(
              swap,
              press,
              round,
              !canSend &&
                "bg-muted text-muted-foreground/70 hover:bg-muted disabled:opacity-100",
            )}
            disabled={!canSend}
            size="icon-sm"
            type="submit"
          >
            {streaming ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <IconArrowUp stroke={2.2} />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
