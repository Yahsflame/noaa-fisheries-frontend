import { createSignal } from "solid-js";
import FishImage from "../FishImage/FishImage";
import FishName from "../FishName/FishName";
import FishDescription from "../FishDescription/FishDescription";
import FishModal from "../FishModal/FishModal";
import { generateId } from "~/utils/textUtils";
import "./FishCard.css";

export default function FishCard(props) {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const fishId = `fish-${generateId(props.fish.SpeciesName)}`;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <article
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
