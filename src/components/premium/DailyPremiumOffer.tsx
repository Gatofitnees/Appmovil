import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumModal } from '@/components/premium/PremiumModal';

export const DailyPremiumOffer: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { isPremium, isAsesorado, isLoading, isError, checkPremiumStatus } = useSubscription();
    const { user } = useAuth();

    useEffect(() => {
        // Strict check: if premium/asesorado OR NO USER, NEVER show offer.
        if (isPremium || isAsesorado || !user) {
            setIsVisible(false); // Ensure it's closed
            return;
        }

        // Only proceed if subscription data is loaded AND there's no error
        // If there's an error, we prefer NOT to show the offer to avoid annoying valid premium users experiencing network issues
        if (!isLoading && !isError) {
            checkAndShowOffer();
        }
    }, [isLoading, isPremium, isAsesorado, isError, user]);

    const checkAndShowOffer = async () => {
        const lastShownDate = localStorage.getItem('last_premium_offer_shown');
        const today = new Date().toDateString();

        if (lastShownDate !== today) {
            // FAIL-SAFE: Verify with server before showing
            // This prevents showing the modal if local state is stale or transitioning
            try {
                const isActuallyPremium = await checkPremiumStatus();
                if (isActuallyPremium) {
                    console.log('DailyOffer: Server confirmed user is premium. Suppressing offer.');
                    return;
                }
            } catch (error) {
                console.error('DailyOffer: Error verifying status. Suppressing offer for safety.', error);
                return; // Fail safe: if error, assume worst case (premium user with connection error) and don't show
            }

            // Show offer
            setIsVisible(true);
            // Mark as shown today
            localStorage.setItem('last_premium_offer_shown', today);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <PremiumModal
            isOpen={isVisible}
            onClose={handleClose}
        />
    );
};
