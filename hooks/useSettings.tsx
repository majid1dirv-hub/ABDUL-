
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  defaultModel: string;
  autoScroll: boolean;
  fontSize: 'small' | 'medium' | 'large';
  customInstructions: string;
  userName: string;
  userEmail: string;
  userBio: string;
  userAvatar: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  defaultModel: 'gemini-3-flash-preview',
  autoScroll: true,
  fontSize: 'medium',
  customInstructions: '',
  userName: 'Abdul Majid',
  userEmail: 'majid1dir.v@gmail.com',
  userBio: 'CEO and Founder of OUR NEXUS. Hafiz Quran from Pakistan, KPK, District Upper Dir.',
  userAvatar: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('nexus_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('nexus_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
