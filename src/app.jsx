import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Navbar from "~/components/Navbar/Navbar";
import ErrorBoundary from "~/components/ErrorBoundary/ErrorBoundary";
import { ThemeProvider } from "~/contexts/ThemeContext";
import "./app.css";

export default function App() {
  return (
    <ThemeProvider>
      <Router
        root={(props) => (
          <MetaProvider>
            <Title>NOAA Fisheries Regions</Title>
            <div class="app">
              {/* DNS prefetching for faster image loading */}
              <link rel="dns-prefetch" href="//www.fishwatch.gov" />
              <link rel="dns-prefetch" href="//media.fisheries.noaa.gov" />
              <link rel="preconnect" href="//www.fishwatch.gov" crossorigin />
              <link rel="preconnect" href="//media.fisheries.noaa.gov" crossorigin />

              {/* Skip links for accessibility */}
              <a href="#main-content" class="skip-link">
                Skip to main content
              </a>
              <a href="#navigation" class="skip-link">
                Skip to navigation
              </a>

              <Navbar />
              <main id="main-content" class="main-content">
                <ErrorBoundary>
                  <Suspense fallback={<div class="loading">Loading...</div>}>
                    {props.children}
                  </Suspense>
                </ErrorBoundary>
              </main>
            </div>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}
