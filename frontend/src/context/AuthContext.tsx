'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  AuthToken,
  UserRegisterRequest,
  UserLoginRequest,
  UserProfileUpdateRequest,
} from '../../../shared/types';
import {
  fetchDemoPersonas,
  switchDemoPersona,
  registerUser,
  loginUser,
  fetchCurrentUser,
  updateUserProfile,
} from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  personas: User[];
  isLoading: boolean;
  error: string | null;
  switchPersona: (personaId: string) => Promise<void>;
  login: (req: UserLoginRequest) => Promise<void>;
  register: (req: UserRegisterRequest) => Promise<void>;
  updateProfile: (req: UserProfileUpdateRequest) => Promise<void>;
  logout: () => void;
  refreshPersonas: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'roomieops_auth_token';
const USER_STORAGE_KEY = 'roomieops_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [personas, setPersonas] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPersonas = useCallback(async () => {
    try {
      const demoList = await fetchDemoPersonas();
      setPersonas(demoList);
      return demoList;
    } catch (err) {
      console.error('Failed to load demo personas:', err);
      return [];
    }
  }, []);

  // Initialize session from localStorage or seed with default persona
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const demoList = await refreshPersonas();
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken && storedUserJson) {
          try {
            const user = JSON.parse(storedUserJson);
            setToken(storedToken);
            setCurrentUser(user);
            // Verify token in background
            fetchCurrentUser(storedToken)
              .then((freshUser) => {
                setCurrentUser(freshUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
              })
              .catch(() => {
                // If token invalid, fallback to default persona
                if (demoList.length > 0) {
                  switchPersona(demoList[0].id);
                }
              });
          } catch {
            if (demoList.length > 0) {
              await switchPersona(demoList[0].id);
            }
          }
        } else if (demoList.length > 0) {
          // Default to Alex Chen for instant zero-config experience
          await switchPersona(demoList[0].id);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshPersonas]);

  const switchPersona = async (personaId: string) => {
    setError(null);
    try {
      const auth = await switchDemoPersona(personaId);
      setToken(auth.access_token);
      setCurrentUser(auth.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
    } catch (err: any) {
      setError(err.message || 'Failed to switch persona');
      throw err;
    }
  };

  const login = async (req: UserLoginRequest) => {
    setError(null);
    try {
      const auth = await loginUser(req);
      setToken(auth.access_token);
      setCurrentUser(auth.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (req: UserRegisterRequest) => {
    setError(null);
    try {
      const auth = await registerUser(req);
      setToken(auth.access_token);
      setCurrentUser(auth.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
      await refreshPersonas();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateProfile = async (req: UserProfileUpdateRequest) => {
    if (!token) throw new Error('Not authenticated');
    setError(null);
    try {
      const updated = await updateUserProfile(req, token);
      setCurrentUser(updated);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      await refreshPersonas();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Switch to first persona if available
    if (personas.length > 0) {
      switchPersona(personas[0].id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        personas,
        isLoading,
        error,
        switchPersona,
        login,
        register,
        updateProfile,
        logout,
        refreshPersonas,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
