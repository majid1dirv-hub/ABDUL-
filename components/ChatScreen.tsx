
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, AIModel } from '../types';
import { AVAILABLE_MODELS } from '../constants';
import { streamAIResponse } from '../services/aiService';
import { Paperclip, Send, Bot, User, Copy, Check, PlusCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ModelSelector } from './ModelSelector';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';
import { useChatStore } from '../hooks/useChatStore';

const CodeBlock: React.FC<{ language: string; value: string; theme: 'light' | 'dark' }> = ({ language, value, theme }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-lg overflow-hidden bg-black/70 border border-white/10 shadow-lg">
            <div className="flex justify-between items-center px-4 py-1.5 bg-gray-800/80">
                <span className="text-xs font-sans text-gray-400 capitalize">{language}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    {hasCopied ? <Check size={14} /> : <Copy size={14} />}
                    {hasCopied ? 'Copied!' : 'Copy code'}
                </button>
            </div>
            <SyntaxHighlighter
                style={theme === 'dark' ? vscDarkPlus : oneLight}
                language={language}
                PreTag="div"
                customStyle={{ margin: 0, padding: '1rem', backgroundColor: 'transparent' }}
                codeTagProps={{ style: { fontFamily: '"Fira Code", "Dank Mono", monospace' } }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};


const ChatScreen: React.FC = () => {
    const { settings } = useSettings();
    const { conversations, currentConversationId, saveConversation, setCurrentConversationId } = useChatStore();
    
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (currentConversationId) {
            const conv = conversations.find(c => c.id === currentConversationId);
            return conv ? conv.messages : [];
        }
        return [];
    });
    
    const [conversationId, setConversationId] = useState<string>(() => {
        return currentConversationId || Date.now().toString();
    });

    const [input, setInput] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
        return AVAILABLE_MODELS.find(m => m.id === settings.defaultModel) || AVAILABLE_MODELS[0];
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        if (settings.autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    useEffect(() => {
        if (messages.length > 0) {
            saveConversation(conversationId, messages);
        }
    }, [messages, conversationId, saveConversation]);
    
    const handleSendMessage = useCallback(async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            ...(image && { image }),
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setImage(null);
        setIsLoading(true);

        const modelResponseId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: modelResponseId, role: 'model', content: '' }]);

        try {
            const history = messages.filter(m => m.role !== 'system');
            
            await streamAIResponse(selectedModel, history, input, image, (chunk) => {
                setMessages(prev =>
                    prev.map(m =>
                        m.id === modelResponseId ? { ...m, content: m.content + chunk } : m
                    )
                );
            }, settings.customInstructions);
        } catch (error: any) {
            console.error("Error streaming AI response:", error);
            let errorMessage = "Sorry, something went wrong. Please check the console for details.";
            
            // Check for quota exceeded error (429)
            const errorString = typeof error === 'string' ? error : JSON.stringify(error);
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = "⚠️ **Quota Exceeded**: You've reached the limit for the Gemini API. Please wait a moment or check your plan details at https://ai.google.dev/gemini-api/docs/rate-limits";
            }

            setMessages(prev =>
                prev.map(m =>
                    m.id === modelResponseId ? { ...m, content: errorMessage } : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [input, image, isLoading, messages, selectedModel]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full p-4 gap-4 bg-transparent">
             {/* Header */}
            <header className="flex-shrink-0 flex justify-between items-center p-4 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-md">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Chat</h2>
                    <button 
                        onClick={() => {
                            setCurrentConversationId(null);
                            setConversationId(Date.now().toString());
                            setMessages([]);
                            setInput('');
                            setImage(null);
                            inputRef.current?.focus();
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/50"
                    >
                        <PlusCircle size={18} />
                        New Chat
                    </button>
                </div>
                <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-inner">
                {messages.length === 0 && <WelcomeMessage />}
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                 {isLoading && messages[messages.length-1]?.role === 'model' && messages[messages.length-1]?.content === '' && (
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-600 rounded-full text-white shadow-lg shadow-emerald-500/20"><Bot size={20} /></div>
                        <div className="flex items-center gap-2 pt-2">
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 p-4 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-md">
                <div className="relative">
                    {image && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-black/50 rounded-lg">
                            <img src={image} alt="preview" className="h-20 w-20 object-cover rounded" />
                            <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 text-xs">&times;</button>
                        </div>
                    )}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${selectedModel.name}...`}
                        className="w-full bg-white/50 dark:bg-black/50 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 p-4 pr-32 rounded-lg border-2 border-transparent focus:border-emerald-500 focus:ring-0 transition-colors resize-none"
                        rows={1}
                        style={{minHeight: "52px"}}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                            <Paperclip size={20} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button onClick={handleSendMessage} disabled={isLoading} className="bg-emerald-600 text-white rounded-lg p-2 disabled:bg-emerald-300 hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20">
                           {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Message: React.FC<{message: ChatMessage}> = ({ message }) => {
    const isUser = message.role === 'user';
    const [hasCopied, setHasCopied] = useState(false);
    const { theme } = useTheme();
    const { settings } = useSettings();

    const fontSizeClass = settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-base' : 'text-sm';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <div className="flex-shrink-0 p-2 bg-emerald-600 rounded-full text-white shadow-lg shadow-emerald-500/20"><Bot size={20} /></div>}
            
            <div className={`max-w-xl w-full p-4 rounded-xl relative group ${isUser ? 'bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-600/10' : 'bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'}`}>
                 {message.image && <img src={message.image} alt="attachment" className="rounded-lg mb-2 max-h-64" />}
                <div className={`prose ${fontSizeClass} dark:prose-invert max-w-none prose-p:before:content-none prose-p:after:content-none`}>
                     <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isBlock = !!match;
                                return isBlock ? (
                                    <CodeBlock
                                        language={match[1]}
                                        value={String(children).replace(/\n$/, '')}
                                        theme={theme}
                                    />
                                ) : (
                                    <code 
                                        className="bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-1 rounded-md text-sm font-mono before:content-[''] after:content-['']"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
                 {!isUser && message.content && (
                    <button onClick={handleCopy} className="absolute -top-2 -right-2 p-1.5 bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                 )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white shadow-md">
                    {settings.userAvatar ? (
                        <img src={settings.userAvatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} />
                    )}
                </div>
            )}
        </div>
    );
};

const WelcomeMessage: React.FC = () => {
    const { settings } = useSettings();
    return (
        <div className="text-center p-8 text-gray-600 dark:text-gray-400">
            <div className="w-20 h-20 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Bot size={48} className="text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold mb-2 text-emerald-900 dark:text-emerald-50">Welcome to Our Nexus</h2>
            <p className="mb-1 text-lg font-medium text-emerald-700 dark:text-emerald-300">Hello, {settings.userName || 'User'}</p>
            <p className="mb-4 text-sm text-emerald-600/60 dark:text-emerald-400/40 italic">Founded by ABDUL MAJID</p>
            <p className="text-gray-500 dark:text-gray-400">Select a model from the top right and start a conversation.</p>
        </div>
    );
};


export default ChatScreen;
