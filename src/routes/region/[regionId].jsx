import { Title } from "@solidjs/meta";
import { createSignal, createEffect, For, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import ApiService from "~/services/api";
import FishCard from "~/components/FishCard";

export default function RegionPage() {
  const params = useParams();
  const [regionData, setRegionData] = createSignal(null);
  const [fish, setFish] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  createEffect(async () => {
    const regionId = params.regionId;
    if (!regionId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch region data and fish data
      const [regionInfo, fishData] = await Promise.all([
        ApiService.fetchRegionData(regionId),
        ApiService.fetchFishByRegion(regionId)
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
          <div class="loading">Loading region data...</div>
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
              <div class="fish-grid">
                <For each={fish()}>
                  {(fishItem, index) => <FishCard fish={fishItem} />}
                </For>
              </div>
            </Show>
          </section>
        </Show>

        <style jsx>{`
          .region-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .region-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .region-header h1 {
            font-size: 2.5rem;
            color: #1976d2;
            margin-bottom: 2rem;
          }

          .region-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            max-width: 600px;
            margin: 0 auto;
          }

          .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          .stat-card h3 {
            font-size: 1rem;
            color: #666;
            margin-bottom: 0.5rem;
            font-weight: normal;
          }

          .stat-card .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #1976d2;
          }

          .fish-section {
            margin-top: 3rem;
          }

          .fish-section h2 {
            font-size: 1.8rem;
            color: #333;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .fish-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }

          @media (max-width: 768px) {
            .region-page {
              padding: 1rem;
            }

            .region-header h1 {
              font-size: 2rem;
            }

            .region-stats {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .stat-card {
              padding: 1rem;
            }

            .stat-card .stat-value {
              font-size: 1.5rem;
            }

            .fish-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
          }

          @media (max-width: 480px) {
            .region-header h1 {
              font-size: 1.5rem;
            }

            .fish-section h2 {
              font-size: 1.5rem;
            }

            .stat-card {
              padding: 1rem;
            }

            .stat-card h3 {
              font-size: 0.9rem;
            }

            .stat-card .stat-value {
              font-size: 1.3rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
