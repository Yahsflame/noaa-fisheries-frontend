import { createSignal, onMount, Show, For } from "solid-js";
import "./ImageSlider.css";

export default function ImageSlider(props) {
  const { images, speciesName, className = "" } = props;
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [isImageLoading, setIsImageLoading] = createSignal(false);

  const hasMultipleImages = () => images && images.length > 1;

  onMount(() => {
    if (!images || images.length <= 1) return;

    [1, 2].forEach((index) => {
      if (index < images.length) {
        const img = new Image();
        img.src = images[index].src;
      }
    });
  });

  const nextImage = () => {
    if (images && images.length > 0) {
      setIsImageLoading(true);
      const newIndex = (currentIndex() + 1) % images.length;
      setCurrentIndex(newIndex);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setIsImageLoading(true);
      const newIndex = (currentIndex() - 1 + images.length) % images.length;
      setCurrentIndex(newIndex);
    }
  };

  const goToImage = (index) => {
    if (index !== currentIndex()) {
      setIsImageLoading(true);
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
