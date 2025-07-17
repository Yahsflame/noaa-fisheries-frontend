const prefetchedUrls = new Set();

export function getFirstImageUrl(fish) {
  if (fish.ImageGallery && fish.ImageGallery.length > 0) {
    return fish.ImageGallery[0].src;
  }

  if (fish.SpeciesIllustrationPhoto && fish.SpeciesIllustrationPhoto.src) {
    return fish.SpeciesIllustrationPhoto.src;
  }

  return null;
}

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

    document.head.appendChild(link);

    prefetchedUrls.add(imageUrl);

    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 10000);

  } catch (error) {
    console.warn('Failed to prefetch image:', imageUrl, error);
  }
}

export function prefetchFirstImages(fishArray, count = 3, priority = 'low') {
  if (!Array.isArray(fishArray) || fishArray.length === 0) {
    return;
  }

  const fishToPrefetch = fishArray.slice(0, count);

  fishToPrefetch.forEach((fish, index) => {
    const imageUrl = getFirstImageUrl(fish);
    if (imageUrl) {
      const imagePriority = index === 0 ? 'high' : priority;
      prefetchImage(imageUrl, imagePriority);
    }
  });
}

export function prefetchFullGallery(fish, priority = 'low', debug = false) {
  if (!fish || !fish.ImageGallery || !Array.isArray(fish.ImageGallery)) {
    return;
  }

  if (debug) {
    console.log(`Prefetching full gallery for ${fish.SpeciesName}: ${fish.ImageGallery.length} images`);
  }

  fish.ImageGallery.forEach((image, index) => {
    if (image.src) {
      const imagePriority = index === 0 ? 'high' : priority;
      prefetchImage(image.src, imagePriority);

      if (debug) {
        console.log(`  - Image ${index + 1}/${fish.ImageGallery.length}: ${imagePriority} priority`);
      }
    }
  });
}

export function prefetchRegionImages(fishArray, debug = false) {
  if (!Array.isArray(fishArray) || fishArray.length === 0) {
    return;
  }

  if (debug) {
    console.log(`Starting region prefetch strategy for ${fishArray.length} fish`);
  }

  const firstThree = fishArray.slice(0, 3);
  firstThree.forEach((fish, index) => {
    const priority = index === 0 ? 'high' : 'low';
    if (debug) {
      console.log(`Phase 1 - Card ${index + 1}: ${fish.SpeciesName}`);
    }
    prefetchFullGallery(fish, priority, debug);
  });

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
  }, 500);
}

export function prefetchRemainingGallery(fish, debug = false) {
  if (!fish || !fish.ImageGallery || !Array.isArray(fish.ImageGallery)) {
    return;
  }

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

export function clearPrefetchCache() {
  prefetchedUrls.clear();
}

export function getPrefetchStats() {
  return {
    cachedUrls: prefetchedUrls.size,
    urls: Array.from(prefetchedUrls)
  };
}
