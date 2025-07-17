import { Title } from "@solidjs/meta";
import {
  createSignal,
  createEffect,
  createMemo,
  For,
  Show,
  onMount,
} from "solid-js";
import { useParams } from "@solidjs/router";
import ApiService from "~/services/api";
import FishCard from "~/components/FishCard/FishCard";
import FishCardSkeleton from "~/components/FishCardSkeleton/FishCardSkeleton";
import { PAGINATION } from "~/constants";
import "./region.css";

export default function RegionPage() {
  const params = useParams();
  const [regionData, setRegionData] = createSignal(null);
  const [fish, setFish] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [visibleCount, setVisibleCount] = createSignal(
    PAGINATION.INITIAL_VISIBLE_COUNT,
  );
  const [loadingMore, setLoadingMore] = createSignal(false);
  let fishGridRef;

  createEffect(async () => {
    const regionId = params.regionId;
    if (!regionId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch region data and fish data
      const [regionInfo, fishData] = await Promise.all([
        ApiService.fetchRegionData(regionId),
        ApiService.fetchFishByRegion(regionId),
      ]);

      setRegionData(regionInfo);
      setFish(fishData);
    } catch (err) {
      setError("Failed to load region data");
      console.error("Error loading region data:", err);
    } finally {
      setLoading(false);
    }
  });

  // Advanced prefetching strategy when fish data loads
  createEffect(() => {
    const fishData = fish();
    if (fishData.length > 0) {
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
    return fish().slice(0, visibleCount());
  });

  const hasMore = createMemo(() => {
    return visibleCount() < fish().length;
  });

  const loadMore = () => {
    if (loadingMore() || !hasMore()) return;

    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + PAGINATION.LOAD_MORE_COUNT, fish().length),
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

  const regionName = () =>
    regionData()?.name || formatRegionName(params.regionId);

  return (
    <>
      <Title>{regionName()} - NOAA Fisheries</Title>
      <div class="region-page">
        <Show when={loading()}>
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
        </Show>

        <Show when={error()}>
          <div class="error">{error()}</div>
        </Show>

        <Show when={!loading() && !error()}>
          <header class="region-header">
            <h1>{regionName()}</h1>
            <div class="region-stats">
              <div class="stat-card">
                <h3>Average Calories per Serving</h3>
                <span class="stat-value">
                  {regionData()?.avgCalories
                    ? `${regionData().avgCalories.toFixed(1)} cal`
                    : "N/A"}
                </span>
              </div>
              <div class="stat-card">
                <h3>Average Fat per Serving</h3>
                <span class="stat-value">
                  {regionData()?.avgFat
                    ? `${regionData().avgFat.toFixed(1)}g`
                    : "N/A"}
                </span>
              </div>
            </div>
          </header>

          <section class="fish-section">
            <h2>Fish Species in {regionName()}</h2>
            <Show
              when={fish().length > 0}
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
