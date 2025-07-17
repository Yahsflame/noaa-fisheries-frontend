import { Show, onMount, createEffect, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import ImageSlider from "../ImageSlider/ImageSlider";
import { stripHtml } from "~/utils/textUtils";
import "./FishModal.css";

export default function FishModal(props) {
  const { fish, isOpen, onClose } = props;
  let modalRef;
  let previousFocus;

  const hasImageGallery = () =>
    fish.ImageGallery && fish.ImageGallery.length > 0;

  const getFallbackImage = () => {
    if (fish.SpeciesIllustrationPhoto && fish.SpeciesIllustrationPhoto.src) {
      return fish.SpeciesIllustrationPhoto;
    }
    return null;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    if (typeof document !== "undefined" && previousFocus) {
      previousFocus.focus();
    }
  };

  const trapFocus = (e) => {
    if (e.key === "Tab" && modalRef) {
      const focusableElements = modalRef.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  createEffect(() => {
    if (typeof document !== "undefined") {
      if (isOpen()) {
        const scrollY = window.scrollY;

        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        document.body.setAttribute('data-scroll-y', scrollY.toString());

        previousFocus = document.activeElement;
        requestAnimationFrame(() => {
          modalRef?.focus();
        });
      } else {
        const scrollY = document.body.getAttribute('data-scroll-y');

        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0'));
        }

        document.body.removeAttribute('data-scroll-y');
      }
    }
  });

  onCleanup(() => {
    if (typeof document !== "undefined") {
      const scrollY = document.body.getAttribute('data-scroll-y');

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0'));
      }

      document.body.removeAttribute('data-scroll-y');
    }
  });

  return (
    <Show when={isOpen()}>
      <Portal>
        <div
          ref={modalRef}
          class="modal-backdrop"
          onClick={handleBackdropClick}
          onKeyDown={(e) => {
            handleKeyDown(e);
            trapFocus(e);
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
        <div class="modal-content">
          <div class="modal-header">
            <button
              class="modal-close"
              onClick={handleClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-image-section">
              <Show
                when={hasImageGallery()}
                fallback={
                  <Show
                    when={getFallbackImage()}
                    fallback={
                      <div class="modal-image-placeholder">
                        <span>No Image Available</span>
                      </div>
                    }
                  >
                    <img
                      src={getFallbackImage().src}
                      alt={getFallbackImage().alt || fish.SpeciesName}
                      class="modal-image"
                    />
                  </Show>
                }
              >
                <ImageSlider
                  images={fish.ImageGallery}
                  speciesName={fish.SpeciesName}
                  className="modal-slider"
                />
              </Show>
            </div>

            <div class="modal-info">
              <div class="modal-title-section">
                <h2 id="modal-title" class="modal-fish-name">
                  {fish.SpeciesName}
                </h2>
                <Show when={fish.ScientificName}>
                  <p class="modal-scientific-name">{fish.ScientificName}</p>
                </Show>
                <Show when={fish.NOAAFisheriesRegion}>
                  <p class="modal-region">Region: {fish.NOAAFisheriesRegion}</p>
                </Show>
              </div>

              <div class="modal-nutrition-section">
                <h3>Nutritional Information</h3>
                <div class="modal-nutrition-grid">
                  <div class="nutrition-detail">
                    <span class="nutrition-label">Calories:</span>
                    <span class="nutrition-value">
                      {fish.Calories || "N/A"}
                    </span>
                  </div>
                  <div class="nutrition-detail">
                    <span class="nutrition-label">Fat:</span>
                    <span class="nutrition-value">
                      {fish.FatTotal || "N/A"}
                    </span>
                  </div>
                  <div class="nutrition-detail">
                    <span class="nutrition-label">Protein:</span>
                    <span class="nutrition-value">{fish.Protein || "N/A"}</span>
                  </div>
                  <div class="nutrition-detail">
                    <span class="nutrition-label">Cholesterol:</span>
                    <span class="nutrition-value">
                      {fish.Cholesterol || "N/A"}
                    </span>
                  </div>
                  <div class="nutrition-detail">
                    <span class="nutrition-label">Sodium:</span>
                    <span class="nutrition-value">{fish.Sodium || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <h3>Taste</h3>
                <p>{fish.Taste ? stripHtml(fish.Taste) : "N/A"}</p>
              </div>

              <div class="modal-section">
                <h3>Texture</h3>
                <p>{fish.Texture ? stripHtml(fish.Texture) : "N/A"}</p>
              </div>

              <div class="modal-section">
                <h3>Biology</h3>
                <p>{fish.Biology ? stripHtml(fish.Biology) : "N/A"}</p>
              </div>

              <div class="modal-section">
                <h3>Harvest Information</h3>
                <p>{fish.Harvest ? stripHtml(fish.Harvest) : "N/A"}</p>
              </div>

              <div class="modal-section">
                <h3>Bycatch</h3>
                <p>{fish.Bycatch ? stripHtml(fish.Bycatch) : "N/A"}</p>
              </div>

              <div class="modal-section modal-quote">
                <h3>Sustainability Quote</h3>
                <blockquote>
                  {fish.Quote ? stripHtml(fish.Quote) : "N/A"}
                </blockquote>
              </div>

              <div class="modal-section">
                <h3>Health Benefits</h3>
                <p>
                  {fish.HealthBenefits ? stripHtml(fish.HealthBenefits) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Portal>
    </Show>
  );
}
