"use client";

import { useState, useEffect, useCallback } from 'react';
import { isValidMobileMessage, isAllowedOrigin, sendToFlutter } from '@/lib/mobile-bridge';

export interface MobileAuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
}

/**
 * Hook to manage JWT authentication from Flutter WebView
 * 
 * Listens for postMessage events from Flutter app containing JWT tokens.
 * Follows CopilotKit's authentication pattern for self-hosted deployments.
 * 
 * @see https://docs.copilotkit.ai/langgraph/auth
 */
export function useMobileAuth(): MobileAuthState & {
  setToken: (token: string, userId?: string) => void;
} {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Handle incoming messages from Flutter
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Validate origin (in production, be more strict)
      if (!isAllowedOrigin(event.origin)) {
        console.warn('[MobileAuth] Message from unauthorized origin:', event.origin);
        return;
      }

      // Validate message format
      if (!isValidMobileMessage(event.data)) {
        return;
      }

      // Handle SET_TOKEN message
      if (event.data.type === 'SET_TOKEN') {
        try {
          const { token: newToken, userId: newUserId } = event.data;
          
          if (newToken && typeof newToken === 'string' && newToken.length > 0) {
            setTokenState(newToken);
            setUserId(newUserId || null);
            
            console.log('[MobileAuth] JWT token received', {
              hasToken: !!newToken,
              userId: newUserId,
              tokenLength: newToken.length,
            });
            
            // Notify Flutter that token was received
            try {
              sendToFlutter({
                type: 'TOKEN_RECEIVED',
                success: true,
              });
            } catch (error) {
              console.warn('[MobileAuth] Failed to notify Flutter:', error);
            }
          } else {
            console.warn('[MobileAuth] Invalid token format received');
          }
        } catch (error) {
          console.error('[MobileAuth] Error processing SET_TOKEN message:', error);
        }
      }
    };

    // Listen for messages
    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Manual token setter (for testing or programmatic updates)
  const setToken = useCallback((newToken: string, newUserId?: string) => {
    setTokenState(newToken);
    setUserId(newUserId || null);
  }, []);

  return {
    token,
    userId,
    isAuthenticated: !!token,
    setToken,
  };
}

