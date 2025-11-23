"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { BalanceCard } from "@/components/widgets/BalanceCard";
import { TransactionTable } from "@/components/widgets/TransactionTable";
import { TicketConfirmation } from "@/components/widgets/TicketConfirmation";

/**
 * Registers CopilotKit actions for rendering widgets inline in chat.
 * Uses useCopilotAction with render to display widgets when tools are called.
 * The render function receives the tool result directly.
 * 
 * Reference: https://docs.copilotkit.ai/langgraph/generative-ui/backend-tools
 */
export function EcocashWidgets() {
  // Register action for balance widget - name must match tool name
  useCopilotAction({
    name: "get_balance",
    description: "Get the current wallet balance for the user",
    parameters: [
      {
        name: "user_id",
        type: "string",
        description: "The user ID",
        required: true,
      },
    ],
    render: ({ args, result, status }) => {
      // Show loading state while tool is executing
      if (status !== "complete") {
        return (
          <div className="bg-indigo-100 text-indigo-700 p-4 rounded-lg max-w-md">
            <span className="animate-pulse">⚙️ Retrieving balance...</span>
          </div>
        );
      }

      // result contains the tool's return value (float)
      const balance = typeof result === "number" ? result : parseFloat(result) || 0;
      
      return (
        <BalanceCard 
          accounts={[{
            id: "main",
            label: "Main Account",
            balance: {
              currency: "USD",
              amount: balance,
            },
          }]}
        />
      );
    },
  });

  // Register action for transactions widget - name must match tool name
  useCopilotAction({
    name: "list_transactions",
    description: "List recent transactions for the user",
    parameters: [
      {
        name: "user_id",
        type: "string",
        description: "The user ID",
        required: true,
      },
      {
        name: "limit",
        type: "number",
        description: "Maximum number of transactions to return",
        required: false,
      },
    ],
    render: ({ args, result, status }) => {
      // Show loading state while tool is executing
      if (status !== "complete") {
        return (
          <div className="bg-indigo-100 text-indigo-700 p-4 rounded-lg max-w-md">
            <span className="animate-pulse">⚙️ Loading transactions...</span>
          </div>
        );
      }

      // result contains the tool's return value (list of transactions)
      const transactions = Array.isArray(result) ? result : [];
      
      return <TransactionTable transactions={transactions} />;
    },
  });

  // Register action for ticket confirmation (human-in-the-loop)
  useCopilotAction({
    name: "create_ticket",
    description: "Create a support ticket for the user",
    parameters: [
      {
        name: "user_id",
        type: "string",
        description: "The user ID",
        required: true,
      },
      {
        name: "subject",
        type: "string",
        description: "The ticket subject - a clear summary of the issue extracted from the user's message",
        required: true,
      },
      {
        name: "body",
        type: "string",
        description: "The ticket description - detailed information about the problem extracted from the user's message",
        required: true,
      },
    ],
    renderAndWait: ({ subject, body, status, handler }) => {
      return (
        <TicketConfirmation 
          issue={subject || "No issue specified"} 
          description={body || "No description provided"}
          status={status}
          handler={handler}
        />
      );
    },
  });

  return null;
}
