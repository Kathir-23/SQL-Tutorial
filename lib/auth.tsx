'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';

export interface User {
  id: string;
  email: string;
  certificateName: string;
  nameEditCredits: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signup: (email: string, pass: string, certificateName: string) => { success: boolean; error?: string };
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateCertificateName: (newName: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'sql-mastery-users-db';
const SESSION_KEY = 'sql-mastery-active-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, startTransition] = useTransition();

  // Hydrate active session on client mount
  useEffect(() => {
    try {
      const activeEmail = localStorage.getItem(SESSION_KEY);
      if (activeEmail) {
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        if (usersRaw) {
          const users: Record<string, User & { pass: string }> = JSON.parse(usersRaw);
          if (users[activeEmail.toLowerCase()]) {
            const { pass, ...userData } = users[activeEmail.toLowerCase()];
            void pass;
            startTransition(() => {
              setUser(userData);
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
    }
  }, []);

  const signup = (email: string, pass: string, certificateName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = certificateName.trim();

    if (!cleanEmail || !pass || !cleanName) {
      return { success: false, error: 'All fields are required.' };
    }

    try {
      const usersRaw = localStorage.getItem(USERS_DB_KEY);
      const users: Record<string, User & { pass: string }> = usersRaw ? JSON.parse(usersRaw) : {};

      if (users[cleanEmail]) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newUser: User = {
        id: `USR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        email: cleanEmail,
        certificateName: cleanName,
        nameEditCredits: 1, // Granted 1 free correction credit
        createdAt: new Date().toISOString(),
      };

      users[cleanEmail] = { ...newUser, pass };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, cleanEmail);
      setUser(newUser);

      return { success: true };
    } catch {
      return { success: false, error: 'Storage error. Please try again.' };
    }
  };

  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const usersRaw = localStorage.getItem(USERS_DB_KEY);
      if (!usersRaw) return { success: false, error: 'Invalid email or password.' };

      const users: Record<string, User & { pass: string }> = JSON.parse(usersRaw);
      const existing = users[cleanEmail];

      if (!existing || existing.pass !== pass) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const { pass: _, ...userData } = existing;
      void _;
      localStorage.setItem(SESSION_KEY, cleanEmail);
      setUser(userData);
      return { success: true };
    } catch {
      return { success: false, error: 'Authentication error.' };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateCertificateName = (newName: string) => {
    if (!user) return { success: false, error: 'Not logged in.' };
    const cleanName = newName.trim();
    if (!cleanName) return { success: false, error: 'Name cannot be blank.' };
    if (user.nameEditCredits <= 0) {
      return { success: false, error: 'No name correction credits remaining.' };
    }

    try {
      const usersRaw = localStorage.getItem(USERS_DB_KEY);
      if (!usersRaw) return { success: false, error: 'User database error.' };

      const users: Record<string, User & { pass: string }> = JSON.parse(usersRaw);
      const existing = users[user.email];

      if (!existing) return { success: false, error: 'User not found.' };

      const updatedUser: User = {
        ...user,
        certificateName: cleanName,
        nameEditCredits: user.nameEditCredits - 1, // Deduct 1 credit
      };

      users[user.email] = { ...existing, ...updatedUser };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      setUser(updatedUser);

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update name.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        updateCertificateName,
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
