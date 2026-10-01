'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { supabase } from './supabase';

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
  signup: (email: string, pass: string, certificateName: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCertificateName: (newName: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'sql-mastery-users-db';
const SESSION_KEY = 'sql-mastery-active-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, startTransition] = useTransition();

  // Hydrate active session on client mount (Cloud Supabase first, LocalStorage fallback)
  useEffect(() => {
    async function restoreSession() {
      try {
        const activeEmail = localStorage.getItem(SESSION_KEY);
        if (!activeEmail) return;

        const cleanEmail = activeEmail.toLowerCase();

        // 1. Attempt Supabase Cloud fetch
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (data && !error) {
            const cloudUser: User = {
              id: data.id,
              email: data.email,
              certificateName: data.certificate_name,
              nameEditCredits: data.name_edit_credits ?? 1,
              createdAt: data.created_at,
            };
            startTransition(() => {
              setUser(cloudUser);
            });
            return;
          }
        } catch {
          // Fall back to LocalStorage if Supabase offline/unreachable
        }

        // 2. LocalStorage Fallback
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        if (usersRaw) {
          const users: Record<string, User & { pass: string }> = JSON.parse(usersRaw);
          if (users[cleanEmail]) {
            const { pass, ...userData } = users[cleanEmail];
            void pass;
            startTransition(() => {
              setUser(userData);
            });
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      }
    }

    restoreSession();
  }, []);

  const signup = async (email: string, pass: string, certificateName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = certificateName.trim();

    if (!cleanEmail || !pass || !cleanName) {
      return { success: false, error: 'All fields are required.' };
    }

    const newUser: User = {
      id: `USR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      email: cleanEmail,
      certificateName: cleanName,
      nameEditCredits: 1, // Granted 1 free correction credit
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Supabase Cloud DB
    try {
      // Check if email already exists in Supabase
      const { data: existingSupabaseUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingSupabaseUser) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const { error: insertError } = await supabase.from('users').insert({
        id: newUser.id,
        email: cleanEmail,
        password: pass,
        certificate_name: cleanName,
        name_edit_credits: 1,
        created_at: newUser.createdAt,
      });

      if (insertError) {
        console.warn('Supabase insert warning:', insertError.message);
      }
    } catch (err) {
      console.warn('Supabase offline during signup, using local fallback:', err);
    }

    // 2. Save to LocalStorage (Cache)
    try {
      const usersRaw = localStorage.getItem(USERS_DB_KEY);
      const users: Record<string, User & { pass: string }> = usersRaw ? JSON.parse(usersRaw) : {};

      if (users[cleanEmail]) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      users[cleanEmail] = { ...newUser, pass };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, cleanEmail);
      setUser(newUser);

      return { success: true };
    } catch {
      return { success: false, error: 'Storage error. Please try again.' };
    }
  };

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Cloud Login first
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data && !error) {
        if (data.password !== pass) {
          return { success: false, error: 'Invalid email or password.' };
        }

        const cloudUser: User = {
          id: data.id,
          email: data.email,
          certificateName: data.certificate_name,
          nameEditCredits: data.name_edit_credits ?? 1,
          createdAt: data.created_at,
        };

        // Cache session locally
        localStorage.setItem(SESSION_KEY, cleanEmail);
        setUser(cloudUser);
        return { success: true };
      }
    } catch (err) {
      console.warn('Supabase query failed during login, checking LocalStorage:', err);
    }

    // 2. Fallback to LocalStorage
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

  const updateCertificateName = async (newName: string) => {
    if (!user) return { success: false, error: 'Not logged in.' };
    const cleanName = newName.trim().toUpperCase();
    if (!cleanName) return { success: false, error: 'Name cannot be blank.' };
    if (user.nameEditCredits <= 0) {
      return { success: false, error: 'No name correction credits remaining.' };
    }

    const updatedUser: User = {
      ...user,
      certificateName: cleanName,
      nameEditCredits: user.nameEditCredits - 1, // Deduct 1 credit
    };

    // 1. Update Supabase Cloud DB
    try {
      await supabase
        .from('users')
        .update({
          certificate_name: cleanName,
          name_edit_credits: updatedUser.nameEditCredits,
        })
        .eq('id', user.id);
    } catch (err) {
      console.warn('Supabase update warning:', err);
    }

    // 2. Update LocalStorage
    try {
      const usersRaw = localStorage.getItem(USERS_DB_KEY);
      if (usersRaw) {
        const users: Record<string, User & { pass: string }> = JSON.parse(usersRaw);
        const existing = users[user.email];
        if (existing) {
          users[user.email] = { ...existing, ...updatedUser };
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }
      }
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
