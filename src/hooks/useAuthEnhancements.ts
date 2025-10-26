import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthEnhancements = () => {
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { toast } = useToast();

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Try to sign in with a dummy password to check if email exists
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-password-that-will-fail'
      });

      if (error) {
        // If error is "Invalid login credentials", email exists but password is wrong
        // If error is "Email not confirmed", email exists but not confirmed
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('Invalid email')) {
          return true;
        }
        return false;
      }
      
      // If no error, email exists and password worked (shouldn't happen with dummy password)
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleGoogleSignInWithEmailCheck = async () => {
    setIsCheckingEmail(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: 'Error signing in with Google',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error signing in with Google',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleManualSignUpWithEmailCheck = async (
    email: string, 
    password: string, 
    fullName: string
  ) => {
    setIsCheckingEmail(true);
    
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      
      if (emailExists) {
        toast({
          title: 'Account Already Exists',
          description: 'An account with this email already exists. Please sign in instead.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: 'Error signing up',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      } else {
        toast({
          title: 'Account Created!',
          description: 'Please check your email and click the confirmation link to activate your account.',
        });
        return true;
      }
    } catch (error) {
      toast({
        title: 'Error signing up',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return {
    isCheckingEmail,
    checkEmailExists,
    handleGoogleSignInWithEmailCheck,
    handleManualSignUpWithEmailCheck,
  };
};
