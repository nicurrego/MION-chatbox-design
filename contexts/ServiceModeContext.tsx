import React, { createContext, useContext, useState, useEffect } from 'react';

interface ServiceModeContextType {
  useMockService: boolean;
  setUseMockService: (value: boolean) => void;
}

const ServiceModeContext = createContext<ServiceModeContextType | undefined>(undefined);

export const ServiceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage (defaults to false - Real API)
  const [useMockService, setUseMockServiceState] = useState<boolean>(() => {
    const stored = localStorage.getItem('useMockService');
    return stored === 'true'; // Defaults to false if not set
  });

  // Update localStorage whenever the value changes
  const setUseMockService = (value: boolean) => {
    setUseMockServiceState(value);
    localStorage.setItem('useMockService', String(value));
  };

  return (
    <ServiceModeContext.Provider value={{ useMockService, setUseMockService }}>
      {children}
    </ServiceModeContext.Provider>
  );
};

export const useServiceMode = () => {
  const context = useContext(ServiceModeContext);
  if (!context) {
    throw new Error('useServiceMode must be used within ServiceModeProvider');
  }
  return context;
};

