import React from 'react';

interface ImageSelectionModalProps {
    images: string[];
    onSelect: (selectedImageUrl: string) => void;
    onClose: () => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ images, onSelect, onClose }) => {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.3s ease-out; }
            `}</style>
            <div
                className="bg-slate-900/80 rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-6 w-11/12 max-w-4xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="modal-title" className="text-3xl text-cyan-200 text-center mb-6">Choose a modification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.map((imageSrc, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <button
                                onClick={() => onSelect(imageSrc)}
                                className="relative w-full aspect-[9/16] overflow-hidden rounded-lg group focus:outline-none focus:ring-4 focus:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-slate-900"
                                aria-label={`Select modification ${index + 1}`}
                            >
                                <img
                                    src={imageSrc}
                                    alt={`Generated variation ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="text-white text-2xl font-bold bg-black/50 px-4 py-2 rounded-md">SELECT</span>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-6">
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors text-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageSelectionModal;
