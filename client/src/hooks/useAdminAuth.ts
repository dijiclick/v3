import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'admin123'; // Simple password for demo
const ADMIN_SESSION_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated on load
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(stored === 'true');
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}