import { createSignal, createEffect, onCleanup } from "solid-js";

export function useCardVisibility(threshold = 100) {
  const [isVisible, setIsVisible] = createSignal(false);
  const [element, setElement] = createSignal(null);
  const [hasPrefetched, setHasPrefetched] = createSignal(false);

  let observer = null;
  let hasBeenVisible = false;

  createEffect(() => {
    const currentElement = element();

    if (hasBeenVisible || !currentElement || typeof window === "undefined") {
      return;
    }

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible) {
            hasBeenVisible = true;
            setIsVisible(true);
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
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  return [isVisible, setElement, hasPrefetched, markAsPrefetched];
}
