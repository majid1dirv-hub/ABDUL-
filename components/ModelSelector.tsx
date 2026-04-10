import React from 'react';
import { AIModel, AIProvider } from '../types';
import { AVAILABLE_MODELS } from '../constants';

interface ModelSelectorProps {
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
    return (
        <select
            value={selectedModel.id}
            onChange={(e) => {
                const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
                if(model) onModelChange(model);
            }}
            className="bg-white/50 dark:bg-black/50 text-gray-800 dark:text-gray-200 rounded-md py-2 px-3 border border-transparent focus:border-emerald-500 focus:ring-0"
        >
            {Object.values(AIProvider).map(provider => (
                <optgroup label={provider} key={provider}>
                    {AVAILABLE_MODELS.filter(m => m.provider === provider).map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                </optgroup>
            ))}
        </select>
    );
};
