import { Show } from "solid-js";
import "./FishName.css";

export default function FishName(props) {
  const { SpeciesName, ScientificName } = props.fish;
  const { fishId } = props;

  return (
    <div class="fish-name-container">
      <h3 id={`${fishId}-name`} class="fish-name">
        {SpeciesName}
      </h3>
      <Show when={ScientificName}>
        <p class="scientific-name">{ScientificName}</p>
      </Show>
    </div>
  );
}
