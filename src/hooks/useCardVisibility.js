import { createSignal, createEffect, onCleanup } from "solid-js";

/**
 * Enhanced visibility hook specifically for card-based prefetching
 * Tracks when cards come into view and manages prefetching state
 */
export function useCardVisibility(threshold = 100) {
  const [isVisible, setIsVisible] = createSignal(false);
  const [element, setElement] = createSignal(null);
  const [hasPrefetched, setHasPrefetched] = createSignal(false);

  let observer = null;
  let hasBeenVisible = false;

  createEffect(() => {
    const currentElement = element();

    // Don't create observer if already visible or no element or no window
    if (hasBeenVisible || !currentElement || typeof window === "undefined") {
      return;
    }

    // Clean up existing observer before creating new one
    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible) {
            hasBeenVisible = true;
            setIsVisible(true);

            // Don't disconnect immediately - let the component handle prefetching
            // The component will call markAsPrefetched() when done
          }
        });
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.01
      }
    );

    observer.observe(currentElement);
  });

  onCleanup(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  const markAsPrefetched = () => {
    setHasPrefetched(true);
    // Clean up observer after prefetching is complete
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  return [isVisible, setElement, hasPrefetched, markAsPrefetched];
}
