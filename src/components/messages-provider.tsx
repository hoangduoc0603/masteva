'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { Messages } from '@/lib/messages';

const MessagesContext = createContext<Messages | null>(null);

export function MessagesProvider({ messages, children }: { messages: Messages; children: ReactNode }) {
  return <MessagesContext.Provider value={messages}>{children}</MessagesContext.Provider>;
}

export function useMessages(): Messages {
  const messages = useContext(MessagesContext);
  if (!messages) throw new Error('useMessages phải nằm trong <MessagesProvider>');
  return messages;
}
