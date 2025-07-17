import { createSignal, createEffect, For, Show, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import ApiService from "~/services/api";
import { BREAKPOINTS } from "~/constants";
import ThemeToggle from "~/components/ThemeToggle/ThemeToggle";
import FishIcon from "~/components/svgs/FishIcon";
import "./Navbar.css";

export default function Navbar() {
  const [regions, setRegions] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const toggleMenu = () => {
    const newState = !isMenuOpen();
    setIsMenuOpen(newState);

    if (typeof document !== "undefined") {
      if (newState) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isMenuOpen()) {
      closeMenu();
    }
  };

  const handleResize = () => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth > BREAKPOINTS.MOBILE &&
      isMenuOpen()
    ) {
      closeMenu();
    }
  };

  createEffect(() => {
    if (typeof document !== "undefined") {
      if (isMenuOpen()) {
        document.addEventListener("keydown", handleKeyDown);
      } else {
        document.removeEventListener("keydown", handleKeyDown);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });

  createEffect(async () => {
    try {
      setLoading(true);
      const data = await ApiService.fetchRegions();
      setRegions(data);
      setError(null);
    } catch (err) {
      setError("Failed to load regions");
      console.error("Error loading regions:", err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <nav id="navigation" class="navbar">
      <div class="nav-container">
        <A href="/" class="nav-logo" onClick={closeMenu}>
          NOAA Fisheries
        </A>

        <div class="nav-links desktop-nav">
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

        <div class="nav-controls">
          <div class="desktop-theme-toggle">
            <ThemeToggle />
          </div>
          <button
            class="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <FishIcon isMenuOpen={isMenuOpen} />
          </button>
        </div>

        <div class={`mobile-nav ${isMenuOpen() ? "open" : ""}`}>
          <div class="mobile-nav-content">
            <A href="/" class="nav-link mobile-nav-link" onClick={closeMenu}>
              Home
            </A>
            {loading() && <span class="nav-loading">Loading regions...</span>}
            {error() && <span class="nav-error">{error()}</span>}
            {!loading() && !error() && (
              <For each={regions()}>
                {(region) => (
                  <A
                    href={`/region/${ApiService.formatRegionNameToId(region.name)}`}
                    class="nav-link mobile-nav-link"
                    onClick={closeMenu}
                  >
                    {region.name}
                  </A>
                )}
              </For>
            )}
            <div class="mobile-theme-toggle">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <Show when={isMenuOpen()}>
          <div class="mobile-nav-overlay" onClick={closeMenu}></div>
        </Show>
      </div>
    </nav>
  );
}
