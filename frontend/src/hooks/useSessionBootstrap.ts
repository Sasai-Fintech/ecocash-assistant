import { useEffect, useState } from "react";
import { Buffer } from "buffer";

type SessionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; sessionId: string; expiresAt: string; userId: string };

function decodeJwt(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  if (!payload) {
    return {};
  }
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded =
      typeof window !== "undefined"
        ? window.atob(normalized)
        : Buffer.from(normalized, "base64").toString("binary");
    const json = decodeURIComponent(
      decoded
        .split("")
        .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function useSessionBootstrap(params: {
  mobileToken?: string;
  metadata?: Record<string, unknown>;
}) {
  const [state, setState] = useState<SessionState>({ status: "idle" });

  useEffect(() => {
    if (!params.mobileToken) {
      setState({ status: "error", error: "Missing mobile token" });
      return;
    }

    setState({ status: "loading" });
    try {
      const payload = decodeJwt(params.mobileToken);
      const userId =
        (typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : undefined) ??
        (params.metadata && typeof params.metadata.userId === "string"
          ? params.metadata.userId
          : "eco-user");
      const expires =
        typeof payload.exp === "number"
          ? new Date(payload.exp * 1000).toISOString()
          : new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const sessionId =
        typeof window !== "undefined" && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `sess_${Date.now()}`;

      setState({
        status: "ready",
        sessionId,
        expiresAt: expires,
        userId,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to parse mobile token",
      });
    }
  }, [params.mobileToken, params.metadata]);

  return state;
}
