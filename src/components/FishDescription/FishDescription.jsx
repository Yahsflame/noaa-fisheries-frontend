import { Show } from "solid-js";
import { stripHtml } from "~/utils/textUtils";
import "./FishDescription.css";

export default function FishDescription(props) {
  const { Calories, FatTotal, Protein, Biology } = props.fish;
  const { fishId } = props;

  // Create description from available fields
  const getDescription = () => {
    const descriptions = [];

    descriptions.push(stripHtml(Biology).substring(0, 200));

    return (
      descriptions.join(" ").substring(0, 100) +
      (descriptions.join(" ").length > 100 ? "..." : "")
    );
  };

  const description = getDescription();

  return (
    <div class="fish-description-container">
      <div class="fish-nutrition">
        <div class="nutrition-item">
          <span class="nutrition-label">Calories:</span>
          <span class="nutrition-value">{Calories || "N/A"}</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-label">Fat:</span>
          <span class="nutrition-value">{FatTotal || "N/A"}</span>
        </div>
        <div class="nutrition-item">
          <span class="nutrition-label">Protein:</span>
          <span class="nutrition-value">{Protein || "N/A"}</span>
        </div>
      </div>

      <Show when={description}>
        <p id={`${fishId}-description`} class="fish-description">
          {description}
        </p>
      </Show>
    </div>
  );
}
