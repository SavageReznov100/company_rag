export interface UserRead {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  conversation_id: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  messages: ChatMessage[];
  next_node?: string | null;
}
