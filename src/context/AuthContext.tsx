import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext, type AuthContextValue } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function applyUser(nextUser: User | null) {
      if (!active) return;
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      if (!active) return;
      setIsAdmin(!error && data === true);
      setLoading(false);
    }

    void supabase.auth.getSession().then(({ data }) => applyUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Token refreshes can fire when a browser tab regains focus. Keeping the
      // route mounted prevents in-progress admin forms from losing local state.
      void applyUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  }), [user, isAdmin, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
