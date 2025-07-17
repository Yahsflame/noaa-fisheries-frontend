import { createSignal, createEffect, Show, For } from "solid-js";
import "./ImageSlider.css";

export default function ImageSlider(props) {
  const { images, speciesName, className = "", isVisible = true } = props;
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [imagesLoaded, setImagesLoaded] = createSignal({});
  const [isImageLoading, setIsImageLoading] = createSignal(false);

  // If no images or only one image, don't show slider controls
  const hasMultipleImages = () => images && images.length > 1;

  // Aggressive preloading strategy
  createEffect(() => {
    if (!images || images.length === 0 || !isVisible) return;

    // Immediately mark first image as loaded to prevent loading state
    setImagesLoaded((prev) => ({ ...prev, 0: true }));

    // Start preloading immediately, no delays
    if (images.length > 1) {
      // Load next two images immediately for faster navigation
      [1, 2].forEach((index) => {
        if (index < images.length) {
          const img = new Image();
          img.fetchPriority = 'high'; // High priority for immediate next images
          img.onload = () => {
            setImagesLoaded((prev) => ({ ...prev, [index]: true }));
          };
          img.onerror = () => console.warn(`Failed to preload image at index ${index}`);
          img.src = images[index].src;
        }
      });

      // Load remaining images with lower priority
      setTimeout(() => {
        for (let i = 3; i < images.length; i++) {
          const img = new Image();
          img.fetchPriority = 'low';
          img.onload = () => {
            setImagesLoaded((prev) => ({ ...prev, [i]: true }));
          };
          img.onerror = () => console.warn(`Failed to preload image at index ${i}`);
          img.src = images[i].src;
        }
      }, 100); // Minimal delay to not block main thread
    }
  });

  const nextImage = () => {
    if (images && images.length > 0) {
      const newIndex = (currentIndex() + 1) % images.length;
      if (!imagesLoaded()[newIndex]) {
        setIsImageLoading(true);
      }
      setCurrentIndex(newIndex);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      const newIndex = (currentIndex() - 1 + images.length) % images.length;
      if (!imagesLoaded()[newIndex]) {
        setIsImageLoading(true);
      }
      setCurrentIndex(newIndex);
    }
  };

  const goToImage = (index) => {
    if (index !== currentIndex()) {
      if (!imagesLoaded()[index]) {
        setIsImageLoading(true);
      }
      setCurrentIndex(index);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      prevImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    }
  };

  return (
    <div
      class={`image-slider ${className} ${isVisible ? "priority-loading" : ""}`}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <Show
        when={images && images.length > 0}
        fallback={
          <div class="image-placeholder">
            <span>No Image Available</span>
          </div>
        }
      >
        <div class="slider-container">
          <div class="image-container">
            <div class={`image-wrapper ${isImageLoading() ? "loading" : ""}`}>
              <img
                key={`${currentIndex()}-${images[currentIndex()].src}`}
                src={images[currentIndex()].src}
                alt={images[currentIndex()].alt || speciesName}
                class="slider-image"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
              <Show when={isImageLoading()}>
                <div class="image-loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
              </Show>
            </div>

            <Show when={hasMultipleImages()}>
              <button
                class="slider-btn slider-btn-prev"
                onClick={prevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                class="slider-btn slider-btn-next"
                onClick={nextImage}
                aria-label="Next image"
              >
                ›
              </button>
            </Show>
          </div>

          <Show when={hasMultipleImages()}>
            <div class="slider-dots">
              <For each={images}>
                {(_, index) => (
                  <button
                    class={`slider-dot ${currentIndex() === index() ? "active" : ""}`}
                    onClick={() => goToImage(index())}
                    aria-label={`Go to image ${index() + 1}`}
                  />
                )}
              </For>
            </div>
          </Show>

          <Show when={hasMultipleImages()}>
            <div class="image-counter">
              {currentIndex() + 1} of {images.length}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
