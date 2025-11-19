"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { CopilotKit } from "@copilotkit/react-core";
import { useCopilotChat } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";

import { ChatMessages } from "../components/chat/ChatMessages";
import { ChatComposer } from "../components/chat/ChatComposer";
import { SessionHistory } from "../components/chat/SessionHistory";
import { useChatSessions } from "../hooks/useChatSessions";
import { useSessionBootstrap } from "../hooks/useSessionBootstrap";
import { useWidgetActions } from "../hooks/useWidgetActions";
import { env } from "../lib/env";

type ReadySessionState = { status: "ready"; sessionId: string; expiresAt: string; userId: string };

export default function HomePage() {
  const [mobileToken, setMobileToken] = useState<string | undefined>();
  const [metadata, setMetadata] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token =
      window.__ECO_TOKEN__ ?? new URLSearchParams(window.location.search).get("token") ?? undefined;
    const metaParam = new URLSearchParams(window.location.search).get("metadata");
    let parsedMeta: Record<string, unknown> | undefined = window.__ECO_METADATA__ ?? undefined;
    if (metaParam) {
      try {
        parsedMeta = JSON.parse(decodeURIComponent(metaParam));
      } catch {
        // ignore metadata parse errors
      }
    }
    setMobileToken(token ?? undefined);
    setMetadata(parsedMeta ?? { channel: "web-demo" });
  }, []);

  const session = useSessionBootstrap({ mobileToken, metadata });

  if (session.status === "idle" || session.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-600">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 animate-spin text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Initializing Eco Assist…</span>
        </div>
      </div>
    );
  }

  if (session.status === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white text-center">
        <p className="text-lg font-semibold text-gray-900">We couldn't secure your session.</p>
        <p className="text-sm text-gray-600">{session.error}</p>
      </div>
    );
  }

  if (!mobileToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-900">
        <div className="text-center">
          <p className="text-lg font-semibold">Mobile token missing</p>
          <p className="text-sm text-gray-600">Please relaunch the widget from the EcoCash app.</p>
        </div>
      </div>
    );
  }

  return (
    <CopilotKit
      runtimeUrl={env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL}
      agent={env.NEXT_PUBLIC_AGENT_ID}
      headers={{ Authorization: `Bearer ${mobileToken}` }}
    >
      <ChatExperience session={session} mobileToken={mobileToken} />
    </CopilotKit>
  );
}

function ChatExperience({
  session,
  mobileToken,
}: {
  session: ReadySessionState;
  mobileToken: string;
}) {
  const initialSessionId = useMemo(
    () => session.sessionId ?? crypto.randomUUID(),
    [session.sessionId],
  );
  const { sessions, currentSessionId, selectSession, createSession, touchSession } =
    useChatSessions(initialSessionId);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleNewChat = () => {
    const id = createSession();
    selectSession(id);
    setHistoryOpen(false);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="fixed right-4 top-4 z-40 flex items-center gap-2">
        <button
          type="button"
          aria-label="New chat"
          onClick={handleNewChat}
          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
          title="New chat"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Session history"
          onClick={() => setHistoryOpen(open => !open)}
          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
          title="Session history"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6h.01M12 12h.01M12 18h.01M12 6a.5.5 0 110-1 .5.5 0 010 1zm0 6a.5.5 0 110-1 .5.5 0 010 1zm0 6a.5.5 0 110-1 .5.5 0 010 1z"
            />
            <circle cx="12" cy="6" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="18" r="1" />
          </svg>
        </button>
      </div>

      {/* Main Chat Area - Centered */}
      <div className="relative flex flex-1 flex-col">
        <ChatSurface
          key={currentSessionId}
          sessionId={currentSessionId}
          userId={session.userId}
          mobileToken={mobileToken}
          onMessageActivity={() => touchSession(currentSessionId)}
        />
      </div>

      {/* Session History Modal/Dropdown */}
      {historyOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />

          {/* Session Panel */}
          <div className="fixed right-4 top-16 z-50 w-80 max-h-[80vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <SessionHistory
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelect={id => {
                selectSession(id);
                setHistoryOpen(false);
              }}
              onCreate={handleNewChat}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ChatSurface({
  sessionId,
  userId,
  mobileToken,
  onMessageActivity,
}: {
  sessionId: string;
  userId: string;
  mobileToken: string;
  onMessageActivity: () => void;
}) {
  const { visibleMessages, appendMessage, isLoading, stopGeneration } = useCopilotChat({
    id: sessionId,
    headers: { Authorization: `Bearer ${mobileToken}` },
  });

  const [composerValue, setComposerValue] = useState("");

  const sendMessage = useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content) {
        return;
      }
      const textMessage = new TextMessage({
        content,
        role: Role.User,
      });
      await appendMessage(textMessage);
      onMessageActivity();
    },
    [appendMessage, onMessageActivity],
  );

  const handleSend = useCallback(async () => {
    const message = composerValue;
    setComposerValue("");
    await sendMessage(message);
  }, [composerValue, sendMessage]);

  const handleWidgetPostback = useCallback(
    (payload: Record<string, unknown>) => {
      if (!payload) return;
      const explicit = typeof payload.prompt === "string" ? payload.prompt : undefined;
      const labeled = typeof payload.__label === "string" ? payload.__label : undefined;
      const fallback = JSON.stringify(payload);
      sendMessage(explicit ?? labeled ?? fallback);
    },
    [sendMessage],
  );

  useWidgetActions({ onPostback: handleWidgetPostback });

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col px-4 pb-8 pt-20 lg:px-6">
      <header className="mb-8 flex flex-col gap-2 text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Eco Assist
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Hey {userId.split("@")[0] || "there"}, how can we help?
        </h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={visibleMessages} isLoading={isLoading} />
      </div>
      <div className="mt-6">
        <ChatComposer
          value={composerValue}
          onChange={setComposerValue}
          onSend={handleSend}
          onStop={stopGeneration}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </div>
  );
}
