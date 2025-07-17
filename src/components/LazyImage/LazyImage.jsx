import { createSignal, createEffect, onMount } from "solid-js";
import "./LazyImage.css";

export default function LazyImage(props) {
  const {
    src,
    alt,
    className = "",
    placeholder = null,
    onLoad = () => {},
    onError = () => {},
    ...otherProps
  } = props;

  const [isLoaded, setIsLoaded] = createSignal(false);
  const [hasError, setHasError] = createSignal(false);
  const [isInView, setIsInView] = createSignal(false);
  let imgRef;
  let observer;

  onMount(() => {
    if (!imgRef) return;

    // Create intersection observer for lazy loading
    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "50px", // Start loading 50px before image comes into view
          threshold: 0.1,
        },
      );

      observer.observe(imgRef);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError();
  };

  return (
    <div
      ref={imgRef}
      class={`lazy-image-container ${className} ${isLoaded() ? "loaded" : ""} ${
        hasError() ? "error" : ""
      }`}
      {...otherProps}
    >
      {/* Placeholder while loading */}
      <div
        class={`lazy-image-placeholder ${
          isLoaded() || hasError() ? "hidden" : ""
        }`}
      >
        {placeholder || (
          <div class="default-placeholder">
            <div class="placeholder-spinner"></div>
          </div>
        )}
      </div>

      {/* Actual image */}
      {isInView() && (
        <img
          src={src}
          alt={alt}
          class={`lazy-image ${isLoaded() ? "visible" : ""}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy" // Native lazy loading as backup
        />
      )}

      {/* Error state */}
      {hasError() && (
        <div class="lazy-image-error">
          <span>Image failed to load</span>
        </div>
      )}
    </div>
  );
}
