"use client";

import { IconAlertCircle, IconChevronDown, IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

export type Turn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
  error?: boolean;
};

export type Thread = {
  id: string;
  title: string;
  preview: string;
  updated: string;
  group: "today" | "yesterday" | "week";
  pinned?: boolean;
  turns: Turn[];
};

const easeOut = "ease-[cubic-bezier(0.23,1,0.32,1)]";
const press = `${easeOut} transition-[scale,background-color] duration-150 active:scale-[0.96] motion-reduce:active:scale-100`;
const enter = `${easeOut} motion-reduce:slide-in-from-bottom-0 fade-in slide-in-from-bottom-1 animate-in duration-200`;

type Props = {
  thread: Thread | null;
  recent: Thread[];
  onOpen: (id: string) => void;
};

export function Conversation({ thread, recent, onOpen }: Props) {
  if (!thread) {
    return (
      <div className="flex grow items-center justify-center px-8">
        <div className={cn(enter, "flex w-full max-w-160 flex-col gap-10")}>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-semibold text-[34px]/10 tracking-[-0.025em]">
              How can I help you today?
            </h1>
            <p className="text-[15px]/5.5 text-muted-foreground">
              Ask a question about your documents and I'll search them to find
              an answer.
            </p>
          </div>
          {recent.length > 0 && (
            <div className="flex flex-col">
              <p className="pb-1 font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-[0.08em]">
                Continue
              </p>
              {recent.map((t) => (
                <button
                  className="-mx-2 flex h-13 items-center gap-3.5 rounded-lg not-last:border-muted not-last:border-b px-2 text-left transition-colors hover:bg-muted/60"
                  key={t.id}
                  onClick={() => onOpen(t.id)}
                  type="button"
                >
                  <span className="flex grow flex-col gap-0.5">
                    <span className="font-medium text-sm/4.5">{t.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {t.preview}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="grow">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-160 gap-4.5 px-4 pt-6 pb-4">
            {thread.turns.map((turn) =>
              turn.role === "user" ? (
                <MessageScrollerItem
                  className="group/turn flex flex-row-reverse items-center gap-2"
                  key={turn.id}
                  messageId={turn.id}
                >
                  <div className="max-w-105 rounded-[20px] bg-muted px-4 py-2.5 text-[15px]/5.5">
                    {turn.text}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within/turn:opacity-100 group-hover/turn:opacity-100">
                    <Button
                      aria-label="Copy"
                      className={cn(press, "size-6.5 rounded-lg text-muted-foreground")}
                      onClick={() => navigator.clipboard.writeText(turn.text)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <IconCopy stroke={1.8} />
                    </Button>
                  </div>
                </MessageScrollerItem>
              ) : (
                <MessageScrollerItem
                  className={cn("flex flex-col gap-2.5", turn.streaming && enter)}
                  key={turn.id}
                  messageId={turn.id}
                >
                  {turn.error ? (
                    <div className="flex items-start gap-3 rounded-xl bg-destructive/5 px-4 py-3.5 ring-1 ring-destructive/15">
                      <IconAlertCircle
                        className="mt-px size-4 shrink-0 text-destructive"
                        stroke={2}
                      />
                      <p className="text-[13px]/5 text-destructive/80">
                        The response failed. Please try again.
                      </p>
                    </div>
                  ) : (
                    <>
                      {turn.streaming && !turn.text && (
                        <div className="flex items-center gap-2 font-medium text-[13px] text-primary animate-pulse">
                          Thinking…
                        </div>
                      )}
                      {turn.text && (
                        <p className="text-[15px]/6 whitespace-pre-wrap">
                          {turn.text}
                        </p>
                      )}
                      {!turn.streaming && (
                        <div className="-ml-1.5 flex items-center gap-0.5">
                          <Button
                            aria-label="Copy"
                            className={cn(press, "size-6.5 rounded-lg text-muted-foreground")}
                            onClick={() => navigator.clipboard.writeText(turn.text)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <IconCopy stroke={1.8} />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </MessageScrollerItem>
              ),
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton
          className={cn(
            easeOut,
            "bottom-2 h-8 gap-1.5 rounded-full border-border bg-background px-3.5 font-medium text-[13px] shadow-xs transition-[translate,scale,opacity,background-color]",
          )}
          size="sm"
          variant="outline"
        >
          <IconChevronDown className="size-3.5" stroke={2} />
          Jump to latest
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
