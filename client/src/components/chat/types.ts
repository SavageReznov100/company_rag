import type { ChatMessage } from "@/api/connect.types";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}
