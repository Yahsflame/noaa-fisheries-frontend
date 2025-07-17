import { Title } from "@solidjs/meta";
import {
  createSignal,
  createMemo,
  For,
  Show,
  onMount,
} from "solid-js";
import { useParams, createAsync } from "@solidjs/router";
import { getFishByRegion, getRegionData } from "~/services/api";
import ApiService from "~/services/api";
import FishCard from "~/components/FishCard/FishCard";
import FishCardSkeleton from "~/components/FishCardSkeleton/FishCardSkeleton";
import { PAGINATION } from "~/constants";
import "./region.css";

export default function RegionPage() {
  const params = useParams();

  // Server-side data fetching with createAsync
  const regionData = createAsync(() => getRegionData(params.regionId));
  const fish = createAsync(() => getFishByRegion(params.regionId));

  const [visibleCount, setVisibleCount] = createSignal(
    PAGINATION.INITIAL_VISIBLE_COUNT,
  );
  const [loadingMore, setLoadingMore] = createSignal(false);
  let fishGridRef;

  // Client-side prefetching after component mounts
  onMount(() => {
    const fishData = fish();
    if (fishData && fishData.length > 0) {
      // Import the prefetch utility
      import("~/utils/imagePrefetch").then(({ prefetchRegionImages }) => {
        // Enable debug mode in development
        const debugMode = import.meta.env.DEV;
        prefetchRegionImages(fishData, debugMode);
      });
    }
  });

  // Create computed values for lazy loading
  const visibleFish = createMemo(() => {
    const fishData = fish();
    return fishData ? fishData.slice(0, visibleCount()) : [];
  });

  const hasMore = createMemo(() => {
    const fishData = fish();
    return fishData ? visibleCount() < fishData.length : false;
  });

  const loadMore = () => {
    if (loadingMore() || !hasMore()) return;

    setLoadingMore(true);
    setTimeout(() => {
      const fishData = fish();
      setVisibleCount((prev) =>
        Math.min(prev + PAGINATION.LOAD_MORE_COUNT, fishData ? fishData.length : 0),
      );
      setLoadingMore(false);
    }, 300);
  };

  // Setup scroll listener after mount
  onMount(() => {
    const handleScroll = () => {
      if (!hasMore() || loadingMore()) return;

      const container = fishGridRef;
      if (container) {
        const lastChild = container.lastElementChild;
        if (lastChild) {
          const rect = lastChild.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (rect.top <= windowHeight + PAGINATION.SCROLL_THRESHOLD) {
            loadMore();
          }
        }
      }
    };

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

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  });

  const formatRegionName = (regionId) => {
    return regionId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const regionName = () => {
    const region = regionData();
    return region?.name || formatRegionName(params.regionId);
  };

  return (
    <>
      <Title>{regionName()} - NOAA Fisheries</Title>
      <div class="region-page">
        <Show
          when={regionData() && fish()}
          fallback={
            <>
              <header class="region-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-stats">
                  <div class="skeleton-stat-card">
                    <div class="skeleton-stat-label"></div>
                    <div class="skeleton-stat-value"></div>
                  </div>
                  <div class="skeleton-stat-card">
                    <div class="skeleton-stat-label"></div>
                    <div class="skeleton-stat-value"></div>
                  </div>
                </div>
              </header>
              <section class="fish-section">
                <div class="skeleton-section-title"></div>
                <div class="skeleton-grid">
                  <For each={Array(6).fill(0)}>{() => <FishCardSkeleton />}</For>
                </div>
              </section>
            </>
          }
        >
          <header class="region-header">
            <h1>{regionName()}</h1>
            <div class="region-stats">
              <div class="stat-card">
                <h3>Average Calories per Serving</h3>
                <span class="stat-value">
                  {regionData()?.avgCalories
                    ? `${Math.round(regionData().avgCalories * 10) / 10} cal`
                    : "N/A"}
                </span>
              </div>
              <div class="stat-card">
                <h3>Average Fat per Serving</h3>
                <span class="stat-value">
                  {regionData()?.avgFat
                    ? `${Math.round(regionData().avgFat * 10) / 10}g`
                    : "N/A"}
                </span>
              </div>
            </div>
          </header>

          <section class="fish-section">
            <h2>Fish Species in {regionName()}</h2>
            <Show
              when={fish() && fish().length > 0}
              fallback={<p>No fish data available for this region.</p>}
            >
              <div class="fish-grid" ref={fishGridRef}>
                <For each={visibleFish()}>
                  {(fishItem) => <FishCard fish={fishItem} />}
                </For>
              </div>

              <Show when={loadingMore()}>
                <div class="skeleton-grid">
                  <For each={Array(PAGINATION.LOAD_MORE_COUNT).fill(0)}>
                    {() => <FishCardSkeleton />}
                  </For>
                </div>
              </Show>

              <Show when={!hasMore() && visibleFish().length > 0}>
                <div class="end-message">All fish loaded for this region</div>
              </Show>
            </Show>
          </section>
        </Show>
      </div>
    </>
  );
}
