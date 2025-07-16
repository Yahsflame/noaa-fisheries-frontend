import { createSignal, createEffect, For } from 'solid-js';
import { A } from '@solidjs/router';
import ApiService from '~/services/api';

export default function Navbar() {
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
      setError('Failed to load regions');
      console.error('Error loading regions:', err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <nav class="navbar">
      <div class="nav-container">
        <A href="/" class="nav-logo">
          NOAA Fisheries
        </A>
        <div class="nav-links">
          <A href="/" class="nav-link">
            Home
          </A>
          {loading() && <span class="nav-loading">Loading regions...</span>}
          {error() && <span class="nav-error">{error()}</span>}
          {!loading() && !error() && (
            <For each={regions()}>
              {(region) => (
                <A
                  href={`/region/${ApiService.formatRegionNameToId(region.name)}`}
                  class="nav-link"
                >
                  {region.name}
                </A>
              )}
            </For>
          )}
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background-color: #1976d2;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .nav-logo:hover {
          color: #bbdefb;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background-color 0.3s ease;
          font-weight: 500;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .nav-loading {
          color: #bbdefb;
          font-style: italic;
        }

        .nav-error {
          color: #ffcdd2;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: 1rem;
            padding: 0 1rem;
          }

          .nav-links {
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
          }

          .nav-link {
            padding: 0.5rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .nav-links {
            gap: 0.5rem;
          }

          .nav-link {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </nav>
  );
}
