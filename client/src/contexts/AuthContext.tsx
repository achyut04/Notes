import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      setUser({ id: payload.userId, email: payload.email });
    }
    setIsLoading(false);
  }, []);

  const login = (authToken: string) => {
    localStorage.setItem("authToken", authToken);
    setToken(authToken);
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    setUser({ id: payload.userId, email: payload.email });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
