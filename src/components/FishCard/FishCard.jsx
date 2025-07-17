import { createSignal, onMount } from "solid-js";
import FishImage from "../FishImage/FishImage";
import FishName from "../FishName/FishName";
import FishDescription from "../FishDescription/FishDescription";
import FishModal from "../FishModal/FishModal";
import { generateId } from "~/utils/textUtils";
import { useCardVisibility } from "~/hooks/useCardVisibility";
import "./FishCard.css";

export default function FishCard(props) {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isVisible, setElement, hasPrefetched, markAsPrefetched] = useCardVisibility(100);
  const fishId = `fish-${generateId(props.fish.SpeciesName)}`;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  onMount(() => {
    const checkAndPrefetch = () => {
      if (isVisible() && !hasPrefetched()) {

        if (props.fish.ImageGallery && props.fish.ImageGallery.length > 1) {
          import("~/utils/imagePrefetch").then(({ prefetchRemainingGallery }) => {
            const debugMode = import.meta.env.DEV;
            prefetchRemainingGallery(props.fish, debugMode);
            markAsPrefetched();
          });
        } else {
          markAsPrefetched();
        }
      }
    };

    checkAndPrefetch();
    const interval = setInterval(checkAndPrefetch, 200);

    return () => clearInterval(interval);
  });

  return (
    <>
      <article
        ref={setElement}
        class="fish-card"
        role="article"
        aria-labelledby={`${fishId}-name`}
      >
        <FishImage fish={props.fish} />

        <div class="fish-info">
          <FishName fish={props.fish} fishId={fishId} />
          <FishDescription fish={props.fish} fishId={fishId} />
          <button
            class="learn-more-btn"
            onClick={openModal}
            aria-describedby={`${fishId}-description`}
          >
            Learn more about {props.fish.SpeciesName}
          </button>
        </div>
      </article>

      <FishModal fish={props.fish} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
