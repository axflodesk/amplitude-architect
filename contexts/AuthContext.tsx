import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getAuthFromStorage, saveAuthToStorage, clearAuthFromStorage, validatePasscode } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const authState = getAuthFromStorage();
    if (authState && authState.authenticated) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (passcode: string): boolean => {
    if (validatePasscode(passcode)) {
      saveAuthToStorage();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    clearAuthFromStorage();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
