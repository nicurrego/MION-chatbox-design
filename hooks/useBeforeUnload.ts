import { useEffect, useCallback } from 'react';

interface UseBeforeUnloadOptions {
  isDirty: boolean;
  onConfirmLeave?: () => void;
  onCancelLeave?: () => void;
}

/**
 * Custom hook to handle beforeunload events and mobile back button presses
 * Shows a confirmation dialog when user tries to leave the app with unsaved progress
 */
export const useBeforeUnload = ({ isDirty, onConfirmLeave, onCancelLeave }: UseBeforeUnloadOptions) => {
  // Handle browser beforeunload event (closing tab, navigating away, etc.)
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle mobile back button (Android)
  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = (e: PopStateEvent) => {
      // Push a new state to prevent actual navigation
      window.history.pushState(null, '', window.location.href);
    };

    // Push initial state to enable back button interception
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty]);
};

