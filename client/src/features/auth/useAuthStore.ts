import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "../../services/api-client"; // Import the api-client

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface RefreshResponseData {
  accessToken: string;
}

interface SessionStatusData {
  user: {
    id: number;
    username: string;
  };
  expiresAt: string;
  expiresIn: number;
}

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
  getSessionStatus: () => Promise<{
    expiresAt: string;
    expiresIn: number;
  } | null>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      lastActivity: Date.now(),
      isAuthenticated: false,

      setAccessToken: (token: string | null) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },
      setRefreshToken: (token: string | null) => {
        set({ refreshToken: token });
      },
      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },
      logout: async () => {
        const currentRefreshToken = get().refreshToken;
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          lastActivity: Date.now(),
        });
        // Call backend logout endpoint
        if (currentRefreshToken) {
          try {
            await api("/admin/logout", {
              method: "POST",
              data: { token: currentRefreshToken },
            });
          } catch (error) {
            console.error("Logout failed:", error);
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
          const response = await api<ApiEnvelope<RefreshResponseData>>(
            "/admin/refresh",
            {
              method: "POST",
              data: { token: currentRefreshToken },
              trackActivity: false,
            },
          );

          if (response.data?.accessToken) {
            set({
              accessToken: response.data.accessToken,
              // Backend refresh returns only accessToken, so keep existing refreshToken.
              refreshToken: currentRefreshToken,
              isAuthenticated: true,
              lastActivity: Date.now(),
            });
            return true;
          } else {
            // Invalid response from refresh, force logout
            get().logout();
            return false;
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
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
          const response = await api<ApiEnvelope<SessionStatusData>>(
            "/admin/status",
            { method: "GET", trackActivity: false },
          );
          if (
            response.data?.expiresAt &&
            typeof response.data.expiresIn === "number"
          ) {
            return {
              expiresAt: response.data.expiresAt,
              expiresIn: response.data.expiresIn,
            };
          }
          return null;
        } catch (error) {
          console.error("Failed to get session status:", error);
          return null;
        }
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage
      partialize: (state) => ({ refreshToken: state.refreshToken }), // ONLY persist refreshToken
    },
  ),
);

export default useAuthStore;
