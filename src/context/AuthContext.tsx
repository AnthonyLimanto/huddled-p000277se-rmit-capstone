import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { supabase } from "../api/supabase";
import { Text } from 'react-native';

export interface User {
  id: string;
  email?: string; 
  [key: string]: any; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({user: null, isLoading: true, signOut: async () => {}});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check the current session on app load
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    };

    fetchUser();

    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, signOut }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <Text>Loading</Text>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};