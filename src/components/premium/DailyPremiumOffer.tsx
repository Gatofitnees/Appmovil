import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumModal } from '@/components/premium/PremiumModal';

export const DailyPremiumOffer: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { isPremium, isAsesorado, isLoading } = useSubscription();

    useEffect(() => {
        // Strict check: if premium/asesorado, NEVER show offer.
        if (isPremium || isAsesorado) {
            setIsVisible(false); // Ensure it's closed
            return;
        }

        // Only proceed if subscription data is loaded
        if (!isLoading) {
            checkAndShowOffer();
        }
    }, [isLoading, isPremium, isAsesorado]);

    const checkAndShowOffer = () => {
        const lastShownDate = localStorage.getItem('last_premium_offer_shown');
        const today = new Date().toDateString();

        if (lastShownDate !== today) {
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
