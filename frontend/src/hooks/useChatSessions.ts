import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "ecoassist.sessions";
export const DEFAULT_SESSION_TITLE = "New session";

function createEntry(id: string): ChatSession {
  const now = Date.now();
  return {
    id,
    title: DEFAULT_SESSION_TITLE,
    createdAt: now,
    updatedAt: now,
  };
}

export function useChatSessions(initialSessionId: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(initialSessionId);
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) {
      return;
    }
    initialized.current = true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          return;
        }
      } catch {
        // ignore parse errors and fall back to default
      }
    }
    const entry = createEntry(initialSessionId);
    setSessions([entry]);
    setCurrentSessionId(initialSessionId);
  }, [initialSessionId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (sessions.length === 0) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (!sessions.find(session => session.id === initialSessionId) && initialized.current) {
      const entry = createEntry(initialSessionId);
      setSessions(prev => [entry, ...prev]);
      setCurrentSessionId(initialSessionId);
    }
  }, [initialSessionId, sessions]);

  const selectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
  }, []);

  const createSession = useCallback(() => {
    const id = crypto.randomUUID();
    const entry = createEntry(id);
    setSessions(prev => [entry, ...prev]);
    setCurrentSessionId(id);
    return id;
  }, []);

  const updateSessionTitle = useCallback((id: string, title: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id
          ? {
              ...session,
              title: title.trim() === "" ? DEFAULT_SESSION_TITLE : title,
              updatedAt: Date.now(),
            }
          : session,
      ),
    );
  }, []);

  const touchSession = useCallback((id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id
          ? {
              ...session,
              updatedAt: Date.now(),
            }
          : session,
      ),
    );
  }, []);

  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  );

  return {
    sessions: orderedSessions,
    currentSessionId,
    selectSession,
    createSession,
    updateSessionTitle,
    touchSession,
  };
}
