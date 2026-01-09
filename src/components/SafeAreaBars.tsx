import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SafeAreaBars - Protects content from notch and safe areas
 * Creates visible spacers at the top (notch area)
 */
export const SafeAreaBars: React.FC = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/ai-chat' || location.pathname === '/coach-chat';

  // if (isChatPage) return null; // User requested to re-enable safe area bars for chats
  const isFoodSearch = location.pathname === '/nutrition/search';
  if (isFoodSearch) return null;

  /* 
    Updated logic: We use exact matching to ensure only the main tab pages get the blur effect.
    Sub-pages (like /workout/active) will default to the solid bar, which is safer for content visibility.
  */
  const blurredRoutes = ['/home', '/workout', '/nutrition', '/ranking', '/social'];
  // Check if current path matches EXACTLY.
  const isBlurredPage = blurredRoutes.includes(location.pathname);

  const baseClasses = "fixed top-0 left-0 right-0 z-40";
  // Increased transparency (40% opacity) to make blur more visible
  const bgClasses = isBlurredPage
    ? "bg-background/40 backdrop-blur-md"
    : "bg-background";

  return (
    <>
      {/* Top Safe Area Bar - Protects from notch */}
      <div
        id="safe-area-bar"
        className={`${baseClasses} ${bgClasses}`}
        style={{
          height: 'max(var(--safe-area-inset-top), 50px)',
          paddingTop: 'var(--safe-area-inset-top, 0px)',
        }}
      />
    </>
  );
};

export default SafeAreaBars;

