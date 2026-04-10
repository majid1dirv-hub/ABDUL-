import React, { useState, useCallback } from 'react';
import { generateCode } from '../services/aiService';
import { Bot, Wand2, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AIModel } from '../types';
import { AVAILABLE_MODELS } from '../constants';
import { ModelSelector } from './ModelSelector';
import { useSettings } from '../hooks/useSettings';

const AppBuilderScreen: React.FC = () => {
    const { settings } = useSettings();
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
        return AVAILABLE_MODELS.find(m => m.id === settings.defaultModel) || AVAILABLE_MODELS[0];
    });

    const handleGenerateCode = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setGeneratedCode('');
        try {
            const code = await generateCode(selectedModel, prompt, settings.customInstructions);
            const codeBlock = code.match(/```(?:tsx|typescript|jsx|javascript|html)\n([\s\S]*?)```/);
            setGeneratedCode(codeBlock ? codeBlock[1] : code);
        } catch (error: any) {
            console.error("Failed to generate code:", error);
            const errorString = typeof error === 'string' ? error : JSON.stringify(error);
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                setGeneratedCode("// ⚠️ Quota Exceeded: You've reached the limit for the Gemini API.\n// Please wait a moment or check your plan details at https://ai.google.dev/gemini-api/docs/rate-limits");
            } else {
                setGeneratedCode("// An error occurred while generating the code.\n// Please check the console for more details.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, selectedModel]);

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full p-4 gap-4 bg-transparent">
            {/* Header */}
            <header className="flex-shrink-0 flex justify-between items-center p-4 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                        <Wand2 className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50">AI App Builder</h2>
                        <p className="text-sm text-emerald-700/70 dark:text-emerald-300/60">Describe the component you want to build.</p>
                    </div>
                </div>
                <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                {/* Prompt Input */}
                <div className="md:w-1/3 flex flex-col gap-4">
                    <div className="flex-1 flex flex-col p-4 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-inner">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A login form with email, password, and a remember me checkbox'"
                            className="w-full h-full flex-1 bg-white/50 dark:bg-black/50 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 p-4 rounded-lg border-2 border-transparent focus:border-emerald-500 focus:ring-0 transition-colors resize-none"
                        />
                    </div>
                    <button
                        onClick={handleGenerateCode}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg p-4 disabled:bg-emerald-300 hover:bg-emerald-700 transition-all duration-200 font-bold text-lg shadow-lg shadow-emerald-500/20"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                             <>
                                <Wand2 size={20} /> Generate Code
                            </>
                        )}
                    </button>
                </div>

                {/* Code Display */}
                <div className="md:w-2/3 flex flex-col rounded-xl bg-black/50 backdrop-blur-lg border border-white/10 shadow-lg overflow-hidden relative">
                    {generatedCode ? (
                        <>
                            <button onClick={handleCopy} className="absolute top-4 right-4 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors z-10">
                                {hasCopied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                            <SyntaxHighlighter
                                language="tsx"
                                style={vscDarkPlus}
                                customStyle={{
                                    height: '100%',
                                    width: '100%',
                                    margin: 0,
                                    padding: '1.5rem',
                                    backgroundColor: 'transparent'
                                }}
                                codeTagProps={{
                                    style: {
                                        fontFamily: 'monospace'
                                    }
                                }}
                            >
                                {generatedCode}
                            </SyntaxHighlighter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                             <div className="w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center mb-6">
                                <Bot size={48} className="text-emerald-600" />
                             </div>
                            <h3 className="text-xl font-bold mb-2 text-emerald-50">Generated code will appear here</h3>
                            <p className="text-emerald-100/40">Enter a description on the left and click "Generate Code" to see the magic happen!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppBuilderScreen;