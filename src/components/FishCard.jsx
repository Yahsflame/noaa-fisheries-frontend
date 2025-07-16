import { Show } from "solid-js";

export default function FishCard(props) {
  const {
    SpeciesName,
    ImageGallery,
    SpeciesIllustrationPhoto,
    Calories,
    FatTotal,
    Protein,
    Biology,
    Taste,
    Texture,
    HealthBenefits,
    ScientificName,
  } = props.fish;

  // Get the best available image
  const getImageSrc = () => {
    if (ImageGallery && ImageGallery.length > 0) {
      return ImageGallery[0].src;
    }
    if (SpeciesIllustrationPhoto && SpeciesIllustrationPhoto.src) {
      return SpeciesIllustrationPhoto.src;
    }
    return null;
  };

  const getImageAlt = () => {
    if (ImageGallery && ImageGallery.length > 0) {
      return ImageGallery[0].alt || SpeciesName;
    }
    if (SpeciesIllustrationPhoto && SpeciesIllustrationPhoto.alt) {
      return SpeciesIllustrationPhoto.alt;
    }
    return SpeciesName;
  };

  // Create description from available fields
  const getDescription = () => {
    const descriptions = [];

    if (Biology) {
      descriptions.push(Biology.replace(/<[^>]*>/g, "").substring(0, 200));
    }
    if (Taste) {
      descriptions.push(Taste.replace(/<[^>]*>/g, ""));
    }
    if (Texture) {
      descriptions.push(Texture.replace(/<[^>]*>/g, ""));
    }
    if (HealthBenefits) {
      descriptions.push(HealthBenefits.replace(/<[^>]*>/g, ""));
    }

    return (
      descriptions.join(" ").substring(0, 300) +
      (descriptions.join(" ").length > 300 ? "..." : "")
    );
  };

  const imageSrc = getImageSrc();
  const imageAlt = getImageAlt();
  const description = getDescription();

  return (
    <div class="fish-card">
      <div class="fish-image-container">
        <Show
          when={imageSrc}
          fallback={
            <div class="fish-image-placeholder">
              <span>No Image</span>
            </div>
          }
        >
          <img src={imageSrc} alt={imageAlt} class="fish-image" />
        </Show>
      </div>

      <div class="fish-info">
        <h3 class="fish-name">{SpeciesName}</h3>
        <Show when={ScientificName}>
          <p class="scientific-name">{ScientificName}</p>
        </Show>

        <div class="fish-nutrition">
          <div class="nutrition-item">
            <span class="nutrition-label">Calories:</span>
            <span class="nutrition-value">{Calories || "N/A"} cal</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-label">Fat:</span>
            <span class="nutrition-value">{FatTotal || "N/A"}</span>
          </div>
          <Show when={Protein}>
            <div class="nutrition-item">
              <span class="nutrition-label">Protein:</span>
              <span class="nutrition-value">{Protein}g</span>
            </div>
          </Show>
        </div>

        <Show when={description}>
          <p class="fish-description">{description}</p>
        </Show>
      </div>

      <style jsx>{`
        .fish-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .fish-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .fish-image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fish-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .fish-card:hover .fish-image {
          transform: scale(1.05);
        }

        .fish-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 1rem;
          background-color: #f0f0f0;
        }

        .fish-info {
          padding: 1.5rem;
        }

        .fish-name {
          font-size: 1.3rem;
          color: #1976d2;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .scientific-name {
          font-size: 0.9rem;
          color: #666;
          font-style: italic;
          margin-bottom: 1rem;
        }

        .fish-nutrition {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .nutrition-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .nutrition-label {
          font-weight: 500;
          color: #666;
        }

        .nutrition-value {
          font-weight: 600;
          color: #333;
        }

        .fish-description {
          color: #666;
          line-height: 1.6;
          margin-top: 1rem;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .fish-card {
            margin-bottom: 1rem;
          }

          .fish-image-container {
            height: 150px;
          }

          .fish-info {
            padding: 1rem;
          }

          .fish-name {
            font-size: 1.2rem;
          }

          .scientific-name {
            font-size: 0.8rem;
          }

          .nutrition-item {
            flex-direction: column;
            gap: 0.25rem;
          }

          .nutrition-label {
            font-size: 0.9rem;
          }

          .nutrition-value {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .fish-image-container {
            height: 120px;
          }

          .fish-info {
            padding: 0.75rem;
          }

          .fish-name {
            font-size: 1.1rem;
          }

          .scientific-name {
            font-size: 0.75rem;
          }

          .fish-description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
