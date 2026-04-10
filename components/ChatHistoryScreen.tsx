
import React, { useState, useMemo } from 'react';
import { useChatStore } from '../hooks/useChatStore';
import { Search, MessageSquare, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppMode, Conversation } from '../types';

interface ChatHistoryScreenProps {
  onSelectConversation: (id: string) => void;
}

const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({ onSelectConversation }) => {
  const { conversations, deleteConversation } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const titleMatch = conv.title.toLowerCase().includes(query);
      const messageMatch = conv.messages.some(msg => msg.content.toLowerCase().includes(query));
      return titleMatch || messageMatch;
    });
  }, [conversations, searchQuery]);

  const getMatchSnippet = (conv: Conversation) => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    const matchingMsg = conv.messages.find(msg => msg.content.toLowerCase().includes(query));
    if (!matchingMsg) return null;

    const index = matchingMsg.content.toLowerCase().indexOf(query);
    const start = Math.max(0, index - 40);
    const end = Math.min(matchingMsg.content.length, index + query.length + 40);
    let snippet = matchingMsg.content.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < matchingMsg.content.length) snippet = snippet + '...';
    
    return snippet;
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-emerald-500/30 text-emerald-900 dark:text-emerald-100 rounded px-0.5">
              {part}
            </mark>
          ) : part
        )}
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white/50 dark:bg-black/20 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-emerald-900 dark:text-emerald-50 mb-2">Chat History</h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/40">Search and manage your past conversations</p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/50" size={20} />
          <input
            type="text"
            placeholder="Search by title or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-white/5 border border-emerald-500/20 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-emerald-900 dark:text-emerald-50 shadow-xl"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-50 mb-4">
            {searchQuery ? `Search Results (${filteredConversations.length})` : 'Recent Conversations'}
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conv) => {
                const snippet = getMatchSnippet(conv);
                return (
                  <motion.div
                    key={conv.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start gap-4 bg-white/40 dark:bg-white/5 p-5 rounded-3xl border border-white/20 shadow-lg hover:bg-white/60 dark:hover:bg-white/10 transition-all group cursor-pointer"
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-600 flex-shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-emerald-900 dark:text-emerald-50 truncate text-lg">
                          {highlightText(conv.title, searchQuery)}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                          <ArrowRight size={18} className="text-emerald-600" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-emerald-800/50 dark:text-emerald-100/30 mb-3">
                        <Calendar size={12} />
                        {formatDate(conv.createdAt)}
                        <span>•</span>
                        {conv.messages.length} messages
                      </div>

                      {snippet && (
                        <div className="bg-emerald-500/5 dark:bg-emerald-400/5 p-3 rounded-xl border border-emerald-500/10">
                          <p className="text-sm text-emerald-800/70 dark:text-emerald-100/50 italic line-clamp-2">
                            "{highlightText(snippet, searchQuery)}"
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredConversations.length === 0 && (
              <div className="text-center py-20 bg-white/20 dark:bg-white/5 rounded-3xl border border-dashed border-emerald-500/20">
                {searchQuery ? (
                  <>
                    <Search size={48} className="mx-auto mb-4 text-emerald-500/20" />
                    <p className="text-emerald-800/40 dark:text-emerald-100/30">No matches found for "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <MessageSquare size={48} className="mx-auto mb-4 text-emerald-500/20" />
                    <p className="text-emerald-800/40 dark:text-emerald-100/30">No conversations yet. Start chatting to see your history!</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryScreen;
