"use client";

import { Loader2 } from "lucide-react";
import { AuthPage } from "@/components/auth/auth-page";
import { ChatPage } from "@/components/chat/chat-page";
import { useAuth } from "@/components/auth/auth-context";

export default function Home() {
  const { isAuthenticated, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return isAuthenticated ? <ChatPage /> : <AuthPage />;
}
