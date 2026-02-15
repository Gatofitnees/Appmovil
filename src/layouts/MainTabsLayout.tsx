import React from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import HomePage from '@/pages/HomePage';
import WorkoutPage from '@/pages/WorkoutPage';
import NutritionPage from '@/pages/NutritionPage';
import RankingPage from '@/pages/RankingPage';
import SocialPage from '@/pages/SocialPage';
import { DailyPremiumOffer } from '@/components/premium/DailyPremiumOffer';
import { StreakListener } from '@/components/streak/StreakListener';

const MainTabsLayout: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname;

    // Function to determine if a specific tab is active
    const isTabActive = (path: string) => {
        return pathname.startsWith(path);
    };

    // Helper to render content with consistent styling and persistence
    const renderTab = (path: string, Component: React.FC) => {
        const isActive = isTabActive(path);

        return (
            <div
                className={`absolute inset-0 pb-[calc(4rem+var(--safe-area-inset-bottom))] bg-background overflow-y-auto overflow-x-hidden ${isActive ? 'z-10' : 'z-0 invisible pointer-events-none'}`}
                aria-hidden={!isActive}
                style={{
                    // If inactive, we use visibility: hidden instead of display: none to keep structure but avoid painting? 
                    // actually display: none is better for performance if complex, but visibility: hidden keeps scroll better in some cases?
                    // The plan said display: none (via 'hidden' class). Let's stick to 'hidden' (display: none) or invisible.
                    // However, keeping scroll position usually requires the element to remain in the DOM. 
                    // Tailwind 'invisible' is visibility: hidden. 'hidden' is display: none.
                    // With display: none, scroll position on the element MIGHT be lost if not careful, 
                    // but since we are wrapping it in a div with overflow-y-auto, the scroll belongs to the div.
                    // If the div gets display: none, its scroll *should* be preserved in modern browsers, 
                    // but sometimes it resets.
                    // Let's try 'hidden' (display: none) first as it's lighter.
                    display: isActive ? 'block' : 'none'
                }}
            >
                <Component />
            </div>
        );
    };

    return (
        <div className="relative w-full h-screen bg-background">
            {/* Content Area */}
            <div className="absolute inset-0">
                {renderTab('/home', HomePage)}
                {renderTab('/workout', WorkoutPage)}
                {renderTab('/nutrition', NutritionPage)}
                {renderTab('/ranking', RankingPage)}
                {renderTab('/social', SocialPage)}
            </div>

            {/* Navigation Bar - Always visible on top (z-index wise) */}
            <NavBar />

            {/* Streak Listener - Now here to wait for loading */}
            <StreakListener />

            {/* Daily Premium Offer Overlay */}
            <DailyPremiumOffer />
        </div>
    );
};

export default MainTabsLayout;
