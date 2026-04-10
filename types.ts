
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string; // base64 encoded image
}

export enum AIProvider {
  GEMINI = 'Google Gemini',
  OPENAI = 'OpenAI (Mock)',
  GROQ = 'Groq (Mock)',
  CLAUDE = 'Claude (Mock)',
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export enum AppMode {
  CHAT = 'CHAT',
  APP_BUILDER = 'APP_BUILDER',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}
