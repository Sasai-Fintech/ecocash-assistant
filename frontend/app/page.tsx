"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat, useCopilotChatSuggestions, type InputProps } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { EcocashWidgets } from "@/components/EcocashWidgets";
import { Chat } from "@/components/Chat";
import { SessionHistory } from "@/components/SessionHistory";
import { SessionTitleGenerator } from "@/components/SessionTitleGenerator";
import { Button } from "@/components/ui/button";
import { Plus, History, Send, X } from "lucide-react";
import { useMobileAuth } from "@/lib/hooks/use-mobile-auth";
import { useMobileContext } from "@/lib/hooks/use-mobile-context";

function NewSessionButton() {
  const handleNewSession = () => {
    // Generate new thread ID - CopilotKit will use this for the new session
    const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("ecocash_current_thread", newThreadId);
    // Reload page to start fresh session (CopilotKit will pick up new thread)
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 md:h-10 md:w-10"
      onClick={handleNewSession}
      aria-label="New Session"
    >
      <Plus className="h-5 w-5 md:h-6 md:w-6" />
    </Button>
  );
}

function SuggestionsComponent() {
  useCopilotChatSuggestions({
    instructions: `Offer context-aware suggestions based on the conversation state. CRITICAL: Never suggest actions that have already been completed. Always prioritize financial insights and account management actions.

    Rules:
    1. If the AI has confirmed a ticket was "successfully submitted" or "submitted", DO NOT suggest "Confirm submission" - the ticket is already confirmed. Instead suggest: "Check my balance", "View transactions", "Show financial insights", or "Get more help"
    
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
    
    5. If user just viewed transactions, suggest: "Get help with a transaction", "Check my balance", or "Show financial insights"
    
    6. If user is asking about a specific transaction, suggest "View transaction details" or "Report an issue"
    
    7. If a ticket was just successfully submitted, suggest next logical steps like "Check my balance", "View recent transactions", or "Show financial insights"
    
    8. If the conversation shows the ticket is already processed/completed, suggest new actions, not confirmation actions
    
    9. If user asks about financial insights, analysis, or wants to see spending/incoming/investment breakdown, suggest:
       - "Show cash flow" (for overview bar chart)
       - "Analyze incoming" (for detailed incoming breakdown)
       - "Analyze spends" (for detailed spending breakdown)
       - "Analyze investment" (for detailed investment breakdown)
    
    10. For new conversations or when no specific context, ALWAYS include "Show financial insights" as one of the suggestions. Other good defaults are:
       - "Check my wallet balance"
       - "View recent transactions"
       - "Show financial insights"
       - "Get help with a transaction"
    
    11. NEVER suggest "Ask another question" - it's not relevant. Instead suggest specific actionable items.
    
    Always check the last AI message - if it mentions "successfully submitted", "has been submitted", "ticket created", or similar completion phrases, do NOT suggest confirmation actions.
    If AI asks "what's wrong" or "what issue", provide issue-specific suggestions, not generic ones.
    If AI mentions financial insights or analysis, provide financial insights suggestions.
    Keep suggestions concise (2-5 words), actionable, and relevant to the current conversation context.
    Prioritize financial insights suggestions when appropriate.`,
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return null; // Suggestions are automatically rendered by CopilotKit
}

function CustomInput({ inProgress, onSend, isVisible, onStop }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (value: string) => {
    if (value.trim()) {
      onSend(value);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-8 mb-6 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <input
        ref={inputRef}
        disabled={inProgress}
        type="text"
        placeholder="Ask anything"
        className="flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:bg-gray-100 dark:disabled:bg-zinc-700 transition-all"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e.currentTarget.value);
          }
        }}
      />
      {inProgress ? (
        <button
          type="button"
          className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (onStop) {
              onStop();
            }
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }}
          title="Cancel"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <button
          type="button"
          disabled={inProgress}
          className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (inputRef.current) {
              handleSubmit(inputRef.current.value);
            }
          }}
          title="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function ChatWithContext() {
  const { context } = useMobileContext();
  
  return (
    <CopilotChat
      className="h-full border-0 rounded-2xl shadow-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm"
      instructions="You are the Ecocash Assistant, a helpful and friendly AI financial companion. Help users with their wallet balance, transaction history, and support tickets. Be proactive and suggest helpful actions when appropriate. When starting a new conversation, greet the user with 'How can I help you today?'"
      labels={{
        title: "What's on your mind today?",
        initial: "How can I help you today?",
        placeholder: "Ask anything",
      }}
      Input={CustomInput}
    />
  );
}

export default function Home() {
  // Get JWT token from Flutter WebView (via postMessage)
  // This hook doesn't require CopilotKit, so it can be called outside
  const { token, userId, isAuthenticated } = useMobileAuth();

  // Build properties for CopilotKit with auth headers
  // Following CopilotKit's self-hosted auth pattern: https://docs.copilotkit.ai/langgraph/auth
  const copilotKitProperties = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(userId && { 'X-User-Id': userId }),
        },
      }
    : undefined;

  return (
    <CopilotKit
      agent="ecocash_agent"
      runtimeUrl="/api/copilotkit"
      properties={copilotKitProperties}
    >
      <EcocashWidgets />
      <Chat />
      <SuggestionsComponent />
      <SessionTitleGenerator />
      <main className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-sm z-10 border-b border-gray-200/50 dark:border-zinc-700/50 relative min-h-[80px] sm:min-h-[100px]">
          <div className="w-full flex items-center justify-between relative h-full">
            <div className="flex-1"></div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-24 w-64 sm:h-32 sm:w-80 flex-shrink-0">
                <Image
                  src="/ecocashlogo.png"
                  alt="EcoCash Logo"
                  fill
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <NewSessionButton />
              <SessionHistory />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full max-w-5xl mx-auto p-4 md:p-6">
            <div className="h-full flex flex-col gap-4">
              {/* Chat */}
              <div className="flex-1 min-h-0">
                <ChatWithContext />
              </div>
            </div>
          </div>
        </div>
      </main>
    </CopilotKit>
  );
}
