import { createSignal, createEffect, Show, For } from "solid-js";
import "./ImageSlider.css";

export default function ImageSlider(props) {
  const { images, speciesName, className = "" } = props;
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [imagesLoaded, setImagesLoaded] = createSignal({});
  const [isImageLoading, setIsImageLoading] = createSignal(false);

  // If no images or only one image, don't show slider controls
  const hasMultipleImages = () => images && images.length > 1;

  // Preload images after first image loads
  createEffect(() => {
    if (images && images.length > 1) {
      // Mark first image as loaded immediately
      setImagesLoaded((prev) => ({
        ...prev,
        0: true,
      }));

      // Preload remaining images in order of priority
      // Priority: next image, previous image, then rest
      const preloadOrder = [1];
      if (images.length > 2) preloadOrder.push(images.length - 1);
      for (let i = 2; i < images.length - 1; i++) {
        preloadOrder.push(i);
      }

      preloadOrder.forEach((index, priority) => {
        if (index < images.length) {
          setTimeout(() => {
            const img = new Image();
            img.onload = () => {
              setImagesLoaded((prev) => ({
                ...prev,
                [index]: true,
              }));
            };
            img.onerror = () => {
              console.warn(`Failed to preload image at index ${index}`);
            };
            img.src = images[index].src;
          }, priority * 50); // Stagger loading to prevent overwhelming
        }
      });
    }
  });

  const nextImage = () => {
    if (images && images.length > 0) {
      const newIndex = (currentIndex() + 1) % images.length;
      // Only show loading if image isn't already preloaded
      if (!imagesLoaded()[newIndex]) {
        setIsImageLoading(true);
      }
      setCurrentIndex(newIndex);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      const newIndex = (currentIndex() - 1 + images.length) % images.length;
      // Only show loading if image isn't already preloaded
      if (!imagesLoaded()[newIndex]) {
        setIsImageLoading(true);
      }
      setCurrentIndex(newIndex);
    }
  };

  const goToImage = (index) => {
    if (index !== currentIndex()) {
      // Only show loading if image isn't already preloaded
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
      class={`image-slider ${className}`}
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
                key={currentIndex()}
                src={images[currentIndex()].src}
                alt={images[currentIndex()].alt || speciesName}
                class="slider-image"
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
