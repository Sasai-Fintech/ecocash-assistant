"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { EcocashWidgets } from "@/components/EcocashWidgets";
import { SessionHistory } from "@/components/SessionHistory";
import { SessionTitleGenerator } from "@/components/SessionTitleGenerator";
import { Button } from "@/components/ui/button";
import { Plus, History } from "lucide-react";
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
    
    9. If user asks about financial insights, analysis, or wants to see spending/incoming/investment breakdown, suggest:
       - "Show cash flow" (for overview bar chart)
       - "Analyze incoming" (for detailed incoming breakdown)
       - "Analyze spends" (for detailed spending breakdown)
       - "Analyze investment" (for detailed investment breakdown)
    
    10. Otherwise, suggest common actions like "Check my wallet balance", "View recent transactions", "Show financial insights", or "Get support"
    
    Always check the last AI message - if it mentions "successfully submitted", "has been submitted", "ticket created", or similar completion phrases, do NOT suggest confirmation actions.
    If AI asks "what's wrong" or "what issue", provide issue-specific suggestions, not generic ones.
    If AI mentions financial insights or analysis, provide financial insights suggestions.
    Keep suggestions concise (2-5 words), actionable, and relevant to the current conversation context.`,
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return null; // Suggestions are automatically rendered by CopilotKit
}

// Chat component that conditionally shows initial greeting based on mobile context
function ChatWithContext() {
  // Get context to check if we should skip the greeting
  const { context } = useMobileContext();
  
  // Use welcome message as initial - CopilotKit will handle it properly
  // When transaction context is provided via postMessage, the agent will respond immediately
  // For regular web users, they'll see the welcome message
  const initialMessage = "How can I help you today?";
  
  return (
    <CopilotChat
      className="h-full border-0 rounded-2xl shadow-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm"
      instructions="You are the Ecocash Assistant, a helpful and friendly AI financial companion. Help users with their wallet balance, transaction history, and support tickets. Be proactive and suggest helpful actions when appropriate. When starting a new conversation, greet the user with 'How can I help you today?'"
      labels={{
        title: "What's on your mind today?",
        initial: "",
        placeholder: "Ask anything",
      }}
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
