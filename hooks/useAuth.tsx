import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateHandle } from '@/utils/handleGenerator';

interface User {
  id: string;
  email: string;
  phoneNumber: string;
  handle: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('postsy_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('postsy_user');
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists in localStorage
    const existingUser = localStorage.getItem(`postsy_user_${email}`);
    let userData: User;
    
    if (existingUser) {
      userData = JSON.parse(existingUser);
    } else {
      // Create new user data with generated handle
      userData = {
        id: Date.now().toString(),
        email: email,
        phoneNumber: '+1234567890',
        handle: generateHandle(),
      };
      localStorage.setItem(`postsy_user_${email}`, JSON.stringify(userData));
    }
    
    localStorage.setItem('postsy_user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (email: string, phoneNumber: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create user data with generated handle
    const userData: User = {
      id: Date.now().toString(),
      email: email,
      phoneNumber: phoneNumber,
      handle: generateHandle(),
    };
    
    // Save user data
    localStorage.setItem(`postsy_user_${email}`, JSON.stringify(userData));
    localStorage.setItem('postsy_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem('postsy_user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}