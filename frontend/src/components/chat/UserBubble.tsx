import type { UserMessageProps } from "@copilotkit/react-ui/dist/components/chat/props";

export function UserBubble({ message }: UserMessageProps) {
  return (
    <div className="group flex justify-end">
      <div className="max-w-[85%] rounded-3xl bg-gray-100 px-5 py-3.5 text-[15px] leading-relaxed text-gray-900 shadow-sm">
        <div className="whitespace-pre-wrap break-words">{message}</div>
      </div>
    </div>
  );
}
