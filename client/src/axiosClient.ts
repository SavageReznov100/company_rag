import axios from "axios";
import { clearSession, getStoredToken } from "./lib/auth";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
});

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a token is missing/expired, clear the session and let the auth
    // context return the user to the sign-in screen.
    if (error.response?.status === 401) {
      clearSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("rag:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);
