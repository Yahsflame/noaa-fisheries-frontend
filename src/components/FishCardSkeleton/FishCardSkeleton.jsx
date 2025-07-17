import "./FishCardSkeleton.css";

export default function FishCardSkeleton() {
  return (
    <div class="fish-card-skeleton">
      <div class="skeleton-image"></div>

      <div class="skeleton-info">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>

        <div class="skeleton-nutrition">
          <div class="skeleton-nutrition-item">
            <div class="skeleton-label"></div>
            <div class="skeleton-value"></div>
          </div>
          <div class="skeleton-nutrition-item">
            <div class="skeleton-label"></div>
            <div class="skeleton-value"></div>
          </div>
          <div class="skeleton-nutrition-item">
            <div class="skeleton-label"></div>
            <div class="skeleton-value"></div>
          </div>
        </div>

        <div class="skeleton-description"></div>
        <div class="skeleton-description short"></div>

        <div class="skeleton-button"></div>
      </div>
    </div>
  );
}
