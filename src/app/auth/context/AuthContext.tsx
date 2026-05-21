import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearTokens, setTokens } from "@/shared/lib/apiClient.ts";
import { login as apiLogin, logout as apiLogout, signup as apiSignup } from "../../../api/auth/authApi.ts";
import type { User } from "../../user/types/user.types.ts";
import type { LoginRequest, SignupRequest } from "../types/auth.types.ts";
import {getMe} from "@/api/user/userApi.ts";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchUser() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function login(data: LoginRequest) {
    const res = await apiLogin(data);
    setTokens(res.accessToken, res.refreshToken);
    const me = await getMe();
    setUser(me);
  }

  async function signup(data: SignupRequest) {
    await apiSignup(data);
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  async function refreshUser() {
    const me = await getMe();
    setUser(me);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
