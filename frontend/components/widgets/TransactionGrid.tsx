"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionCard, Transaction } from "./TransactionCard";

interface TransactionGridProps {
  transactions: Transaction[];
  onSupportClick?: (transaction: Transaction) => void;
}

export function TransactionGrid({ transactions, onSupportClick }: TransactionGridProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSupportClick = (transaction: Transaction) => {
    if (onSupportClick) {
      onSupportClick(transaction);
    } else {
      // Fallback: try to find and click the chat input
      const chatInput = document.querySelector('textarea[placeholder*="message"], textarea[placeholder*="Message"], input[type="text"]') as HTMLTextAreaElement | HTMLInputElement;
      if (chatInput) {
        const displayName = transaction.merchant || transaction.description || "Transaction";
        const message = `I need help with my transaction to ${displayName} (${transaction.id})`;
        chatInput.focus();
        chatInput.value = message;
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(event);
        // Try to submit (this may vary based on CopilotKit implementation)
        setTimeout(() => {
          const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }, 100);
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Recent Transactions
          </CardTitle>
          {transactions.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex-shrink-0"
              onClick={() => {
                const chatInput = document.querySelector('textarea[placeholder*="message" i], textarea[placeholder*="type" i]') as HTMLTextAreaElement;
                if (chatInput) {
                  chatInput.focus();
                  chatInput.value = "Show all transactions";
                  ['input', 'change'].forEach(eventType => {
                    const event = new Event(eventType, { bubbles: true });
                    chatInput.dispatchEvent(event);
                  });
                  setTimeout(() => {
                    const form = chatInput.closest('form');
                    const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
                    if (submitButton && !submitButton.disabled) {
                      submitButton.click();
                    }
                  }, 50);
                }
              }}
            >
              Show all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4 sm:px-6">
        <div className="transaction-grid-scroll">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <TransactionCard
                transaction={transaction}
                onSupportClick={handleSupportClick}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

