'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { CustomInput } from '@/components/ui/custom-input';
import { toast } from 'sonner';

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('AdminAuthCheck: Loading timeout, showing login form');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkAdminStatus(session.user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAuth]);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Admin check error:', error);
        setIsAdmin(false);
        return;
      }

      console.log('Admin check result:', { data, isAdmin: !!data });
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Admin status check error:', error);
      setIsAdmin(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (loading || (user && isAdmin === null)) {
    console.log('AdminAuthCheck: Still loading', { loading, user: !!user, isAdmin });
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-sm border border-[#7303c0] rounded-lg p-8">
          <h1 className="text-2xl font-orbitron text-center mb-8 gradient-text">
            Admin Login
          </h1>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <CustomInput
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-[#7303c0] text-white"
              required
            />
            
            <CustomInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-[#7303c0] text-white"
              required
            />
            
            <Button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-[#7303c0] hover:bg-[#928dab] text-white"
            >
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-sm border border-red-500 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-orbitron mb-4 text-red-400">
            Access Denied
          </h1>
          <p className="text-[#928dab] mb-6">
            You don&apos;t have admin privileges to access this page.
          </p>
          <Button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

