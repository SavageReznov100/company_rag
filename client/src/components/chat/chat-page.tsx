"use client";

import { useMemo, useState } from "react";
import { IconLayoutSidebar } from "@tabler/icons-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { ChatMessage } from "@/api/connect.types";
import { useChat } from "@/api/connect.hooks";
import { useAuth } from "@/components/auth/auth-context";
import { ChatSidebar } from "./chat-sidebar";
import { Composer } from "./composer";
import { Conversation, type Thread, type Turn } from "./conversation";
import type { Conversation as ConversationState } from "./types";

const MODEL_NAME = "gemini-3.6-flash";

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (const message of messages) {
    if (!message.content) continue;
    const role = message.role.toLowerCase();
    if (role === "human" || role === "user") {
      result.push({ role: "user", content: message.content });
    } else if (role === "ai" || role === "assistant") {
      result.push({ role: "assistant", content: message.content });
    }
  }
  return result;
}

function createConversation(): ConversationState {
  return { id: crypto.randomUUID(), title: "New chat", messages: [] };
}

export function ChatPage() {
  const { user, signOut } = useAuth();
  const chat = useChat();

  const [conversations, setConversations] = useState<ConversationState[]>(() => [
    createConversation(),
  ]);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [draft, setDraft] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  );

  function updateConversation(id: string, patch: Partial<ConversationState>) {
    setConversations((previous) =>
      previous.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function handleNewChat() {
    const conversation = createConversation();
    setConversations((previous) => [conversation, ...previous]);
    setActiveId(conversation.id);
    setDraft("");
  }

  async function handleSend() {
    const content = draft.trim();
    if (!content || chat.isPending) return;

    const conversationId = active.id;
    const userMessage: ChatMessage = { role: "user", content };

    updateConversation(conversationId, {
      messages: [...active.messages, userMessage],
      title: active.title === "New chat" ? content.slice(0, 48) : active.title,
    });
    setDraft("");
    setPendingId(conversationId);

    try {
      // The backend persists history in a LangGraph checkpoint keyed by
      // `conversation_id`, so only send the NEW message (avoids duplication).
      const response = await chat.mutateAsync({
        conversation_id: conversationId,
        messages: [userMessage],
      });
      updateConversation(conversationId, {
        messages: normalizeMessages(response.messages),
      });
    } catch {
      // Error toast is surfaced by the useChat hook.
    } finally {
      setPendingId(null);
    }
  }

  const threads: Thread[] = useMemo(
    () =>
      conversations.map((c) => ({
        id: c.id,
        title: c.title || "New chat",
        preview: c.messages[c.messages.length - 1]?.content ?? "",
        updated: "now",
        group: "today",
        turns: c.messages.map(
          (message, index): Turn => ({
            id: `${c.id}-${index}`,
            role: message.role === "user" ? "user" : "assistant",
            text: message.content,
          }),
        ),
      })),
    [conversations],
  );

  const thread: Thread | null = useMemo(() => {
    const found = threads.find((t) => t.id === active.id);
    if (!found) return null;
    if (found.turns.length === 0 && !(pendingId === active.id && chat.isPending)) {
      return null;
    }
    const turns: Turn[] = [...found.turns];
    if (pendingId === active.id && chat.isPending) {
      turns.push({ id: "pending", role: "assistant", text: "", streaming: true });
    }
    return { ...found, turns };
  }, [threads, active.id, pendingId, chat.isPending]);

  function handleThreadsChange(next: Thread[]) {
    const mapped = next.map((t) => ({
      id: t.id,
      title: t.title,
      messages: t.turns.map((turn) => ({
        role: turn.role,
        content: turn.text,
      })),
    }));

    const fallback = mapped.length > 0 ? mapped : [createConversation()];
    setConversations(fallback);
    if (!fallback.some((c) => c.id === activeId)) {
      setActiveId(fallback[0].id);
    }
  }

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <ChatSidebar
        activeId={active.id}
        onChange={handleThreadsChange}
        onNew={handleNewChat}
        onSelect={setActiveId}
        onSignOut={signOut}
        threads={threads}
        user={{
          name: user?.email ?? "User",
          email: user?.email ?? "",
          initials,
        }}
      />
      <SidebarInset className="min-h-0 bg-background">
        <header className="flex h-13 shrink-0 items-center gap-2.5 border-b px-4">
          <SidebarTrigger className="size-7.5 rounded-lg text-muted-foreground">
            <IconLayoutSidebar className="size-4" stroke={1.8} />
          </SidebarTrigger>
          <span className="rounded-md bg-muted px-2.5 py-1 text-[13px] font-medium">
            {MODEL_NAME}
          </span>
          <div className="grow" />
        </header>

        <Conversation
          onOpen={setActiveId}
          recent={threads.filter((t) => t.turns.length > 0).slice(0, 3)}
          thread={thread}
        />

        <Composer
          draft={draft}
          onDraft={setDraft}
          onSend={handleSend}
          streaming={chat.isPending}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
