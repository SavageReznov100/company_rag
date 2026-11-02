"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectApi } from "./connect.api";
import type { ChatRequest, SignUpRequest } from "./connect.types";

export const useSignIn = () =>
  useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      connectApi.signIn(email, password),
    onSuccess: () => {
      toast.success("Signed in successfully!");
    },
    onError: (error) => {
      toast.error("Failed to sign in.");
      console.error("Sign in error:", error);
    },
  });

export const useSignUp = () =>
  useMutation({
    mutationFn: (payload: SignUpRequest) => connectApi.signUp(payload),
    onSuccess: () => {
      toast.success("Account created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create account.");
      console.error("Sign up error:", error);
    },
  });

export const useCurrentUser = (token: string | null) =>
  useQuery({
    queryKey: ["current_user", token],
    queryFn: () => connectApi.getMe(),
    enabled: !!token,
    retry: false,
  });

export const useChat = () =>
  useMutation({
    mutationFn: (request: ChatRequest) => connectApi.chat(request),
    onError: (error) => {
      toast.error("Failed to get a response.");
      console.error("Chat error:", error);
    },
  });
