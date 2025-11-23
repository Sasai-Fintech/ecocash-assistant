"use client";

import { useState, useEffect, useCallback } from 'react';
import { useCopilotChat } from '@copilotkit/react-core';
import { isValidMobileMessage, isAllowedOrigin } from '@/lib/mobile-bridge';

export interface MobileContext {
  transactionId?: string;
  deviceInfo?: Record<string, any>;
  channel?: string;
  [key: string]: any;
}

/**
 * Hook to manage context metadata from Flutter WebView
 * 
 * Handles context passing for transaction help flows and other
 * context-aware features.
 */
export function useMobileContext(): {
  context: MobileContext | null;
  triggerTransactionHelp: (transactionId: string) => void;
} {
  const [context, setContext] = useState<MobileContext | null>(null);
  const { appendMessage } = useCopilotChat();

  // Handle incoming messages from Flutter
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Validate origin
      if (!isAllowedOrigin(event.origin)) {
        console.warn('[MobileContext] Message from unauthorized origin:', event.origin);
        return;
      }

      // Validate message format
      if (!isValidMobileMessage(event.data)) {
        return;
      }

      // Handle SET_CONTEXT message
      if (event.data.type === 'SET_CONTEXT') {
        const newContext: MobileContext = {
          ...event.data.context,
          channel: 'mobile',
        };
        setContext(newContext);
        
        console.log('[MobileContext] Context received', {
          hasTransactionId: !!newContext.transactionId,
          contextKeys: Object.keys(newContext),
        });
      }

      // Handle TRANSACTION_HELP message
      if (event.data.type === 'TRANSACTION_HELP') {
        const { transactionId } = event.data;
        
        // Update context
        setContext((prev) => ({
          ...prev,
          transactionId,
          channel: 'mobile',
        }));

        // Automatically send initial message to agent
        const initialMessage = `I need help with transaction ${transactionId}`;
        
        // Use CopilotKit's chat API to send message
        appendMessage({
          role: 'user',
          content: initialMessage,
        });

        console.log('[MobileContext] Transaction help triggered', {
          transactionId,
          message: initialMessage,
        });
      }
    };

    // Listen for messages
    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [appendMessage]);

  // Manual trigger for transaction help (for testing)
  const triggerTransactionHelp = useCallback((transactionId: string) => {
    setContext((prev) => ({
      ...prev,
      transactionId,
      channel: 'mobile',
    }));

    const initialMessage = `I need help with transaction ${transactionId}`;
    appendMessage({
      role: 'user',
      content: initialMessage,
    });
  }, [appendMessage]);

  return {
    context,
    triggerTransactionHelp,
  };
}

