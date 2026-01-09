
import { useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SocialUserMetadata {
  avatar_url?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  iss?: string;
  name?: string;
  picture?: string;
  provider_id?: string;
  sub?: string;
}

const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  let username = baseUsername;
  let counter = 1;

  while (true) {
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      if (!existingUser) {
        return username;
      }

      username = `${baseUsername}${counter}`;
      counter++;
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      // Return a fallback username if there's an error
      return `${baseUsername}${Math.floor(Math.random() * 10000)}`;
    }
  }
};

export const useAutoProfileSetup = (user: User | null) => {
  const { toast } = useToast();
  const hasRunRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent multiple executions for the same user
    if (!user || (hasRunRef.current && currentUserIdRef.current === user.id)) return;

    // Reset if user changed
    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      hasRunRef.current = false;
    }

    const setupUserProfile = async () => {
      try {


        // Mark as running
        hasRunRef.current = true;
        currentUserIdRef.current = user.id;

        // Check if profile already has data
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username, height_cm, current_weight_kg')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors



        const metadata = user.user_metadata as SocialUserMetadata;
        const isGoogleUser = metadata.provider_id?.includes('google') || user.app_metadata?.provider === 'google';
        const isAppleUser = metadata.provider_id?.includes('apple') || user.app_metadata?.provider === 'apple';



        let fullName = '';
        let avatarUrl = '';
        let baseUsername = '';

        if (isGoogleUser) {
          // Extract Google data - try multiple possible fields
          fullName = metadata.full_name || metadata.name || '';

          // Try different avatar URL fields from Google
          avatarUrl = metadata.avatar_url || metadata.picture || '';



          if (fullName) {
            baseUsername = fullName.toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[^a-z0-9]/g, '')
              .substring(0, 15);
          }
        } else if (isAppleUser) {
          // Apple typically returns name only once and no avatar
          fullName = metadata.full_name || metadata.name || '';

          // If no name, derive from email if present
          if (!fullName && user.email) {
            const emailPart = user.email.split('@')[0];
            fullName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
          }

          if (fullName) {
            baseUsername = fullName.toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[^a-z0-9]/g, '')
              .substring(0, 15);
          }
          // Apple does not provide avatar_url
          avatarUrl = '';

        }

        // If no name from Google or not a Google user, use email
        if (!fullName && user.email) {
          const emailPart = user.email.split('@')[0];
          fullName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
        }

        // Generate username from email if not set
        if (!baseUsername && user.email) {
          baseUsername = user.email.split('@')[0].toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);
        }

        // Ensure we have at least something
        if (!baseUsername) {
          baseUsername = `user${Math.floor(Math.random() * 10000)}`;
        }

        // Prepare updates - always update missing fields
        const updates: any = {};

        if (!existingProfile?.full_name && fullName) {
          updates.full_name = fullName;
        }
        if (!existingProfile?.avatar_url && avatarUrl) {
          updates.avatar_url = avatarUrl;

        }
        if (!existingProfile?.username) {
          // Generate unique username
          const uniqueUsername = await generateUniqueUsername(baseUsername);
          updates.username = uniqueUsername;
        }



        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) {
            console.error('Error updating profile with auto data:', error);
          } else {

          }
        }

        // Check if this is a Google user who might have onboarding data pending
        if (isGoogleUser && (!existingProfile?.height_cm || !existingProfile?.current_weight_kg)) {


          // Check localStorage for onboarding data (this might exist if the flow was interrupted)
          try {
            const pendingDataStr = localStorage.getItem('gatofit_google_auth_pending');
            const regularDataStr = localStorage.getItem('gatofit_onboarding_data');

            if (pendingDataStr || regularDataStr) {

              // Removed toast to reduce noise during login
            }
          } catch (storageError) {

          }
        }

      } catch (error) {
        console.error('Error in auto profile setup:', error);
      }
    };

    setupUserProfile();

    // Cleanup function to reset the ref when user changes
    return () => {
      if (user?.id !== currentUserIdRef.current) {
        hasRunRef.current = false;
        currentUserIdRef.current = null;
      }
    };
  }, [user?.id, toast]); // Only depend on user.id and toast
};
