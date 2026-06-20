import { GoogleGenAI, Type } from "@google/genai";

// Ensure we initialize the Google GenAI SDK lazily and only on demand
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured. Running mock engine fallback.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Interface declarations matching UI metrics
export interface RiskScoreInput {
  district: string;
  windSpeed: number; // km/h
  precipitation: number; // mm/h
  tidalSurge: number; // meters
  populationDensity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskScoreResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  warningLevel: 'Yellow' | 'Orange' | 'Red';
  analysis: string;
  factors: {
    factor: string;
    weight: number;
    score: number;
    analysis: string;
  }[];
}

export interface ResourceRecommendationInput {
  riskScore: number;
  district: string;
  primaryHazard: 'Flood' | 'Cyclone' | 'Landslide' | 'Earthquake' | 'Cloudburst';
  affectedPeopleEstimate: number;
}

export interface ResourceRecommendationResult {
  recommendations: {
    teamType: 'NDRF Unit' | 'State Air Wing' | 'Medical Emergency Unit' | 'Civil Defense Force';
    count: number;
    priority: 'Low' | 'Medium' | 'High';
    reasoning: string;
  }[];
  supplies: {
    item: string;
    quantity: number;
    unit: string;
    priority: 'Low' | 'Medium' | 'High';
  }[];
  airSupportRequired: boolean;
  airSupportReasoning: string;
}

export interface ShelterRecommendationInput {
  district: string;
  disasterType: string;
  requiredCapacity: number;
  activeShelters: {
    id: string;
    name: string;
    district: string;
    capacity: number;
    occupancy: number;
    bedsOpen: number;
    potableWaterLiters: number;
    mrePacks: number;
  }[];
}

export interface ShelterRecommendationResult {
  recommendedShelterId: string;
  routeFeasibility: 'Safe' | 'Caution' | 'Impassable';
  allocationReasoning: string;
  occupancyProjections: {
    timeOffsetHours: number;
    estimatedOccupancyPercent: number;
  }[];
  alternativeShelterId: string;
}

export interface RouteSafetyInput {
  startCoords: { lat: number; lng: number };
  endCoords: { lat: number; lng: number };
  transportMode: 'Ambulance' | 'HeavyTruck' | 'Helicopter' | 'InflatableBoat';
  hazardZones: { lat: number; lng: number; radiusMeters: number; type: string }[];
}

export interface RouteSafetyResult {
  safetyScore: number;
  safetyStatus: 'Safe' | 'Alternative Required' | 'Danger Zone';
  identifiedHazards: string[];
  distanceKm: number;
  estimatedTravelTimeMins: number;
  alternateRouteSuggested: boolean;
  alternateNavigationInstructions: string;
}

/**
 * DETERMINISTIC MOCK AI GENERATOR (Default Fallback)
 * Calculates highly realistic disaster values dynamically based on physical metrics
 */
