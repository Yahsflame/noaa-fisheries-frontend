import { createSignal, createEffect, For, Show, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import ApiService from "~/services/api";
import { BREAKPOINTS } from "~/constants";
import "./Navbar.css";

export default function Navbar() {
  const [regions, setRegions] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const toggleMenu = () => {
    const newState = !isMenuOpen();
    setIsMenuOpen(newState);

    // Toggle body scroll lock (only in browser)
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

  // Handle escape key to close menu
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isMenuOpen()) {
      closeMenu();
    }
  };

  // Handle window resize to close menu on desktop
  const handleResize = () => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth > BREAKPOINTS.MOBILE &&
      isMenuOpen()
    ) {
      closeMenu();
    }
  };

  // Add event listeners
  createEffect(() => {
    if (typeof document !== "undefined") {
      if (isMenuOpen()) {
        document.addEventListener("keydown", handleKeyDown);
      } else {
        document.removeEventListener("keydown", handleKeyDown);
      }
    }

    // Add resize listener
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });

  // Fish SVG Icon Component
  const FishIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class={`fish-icon ${isMenuOpen() ? "rotated" : ""}`}
    >
      <path
        d="M2 12C2 12 4.5 8 8 8C11.5 8 14 10 16 10C18 10 20.5 8 22 12C20.5 16 18 14 16 14C14 14 11.5 16 8 16C4.5 16 2 12 2 12Z"
        fill="currentColor"
      />
      <path
        d="M8 10C8.55228 10 9 10.4477 9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10Z"
        fill="white"
      />
      <path
        d="M16 10L19 7M16 14L19 17"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );

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

        {/* Desktop Navigation */}
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

        {/* Mobile Menu Button */}
        <button
          class="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <FishIcon />
        </button>

        {/* Mobile Slide-out Menu */}
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
          </div>
        </div>

        {/* Mobile Overlay */}
        <Show when={isMenuOpen()}>
          <div class="mobile-nav-overlay" onClick={closeMenu}></div>
        </Show>
      </div>
    </nav>
  );
}
