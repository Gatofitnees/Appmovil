import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CoachBranding, DEFAULT_GATOFIT_BRANDING } from '@/types/branding';
import { useAuth } from '@/contexts/AuthContext';

export const useCoachBranding = () => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<CoachBranding>(DEFAULT_GATOFIT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuperadminBranding = async (): Promise<CoachBranding> => {
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('company_name, banner_image_url, logo_image_url, ranking_image_url, primary_button_color, primary_button_fill_color')
          .eq('email', 'menasebas2006@gmail.com')
          .maybeSingle();

        if (data) {
          return {
            companyName: data.company_name || DEFAULT_GATOFIT_BRANDING.companyName,
            bannerImageUrl: data.banner_image_url || DEFAULT_GATOFIT_BRANDING.bannerImageUrl,
            logoImageUrl: data.logo_image_url || DEFAULT_GATOFIT_BRANDING.logoImageUrl,
            rankingImageUrl: data.ranking_image_url || DEFAULT_GATOFIT_BRANDING.rankingImageUrl,
            primaryButtonColor: data.primary_button_color || DEFAULT_GATOFIT_BRANDING.primaryButtonColor,
            primaryButtonFillColor: data.primary_button_fill_color || DEFAULT_GATOFIT_BRANDING.primaryButtonFillColor,
            hasCoach: false
          };
        }
      } catch (error) {
        console.error('Error fetching superadmin branding:', error);
      }
      return DEFAULT_GATOFIT_BRANDING;
    };

    const fetchCoachBranding = async () => {
      try {
        if (!user) {
          const superadminBranding = await fetchSuperadminBranding();
          setBranding(superadminBranding);
          setLoading(false);
          return;
        }

        // Primero verificar si el usuario ES un coach
        const { data: isCoach } = await supabase
          .from('admin_users')
          .select('company_name, banner_image_url, logo_image_url, ranking_image_url, primary_button_color, primary_button_fill_color')
          .eq('id', user.id)
          .maybeSingle();

        if (isCoach) {
          // Usuario es un coach, usar su propio branding
          setBranding({
            companyName: isCoach.company_name || DEFAULT_GATOFIT_BRANDING.companyName,
            bannerImageUrl: isCoach.banner_image_url || DEFAULT_GATOFIT_BRANDING.bannerImageUrl,
            logoImageUrl: isCoach.logo_image_url || DEFAULT_GATOFIT_BRANDING.logoImageUrl,
            rankingImageUrl: isCoach.ranking_image_url || DEFAULT_GATOFIT_BRANDING.rankingImageUrl,
            primaryButtonColor: isCoach.primary_button_color || DEFAULT_GATOFIT_BRANDING.primaryButtonColor,
            primaryButtonFillColor: isCoach.primary_button_fill_color || DEFAULT_GATOFIT_BRANDING.primaryButtonFillColor,
            hasCoach: true
          });
          setLoading(false);
          return;
        }

        // Si no es coach, verificar si el usuario tiene un coach asignado
        const { data: assignment } = await supabase
          .from('coach_user_assignments')
          .select('coach_id')
          .eq('user_id', user.id)
          .single();

        if (!assignment?.coach_id) {
          // Sin coach asignado, usar branding del superadmin
          const superadminBranding = await fetchSuperadminBranding();
          setBranding(superadminBranding);
          setLoading(false);
          return;
        }

        // Obtener branding del coach
        const { data: coachData } = await supabase
          .from('admin_users')
          .select('company_name, banner_image_url, logo_image_url, ranking_image_url, primary_button_color, primary_button_fill_color')
          .eq('id', assignment.coach_id)
          .single();

        if (coachData) {
          // Usar branding del coach con fallbacks a Gatofit
          setBranding({
            companyName: coachData.company_name || DEFAULT_GATOFIT_BRANDING.companyName,
            bannerImageUrl: coachData.banner_image_url || DEFAULT_GATOFIT_BRANDING.bannerImageUrl,
            logoImageUrl: coachData.logo_image_url || DEFAULT_GATOFIT_BRANDING.logoImageUrl,
            rankingImageUrl: coachData.ranking_image_url || DEFAULT_GATOFIT_BRANDING.rankingImageUrl,
            primaryButtonColor: coachData.primary_button_color || DEFAULT_GATOFIT_BRANDING.primaryButtonColor,
            primaryButtonFillColor: coachData.primary_button_fill_color || DEFAULT_GATOFIT_BRANDING.primaryButtonFillColor,
            hasCoach: true
          });
        } else {
          const superadminBranding = await fetchSuperadminBranding();
          setBranding(superadminBranding);
        }
      } catch (error) {
        console.error('Error fetching coach branding:', error);
        const superadminBranding = await fetchSuperadminBranding();
        setBranding(superadminBranding);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachBranding();
  }, [user]);

  return { branding, loading };
};
