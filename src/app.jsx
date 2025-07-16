import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Navbar from "~/components/Navbar";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>NOAA Fisheries Regions</Title>
          <div class="app">
            <Navbar />
            <main class="main-content">
              <Suspense fallback={<div class="loading">Loading...</div>}>
                {props.children}
              </Suspense>
            </main>
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
