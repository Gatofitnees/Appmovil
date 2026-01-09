
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  reduceSize?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
  cardsPerView?: number;
}

const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({
  children,
  className,
  reduceSize = false,
  autoScroll = false,
  autoScrollInterval = 5000,
  currentSlide,
  onSlideChange,
  cardsPerView = 1
}) => {
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use either controlled (from props) or uncontrolled (internal) state
  const currentIndex = currentSlide !== undefined ? currentSlide : internalCurrentIndex;

  // Update internal state when prop changes
  useEffect(() => {
    if (currentSlide !== undefined) {
      setInternalCurrentIndex(currentSlide);
    }
  }, [currentSlide]);

  // Track container width changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Initial set
    setWidth(containerRef.current.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          // Use contentRect.width or entry.target.offsetWidth
          setWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    // Only auto-scroll if we have a valid width (component is visible)
    if (autoScroll && !isDragging && width > 0) {
      autoScrollTimerRef.current = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % children.length;
        goToSlide(nextIndex);
      }, autoScrollInterval);
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [autoScroll, currentIndex, children.length, isDragging, width, autoScrollInterval]);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Clear auto-scroll timer
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }

    setIsDragging(true);
    setDragOffset(0);

    // Get position from touch or mouse event
    const clientX = 'touches' in e
      ? e.touches[0].clientX
      : e.clientX;

    setDragStart(clientX);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    // Get position from touch or mouse event
    const clientX = 'touches' in e
      ? e.touches[0].clientX
      : e.clientX;

    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const threshold = width * 0.15 / cardsPerView;

    if (dragOffset > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      goToSlide(currentIndex - 1);
    } else if (dragOffset < -threshold && currentIndex < children.length - 1) {
      // Swipe left - go to next
      goToSlide(currentIndex + 1);
    } else {
      // Stay on current slide - snap back
      setDragOffset(0);
    }

    setIsDragging(false);
  };

  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(children.length - 1, index));

    if (onSlideChange) {
      onSlideChange(newIndex);
    } else {
      setInternalCurrentIndex(newIndex);
    }

    setDragOffset(0);
  };

  // Calculate dimensions based on stated width
  const slideWidth = reduceSize ? width * (0.8 / cardsPerView) : width / cardsPerView;
  const slideMargin = reduceSize ? width * 0.1 / cardsPerView : 0;

  return (
    <div className={cn('relative w-full h-full flex flex-col', className)}>
      <div
        className="relative overflow-hidden w-full flex-grow"
        ref={containerRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <motion.div
          className="flex w-full h-full"
          animate={{
            x: isDragging
              ? dragOffset - (currentIndex * slideWidth * cardsPerView)
              : -(currentIndex * slideWidth * cardsPerView)
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40
          }}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              className="flex-shrink-0 transition-opacity duration-300 h-full flex items-center justify-center p-2"
              style={{
                width: slideWidth > 0 ? slideWidth : '100%', // Fallback width
                opacity: currentIndex === index ? 1 : 0.5,
                transform: currentIndex === index ? 'scale(1)' : 'scale(0.9)',
                transition: 'all 0.3s ease'
              }}
              key={index}
            >
              {/* Ensure child takes full height available in the slide container */}
              <div className="w-full h-full">
                {child}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Enhanced indicators with better visibility and tap targets */}
      <div className="flex justify-center space-x-2 py-4 z-10 pointer-events-none w-full shrink-0">
        {children.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all border pointer-events-auto",
              index === currentIndex
                ? "bg-primary border-primary w-6"
                : "bg-white/20 border-transparent hover:bg-white/40"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSlide(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableCarousel;
