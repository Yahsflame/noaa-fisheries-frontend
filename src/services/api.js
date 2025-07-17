import { cache } from "@solidjs/router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const API_KEY = import.meta.env.VITE_API_KEY;

// Utility functions for region name formatting
export function formatRegionNameToId(regionName) {
  if (!regionName) return "";
  return regionName.toLowerCase().replace(/\s+/g, "-");
}

export function formatRegionIdToName(regionId) {
  return regionId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// Core data fetching function
export const getAllFishData = cache(async () => {
  "use server";
  console.log("[SSR] Fetching all fish data on server...");
  try {
    const response = await fetch(`${API_BASE_URL}/gofish?apikey=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`[SSR] Successfully fetched ${data.length} fish records`);
    return data;
  } catch (error) {
    console.error("[SSR] Error fetching fish data:", error);
    throw error;
  }
}, "allFishData");

// Client-side fish data fetching
export async function fetchAllFishData() {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch(`${API_BASE_URL}/gofish?apikey=${API_KEY}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching fish data:", error);
      throw error;
    }
  }
  return await getAllFishData();
}

// Region statistics calculation
function calculateRegionStats(fishData) {
  const regionMap = new Map();

  fishData.forEach((fish) => {
    const region = fish.NOAAFisheriesRegion;
    if (!region) return;

    if (!regionMap.has(region)) {
      regionMap.set(region, {
        name: region,
        fish: [],
        totalCalories: 0,
        totalFat: 0,
        validCalories: 0,
        validFat: 0,
      });
    }

    const regionData = regionMap.get(region);
    regionData.fish.push(fish);

    const calories = parseFloat(fish.Calories);
    if (!isNaN(calories)) {
      regionData.totalCalories += calories;
      regionData.validCalories++;
    }

    const fatStr = fish.FatTotal;
    if (fatStr) {
      const fat = parseFloat(fatStr.replace(/[^\d.]/g, ""));
      if (!isNaN(fat)) {
        regionData.totalFat += fat;
        regionData.validFat++;
      }
    }
  });

  return Array.from(regionMap.values()).map((region) => ({
    name: region.name,
    fishCount: region.fish.length,
    avgCalories: region.validCalories > 0 ? region.totalCalories / region.validCalories : null,
    avgFat: region.validFat > 0 ? region.totalFat / region.validFat : null,
  }));
}

// SSR-cached regions data
export const getRegionsData = cache(async () => {
  "use server";
  console.log("[SSR] Processing regions data on server...");
  try {
    const fishData = await getAllFishData();
    const regions = calculateRegionStats(fishData);
    console.log(`[SSR] Processed ${regions.length} regions`);
    return regions;
  } catch (error) {
    console.error("[SSR] Error fetching regions on server:", error);
    throw error;
  }
}, "regionsData");

// Client-side regions fetching
export async function fetchRegions() {
  try {
    const fishData = await fetchAllFishData();
    const regions = calculateRegionStats(fishData);
    return regions;
  } catch (error) {
    console.error("Error processing regions:", error);
    throw error;
  }
}

// SSR-cached fish by region
export const getFishByRegion = cache(async (regionId) => {
  "use server";
  console.log(`[SSR] Fetching fish data for region: ${regionId}`);
  try {
    const fishData = await getAllFishData();
    const regionFish = fishData.filter(
      (fish) =>
        formatRegionNameToId(fish.NOAAFisheriesRegion) === regionId,
    );
    console.log(`[SSR] Found ${regionFish.length} fish for region ${regionId}`);
    return regionFish;
  } catch (error) {
    console.error(`[SSR] Error fetching fish by region ${regionId}:`, error);
    throw error;
  }
}, "fishByRegion");

// Client-side fish by region fetching
export async function fetchFishByRegion(regionId) {
  try {
    const fishData = await fetchAllFishData();
    const regionName = formatRegionIdToName(regionId);
    return fishData.filter((fish) => fish.NOAAFisheriesRegion === regionName);
  } catch (error) {
    console.error(`Error fetching fish for region ${regionId}:`, error);
    throw error;
  }
}

// SSR-cached region data
export const getRegionData = cache(async (regionId) => {
  "use server";
  console.log(`[SSR] Fetching region metadata for: ${regionId}`);
  try {
    const regions = await getRegionsData();
    const region = regions.find(region =>
      formatRegionNameToId(region.name) === regionId
    );
    console.log(`[SSR] Found region: ${region?.name || 'Not found'}`);
    return region;
  } catch (error) {
    console.error(`[SSR] Error fetching region data for ${regionId}:`, error);
    throw error;
  }
}, "regionData");

// Client-side region data fetching
export async function fetchRegionData(regionId) {
  try {
    const regions = await fetchRegions();
    const regionName = formatRegionIdToName(regionId);
    return regions.find((region) => region.name === regionName);
  } catch (error) {
    console.error(`Error fetching region ${regionId}:`, error);
    throw error;
  }
}
