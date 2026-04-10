
import React, { useState, useMemo } from 'react';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { SettingsProvider } from './hooks/useSettings';
import ChatScreen from './components/ChatScreen';
import AppBuilderScreen from './components/AppBuilderScreen';
import SettingsScreen from './components/SettingsScreen';
import ChatHistoryScreen from './components/ChatHistoryScreen';
import { AppMode } from './types';
import { MessageSquare, Code, Sun, Moon, Settings as SettingsIcon, Menu, X, PlusCircle, History } from 'lucide-react';
import { useChatStore } from './hooks/useChatStore';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </ThemeProvider>
  );
};

const MainApp: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { setCurrentConversationId } = useChatStore();

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMode(AppMode.CHAT);
    setChatKey(prev => prev + 1);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setMode(AppMode.CHAT);
    setChatKey(prev => prev + 1); // Force remount to load new conversation
  };

  const renderedScreen = useMemo(() => {
    switch (mode) {
      case AppMode.CHAT:
        return <ChatScreen key={chatKey} />;
      case AppMode.APP_BUILDER:
        return <AppBuilderScreen />;
      case AppMode.SETTINGS:
        return <SettingsScreen />;
      case AppMode.HISTORY:
        return <ChatHistoryScreen onSelectConversation={handleSelectConversation} />;
      default:
        return <ChatScreen key={chatKey} />;
    }
  }, [mode, chatKey]);

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop')"}}>
      <div className="min-h-screen w-full flex bg-emerald-950/20 dark:bg-black/40 backdrop-blur-[2px] relative">
        
        {/* Mobile/Floating Menu Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 left-4 z-50 p-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-110 active:scale-95 md:hidden`}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <nav className={`fixed md:relative z-40 h-screen transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} flex flex-col bg-white/10 dark:bg-black/30 backdrop-blur-2xl border-r border-white/20 dark:border-white/5 shadow-2xl overflow-hidden`}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10 p-2">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2 rounded-xl shadow-lg shadow-emerald-500/30 ring-1 ring-white/20 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                        <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.606 4.014a8.251 8.251 0 0 1 4.788 0 8.25 8.25 0 0 1 3.515 3.515 8.251 8.251 0 0 1 0 4.788 8.25 8.25 0 0 1-3.515 3.515 8.251 8.251 0 0 1-4.788 0 8.25 8.25 0 0 1-3.515-3.515 8.251 8.251 0 0 1 0-4.788 8.25 8.25 0 0 1 3.515-3.515Z" />
                    </svg>
                </div>
              <h1 className={`text-xl font-extrabold text-emerald-900 dark:text-emerald-50 tracking-tight transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Our Nexus</h1>
              
              {/* Internal Toggle for Desktop */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex ml-auto p-1.5 hover:bg-emerald-600/10 rounded-lg text-emerald-800 dark:text-emerald-200 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
            
            <div className={`mb-4 px-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                <p className="text-xs font-bold text-emerald-800/50 dark:text-emerald-100/30 uppercase tracking-widest">Main Menu</p>
                <div className="h-px bg-emerald-500/10 my-2"></div>
            </div>

            <ul className="flex-1">
              <SidebarButton
                icon={<MessageSquare size={24} />}
                text="AI Chat"
                active={mode === AppMode.CHAT}
                onClick={() => setMode(AppMode.CHAT)}
                collapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<Code size={24} />}
                text="AI App Builder"
                active={mode === AppMode.APP_BUILDER}
                onClick={() => setMode(AppMode.APP_BUILDER)}
                collapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<History size={24} />}
                text="History"
                active={mode === AppMode.HISTORY}
                onClick={() => setMode(AppMode.HISTORY)}
                collapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<PlusCircle size={24} />}
                text="New Chat"
                onClick={handleNewChat}
                collapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<SettingsIcon size={24} />}
                text="Settings"
                active={mode === AppMode.SETTINGS}
                onClick={() => setMode(AppMode.SETTINGS)}
                collapsed={!isSidebarOpen}
              />
            </ul>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {renderedScreen}
        </main>
      </div>
    </div>
  );
};

interface SidebarButtonProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, text, active = false, onClick, collapsed = false }) => {
  const baseClasses = 'flex items-center w-full gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-300 group relative';
  const activeClasses = 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]';
  const inactiveClasses = 'text-emerald-900/70 dark:text-emerald-100/60 hover:bg-emerald-600/10 dark:hover:bg-emerald-400/10 hover:text-emerald-700 dark:hover:text-emerald-300';

  return (
    <li className="mb-2">
      <button 
        onClick={onClick} 
        className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? text : ''}
      >
        <div className="flex-shrink-0">{icon}</div>
        {!collapsed && <span className="hidden md:inline font-medium whitespace-nowrap">{text}</span>}
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-emerald-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            {text}
          </div>
        )}
      </button>
    </li>
  );
};

export default App;
