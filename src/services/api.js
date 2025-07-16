// API service for NOAA Fisheries data - Updated to use port 5001 and work with actual data structure
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const API_KEY = import.meta.env.VITE_API_KEY;

class ApiService {
  async fetchAllFishData() {
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

  // Process fish data to group by regions and calculate averages
  async fetchRegions() {
    try {
      const fishData = await this.fetchAllFishData();
      const regionMap = new Map();

      // Group fish by NOAAFisheriesRegion
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

        // Parse nutritional data
        const calories = parseFloat(fish.Calories) || 0;
        const fat = parseFloat(fish.FatTotal?.replace(" g", "")) || 0;

        region.totalCalories += calories;
        region.totalFat += fat;
        region.count++;
      });

      // Calculate averages and return regions
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

export default new ApiService();