export const mockPredictionEngine = {
  calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
    const { district, windSpeed, precipitation, tidalSurge, populationDensity } = input;
    
    // Calculate weights
    const windWeight = Math.min((windSpeed / 160) * 30, 30);
    const rainWeight = Math.min((precipitation / 60) * 35, 35);
    const surgeWeight = Math.min((tidalSurge / 5) * 20, 20);
    
    let densityFactor = 5;
    if (populationDensity === 'medium') densityFactor = 8;
    if (populationDensity === 'high') densityFactor = 12;
    if (populationDensity === 'critical') densityFactor = 15;

    const cumulativeScore = Math.floor(windWeight + rainWeight + surgeWeight + densityFactor);
    const score = Math.max(0, Math.min(cumulativeScore, 100));

    let riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme' = 'Low';
    let warningLevel: 'Yellow' | 'Orange' | 'Red' = 'Yellow';

    if (score >= 75) {
      riskLevel = 'Extreme';
      warningLevel = 'Red';
    } else if (score >= 50) {
      riskLevel = 'High';
      warningLevel = 'Red';
    } else if (score >= 25) {
      riskLevel = 'Medium';
      warningLevel = 'Orange';
    }

    const factors = [
      {
        factor: "Atmospheric Wind Velocity",
        weight: 30,
        score: Math.floor(windWeight * (100 / 30)),
        analysis: windSpeed > 100 
          ? `Gale currents at ${windSpeed} km/h present major flying debris and structural failure hazards.` 
          : `Moderate wind currents at ${windSpeed} km/h under critical infrastructure tolerances.`
      },
      {
        factor: "Meteorological Precipitation Intensity",
        weight: 35,
        score: Math.floor(rainWeight * (100 / 35)),
        analysis: precipitation > 35 
          ? `Severe cloudburst runoff at ${precipitation} mm/h exceeding drainage spill capacities.` 
          : `Stable runoff accumulation at ${precipitation} mm/h within metropolitan limits.`
      },
      {
        factor: "Estuary Tidal Surge displacement",
        weight: 20,
        score: Math.floor(surgeWeight * (100 / 20)),
        analysis: tidalSurge > 2.5 
          ? `Extreme coastal water surge at +${tidalSurge}m. Waterfront slums and low-lying assets are directly threatened.` 
          : `Marginal elevation at +${tidalSurge}m. Silt protection levels are holding.`
      },
      {
        factor: "Population Density Clearance Vector",
        weight: 15,
        score: Math.floor((densityFactor / 15) * 100),
        analysis: `Zone density categorised as [${populationDensity.toUpperCase()}]. evacuation buffers are restricted by high spatial density.`
      }
    ];

    return {
      riskScore: score,
      riskLevel,
      warningLevel,
      analysis: `AI PREDICTION OVERLAY FOR [${district.toUpperCase()}]: Current meteorological readings suggest a ${riskLevel.toLowerCase()}-risk hazard corridor. Primary safety threats are driven by ${precipitation > 35 ? 'flood surge' : 'gale wind loads'}. Suggested defensive action: marshal rescue items to boundary line.`,
      factors
    };
  },

  calculateResourceRecommendations(input: ResourceRecommendationInput): ResourceRecommendationResult {
    const { riskScore, district, primaryHazard, affectedPeopleEstimate } = input;

    const recommendations: ResourceRecommendationResult['recommendations'] = [];
    const supplies: ResourceRecommendationResult['supplies'] = [];

    // Calculate resource needs based on scale
    if (primaryHazard === 'Flood' || primaryHazard === 'Cloudburst') {
      recommendations.push({
        teamType: 'NDRF Unit',
        count: Math.max(1, Math.min(5, Math.ceil(affectedPeopleEstimate / 400))),
        priority: riskScore > 60 ? 'High' : 'Medium',
        reasoning: "Urgent deployment of inflatable boats and swiftwater technicians to aid evacuation of low-lying shelters."
      });
      recommendations.push({
        teamType: 'Medical Emergency Unit',
        count: Math.max(1, Math.min(4, Math.ceil(affectedPeopleEstimate / 600))),
        priority: riskScore > 75 ? 'High' : 'Medium',
        reasoning: "Set up trauma stations on dry shorelines for stranded survivors showing signals of dehydration or hypothermia."
      });
    } else if (primaryHazard === 'Cyclone') {
      recommendations.push({
        teamType: 'Civil Defense Force',
        count: Math.max(1, Math.min(6, Math.ceil(affectedPeopleEstimate / 300))),
        priority: riskScore > 50 ? 'High' : 'Medium',
        reasoning: "Equipped with power saws and heavy-duty steel cutters to clear major highways blocked by downcast power gantries."
      });
      recommendations.push({
        teamType: 'State Air Wing',
        count: riskScore > 70 ? 2 : 1,
        priority: riskScore > 75 ? 'High' : 'Low',
        reasoning: "Airborne transport required for critical medical drops across severed transport bridges."
      });
    } else {
      // General disasters
      recommendations.push({
        teamType: 'Civil Defense Force',
        count: Math.max(1, Math.min(3, Math.ceil(affectedPeopleEstimate / 500))),
        priority: 'Medium',
        reasoning: "General security, perimeter barriers, and logistical coordination force."
      });
    }

    // Dynamic supplies
    supplies.push({
      item: "Potable Drinking Water (Bulk)",
      quantity: Math.ceil(affectedPeopleEstimate * 3.5),
      unit: "Liters",
      priority: riskScore > 50 ? 'High' : 'Medium'
    });
    supplies.push({
      item: "MRE Dry Meals Box",
      quantity: Math.ceil(affectedPeopleEstimate * 2),
      unit: "Packs",
      priority: 'Medium'
    });
    supplies.push({
      item: "Trauma Tactical First-Aid Kits",
      quantity: Math.min(500, Math.ceil(affectedPeopleEstimate * 0.1)),
      unit: "Kits",
      priority: riskScore > 70 ? 'High' : 'Medium'
    });

    if (primaryHazard === 'Flood') {
      supplies.push({
        item: "Water Purification Tablets",
        quantity: Math.ceil(affectedPeopleEstimate * 10),
        unit: "Pills",
        priority: 'High'
      });
    }

    return {
      recommendations,
      supplies,
      airSupportRequired: riskScore > 70 || primaryHazard === 'Landslide',
      airSupportReasoning: riskScore > 70 
        ? `Air Lift required due to major route severances across flooded sectors.` 
        : `Mountainous mudflows make highway transit highly unstable.`
    };
  },

  calculateShelterRecommendations(input: ShelterRecommendationInput): ShelterRecommendationResult {
    const { district, disasterType, requiredCapacity, activeShelters } = input;

    if (activeShelters.length === 0) {
      throw new Error("No operational shelters available to bind recommendation.");
    }

    // Filter shelters by District if possible, score based on bedsOpen and capacity
    const scoredShelters = activeShelters.map(shelter => {
      let score = 0;
      // Prefer same district
      if (shelter.district.toLowerCase() === district.toLowerCase()) {
        score += 50;
      }
      // Prefer shelters with open beds
      score += Math.min(30, (shelter.bedsOpen / shelter.capacity) * 100);
      
      // Penalty if almost full (under 10 beds)
      if (shelter.bedsOpen < 15) {
        score -= 40;
      }
      
      // Prefer plenty of water and meals
      if (shelter.potableWaterLiters > 3000) score += 10;
      if (shelter.mrePacks > 1000) score += 10;

      return { shelter, score };
    });

    // Sort descending
    scoredShelters.sort((a, b) => b.score - a.score);

    const recommendedShelter = scoredShelters[0]?.shelter || activeShelters[0];
    const alternativeShelter = scoredShelters[1]?.shelter || activeShelters[0];

    // Determine feasibility
    let routeFeasibility: 'Safe' | 'Caution' | 'Impassable' = 'Safe';
    if (disasterType === 'Flood' && recommendedShelter.district !== district) {
      routeFeasibility = 'Caution';
    } else if (disasterType === 'Cyclone' && recommendedShelter.occupancy > recommendedShelter.capacity * 0.95) {
      routeFeasibility = 'Caution';
    }

    return {
      recommendedShelterId: recommendedShelter.id,
      routeFeasibility,
      allocationReasoning: `AI ALLOCATION MODEL: Shelter [${recommendedShelter.name}] chosen as primary recommendation. It presents ${recommendedShelter.bedsOpen} open beds and stable fresh water buffers (${recommendedShelter.potableWaterLiters}L). Alternate is [${alternativeShelter.name}].`,
      occupancyProjections: [
        { timeOffsetHours: 2, estimatedOccupancyPercent: Math.min(100, Math.floor((recommendedShelter.occupancy + requiredCapacity * 0.3) / recommendedShelter.capacity * 100)) },
        { timeOffsetHours: 4, estimatedOccupancyPercent: Math.min(100, Math.floor((recommendedShelter.occupancy + requiredCapacity * 0.7) / recommendedShelter.capacity * 100)) },
        { timeOffsetHours: 8, estimatedOccupancyPercent: Math.min(100, Math.floor((recommendedShelter.occupancy + requiredCapacity) / recommendedShelter.capacity * 100)) }
      ],
      alternativeShelterId: alternativeShelter.id
    };
  },

  calculateRouteSafety(input: RouteSafetyInput): RouteSafetyResult {
    const { startCoords, endCoords, transportMode, hazardZones } = input;

    // Direct distance calculation d = sqrt(x^2 + y^2) * scale
    const dLat = endCoords.lat - startCoords.lat;
    const dLng = endCoords.lng - startCoords.lng;
    const distanceKm = parseFloat((Math.sqrt(dLat * dLat + dLng * dLng) * 111.3).toFixed(2));

    // Check overlap with hazard zones (Simulated checks)
    const identifiedHazards: string[] = [];
    let overlapCount = 0;

    // Look through hazards or simulate if empty
    if (hazardZones && hazardZones.length > 0) {
      hazardZones.forEach(zone => {
        // Find distance to zone mid
        const zLat = zone.lat - ((startCoords.lat + endCoords.lat) / 2);
        const zLng = zone.lng - ((startCoords.lng + endCoords.lng) / 2);
        const distToZone = Math.sqrt(zLat * zLat + zLng * zLng) * 111300; // in meters
        
        if (distToZone < zone.radiusMeters + 2000) {
          overlapCount++;
          identifiedHazards.push(`Encountered active [${zone.type}] cluster sector (${distToZone.toFixed(0)}m proximity)`);
        }
      });
    }

    // Default safety hazards if none passed
    if (identifiedHazards.length === 0) {
      if (distanceKm > 5) {
        identifiedHazards.push("Severe water accumulation at primary subway arterial");
        identifiedHazards.push("Potential downcast low-tension power cables");
        overlapCount = 2;
      } else {
        identifiedHazards.push("Wet slippery tarmac & restricted high-speed visibility");
        overlapCount = 1;
      }
    }

    let safetyScore = 100 - (overlapCount * 25);
    // Adjustment based on transport mode
    if (transportMode === 'Helicopter') {
      safetyScore = Math.min(95, safetyScore + 15); // Air bypasses street flooding
    } else if (transportMode === 'InflatableBoat' && identifiedHazards.join().toLowerCase().includes("water")) {
      safetyScore = Math.min(90, safetyScore + 20); // Boats are perfect for water hazards
    }

    safetyScore = Math.max(10, Math.min(safetyScore, 100));

    let safetyStatus: 'Safe' | 'Alternative Required' | 'Danger Zone' = 'Safe';
    if (safetyScore < 40) {
      safetyStatus = 'Danger Zone';
    } else if (safetyScore < 75) {
      safetyStatus = 'Alternative Required';
    }

    // Estimated speed based on mode
    let avgSpeedKmh = 25;
    if (transportMode === 'Helicopter') avgSpeedKmh = 140;
    else if (transportMode === 'Ambulance') avgSpeedKmh = 40;
    else if (transportMode === 'HeavyTruck') avgSpeedKmh = 30;
    else if (transportMode === 'InflatableBoat') avgSpeedKmh = 15;

    const baseTime = (distanceKm / avgSpeedKmh) * 60;
    const estimatedTravelTimeMins = Math.ceil(baseTime * (1 + (100 - safetyScore) / 40));

    return {
      safetyScore,
      safetyStatus,
      identifiedHazards,
      distanceKm,
      estimatedTravelTimeMins,
      alternateRouteSuggested: safetyStatus !== 'Safe',
      alternateNavigationInstructions: safetyStatus !== 'Safe' 
        ? `TACTICAL REDIRECT: Avoid the primary arterial bridge. Reroute convoy via high-elevation flyover or coordinate State Air Wing crane lifting to direct zone targets.` 
        : `Stay on scheduled course. Convene safety beacons and proceed below 30 km/h with high beams active.`
    };
  }
};

