import axios from "axios";
import useAuthStore from "@/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let isHandlingAuthFailure = false;

export async function clearServerSession() {
  try {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    // Best effort — backend should clear the httpOnly cookie regardless.
  }
}

export async function redirectToLogin(message) {
  if (typeof window === "undefined" || isHandlingAuthFailure) return;

  isHandlingAuthFailure = true;
  useAuthStore.getState().logout();
  await clearServerSession();

  const params = new URLSearchParams({ error: message });
  window.location.replace(`/auth/login?${params.toString()}`);
}

export async function signOut() {
  if (typeof window === "undefined") return;

  useAuthStore.getState().logout();
  await clearServerSession();
  window.location.replace("/auth/login");
}

export function resetAuthFailureGuard() {
  isHandlingAuthFailure = false;
}
