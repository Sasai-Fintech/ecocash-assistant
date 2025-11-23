"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { EcocashWidgets } from "@/components/EcocashWidgets";

function SuggestionsComponent() {
  useCopilotChatSuggestions({
    instructions: `Offer context-aware suggestions based on the conversation state. CRITICAL: Never suggest actions that have already been completed.

    Rules:
    1. If the AI has confirmed a ticket was "successfully submitted" or "submitted", DO NOT suggest "Confirm submission" - the ticket is already confirmed. Instead suggest: "Check my balance", "View transactions", or "Get more help"
    
    2. If there's a pending ticket confirmation dialog visible (user hasn't confirmed yet), suggest "Confirm submission" or "Cancel ticket"
    
    3. If AI just summarized a transaction and asked "tell us what's wrong" or "what issue are you facing", suggest common transaction issues:
       - "Receiver has not received the payment"
       - "Amount debited twice"
       - "Transaction failed"
       - "Need refund"
       - "Wrong amount charged"
       - "Offer not applied"
    
    4. If AI is providing resolution steps (e.g., "contact merchant with UTR"), suggest:
       - "Okay" or "Got it"
       - "Contacted merchant, issue not resolved"
       - "Issue resolved"
    
    5. If user just viewed transactions, suggest "Get help with a transaction" or "Check my balance"
    
    6. If user is asking about a specific transaction, suggest "View transaction details" or "Report an issue"
    
    7. If a ticket was just successfully submitted, suggest next logical steps like "Check my balance", "View recent transactions", or "Ask another question"
    
    8. If the conversation shows the ticket is already processed/completed, suggest new actions, not confirmation actions
    
    9. Otherwise, suggest common actions like "Check my wallet balance", "View recent transactions", or "Get support"
    
    Always check the last AI message - if it mentions "successfully submitted", "has been submitted", "ticket created", or similar completion phrases, do NOT suggest confirmation actions.
    If AI asks "what's wrong" or "what issue", provide issue-specific suggestions, not generic ones.
    Keep suggestions concise (2-5 words), actionable, and relevant to the current conversation context.`,
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return null; // Suggestions are automatically rendered by CopilotKit
}

export default function Home() {
  return (
    <CopilotKit
      agent="ecocash_agent"
      runtimeUrl="/api/copilotkit"
    >
      <EcocashWidgets />
      <SuggestionsComponent />
      <main className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
        {/* Header */}
        <div className="p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-sm z-10 border-b border-gray-200/50 dark:border-zinc-700/50">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              EcoCash Assistant
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your AI Financial Companion</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full max-w-5xl mx-auto p-4 md:p-6">
            <div className="h-full flex flex-col gap-4">
              {/* Chat */}
              <div className="flex-1 min-h-0">
                <CopilotChat
                  className="h-full border-0 rounded-2xl shadow-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm"
                  instructions="You are the Ecocash Assistant, a helpful and friendly AI financial companion. Help users with their wallet balance, transaction history, and support tickets. Be proactive and suggest helpful actions when appropriate."
                  labels={{
                    title: "How can we help you today?",
                    initial: "Hello! I can help you check your balance, view transactions, or raise a support ticket. How can I help?",
                    placeholder: "Type your message...",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </CopilotKit>
  );
}
