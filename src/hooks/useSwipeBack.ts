import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSwipeBack = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const threshold = 50; // Minimum distance for swipe
    const screenEdgeThreshold = 30; // Distance from left edge to trigger

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Check if swipe started near left edge
      const startedAtEdge = touchStartX < screenEdgeThreshold;

      // Check if it's a horizontal swipe (more horizontal than vertical)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      // Check if swipe direction is to the right
      const isRightSwipe = deltaX > threshold;


      // Check if target or any parent should prevent swipe
      let target = e.target as HTMLElement;
      let preventSwipe = false;
      while (target && target !== document.body) {
        if (target.getAttribute && target.getAttribute('data-no-swipe-back') === 'true') {
          preventSwipe = true;
          break;
        }
        target = target.parentElement as HTMLElement;
      }

      if (preventSwipe) return;

      if (startedAtEdge && isHorizontalSwipe && isRightSwipe) {
        navigate(-1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [navigate]);
};
