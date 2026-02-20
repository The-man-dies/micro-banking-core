import React, { useEffect, useRef } from 'react';
import useAuthStore from './useAuthStore';
import api from '../../services/api-client'; // Import the api-client

const INACTIVITY_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds
const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000; // Refresh if token expires in next 5 minutes

interface AuthStatusResponse {
  status: string; // e.g., 'valid', 'expired'
  expiresAt: string; // ISO string
}

const AuthManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, lastActivity, updateActivity, refreshSession, logout } = useAuthStore();
  const activityTimerRef = useRef<number | undefined>(undefined);

  // --- User Activity Monitoring ---
  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    // Listen to mouse, keyboard, and click events
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('click', handleActivity);

    // Initial activity update
    updateActivity();

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [updateActivity]);

  // --- Proactive Token Refresh ---
  useEffect(() => {
    let refreshInterval: number;

    const checkTokenAndRefresh = async () => {
      if (!isAuthenticated || !useAuthStore.getState().refreshToken) {
        return; // No authenticated session or refresh token
      }

      const now = Date.now();
      const isUserActive = (now - lastActivity) < INACTIVITY_THRESHOLD_MS;

      // Get session status from backend
      try {
        const authStatusResponse = await api<AuthStatusResponse>('/admin/status', { method: 'GET' });
        const expiresAt = new Date(authStatusResponse.expiresAt).getTime();
        const expiresInMs = expiresAt - now;

        if (expiresInMs < TOKEN_REFRESH_WINDOW_MS && isUserActive) {
          console.log('Access token near expiration and user is active. Attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.error('Failed to refresh session, logging out.');
            logout();
          }
        } else if (expiresInMs <= 0 && isUserActive) {
          // Token expired while active, attempt refresh immediately
          console.log('Access token expired and user is active. Attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.error('Failed to refresh session immediately after expiration, logging out.');
            logout();
          }
        } else if (expiresInMs <= 0 && !isUserActive) {
          // Token expired while inactive, allow natural logout (401 on next request)
          console.log('Access token expired and user is inactive. Allowing natural expiration.');
        } else {
          // Token is valid and not near expiration, or user is inactive
          console.log('Token is valid or user is inactive, no refresh needed yet.');
        }
      } catch (error) {
        console.error('Error checking token status:', error);
        // If /admin/status fails, it might be due to an expired token, leading to 401
        // The api-client interceptor should handle 401 for this, resulting in logout.
      }
    };

    // Start periodic check only if authenticated
    if (isAuthenticated) {
      refreshInterval = setInterval(checkTokenAndRefresh, REFRESH_CHECK_INTERVAL_MS) as unknown as number;
    }

    return () => {
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, lastActivity, refreshSession, logout]);

  return <>{children}</>;
};

export default AuthManager;