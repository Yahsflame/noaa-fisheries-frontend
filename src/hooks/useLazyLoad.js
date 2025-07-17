import { createSignal, createEffect, onCleanup } from "solid-js";
import { PAGINATION } from "~/constants";

export default function useLazyLoad(
  items,
  initialCount = PAGINATION.INITIAL_VISIBLE_COUNT,
  loadMoreCount = PAGINATION.LOAD_MORE_COUNT,
  threshold = PAGINATION.SCROLL_THRESHOLD,
) {
  const [visibleItems, setVisibleItems] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [hasMore, setHasMore] = createSignal(true);
  let observer;
  let sentinelElement;

  // Initialize with first batch
  createEffect(() => {
    const itemsArray = Array.isArray(items)
      ? items
      : typeof items === "function"
        ? items()
        : [];
    if (itemsArray.length > 0) {
      const initial = itemsArray.slice(0, initialCount);
      setVisibleItems(initial);
      setHasMore(itemsArray.length > initialCount);
    } else {
      setVisibleItems([]);
      setHasMore(false);
    }
  });

  const loadMore = () => {
    if (isLoading() || !hasMore()) return;

    setIsLoading(true);

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const itemsArray = Array.isArray(items)
        ? items
        : typeof items === "function"
          ? items()
          : [];
      const currentLength = visibleItems().length;
      const nextBatch = itemsArray.slice(
        currentLength,
        currentLength + loadMoreCount,
      );

      if (nextBatch.length > 0) {
        setVisibleItems((prev) => [...prev, ...nextBatch]);
      }

      setHasMore(currentLength + nextBatch.length < itemsArray.length);
      setIsLoading(false);
    });
  };

  const setupIntersectionObserver = (containerRef) => {
    if (!containerRef || !window.IntersectionObserver) {
      // Fallback to scroll listener for older browsers
      setupScrollListener(containerRef);
      return;
    }

    // Create sentinel element
    sentinelElement = document.createElement("div");
    sentinelElement.style.height = "1px";
    sentinelElement.style.position = "absolute";
    sentinelElement.style.bottom = `${threshold}px`;
    sentinelElement.style.width = "100%";
    sentinelElement.style.pointerEvents = "none";

    containerRef.style.position = "relative";
    containerRef.appendChild(sentinelElement);

    // Create intersection observer
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore() && !isLoading()) {
            loadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0,
      },
    );

    observer.observe(sentinelElement);

    onCleanup(() => {
      if (observer) {
        observer.disconnect();
      }
      if (sentinelElement && sentinelElement.parentNode) {
        sentinelElement.parentNode.removeChild(sentinelElement);
      }
    });
  };

  const setupScrollListener = (containerRef) => {
    if (!containerRef) return;

    const handleScroll = () => {
      if (!hasMore() || isLoading()) return;

      const container = containerRef;
      const lastChild = container.lastElementChild;

      if (lastChild) {
        const rect = lastChild.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Load more when the last item is within threshold pixels from the viewport
        if (rect.top <= windowHeight + threshold) {
          loadMore();
        }
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    onCleanup(() => {
      window.removeEventListener("scroll", throttledScroll);
    });
  };

  return {
    visibleItems,
    isLoading,
    hasMore,
    loadMore,
    setupScrollListener: setupIntersectionObserver,
  };
}
