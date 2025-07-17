import { Show, onMount } from "solid-js";
import { useLazyLoad } from "~/hooks/useLazyLoad";
import ImageSlider from "../ImageSlider/ImageSlider";
import { getFirstImageUrl } from "~/utils/imagePrefetch";
import "./FishImage.css";

export default function FishImage(props) {
  const { ImageGallery, SpeciesIllustrationPhoto, SpeciesName } = props.fish;
  const [isVisible, setElement] = useLazyLoad(200); // Start loading 200px before visible

  // Check if we have multiple images in gallery
  const hasImageGallery = () => ImageGallery && ImageGallery.length > 0;

  // Get fallback image
  const getFallbackImage = () => {
    if (SpeciesIllustrationPhoto && SpeciesIllustrationPhoto.src) {
      return SpeciesIllustrationPhoto;
    }
    return null;
  };

  // Prefetching is now handled at the FishCard level for better coordination

  return (
    <div class="fish-image-container" ref={setElement}>
      <Show
        when={hasImageGallery()}
        fallback={
          <Show
            when={getFallbackImage()}
            fallback={
              <div class="fish-image-placeholder">
                <span>No Image</span>
              </div>
            }
          >
            <img
              src={getFallbackImage().src}
              alt={getFallbackImage().alt || SpeciesName}
              class="fish-image"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </Show>
        }
      >
        <ImageSlider
          images={ImageGallery}
          speciesName={SpeciesName}
          className="fish-card-slider"
          isVisible={isVisible()}
        />
      </Show>
    </div>
  );
}
