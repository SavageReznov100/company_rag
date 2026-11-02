import { axiosClient } from "../axiosClient";
import type {
  ChatRequest,
  ChatResponse,
  LoginResponse,
  SignUpRequest,
  UserRead,
} from "./connect.types";

export const connectApi = {
  signIn: async (email: string, password: string): Promise<LoginResponse> => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const response = await axiosClient.post<LoginResponse>(
      "/auth/jwt/login",
      form,
    );
    return response.data;
  },

  signUp: async (payload: SignUpRequest): Promise<UserRead> => {
    const response = await axiosClient.post<UserRead>("/auth/register", payload);
    return response.data;
  },

  getMe: async (): Promise<UserRead> => {
    const response = await axiosClient.get<UserRead>("/auth/users/me");
    return response.data;
  },

  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await axiosClient.post<ChatResponse>("/chat", request);
    return response.data;
  },
};
