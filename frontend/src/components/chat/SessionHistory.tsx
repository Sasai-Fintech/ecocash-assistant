import type { ChatSession } from "../../hooks/useChatSessions";

type Props = {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export function SessionHistory({ sessions, currentSessionId, onSelect, onCreate }: Props) {
  return (
    <div className="flex max-h-[80vh] flex-col bg-white p-4">
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-sm font-semibold text-gray-900">Chat History</h3>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
              session.id === currentSessionId
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <p className="text-sm font-medium">{session.title}</p>
            <p className="text-[11px] text-gray-500">
              {new Date(session.updatedAt).toLocaleString()}
            </p>
          </button>
        ))}
        {sessions.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-gray-500">No conversations yet.</p>
        )}
      </div>
    </div>
  );
}
