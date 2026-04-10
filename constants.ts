
import { AIModel, AIProvider } from './types';

export const AVAILABLE_MODELS: AIModel[] = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 1.5 Flash', provider: AIProvider.GEMINI },
  { id: 'gemini-3-pro-preview', name: 'Gemini 1.5 Pro', provider: AIProvider.GEMINI },
  { id: 'gpt-4o', name: 'GPT-4o', provider: AIProvider.OPENAI },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: AIProvider.OPENAI },
  { id: 'llama3-70b-8192', name: 'LLaMA3 70b', provider: AIProvider.GROQ },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7b', provider: AIProvider.GROQ },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: AIProvider.CLAUDE },
];
