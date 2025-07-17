import { createSignal, createEffect, onCleanup } from "solid-js";

export function useLazyLoad(threshold = 100) {
  const [isVisible, setIsVisible] = createSignal(false);
  const [element, setElement] = createSignal(null);

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
            observer.disconnect();
            observer = null;
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

  return [isVisible, setElement];
}
