import { cache } from "@solidjs/router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const API_KEY = import.meta.env.VITE_API_KEY;

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

class ApiService {
  async fetchAllFishData() {
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

  async fetchRegions() {
    try {
      const fishData = await this.fetchAllFishData();
      const regionMap = new Map();

      fishData.forEach((fish) => {
        const regionName = fish.NOAAFisheriesRegion;
        if (!regionName) return;

        if (!regionMap.has(regionName)) {
          regionMap.set(regionName, {
            name: regionName,
            fish: [],
            totalCalories: 0,
            totalFat: 0,
            count: 0,
          });
        }

        const region = regionMap.get(regionName);
        region.fish.push(fish);

        const calories = parseFloat(fish.Calories) || 0;
        const fat = parseFloat(fish.FatTotal?.replace(" g", "")) || 0;

        region.totalCalories += calories;
        region.totalFat += fat;
        region.count++;
      });

      return Array.from(regionMap.values()).map((region) => ({
        name: region.name,
        avgCalories: region.count > 0 ? region.totalCalories / region.count : 0,
        avgFat: region.count > 0 ? region.totalFat / region.count : 0,
        fishCount: region.count,
      }));
    } catch (error) {
      console.error("Error processing regions:", error);
      throw error;
    }
  }

  async fetchRegionData(regionId) {
    try {
      const regions = await this.fetchRegions();
      const regionName = this.formatRegionIdToName(regionId);
      return regions.find((region) => region.name === regionName);
    } catch (error) {
      console.error(`Error fetching region ${regionId}:`, error);
      throw error;
    }
  }

  async fetchFishByRegion(regionId) {
    try {
      const fishData = await this.fetchAllFishData();
      const regionName = this.formatRegionIdToName(regionId);
      return fishData.filter((fish) => fish.NOAAFisheriesRegion === regionName);
    } catch (error) {
      console.error(`Error fetching fish for region ${regionId}:`, error);
      throw error;
    }
  }

  formatRegionIdToName(regionId) {
    return regionId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatRegionNameToId(regionName) {
    return regionName.toLowerCase().replace(/\s+/g, "-");
  }
}
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

function formatRegionNameToId(regionName) {
  if (!regionName) return "";
  return regionName.toLowerCase().replace(/\s+/g, "-");
}

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

export default new ApiService();
