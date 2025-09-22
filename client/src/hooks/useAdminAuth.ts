import { useState, useEffect } from 'react';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/me', {
        credentials: 'include', // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated && data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } else {
        setIsAuthenticated(false);
        setCsrfToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setCsrfToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // Include cookies
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsAuthenticated(true);
        setCsrfToken(data.csrfToken);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCsrfToken(null);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    csrfToken,
    login,
    logout,
    checkAuthStatus,
  };
}