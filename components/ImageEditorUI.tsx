import React, { useState } from 'react';

// --- Icons ---
const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const VideoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
    </svg>
);


interface ImageEditorUIProps {
    onEdit: (prompt: string) => void;
    onGenerateVideo: () => void;
    isLoadingEdit: boolean;
    isReadyForVideo: boolean;
}

const ImageEditorUI: React.FC<ImageEditorUIProps> = ({ onEdit, onGenerateVideo, isLoadingEdit, isReadyForVideo }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoadingEdit) {
            onEdit(prompt);
            setPrompt('');
        }
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4 animate-slideUp">
             <style>{`
                @keyframes slideUp { from { transform: translateY(100px) translateX(-50%); opacity: 0; } to { transform: translateY(0) translateX(-50%); opacity: 1; } }
                .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
            `}</style>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-3 flex flex-col sm:flex-row items-center gap-3">
                <form onSubmit={handleSubmit} className="flex-grow w-full sm:w-auto">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe a change... (e.g., add cherry blossoms)"
                        disabled={isLoadingEdit}
                        className="w-full bg-slate-800/50 text-white placeholder-cyan-300/70 border-0 focus:ring-2 focus:ring-cyan-400 rounded-md px-4 py-2 text-lg"
                        autoComplete="off"
                    />
                </form>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoadingEdit || !prompt.trim()}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EditIcon /> Modify
                    </button>
                    <button
                        onClick={onGenerateVideo}
                        disabled={isLoadingEdit || !isReadyForVideo}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <VideoIcon /> Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorUI;
