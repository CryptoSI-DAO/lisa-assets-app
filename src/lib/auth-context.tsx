"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  tokenBalance: number;
  isAdmin: boolean;
  refreshBalance: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  async function refreshBalance() {
    if (!session?.user) return;
    try {
      const { data } = await supabase
        .from("user_accounts")
        .select("token_balance, is_admin")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setTokenBalance(data.token_balance ?? 0);
        setIsAdmin(data.is_admin ?? false);
      }
    } catch {
      // Table might not exist yet — stay at defaults
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .catch(() => {
        /* env not configured — stay signed out */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (!newSession) {
          setTokenBalance(0);
          setIsAdmin(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch balance whenever session changes
  useEffect(() => {
    if (session?.user) {
      refreshBalance();
    } else {
      setTokenBalance(0);
      setIsAdmin(false);
    }
  }, [session?.user?.id]);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  const value: AuthContextValue = {
    user,
    session,
    loading,
    tokenBalance,
    isAdmin,
    refreshBalance,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
