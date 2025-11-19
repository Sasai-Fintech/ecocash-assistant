import type { AssistantMessageProps } from "@copilotkit/react-ui/dist/components/chat/props";
import { Markdown } from "@copilotkit/react-ui";
import clsx from "clsx";

export function AssistantBubble({
  message,
  subComponent,
  isLoading,
  isGenerating,
  className,
}: AssistantMessageProps) {
  const showContent = message || isLoading || isGenerating;

  return (
    <div className={clsx("group flex items-start gap-4", className)}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0A7CFF] to-[#0860d6] text-sm font-semibold text-white shadow-md">
        EA
      </div>
      <div className="flex-1 space-y-3 pt-1">
        {showContent && (
          <div className="min-h-[24px]">
            {message ? (
              <div className="prose prose-gray max-w-none text-[15px] leading-relaxed text-gray-900">
                <Markdown content={message} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-2">
                <span className="typing-dot h-2 w-2 rounded-full bg-gray-400"></span>
                <span className="typing-dot h-2 w-2 rounded-full bg-gray-400"></span>
                <span className="typing-dot h-2 w-2 rounded-full bg-gray-400"></span>
              </div>
            )}
          </div>
        )}
        {subComponent && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">{subComponent}</div>
        )}
      </div>
    </div>
  );
}
