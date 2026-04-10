
import React, { useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { AVAILABLE_MODELS } from '../constants';
import { Save, User, Shield, Cpu, Palette, Bell, Camera, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openAccordion, setOpenAccordion] = React.useState<string | null>('profile');

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ userAvatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white/50 dark:bg-black/20 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-emerald-900 dark:text-emerald-50 mb-2">Settings</h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/40">Configure your Our Nexus experience</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation */}
          <div className="space-y-2">
            <SettingsNavButton icon={<User size={20} />} label="General" active />
            <SettingsNavButton icon={<Cpu size={20} />} label="AI Models" />
            <SettingsNavButton icon={<Shield size={20} />} label="Security & API" />
            <SettingsNavButton icon={<Bell size={20} />} label="Notifications" />
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/40 dark:bg-white/5 rounded-3xl border border-white/20 shadow-xl overflow-hidden">
              {/* Profile Accordion */}
              <AccordionItem 
                title="Profile Settings" 
                icon={<User size={20} />} 
                isOpen={openAccordion === 'profile'} 
                onToggle={() => setOpenAccordion(openAccordion === 'profile' ? null : 'profile')}
              >
                <div className="space-y-6 pt-2">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-600/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-inner">
                        {settings.userAvatar ? (
                          <img src={settings.userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={48} className="text-emerald-600/50" />
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                      >
                        <Camera size={16} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-50">Profile Picture</p>
                      <p className="text-xs text-emerald-800/50 dark:text-emerald-100/30">JPG, PNG or GIF. Max 1MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-900/70 dark:text-emerald-100/60 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.userName}
                        onChange={(e) => updateSettings({ userName: e.target.value })}
                        className="w-full bg-white/50 dark:bg-black/30 border border-emerald-500/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-emerald-900 dark:text-emerald-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-900/70 dark:text-emerald-100/60 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.userEmail}
                        onChange={(e) => updateSettings({ userEmail: e.target.value })}
                        className="w-full bg-white/50 dark:bg-black/30 border border-emerald-500/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-emerald-900 dark:text-emerald-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900/70 dark:text-emerald-100/60 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={settings.userBio}
                      onChange={(e) => updateSettings({ userBio: e.target.value })}
                      className="w-full bg-white/50 dark:bg-black/30 border border-emerald-500/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-emerald-900 dark:text-emerald-50 min-h-[100px] resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </AccordionItem>

              {/* AI Preferences Accordion */}
              <AccordionItem 
                title="AI Preferences" 
                icon={<Cpu size={20} />} 
                isOpen={openAccordion === 'ai'} 
                onToggle={() => setOpenAccordion(openAccordion === 'ai' ? null : 'ai')}
              >
                <div className="space-y-6 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900/70 dark:text-emerald-100/60 mb-2">
                      Default AI Model
                    </label>
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => updateSettings({ defaultModel: e.target.value })}
                      className="w-full bg-white/50 dark:bg-black/30 border border-emerald-500/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-emerald-900 dark:text-emerald-50"
                    >
                      {AVAILABLE_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-emerald-800/50 dark:text-emerald-100/30">
                      This model will be selected by default when you start a new chat.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-50">Auto-scroll to bottom</p>
                      <p className="text-xs text-emerald-800/50 dark:text-emerald-100/30">Automatically scroll when new messages arrive</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoScroll ? 'bg-emerald-600' : 'bg-gray-400'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoScroll ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900/70 dark:text-emerald-100/60 mb-2">
                      Custom Instructions
                    </label>
                    <textarea
                      value={settings.customInstructions}
                      onChange={(e) => updateSettings({ customInstructions: e.target.value })}
                      placeholder="e.g. 'Always answer in a professional tone' or 'Keep responses concise'"
                      className="w-full bg-white/50 dark:bg-black/30 border border-emerald-500/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-emerald-900 dark:text-emerald-50 min-h-[120px] resize-none"
                    />
                    <p className="mt-2 text-xs text-emerald-800/50 dark:text-emerald-100/30">
                      These instructions will be added to every AI interaction to guide its behavior.
                    </p>
                  </div>
                </div>
              </AccordionItem>
            </div>

            {/* API Management Placeholder */}
            <section className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-white/20 shadow-xl opacity-60">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-500/20 rounded-xl text-gray-600">
                  <Shield size={24} />
                </div>
                <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50">API Management</h2>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  API Key management is currently handled via the platform settings. Custom key injection will be available in a future update.
                </p>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all">
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border-b border-white/10 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 hover:bg-emerald-600/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-emerald-600">{icon}</div>
        <span className="text-lg font-bold text-emerald-900 dark:text-emerald-50">{title}</span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-emerald-600/50"
      >
        <ChevronDown size={20} />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface SettingsNavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SettingsNavButton: React.FC<SettingsNavButtonProps> = ({ icon, label, active = false }) => (
  <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all ${
    active 
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
      : 'text-emerald-900/70 dark:text-emerald-100/60 hover:bg-emerald-600/10 dark:hover:bg-emerald-400/10'
  }`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default SettingsScreen;
