
import React, { useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel';

interface WorkoutSummary {
  id?: number;
  name: string;
  duration?: string;
  calories?: number;
  exercises?: string[];
  exerciseCount?: number;
  totalSets?: number;
  date?: string;
}

type CarouselItem =
  | { type: 'promo' }
  | { type: 'workout'; data: WorkoutSummary };

interface WorkoutCarouselProps {
  items: CarouselItem[];
  children: (item: CarouselItem, index: number, total: number) => React.ReactNode;
  onSlideChange?: (index: number) => void;
}

const WorkoutCarouselContent: React.FC<WorkoutCarouselProps> = ({ items, children, onSlideChange }) => {
  const { api } = useCarousel();

  // Handle listeners and syncing
  useEffect(() => {
    if (!api || !onSlideChange) return;

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      console.log('Carousel slide changed to index:', currentIndex);
      onSlideChange(currentIndex);
    };

    // Listen for slide changes
    api.on('select', onSelect);
    api.on('settle', onSelect);
    // api.on('pointerUp', onSelect); // Removing pointerUp as it might be too aggressive/redundant with select

    return () => {
      api.off('select', onSelect);
      api.off('settle', onSelect);
      // api.off('pointerUp', onSelect);
    };
  }, [api, onSlideChange]);

  // Set initial index ONLY when api first becomes available
  useEffect(() => {
    if (!api || !onSlideChange) return;

    // Check if we already have a selected index (e.g. from internal state)
    // but usually on mount we want to ensure we sync with parent
    onSlideChange(api.selectedScrollSnap());

  }, [api]); // Intentionally omitting onSlideChange to avoid re-syncing just because the handler changed reference (though useCallback in parent fixes that too)

  return (
    <CarouselContent className="-ml-2 md:-ml-4">
      {items.map((item, index) => (
        <CarouselItem key={`${item.type}-${index}`} className="basis-full pl-2 md:pl-4">
          {children(item, index, items.length)}
        </CarouselItem>
      ))}
    </CarouselContent>
  );
};

const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({ items, children, onSlideChange }) => {
  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return <>{children(items[0], 0, 1)}</>;
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        loop: false,
        align: 'start',
        containScroll: 'trimSnaps', // Better boundary handling
        skipSnaps: true, // Allow scrolling through multiple slides on fast swipe
        dragFree: false, // Snap to slides
      }}
    >
      <WorkoutCarouselContent items={items} onSlideChange={onSlideChange}>
        {children}
      </WorkoutCarouselContent>
    </Carousel>
  );
};

export default WorkoutCarousel;
