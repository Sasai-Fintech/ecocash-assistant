"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { EcocashWidgets } from "@/components/EcocashWidgets";

export default function Home() {
  return (
    <CopilotKit
      agent="ecocash_agent"
      runtimeUrl="/api/copilotkit"
    >
      <EcocashWidgets />
      <main className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-900">
        {/* Header */}
        <div className="p-6 bg-white dark:bg-zinc-800 shadow-sm z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">EcoCash Assistant</h1>
            <p className="text-sm text-gray-500">Your AI Financial Companion</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full max-w-4xl mx-auto p-4 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <CopilotChat
                className="h-full border rounded-xl shadow-sm bg-white dark:bg-zinc-800"
                instructions="You are the Ecocash Assistant. Help the user with their financial queries, balance checks, and transactions."
                labels={{
                  title: "Chat with EcoCash",
                  initial: "Hello! I can help you check your balance, view transactions, or raise a support ticket. How can I help?",
                }}
              />
            </div>
            {/* Custom Sasai Footer */}
            <div className="text-center py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700 mt-2">
              Powered By Sasai
            </div>
          </div>
        </div>
      </main>
    </CopilotKit>
  );
}
