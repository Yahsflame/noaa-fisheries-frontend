import { Show } from "solid-js";
import ImageSlider from "../ImageSlider/ImageSlider";
import "./FishImage.css";

export default function FishImage(props) {
  const { ImageGallery, SpeciesIllustrationPhoto, SpeciesName } = props.fish;

  // Check if we have multiple images in gallery
  const hasImageGallery = () => ImageGallery && ImageGallery.length > 0;

  // Get fallback image
  const getFallbackImage = () => {
    if (SpeciesIllustrationPhoto && SpeciesIllustrationPhoto.src) {
      return SpeciesIllustrationPhoto;
    }
    return null;
  };

  return (
    <div class="fish-image-container">
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
            />
          </Show>
        }
      >
        <ImageSlider
          images={ImageGallery}
          speciesName={SpeciesName}
          className="fish-card-slider"
        />
      </Show>
    </div>
  );
}
