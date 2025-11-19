import { useEffect, useRef, KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
};

export function ChatComposer({ value, onChange, onSend, onStop, isLoading, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift sends the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim().length > 0 && !isLoading) {
        onSend();
      }
    }
    // Shift+Enter creates a new line (default behavior)
  };

  const canSend = !disabled && value.trim().length > 0 && !isLoading;

  return (
    <div className="relative mx-auto w-full">
      <div className="rounded-3xl border border-gray-300 bg-white shadow-lg transition-all focus-within:border-gray-400 focus-within:shadow-xl">
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none"
            placeholder="Message Eco Assist..."
            value={value}
            onChange={event => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            style={{ height: "auto" }}
          />

          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition-all hover:bg-gray-800"
              aria-label="Stop generating"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 px-3 text-center text-xs text-gray-500">
        <span>Press Enter to send, Shift + Enter for new line</span>
      </div>
    </div>
  );
}
