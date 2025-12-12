import React from 'react';

interface ConfirmationButtonsProps {
  onConfirm: () => void;
  onReject: () => void;
  compact?: boolean; // For InfoBox widgets row
  mobile?: boolean; // For mobile InfoBox guidance text
}

const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({ onConfirm, onReject, compact = false, mobile = false }) => {
  if (mobile) {
    // Mobile version for InfoBox guidance text (very compact)
    return (
      <div className="flex gap-1.5 items-center justify-center animate-fadeIn w-full">
        <button
          onClick={onConfirm}
          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap"
        >
          ✓ Create
        </button>
        <button
          onClick={onReject}
          className="px-2.5 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold rounded transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
        >
          ✗ Change
        </button>
      </div>
    );
  }

  if (compact) {
    // Compact version for InfoBox widgets row
    return (
      <div className="flex gap-2 items-center animate-fadeIn">
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
        >
          ✓ Create
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          ✗ Change
        </button>
      </div>
    );
  }

  // Full version for ChatBox
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

