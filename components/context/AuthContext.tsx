"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  profile?: {
    primaryType: string;
    secondaryInterests: string;
    avatarUrl?: string;
    bio?: string;
    onboardingCompleted: boolean;
  };
  settings?: {
    theme: string;
    remindersEnabled: boolean;
    weeklySummaryEnabled: boolean;
  };
  gamification?: {
    totalXp: number;
    level: number;
    currentXpInLevel: number;
    nextLevelXp: number;
    progressToNextLevel: number;
    unlockedBadgesCount: number;
    maxCurrentStreak: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginDemo: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  loginDemo: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    if (!newUser.profile?.onboardingCompleted) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const loginDemo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Demo login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
