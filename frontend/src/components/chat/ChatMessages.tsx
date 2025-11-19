import { useMemo } from "react";
import { Role, Message, TextMessage as CopilotTextMessage } from "@copilotkit/runtime-client-gql";

import { AssistantBubble } from "./AssistantBubble";
import { UserBubble } from "./UserBubble";

const INITIAL_ASSISTANT_MESSAGE = new CopilotTextMessage({
  role: Role.Assistant,
  content:
    "Hi! I'm your EcoCash relationship manager. Ask about balances, transactions or raise an Ecocash ticket anytime.",
});

type Props = {
  messages: Message[];
  isLoading: boolean;
};

function renderAssistantBubble(message: Message, key: string | number) {
  let content: string | null = null;

  if (message.isTextMessage()) {
    content = message.content;
  } else if (message.isImageMessage?.()) {
    content = "[Image uploaded]";
  }

  // Check if message is being generated (empty or partial content while in progress)
  const isGenerating = message.isTextMessage() && !content;

  return (
    <AssistantBubble
      key={key}
      message={content ?? ""}
      isLoading={isGenerating}
      isGenerating={isGenerating}
    />
  );
}

function deriveStatusFromMessage(message: Message): boolean {
  if (message.isActionExecutionMessage()) {
    return true;
  }

  if (message.isAgentStateMessage?.()) {
    return true;
  }

  return false;
}

export function ChatMessages({ messages, isLoading }: Props) {
  const { timelineMessages, hasStatus, lastMessageIsAssistant } = useMemo(() => {
    const orderedMessages = [INITIAL_ASSISTANT_MESSAGE, ...messages];
    const displayMessages: Message[] = [];
    let showStatus = false;
    let lastIsAssistant = false;

    orderedMessages.forEach(message => {
      if (message.isActionExecutionMessage()) {
        showStatus = deriveStatusFromMessage(message);
        return;
      }

      if (message.isAgentStateMessage?.()) {
        showStatus = deriveStatusFromMessage(message);
        return;
      }

      if (message.isResultMessage()) {
        // Structured tool results (widgets, confirmations) are rendered via custom components.
        return;
      }

      displayMessages.push(message);

      // Track if the last message is from assistant
      if (message.isTextMessage() && message.role === Role.Assistant) {
        lastIsAssistant = true;
      } else if (message.role === Role.User) {
        lastIsAssistant = false;
      }
    });

    return {
      timelineMessages: displayMessages,
      hasStatus: showStatus,
      lastMessageIsAssistant: lastIsAssistant,
    };
  }, [messages]);

  // Only show loading indicator if we're loading AND the last message is NOT from assistant
  // (If last message is from assistant, it means response has started and will show in that bubble)
  const showLoadingIndicator = (hasStatus || isLoading) && !lastMessageIsAssistant;

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-2 pb-4">
      {timelineMessages.map((message, index) => {
        if (message.isTextMessage()) {
          if (message.role === Role.User) {
            return <UserBubble key={message.id ?? index} message={message.content ?? ""} />;
          }
          return renderAssistantBubble(message, message.id ?? index);
        }

        if (message.isImageMessage?.()) {
          return renderAssistantBubble(message, message.id ?? index);
        }

        return null;
      })}

      {showLoadingIndicator && (
        <AssistantBubble key="assistant-loading" message="" isLoading isGenerating />
      )}
    </div>
  );
}
