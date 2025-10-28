
import React, { useState, useEffect } from 'react';

const InfoBox: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-4 flex items-center justify-end text-white text-right">
      <div>
        <div className="text-5xl md:text-7xl" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}>
          {formattedTime}
        </div>
        <div className="text-2xl md:text-3xl text-cyan-200">
          ☀️ 27°
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
