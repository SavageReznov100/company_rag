"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { connectApi } from "@/api/connect.api";
import { useSignIn, useSignUp } from "@/api/connect.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./auth-context";

type Mode = "signin" | "signup";

export function AuthPage() {
  const { setSession } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = useSignIn();
  const signUp = useSignUp();

  const loading = signIn.isPending || signUp.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    try {
      if (mode === "signin") {
        const { access_token } = await signIn.mutateAsync({ email, password });
        setSession(access_token, null);
        const user = await connectApi.getMe();
        setSession(access_token, user);
        return;
      }

      const createdUser = await signUp.mutateAsync({ email, password });
      const { access_token } = await signIn.mutateAsync({ email, password });
      setSession(access_token, createdUser);
    } catch {
      // Error toasts are surfaced by the useSignIn/useSignUp hooks.
    }
  }

  const isSignIn = mode === "signin";

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h3 className="text-balance text-center font-semibold text-foreground text-lg dark:text-foreground">
            {isSignIn ? "Welcome Back" : "Create your account"}
          </h3>
          <p className="text-pretty text-center text-muted-foreground text-sm dark:text-muted-foreground">
            {isSignIn
              ? "Enter your credentials to access your account."
              : "Create an account to start chatting with your documents."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label
                className="font-medium text-foreground text-sm dark:text-foreground"
                htmlFor="email"
              >
                Email
              </Label>
              <Input
                autoComplete="email"
                className="mt-2"
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <Label
                className="font-medium text-foreground text-sm dark:text-foreground"
                htmlFor="password"
              >
                Password
              </Label>
              <Input
                autoComplete={isSignIn ? "current-password" : "new-password"}
                className="mt-2"
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>
            <Button
              className="mt-4 w-full py-2 font-medium"
              disabled={loading}
              type="submit"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isSignIn ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-pretty text-center text-muted-foreground text-sm dark:text-muted-foreground">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="font-medium text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90"
              onClick={() => setMode(isSignIn ? "signup" : "signin")}
              type="button"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>

          {isSignIn && (
            <p className="mt-4 text-pretty text-center text-muted-foreground text-sm dark:text-muted-foreground">
              Forgot your password?{" "}
              <a
                className="font-medium text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90"
                href="#"
              >
                Reset password
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
