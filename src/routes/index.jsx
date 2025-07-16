import { Title } from "@solidjs/meta";
import { createSignal, createEffect, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import ApiService from "~/services/api";

export default function Home() {
  const [regions, setRegions] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  createEffect(async () => {
    try {
      setLoading(true);
      const data = await ApiService.fetchRegions();
      setRegions(data);
      setError(null);
    } catch (err) {
      setError("Failed to load region data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <Title>NOAA Fisheries Regions</Title>
      <div class="home-page">
        <Show when={loading()}>
          <div class="loading">Loading regions...</div>
        </Show>

        <Show when={error()}>
          <div class="error">{error()}</div>
        </Show>

        <Show when={!loading() && !error()}>
          <header class="home-header">
            <h1>NOAA Fisheries Regions</h1>
            <p>
              Explore nutritional data for fish across different NOAA regions
            </p>
          </header>

          <div class="regions-grid">
            <For each={regions()}>
              {(region) => (
                <A
                  href={`/region/${ApiService.formatRegionNameToId(region.name)}`}
                  class="region-card"
                >
                  <div class="region-card-content">
                    <h3>{region.name}</h3>
                    <div class="region-stats">
                      <div class="stat">
                        <span class="stat-label">Avg Calories:</span>
                        <span class="stat-value">
                          {region.avgCalories
                            ? `${region.avgCalories.toFixed(1)} cal`
                            : "N/A"}
                        </span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">Avg Fat:</span>
                        <span class="stat-value">
                          {region.avgFat
                            ? `${region.avgFat.toFixed(1)}g`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div class="fish-count">
                      {region.fishCount} fish species
                    </div>
                  </div>
                </A>
              )}
            </For>
          </div>
        </Show>

        <style jsx>{`
          .home-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .home-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .home-header h1 {
            font-size: 2.5rem;
            color: #1976d2;
            margin-bottom: 1rem;
          }

          .home-header p {
            font-size: 1.2rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
          }

          .regions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }

          .region-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-decoration: none;
            color: inherit;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
            overflow: hidden;
          }

          .region-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }

          .region-card-content {
            padding: 1.5rem;
          }

          .region-card h3 {
            font-size: 1.3rem;
            color: #1976d2;
            margin-bottom: 1rem;
          }

          .region-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
          }

          .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 0.25rem;
          }

          .stat-value {
            font-size: 1.1rem;
            font-weight: bold;
            color: #333;
          }

          .fish-count {
            text-align: center;
            color: #666;
            font-style: italic;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
          }

          @media (max-width: 768px) {
            .home-page {
              padding: 1rem;
            }

            .home-header h1 {
              font-size: 2rem;
            }

            .regions-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .region-stats {
              flex-direction: column;
              gap: 0.5rem;
            }

            .stat {
              flex-direction: row;
              justify-content: space-between;
            }
          }

          @media (max-width: 480px) {
            .home-header h1 {
              font-size: 1.5rem;
            }

            .home-header p {
              font-size: 1rem;
            }

            .region-card-content {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
