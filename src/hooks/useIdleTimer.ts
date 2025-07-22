import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';

const IDLE_TIME = 10 * 60 * 1000; // 10 minutos em milliseconds

export function useIdleTimer() {
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Limpa o timer anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timer if user is authenticated
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Sessão expirada por inatividade - fazendo logout automático');
        logout();
        // ProtectedRoute will handle redirect automatically
      }, IDLE_TIME);

      console.log('🔄 Timer de inatividade resetado - 10 minutos restantes');
    }
  }, [logout, isAuthenticated]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timer when user is not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'blur'
    ];

    // Start timer when user becomes authenticated
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, handleActivity, resetTimer]);

  // Return activity status for debugging
  return {
    lastActivity: lastActivityRef.current,
    resetTimer,
  };
}
