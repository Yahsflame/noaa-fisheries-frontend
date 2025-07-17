import { Show } from "solid-js";
import { useLazyLoad } from "~/hooks/useLazyLoad";
import ImageSlider from "../ImageSlider/ImageSlider";
import "./FishImage.css";

export default function FishImage(props) {
  const { ImageGallery, SpeciesIllustrationPhoto, SpeciesName } = props.fish;
  const [isVisible, setElement] = useLazyLoad(200);

  const hasImageGallery = () => ImageGallery && ImageGallery.length > 0;

  const getFallbackImage = () => {
    if (SpeciesIllustrationPhoto && SpeciesIllustrationPhoto.src) {
      return SpeciesIllustrationPhoto;
    }
    return null;
  };

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
