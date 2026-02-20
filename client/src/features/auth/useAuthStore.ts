import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../../services/api-client'; // Import the api-client

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  lastActivity: number;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  updateActivity: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  getSessionStatus: () => Promise<{ expiresAt: string; status: string } | null>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      lastActivity: Date.now(),
      isAuthenticated: false,

      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },
      setRefreshToken: (token) => {
        set({ refreshToken: token });
      },
      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },
      logout: async () => {
        const currentRefreshToken = get().refreshToken;
        set({ accessToken: null, refreshToken: null, isAuthenticated: false, lastActivity: Date.now() });
        // Call backend logout endpoint
        if (currentRefreshToken) {
          try {
            await api('/admin/logout', { method: 'POST', data: { refreshToken: currentRefreshToken } });
          } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, handle error, but still clear local state
          }
        }
        window.location.href = "/login"; // Redirect to login page
      },
      refreshSession: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await api('/admin/refresh', {
            method: 'POST',
            data: { refreshToken: currentRefreshToken },
          });

          if (response.accessToken && response.refreshToken) {
            set({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              lastActivity: Date.now(), // Refreshing token counts as activity
            });
            return true;
          } else {
            // Invalid response from refresh, force logout
            get().logout();
            return false;
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          get().logout(); // Force logout on refresh failure
          return false;
        }
      },
      getSessionStatus: async () => {
        const currentAccessToken = get().accessToken;
        if (!currentAccessToken) {
          return null;
        }
        try {
          const response = await api('/admin/status', { method: 'GET' });
          if (response.status && response.expiresAt) {
            return { status: response.status, expiresAt: response.expiresAt };
          }
          return null;
        } catch (error) {
          console.error('Failed to get session status:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage
      partialize: (state) => ({ refreshToken: state.refreshToken }), // ONLY persist refreshToken
    },
  ),
);

export default useAuthStore;
