/**
 * Utility functions for prefetching images to improve performance
 */

// Set to track already prefetched URLs to avoid duplicates
const prefetchedUrls = new Set();

/**
 * Get the first image URL from a fish object
 * @param {Object} fish - Fish data object
 * @returns {string|null} - First image URL or null
 */
export function getFirstImageUrl(fish) {
  // Try ImageGallery first
  if (fish.ImageGallery && fish.ImageGallery.length > 0) {
    return fish.ImageGallery[0].src;
  }

  // Fallback to SpeciesIllustrationPhoto
  if (fish.SpeciesIllustrationPhoto && fish.SpeciesIllustrationPhoto.src) {
    return fish.SpeciesIllustrationPhoto.src;
  }

  return null;
}

/**
 * Prefetch an image using link rel="prefetch"
 * @param {string} imageUrl - URL of the image to prefetch
 * @param {string} priority - Priority: 'high', 'low', or 'auto'
 */
export function prefetchImage(imageUrl, priority = 'low') {
  if (!imageUrl || prefetchedUrls.has(imageUrl)) {
    return;
  }

  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = imageUrl;
    link.as = 'image';
    link.fetchPriority = priority;

    // Add to head
    document.head.appendChild(link);

    // Track this URL
    prefetchedUrls.add(imageUrl);

    // Clean up the link element after a delay to prevent memory leaks
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 10000); // Remove after 10 seconds

  } catch (error) {
    console.warn('Failed to prefetch image:', imageUrl, error);
  }
}

/**
 * Prefetch images for the first N fish in an array
 * @param {Array} fishArray - Array of fish objects
 * @param {number} count - Number of fish to prefetch (default: 3)
 * @param {string} priority - Priority for prefetching
 */
export function prefetchFirstImages(fishArray, count = 3, priority = 'low') {
  if (!Array.isArray(fishArray) || fishArray.length === 0) {
    return;
  }

  // Take only the first N fish
  const fishToPrefetch = fishArray.slice(0, count);

  fishToPrefetch.forEach((fish, index) => {
    const imageUrl = getFirstImageUrl(fish);
    if (imageUrl) {
      // First image gets high priority, others get specified priority
      const imagePriority = index === 0 ? 'high' : priority;
      prefetchImage(imageUrl, imagePriority);
    }
  });
}

/**
 * Prefetch all images from ImageGallery for a fish
 * @param {Object} fish - Fish data object
 * @param {string} priority - Priority for prefetching
 * @param {boolean} debug - Enable debug logging
 */
export function prefetchFullGallery(fish, priority = 'low', debug = false) {
  if (!fish || !fish.ImageGallery || !Array.isArray(fish.ImageGallery)) {
    return;
  }

  if (debug) {
    console.log(`Prefetching full gallery for ${fish.SpeciesName}: ${fish.ImageGallery.length} images`);
  }

  fish.ImageGallery.forEach((image, index) => {
    if (image.src) {
      // First image gets higher priority
      const imagePriority = index === 0 ? 'high' : priority;
      prefetchImage(image.src, imagePriority);

      if (debug) {
        console.log(`  - Image ${index + 1}/${fish.ImageGallery.length}: ${imagePriority} priority`);
      }
    }
  });
}

/**
 * Advanced prefetching strategy for region pages
 * @param {Array} fishArray - Array of fish objects
 * @param {boolean} debug - Enable debug logging
 */
export function prefetchRegionImages(fishArray, debug = false) {
  if (!Array.isArray(fishArray) || fishArray.length === 0) {
    return;
  }

  if (debug) {
    console.log(`Starting region prefetch strategy for ${fishArray.length} fish`);
  }

  // Phase 1: Prefetch ALL images for first 3 cards
  const firstThree = fishArray.slice(0, 3);
  firstThree.forEach((fish, index) => {
    const priority = index === 0 ? 'high' : 'low';
    if (debug) {
      console.log(`Phase 1 - Card ${index + 1}: ${fish.SpeciesName}`);
    }
    prefetchFullGallery(fish, priority, debug);
  });

  // Phase 2: Prefetch only first image for next 3 cards (cards 4-6)
  setTimeout(() => {
    const nextThree = fishArray.slice(3, 6);
    if (debug) {
      console.log(`Phase 2 - Prefetching first images for cards 4-6`);
    }
    nextThree.forEach((fish, index) => {
      const firstImageUrl = getFirstImageUrl(fish);
      if (firstImageUrl) {
        if (debug) {
          console.log(`  - Card ${index + 4}: ${fish.SpeciesName} first image`);
        }
        prefetchImage(firstImageUrl, 'low');
      }
    });
  }, 500); // Small delay to prioritize first 3 cards
}

/**
 * Prefetch remaining gallery images for a fish when it comes into view
 * @param {Object} fish - Fish data object
 * @param {boolean} debug - Enable debug logging
 */
export function prefetchRemainingGallery(fish, debug = false) {
  if (!fish || !fish.ImageGallery || !Array.isArray(fish.ImageGallery)) {
    return;
  }

  // Skip first image (should already be prefetched) and prefetch the rest
  const remainingImages = fish.ImageGallery.slice(1);

  if (debug && remainingImages.length > 0) {
    console.log(`Prefetching ${remainingImages.length} remaining images for ${fish.SpeciesName}`);
  }

  remainingImages.forEach((image, index) => {
    if (image.src) {
      prefetchImage(image.src, 'low');
      if (debug) {
        console.log(`  - Remaining image ${index + 2}/${fish.ImageGallery.length}`);
      }
    }
  });
}

/**
 * Clear the prefetched URLs cache (useful for testing or memory management)
 */
export function clearPrefetchCache() {
  prefetchedUrls.clear();
}

/**
 * Get statistics about the prefetch cache
 * @returns {Object} Cache statistics
 */
export function getPrefetchStats() {
  return {
    cachedUrls: prefetchedUrls.size,
    urls: Array.from(prefetchedUrls)
  };
}
