
import { useState, useEffect, useCallback } from 'react';
import { Conversation, ChatMessage } from '../types';

export const useChatStore = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nexus_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nexus_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const saveConversation = useCallback((id: string, messages: ChatMessage[]) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          messages,
          title: messages[0]?.content.slice(0, 30) || 'New Conversation'
        };
        return updated;
      } else {
        return [
          {
            id,
            title: messages[0]?.content.slice(0, 30) || 'New Conversation',
            messages,
            createdAt: Date.now()
          },
          ...prev
        ];
      }
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  const searchMessages = useCallback((query: string) => {
    if (!query.trim()) return [];
    const results: { conversationId: string; conversationTitle: string; message: ChatMessage }[] = [];
    
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            conversationId: conv.id,
            conversationTitle: conv.title,
            message: msg
          });
        }
      });
    });
    
    return results;
  }, [conversations]);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    saveConversation,
    deleteConversation,
    searchMessages
  };
};
