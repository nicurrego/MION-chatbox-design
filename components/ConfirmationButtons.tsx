import React from 'react';

interface ConfirmationButtonsProps {
  onConfirm: () => void;
  onReject: () => void;
}

const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({ onConfirm, onReject }) => {
  return (
    <div className="flex gap-4 justify-center items-center py-4 animate-fadeIn">
      <button
        onClick={onConfirm}
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
      >
        ✓ Yes, create my onsen
      </button>
      <button
        onClick={onReject}
        className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        ✗ No, I want to change something
      </button>
    </div>
  );
};

export default ConfirmationButtons;

