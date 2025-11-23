"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { BalanceCard } from "@/components/widgets/BalanceCard";
import { TransactionGrid } from "@/components/widgets/TransactionGrid";
import { TicketConfirmation } from "@/components/widgets/TicketConfirmation";
import { Transaction } from "@/components/widgets/TransactionCard";

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
      
      const handleSupportClick = (transaction: Transaction) => {
        const displayName = transaction.merchant || transaction.description || "Transaction";
        const dateStr = transaction.date ? new Date(transaction.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
        const amount = transaction.amount ? Math.abs(transaction.amount).toLocaleString("en-US", { style: "currency", currency: transaction.currency || "USD" }) : "";
        // Send a message that asks for help, not immediately create ticket
        // This triggers the guided support flow
        const message = `I need help with my transaction to ${displayName}${dateStr ? ` on ${dateStr}` : ""}${amount ? ` for ${amount}` : ""}.`;
        
        // Properly trigger React's onChange to enable send button
        const sendMessage = () => {
          // Try multiple selectors for chat input
          const selectors = [
            'textarea[placeholder*="message" i]',
            'textarea[placeholder*="type" i]',
            'textarea[data-testid*="input"]',
            'textarea',
            'input[type="text"]'
          ];
          
          let chatInput: HTMLTextAreaElement | HTMLInputElement | null = null;
          for (const selector of selectors) {
            chatInput = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement;
            if (chatInput) break;
          }
          
          if (!chatInput) {
            console.warn('Could not find chat input');
            return;
          }
          
          // Focus first
          chatInput.focus();
          
          // Set value using native setter to properly trigger React's onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
          )?.set;
          
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(chatInput, message);
          } else {
            chatInput.value = message;
          }
          
          // Create React-compatible input event
          const inputEvent = new Event('input', { bubbles: true, cancelable: true });
          chatInput.dispatchEvent(inputEvent);
          
          // Also trigger change event
          const changeEvent = new Event('change', { bubbles: true, cancelable: true });
          chatInput.dispatchEvent(changeEvent);
          
          // Try to access React's internal handlers
          const reactFiber = (chatInput as any).__reactInternalInstance || 
                            (chatInput as any).__reactFiber$ || 
                            (chatInput as any)._reactInternalFiber;
          
          if (reactFiber) {
            const props = reactFiber.memoizedProps || reactFiber.currentProps;
            if (props?.onChange) {
              props.onChange({
                target: chatInput,
                currentTarget: chatInput,
                bubbles: true,
                cancelable: true,
              });
            }
          }
          
          // Wait a bit for React to process, then find and enable/click send button
          setTimeout(() => {
            const form = chatInput.closest('form');
            let sendButton: HTMLButtonElement | null = null;
            
            // Find send button with multiple strategies
            if (form) {
              // Strategy 1: Standard submit button
              sendButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
              
              // Strategy 2: Button near the input
              if (!sendButton) {
                const buttons = form.querySelectorAll('button');
                for (const btn of Array.from(buttons)) {
                  const btnEl = btn as HTMLButtonElement;
                  if (btnEl.offsetParent !== null) {
                    sendButton = btnEl;
                    break;
                  }
                }
              }
            }
            
            // Strategy 3: Find by aria-label or data attributes
            if (!sendButton) {
              sendButton = document.querySelector(
                'button[aria-label*="send" i], button[aria-label*="submit" i], button[data-testid*="send"], button[data-testid*="submit"]'
              ) as HTMLButtonElement;
            }
            
            if (sendButton) {
              // If button is disabled, try to enable it by removing disabled attribute
              // This might work if CopilotKit just uses disabled attribute
              if (sendButton.disabled) {
                sendButton.removeAttribute('disabled');
                sendButton.disabled = false;
              }
              
              // Click the button if it's now enabled
              if (!sendButton.disabled) {
                sendButton.click();
                return;
              }
            }
            
            // Fallback: Try Enter key
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true,
            });
            chatInput.dispatchEvent(enterEvent);
            
            // Also try form submit as last resort
            if (form) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
            }
          }, 150);
        };
        
        // Small delay to ensure DOM is ready
        setTimeout(sendMessage, 50);
      };
      
      return <TransactionGrid transactions={transactions} onSupportClick={handleSupportClick} />;
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
    renderAndWait: ({ args, status, handler }) => {
      // Extract subject and body from args (tool call arguments)
      const subject = args?.subject || args?.issue || "Support Request";
      const body = args?.body || args?.description || "User requested assistance with a transaction.";
      
      return (
        <TicketConfirmation 
          issue={subject} 
          description={body}
          status={status}
          handler={handler}
        />
      );
    },
  });

  return null;
}