/**
 * GENUINE GEMINI PREDICTIONS (Triggers if process.env.GEMINI_API_KEY is defined)
 */
export const geminiPredictionEngine = {
  async calculateRiskScore(input: RiskScoreInput): Promise<RiskScoreResult> {
    try {
      const ai = getAi();
      const prompt = `Perform localized disaster risk evaluation.
Inputs:
- District/Location: ${input.district}
- Wind Speed: ${input.windSpeed} km/h
- Precipitation Rate: ${input.precipitation} mm/h
- Tidal Surge Displacement: +${input.tidalSurge}m
- Population Density Level: ${input.populationDensity}

Analyze these parameters and calculate risk metrics. Return only the JSON response conforming to the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional meteorological risk analyst. Return a highly structured JSON evaluation object.",
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.INTEGER, description: "A calculated cumulative risk rating from 0 to 100." },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Extreme"] },
              warningLevel: { type: Type.STRING, enum: ["Yellow", "Orange", "Red"] },
              analysis: { type: Type.STRING, description: "Detailed summary analysis describing the danger corridors." },
              factors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    factor: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    score: { type: Type.NUMBER },
                    analysis: { type: Type.STRING }
                  },
                  required: ["factor", "weight", "score", "analysis"]
                }
              }
            },
            required: ["riskScore", "riskLevel", "warningLevel", "analysis", "factors"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response received from Gemini API");
      }
      return JSON.parse(response.text.trim());
    } catch (e: any) {
      console.warn("Gemini Risk Calculation failed. Reverting to local mock engine.", e.message);
      return mockPredictionEngine.calculateRiskScore(input);
    }
  },

  async calculateResourceRecommendations(input: ResourceRecommendationInput): Promise<ResourceRecommendationResult> {
    try {
      const ai = getAi();
      const prompt = `Process tactical relief force recommendation.
Inputs:
- Risk Score: ${input.riskScore}
- Location District: ${input.district}
- Crisis Hazard: ${input.primaryHazard}
- Estimated Impacted Citizens: ${input.affectedPeopleEstimate}

Provide specific emergency team dispatches and bulk supplies enqueued. Return JSON only.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a disaster logistics coordination center AI. Formulate accurate team counts and meal supplies. Return JSON matching the schema.",
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    teamType: { type: Type.STRING, enum: ["NDRF Unit", "State Air Wing", "Medical Emergency Unit", "Civil Defense Force"] },
                    count: { type: Type.INTEGER },
                    priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                    reasoning: { type: Type.STRING }
                  },
                  required: ["teamType", "count", "priority", "reasoning"]
                }
              },
              supplies: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: {
                     item: { type: Type.STRING },
                     quantity: { type: Type.INTEGER },
                     unit: { type: Type.STRING },
                     priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                   },
                   required: ["item", "quantity", "unit", "priority"]
                }
              },
              airSupportRequired: { type: Type.BOOLEAN },
              airSupportReasoning: { type: Type.STRING }
            },
            required: ["recommendations", "supplies", "airSupportRequired", "airSupportReasoning"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response received from Gemini API");
      }
      return JSON.parse(response.text.trim());
    } catch (e: any) {
      console.warn("Gemini Resource Recommendation failed. Reverting to mock engine.", e.message);
      return mockPredictionEngine.calculateResourceRecommendations(input);
    }
  },

  async calculateShelterRecommendations(input: ShelterRecommendationInput): Promise<ShelterRecommendationResult> {
    try {
      const ai = getAi();
      const prompt = `Process tactical shelter allocation logic.
Inputs:
- Target District: ${input.district}
- Crisis Mode: ${input.disasterType}
- Evacuees Count: ${input.requiredCapacity}
- Operational Shelters Roster: ${JSON.stringify(input.activeShelters)}

Calculate the best matched shelter ID, describe why, and estimate 2h/4h/8h occupancy growth. Return JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the shelter assignment system coordinator. Identify the best shelter based on bedsOpen, capacity, and district proximity. Return JSON details.",
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedShelterId: { type: Type.STRING, description: "Highly matched standard id from activeShelters" },
              routeFeasibility: { type: Type.STRING, enum: ["Safe", "Caution", "Impassable"] },
              allocationReasoning: { type: Type.STRING },
              occupancyProjections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeOffsetHours: { type: Type.INTEGER },
                    estimatedOccupancyPercent: { type: Type.INTEGER }
                  },
                  required: ["timeOffsetHours", "estimatedOccupancyPercent"]
                }
              },
              alternativeShelterId: { type: Type.STRING }
            },
            required: ["recommendedShelterId", "routeFeasibility", "allocationReasoning", "occupancyProjections", "alternativeShelterId"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response received from Gemini API");
      }
      return JSON.parse(response.text.trim());
    } catch (e: any) {
      console.warn("Gemini Shelter matching failed. Reverting to mock engine.", e.message);
      return mockPredictionEngine.calculateShelterRecommendations(input);
    }
  },

  async calculateRouteSafety(input: RouteSafetyInput): Promise<RouteSafetyResult> {
    try {
      const ai = getAi();
      const prompt = `Process conveyor transit safety routing risk.
Inputs:
- Start Coordinates: Lat ${input.startCoords.lat}, Lng ${input.startCoords.lng}
- Destination Coordinates: Lat ${input.endCoords.lat}, Lng ${input.endCoords.lng}
- Transport Vehicle Category: ${input.transportMode}
- Hazard Zones in Grid: ${JSON.stringify(input.hazardZones)}

Estimate travel safety index, obstacles, route distance and suggest alternatives if score is poor. Return JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a hazardous tactical logistics routing system AI. Analyze the proximity of start/end segments to hazard zone centers. Return JSON mapping.",
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              safetyScore: { type: Type.INTEGER, description: "Route safety probability rating 0-100." },
              safetyStatus: { type: Type.STRING, enum: ["Safe", "Alternative Required", "Danger Zone"] },
              identifiedHazards: { type: Type.ARRAY, items: { type: Type.STRING } },
              distanceKm: { type: Type.NUMBER },
              estimatedTravelTimeMins: { type: Type.INTEGER },
              alternateRouteSuggested: { type: Type.BOOLEAN },
              alternateNavigationInstructions: { type: Type.STRING }
            },
            required: ["safetyScore", "safetyStatus", "identifiedHazards", "distanceKm", "estimatedTravelTimeMins", "alternateRouteSuggested", "alternateNavigationInstructions"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response received from Gemini API");
      }
      return JSON.parse(response.text.trim());
    } catch (e: any) {
      console.warn("Gemini Route calculation failed. Reverting to mock engine.", e.message);
      return mockPredictionEngine.calculateRouteSafety(input);
    }
  }
};
