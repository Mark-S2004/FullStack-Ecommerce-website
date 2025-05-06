import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/auth/me');
        
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Not setting error here as this is a silent check
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      const message = 
        err.response?.data?.message || 
        'Registration failed. Please try again.';
      
      setError(message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('/api/auth/login', {
        email,
        password,
      });
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      const message = 
        err.response?.data?.message || 
        'Login failed. Please check your credentials.';
      
      setError(message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await axios.get('/api/auth/logout');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      const message = 
        err.response?.data?.message || 
        'Logout failed. Please try again.';
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 