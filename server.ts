import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { geminiPredictionEngine, mockPredictionEngine } from "./server/predictionService";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Track active real-time WebSocket clients
  const connectedClients: Set<WebSocket> = new Set();
  const broadcastEvent = (type: string, data: any) => {
    const payload = JSON.stringify({ type, data });
    connectedClients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        try {
          client.send(payload);
        } catch (e) {
          console.error("Failed to send socket payload", e);
        }
      }
    });
  };

  app.use(express.json());

  // --- IN-MEMORY REAL-TIME SECURE SECURE STORE DATABASES ---
  let DB_INCIDENTS = [
    {
      id: "INC-3081",
      type: "Flood",
      title: "Embankment Breach - Ward 12",
      district: "North Suburbs",
      coords: { lat: 22.57, lng: 88.36 },
      priority: "Critical",
      status: "Active",
      time: "10 mins ago",
      reporter: "V. Sharma (Local volunteer)",
      contact: "+91 98765 43210",
      details: "Primary river defense wall has given way due to prolonged heavy downpours. Fast current flooding populated settlements in Sector 4. Elderly residents are stranded in single-story homes."
    },
    {
      id: "INC-3082",
      type: "Cyclone",
      title: "High Wind Structural Damage",
      district: "Coastal Transit",
      coords: { lat: 21.98, lng: 88.05 },
      priority: "High",
      status: "Escalated",
      time: "25 mins ago",
      reporter: "Police Outpost Block 3",
      contact: "+91 99334 11220",
      details: "Wind speeds touching 140 km/h have ripped heavy power gantries down, completely blocking the arterial Coastal highway and blocking evacuation buses.",
      assignedTeam: "Coastal Rescue-9"
    },
    {
      id: "INC-3083",
      type: "Landslide",
      title: "Debris flow on Route 10A",
      district: "Hill Region",
      coords: { lat: 22.82, lng: 88.42 },
      priority: "High",
      status: "Deployed",
      time: "48 mins ago",
      reporter: "Highway Patrol Squad-4",
      contact: "+91 91100 88776",
      details: "Mudflow has completely buried and choked a 200m section of the highway near milepost 14. Severe rockfall hazard persists. Clear-up crew is onsite.",
      assignedTeam: "Heli-Evac Alpha"
    },
    {
      id: "INC-3084",
      type: "Earthquake",
      title: "Minor Collapse - Building B",
      district: "Central Metro",
      coords: { lat: 22.54, lng: 88.33 },
      priority: "Medium",
      status: "Resolved",
      time: "2 hours ago",
      reporter: "Municipal Fire Services",
      contact: "+91 93221 44556",
      details: "Trombone tremors caused a structural plaster collapse. Entire complex inspected. Found structurally stable, area cordoned off safely.",
      assignedTeam: "City NDRF-4"
    }
  ];

  let DB_SOS_ALERTS = [
    {
      id: "SOS-9421",
      district: "Waterfront slums",
      coords: { lat: 22.59, lng: 88.40 },
      time: "3 mins ago",
      reporterPhone: "+91 97755 33221",
      message: "Water level is past my chest inside the warehouse! 8 of us are huddled up on steel crates. Need rescue, please respond fast. Mobile battery at 11%.",
      status: "Unassigned",
      powerLevel: 11,
      floodLevel: "1.4m and rising",
      recommendedTeamType: "NDRF Unit"
    },
    {
      id: "SOS-9418",
      district: "South Delta Crossing",
      coords: { lat: 22.48, lng: 88.22 },
      time: "12 mins ago",
      reporterPhone: "+91 98311 00445",
      message: "A heavy fallen tree has crushed our ambulance vehicle! Patient with critical oxygen requirement is trapped inside. Need aerial lift or cutters immediately.",
      status: "Allocating",
      powerLevel: 34,
      windSpeed: "120 km/h",
      recommendedTeamType: "State Air Wing"
    },
    {
      id: "SOS-9415",
      district: "Kharagpur Outpost",
      coords: { lat: 22.33, lng: 87.32 },
      time: "32 mins ago",
      reporterPhone: "+91 99445 66778",
      message: "Primary power grid completely offline. Community shelter run out of backup fuel for vaccine fridge. Requesting emergency fuel delivery.",
      status: "Dispatched",
      powerLevel: 57,
      recommendedTeamType: "Civil Defense Force"
    }
  ];

  let DB_SHELTERS = [
    {
      id: "SHL-401",
      name: "St. Xavier Community Stadium",
      district: "Central Metro",
      coordinates: { lat: 22.53, lng: 88.35 },
      capacity: 1200,
      occupancy: 980,
      bedsOpen: 220,
      medicalShortages: ["Insulin", "Anti-venom", "Pediatric rehydration"],
      potableWaterLiters: 4500,
      mrePacks: 1800,
      contact: "+91 33 2287 4511"
    },
    {
      id: "SHL-402",
      name: "Golden Meadows High School",
      district: "North Suburbs",
      coordinates: { lat: 22.61, lng: 88.38 },
      capacity: 800,
      occupancy: 785,
      bedsOpen: 15,
      medicalShortages: ["First-aid kits", "Painkillers"],
      potableWaterLiters: 1200,
      mrePacks: 450,
      contact: "+91 33 2554 1234"
    },
    {
      id: "SHL-403",
      name: "Coastal Transit Station 4",
      district: "Coastal Transit",
      coordinates: { lat: 21.90, lng: 88.08 },
      capacity: 2500,
      occupancy: 2450,
      bedsOpen: 50,
      medicalShortages: ["Oral antibiotics", "Blankets"],
      potableWaterLiters: 9000,
      mrePacks: 5200,
      contact: "+91 3365 2204"
    }
  ];

  let DB_RESCUE_TEAMS = [
    {
      id: "NDRF-Unit-5",
      name: "NDRF Flood Response Alpha",
      type: "NDRF Unit",
      members: 24,
      location: "North Suburbs base",
      status: "Standby",
      vehicle: "Ondoy Inflatable Boats x6",
      phone: "+91 94331 55660",
      coords: { lat: 22.61, lng: 88.38 }
    },
    {
      id: "NDRF-Unit-9",
      name: "Coastal Rescue-9",
      type: "NDRF Unit",
      members: 18,
      location: "Coastal Sector B",
      status: "On Scene",
      vehicle: "Tatra Heavy Duty Truck x2",
      phone: "+91 94331 55664",
      coords: { lat: 21.90, lng: 88.08 }
    },
    {
      id: "Heli-Evac-Alpha",
      name: "State Air Wing Force 1",
      type: "State Air Wing",
      members: 8,
      location: "Dum Dum Airbase",
      status: "En Route",
      vehicle: "HAL Dhruv Helicopter",
      phone: "+91 98887 00112",
      coords: { lat: 22.82, lng: 88.42 }
    },
    {
      id: "Med-Unit-C",
      name: "Disaster Trauma Care 3",
      type: "Medical Emergency Unit",
      members: 12,
      location: "Kothari General Hospital",
      status: "Standby",
      vehicle: "Mobile Advanced ICU Units x3",
      phone: "+91 99112 00223",
      coords: { lat: 22.53, lng: 88.35 }
    }
  ];

  let DB_ALERTS = [
    {
      id: "WRN-501",
      title: "Extreme Meteorological Warning (Cyclone Red)",
      category: "Meteorological",
      priority: "Red",
      description: "Cyclone 'Remal' is hovering 60km south-southeast. Severe wind shear and gale speeds up to 155 km/h. High potential for structural collapse and airborne debris.",
      location: "Coastal Transit & Islands",
      time: "4 mins ago",
      triggerThreshold: "Atmospheric pressure drops under 960 hPa"
    },
    {
      id: "WRN-502",
      title: "Severe Hydrological Threat (Flash Flood)",
      category: "Hydrological",
      priority: "Red",
      description: "Cloudburst runoff has triggered extreme river surge exceeding safe levels by 3.2m. Local reservoirs are executing controlled emergency spillways.",
      location: "North Suburbs Basin",
      time: "15 mins ago",
      triggerThreshold: "Rainfall rate > 45mm/hour"
    },
    {
      id: "WRN-503",
      title: "Geological Instability (Mudslide Zone)",
      category: "Geological",
      priority: "Orange",
      description: "Saturated soil loads on the Southern flank of the tea gardens hills suggest high displacement risk. Operators must avoid Route 10A.",
      location: "Hill Region Sector C",
      time: "1 hour ago",
      triggerThreshold: "Soil shear strength coefficient below 0.42"
    }
  ];

  let DB_SYSTEM_LOGS = [
    {
      id: "sys-0",
      timestamp: "14:48:32 UTC",
      severity: "info",
      component: "GPS Neural Trackers",
      message: "NDRF Units GPS synced, accuracy verified strictly under 3.5m spatial error."
    },
    {
      id: "sys-1",
      timestamp: "14:46:15 UTC",
      severity: "warning",
      component: "Power Grid",
      message: "Substation Block F-3 experienced breaker collapse. Standby backup generators active."
    },
    {
      id: "sys-2",
      timestamp: "14:42:08 UTC",
      severity: "critical",
      component: "Rainfall Gauge #12",
      message: "Precipitation gauge flooded out at Waterfront Slums. Operating on predictive synthetic modeling estimations."
    }
  ];

  // Helper helper to generate formatted time logs
  function getTimestamp() {
    return new Date().toUTCString().substring(17, 25) + " UTC";
  }

  // --- REST ENDPOINTS COMPLIING TO CONNECTED REQS ---

  // 1. Incidents
  app.get("/api/incidents", (req, res) => {
    res.json(DB_INCIDENTS);
  });

  app.post("/api/incidents", (req, res) => {
    const fresh = {
      ...req.body,
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      time: "Just now"
    };
    DB_INCIDENTS.unshift(fresh);
    broadcastEvent("incident_created", fresh);
    res.json(fresh);
  });

  app.put("/api/incidents/:id", (req, res) => {
    const { id } = req.params;
    const index = DB_INCIDENTS.findIndex(i => i.id === id);
    if (index !== -1) {
      DB_INCIDENTS[index] = { ...DB_INCIDENTS[index], ...req.body };
      broadcastEvent("incident_updated", DB_INCIDENTS[index]);
      res.json(DB_INCIDENTS[index]);
    } else {
      res.status(404).json({ error: "Incident not located." });
    }
  });

  // 2. SOS Alerts
  app.get("/api/sos", (req, res) => {
    res.json(DB_SOS_ALERTS);
  });

  app.post("/api/sos", (req, res) => {
    const fresh = {
      ...req.body,
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      time: "Just now"
    };
    DB_SOS_ALERTS.unshift(fresh);
    broadcastEvent("sos_created", fresh);
    res.json(fresh);
  });

  app.put("/api/sos/:id", (req, res) => {
    const { id } = req.params;
    const index = DB_SOS_ALERTS.findIndex(s => s.id === id);
    if (index !== -1) {
      DB_SOS_ALERTS[index] = { ...DB_SOS_ALERTS[index], ...req.body };
      broadcastEvent("sos_updated", DB_SOS_ALERTS[index]);
      res.json(DB_SOS_ALERTS[index]);
    } else {
      res.status(404).json({ error: "SOS request not found." });
    }
  });

  app.post("/api/sos/:id/dispatch", (req, res) => {
    const { id } = req.params;
    const { teamId } = req.body;
    let sosTarget = null;
    let teamTarget = null;

    // Mutate and retrieve target SOS
    const sosIndex = DB_SOS_ALERTS.findIndex(s => s.id === id);
    if (sosIndex !== -1) {
      DB_SOS_ALERTS[sosIndex].status = "Dispatched";
      (DB_SOS_ALERTS[sosIndex] as any).assignedTeam = teamId;
      sosTarget = DB_SOS_ALERTS[sosIndex];
    }

    // Mutate and retrieve target Team
    const teamIndex = DB_RESCUE_TEAMS.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      DB_RESCUE_TEAMS[teamIndex].status = "En Route";
      teamTarget = DB_RESCUE_TEAMS[teamIndex];
    }

    if (sosTarget && teamTarget) {
      broadcastEvent("sos_dispatched", { sos: sosTarget, team: teamTarget });
      res.json({ sos: sosTarget, team: teamTarget });
    } else {
      res.status(404).json({ error: "Squad or SOS reference invalid." });
    }
  });

  app.post("/api/sos/broadcast", (req, res) => {
    const { district } = req.body;
    const timestampStr = getTimestamp();
    const newLog = {
      id: `sys-${Date.now()}`,
      timestamp: timestampStr,
      severity: "critical" as const,
      component: "Warning Ops",
      message: `SMS EMERGENCY BROADCAST TRANSMITTED: All citizens in '${district}' have received high-priority warning SMS alerts on cell grids.`
    };
    DB_SYSTEM_LOGS.unshift(newLog);
    broadcastEvent("alert_broadcast", { district, message: newLog.message });
    res.json({ message: "Emergency cellular warning broadcast enqueued successfully.", nodes: 124, region: district });
  });

  // 3. Shelters
  app.get("/api/shelters", (req, res) => {
    res.json(DB_SHELTERS);
  });

  app.put("/api/shelters/:id", (req, res) => {
    const { id } = req.params;
    const index = DB_SHELTERS.findIndex(s => s.id === id);
    if (index !== -1) {
      DB_SHELTERS[index] = { ...DB_SHELTERS[index], ...req.body };
      res.json(DB_SHELTERS[index]);
    } else {
      res.status(404).json({ error: "Shelter not found." });
    }
  });

  app.post("/api/shelters/:id/requisition", (req, res) => {
    const { id } = req.params;
    const { waterLiters, mreCount, medicines } = req.body;
    const index = DB_SHELTERS.findIndex(s => s.id === id);
    if (index !== -1) {
      DB_SHELTERS[index] = {
        ...DB_SHELTERS[index],
        potableWaterLiters: DB_SHELTERS[index].potableWaterLiters + (waterLiters || 0),
        mrePacks: DB_SHELTERS[index].mrePacks + (mreCount || 0),
        medicalShortages: DB_SHELTERS[index].medicalShortages.filter(m => !medicines.includes(m))
      };
      res.json(DB_SHELTERS[index]);
    } else {
      res.status(404).json({ error: "Shelter not found" });
    }
  });

  // 4. Rescue Teams
  app.get("/api/rescue-teams", (req, res) => {
    res.json(DB_RESCUE_TEAMS);
  });

  app.post("/api/rescue-teams", (req, res) => {
    const fresh = {
      ...req.body,
      id: `Unit-${Math.floor(100 + Math.random() * 900)}`
    };
    DB_RESCUE_TEAMS.push(fresh);
    res.json(fresh);
  });

  app.put("/api/rescue-teams/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = DB_RESCUE_TEAMS.findIndex(t => t.id === id);
    if (index !== -1) {
      DB_RESCUE_TEAMS[index].status = status;
      broadcastEvent("team_updated", DB_RESCUE_TEAMS[index]);
      res.json(DB_RESCUE_TEAMS[index]);
    } else {
      res.status(404).json({ error: "Rescue Team not found" });
    }
  });

  // 5. Alerts
  app.get("/api/alerts", (req, res) => {
    res.json(DB_ALERTS);
  });

  app.post("/api/alerts", (req, res) => {
    const fresh = {
      ...req.body,
      id: `WRN-${Math.floor(500 + Math.random() * 500)}`,
      time: "Just now"
    };
    DB_ALERTS.unshift(fresh);
    broadcastEvent("alert_created", fresh);
    res.json(fresh);
  });

  // 6. System Logs
  app.get("/api/system-logs", (req, res) => {
    res.json(DB_SYSTEM_LOGS);
  });

  app.post("/api/system-logs", (req, res) => {
    const fresh = {
      ...req.body,
      id: `sys-${Date.now()}`,
      timestamp: getTimestamp()
    };
    DB_SYSTEM_LOGS.unshift(fresh);
    res.json(fresh);
  });

  app.post("/api/system-logs/flush", (req, res) => {
    DB_SYSTEM_LOGS = [
      {
        id: `sys-${Date.now()}`,
        timestamp: getTimestamp(),
        severity: "critical",
        component: "Command Hub",
        message: "SYSTEM OVERRIDE COMMAND: Clean database synchronisation invoked. Resetting sensors parameter caches."
      }
    ];
    res.json({ message: "DB cleared" });
  });

  // 7. Predictions & Analytics metrics
  app.get("/api/predictions/metrics", (req, res) => {
    res.json({
      meteorological_confidence: 98.4,
      seismic_integrity_index: 82.1,
      satellite_sync_status: "ONLINE (5 SAT)",
      prediction_run_timestamp: new Date().toISOString(),
      alerts_heat_map: [
        { lat: 22.5961, lng: 88.4245, intensity: 0.9, risk: "Extreme Flooding Risk" },
        { lat: 22.3500, lng: 88.9000, intensity: 0.5, risk: "Moderate High Wind" },
        { lat: 21.8150, lng: 88.0812, intensity: 0.8, risk: "Coastal Surge Warning" }
      ],
      storm_trajectories_simulation: [
        { hour: "+0h", wind_speed_kmh: 140, barometric_pressure_hpa: 965 },
        { hour: "+3h", wind_speed_kmh: 145, barometric_pressure_hpa: 960 },
        { hour: "+6h", wind_speed_kmh: 135, barometric_pressure_hpa: 968 },
        { hour: "+9h", wind_speed_kmh: 120, barometric_pressure_hpa: 974 },
        { hour: "+12h", wind_speed_kmh: 115, barometric_pressure_hpa: 980 }
      ]
    });
  });

  app.post("/api/predictions/trigger-simulation", (req, res) => {
    const simulatedLog = {
      id: `sys-${Date.now()}`,
      timestamp: getTimestamp(),
      severity: "success" as const,
      component: "Deep Prediction AI",
      message: "AI-Meteorology Forecast Simulation finished. Generated 12-hour advanced storm vectors and barometric models."
    };
    DB_SYSTEM_LOGS.unshift(simulatedLog);
    res.json({
      status: "success",
      message: "12-hour predictive forecast model successfully calculated.",
      results_size: 5
    });
  });

  // 7.1 Local & Gemini-Extensible Dynamic AI Predictions API Enclaves
  app.post("/api/predictions/risk-score", async (req, res) => {
    try {
      const input = req.body;
      const useGemini = !!process.env.GEMINI_API_KEY;
      const result = useGemini 
        ? await geminiPredictionEngine.calculateRiskScore(input)
        : mockPredictionEngine.calculateRiskScore(input);
      res.json({ ...result, engine: useGemini ? "Gemini AI Core" : "Mock Predictive Engine fallback" });
    } catch (err: any) {
      console.error("Risk score calculation failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/predictions/resource-recommendation", async (req, res) => {
    try {
      const input = req.body;
      const useGemini = !!process.env.GEMINI_API_KEY;
      const result = useGemini
        ? await geminiPredictionEngine.calculateResourceRecommendations(input)
        : mockPredictionEngine.calculateResourceRecommendations(input);
      res.json({ ...result, engine: useGemini ? "Gemini AI Core" : "Mock Predictive Engine fallback" });
    } catch (err: any) {
      console.error("Resource recommendations failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/predictions/shelter-recommendation", async (req, res) => {
    try {
      // Fetch current database active shelters to score against dynamically
      // Match active shelters list
      const activeShelters = DB_SHELTERS;
      const input = { ...req.body, activeShelters };
      const useGemini = !!process.env.GEMINI_API_KEY;
      const result = useGemini
        ? await geminiPredictionEngine.calculateShelterRecommendations(input)
        : mockPredictionEngine.calculateShelterRecommendations(input);
      res.json({ ...result, engine: useGemini ? "Gemini AI Core" : "Mock Predictive Engine fallback" });
    } catch (err: any) {
      console.error("Shelter recommendation failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/predictions/route-safety", async (req, res) => {
    try {
      // Extract active hazards from active SOS logs if they have high coordinates to use as hazard zones
      const hazardZones = DB_SOS_ALERTS.map(sos => ({
        lat: sos.coords.lat,
        lng: sos.coords.lng,
        radiusMeters: 1500,
        type: sos.recommendedTeamType === "NDRF Unit" ? "Flooding Breach" : "High Wind Strom Obstacle"
      }));

      const input = { ...req.body, hazardZones };
      const useGemini = !!process.env.GEMINI_API_KEY;
      const result = useGemini
        ? await geminiPredictionEngine.calculateRouteSafety(input)
        : mockPredictionEngine.calculateRouteSafety(input);
      res.json({ ...result, engine: useGemini ? "Gemini AI Core" : "Mock Predictive Engine fallback" });
    } catch (err: any) {
      console.error("Route safety score calculation failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Shared lazy-initialized client utility securely hosted on server
  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      aiClient = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return aiClient;
  }

  // Dynamic offline local fallback reasoning when Gemini core is unreachable or forbidden
  function generateMockChatResponse(message: string): string {
    const lower = message.toLowerCase();
    
    if (lower.includes("sos") || lower.includes("9421") || lower.includes("water") || lower.includes("slum")) {
      return `**DISASTERMIND TACTICAL ANALYSIS FOR REGION ALPHA WETLANDS:**

1. **Active Threat Assessment**: Extreme estuary surge (+3.2m above datum line) combined with rainfall rates of 45mm/h. Low-lying mudflat structures at Sector 4 W slums are suffering critical structural integrity breaches.
2. **Citizen Density Overlays**: Estimated 350-400 vulnerable residents in low-clearance units.
3. **Optimized Dispatch Vector**:
   - **Lead Agency**: National Disaster Response Force (NDRF) - Swiftwater Extraction unit 4B.
   - **Asset Allocation**: 4x Inflatable Rescue Boats (IRBs) equipped with OBM outboard motors.
   - **Target Coordinates**: 22.5892° N, 88.4014° E (Waterfront Slums Grid).
4. **Logistics Priority**: Open backup supply routes via high-clearance bypass lanes. Transition 150 immediate evacuees to **St. Xavier High School Sanctuary (SHL-401)**.`;
    }
    
    if (lower.includes("st. xavier") || lower.includes("medical") || lower.includes("shelter") || lower.includes("shl")) {
      return `**SHELTER LOGISTICAL REPORT & RESUPPLY SCHEDULING:**

* **Primary Shelter Evaluated**: St. Xavier High School (SHL-401).
* **Current Occupancy**: 985 / 1200 evacuees.
* **Storage Telemetry**:
  - Potable Drinking Water: 3,500 Liters (Critical depletion below 1.2 days margin).
  - Ready-to-Eat MRE Packs: 1,220 packs.
  - Emergency First-Aid Trauma Kits: 30 remaining units.
* **Critical Logistics Recommendation**: Action requisition order for **Medical Emergency Unit - DTC 3** to transport 4,500 additional liters of potable drinking water, 20 gallons of broad-spectrum antibiotic serums, and heavy blanket packs en route via high-suspension transport trucks.`;
    }
    
    if (lower.includes("alert") || lower.includes("broadcast") || lower.includes("wind") || lower.includes("warning") || lower.includes("weather") || lower.includes("cyclone")) {
      return `**DISASTERMIND SYSTEM WEATHER ALERT TELEMETRY:**

* **Observation Hour**: LIVE REALTIME CYCLONE TRACKING.
* **Max Wind Speeds**: 142 km/h gale force gusts.
* **Precipitation Core**: 52 mm/h.
* **Synthesized Operator Warning Draft**:
  \`[DISASTERMIND SECURE BROADCAST] EMERGENCY CYCLONIC CRITICAL METRICS RECORDED. METROPOLITAN OPERATORS SHIFT ALL ACTIVE SQUADS TO HIGHWAY SHELTER LINES. PUBLIC ADVISEMENT: EVACUATE LOW-LEVEL MUD REBOUND ZONES IMMEDIATELY.\`
* **Suggested Action Vector**: Broadcast to the Emergency Alerts view. Set geo-fenced warning ping directly to mobile base station registers within a 5.0km littoral perimeter.`;
    }

    if (lower.includes("route") || lower.includes("road") || lower.includes("saf") || lower.includes("map")) {
      return `**TACTICAL ROUTING RISK INTERCEPT RECONNAISSANCE:**

* **Proposed Path**: Central Gateway to South Coastlands.
* **Identified Hazards**:
  - Flooding Breach at Bypass 10B.
  - High Wind Storm Obstacles (Downed High-Voltage Steel Transformers block Lane 3).
* **Vehicle Compatibility Matrix**:
  - Ambulance: Safe Route Score 35/100 (Unsafe, high risk of catalytic water lock).
  - Inflatable Rescue Boat: Safe Route Score 88/100 (Highly compatible).
  - Heavy Logistics Convoy: Safe Route Score 60/100 (Requires tactical escort to clear obstacles).
* **Defensive Guidance**: Avoid standard state highway lanes. Command emergency convoys to mount the bypass bridge flyover.`;
    }

    // General fallback
    return `**DISASTERMIND OPERATIONAL REASONING ENGINE ACTIVE:**

Operator query: "${message}" received and analyzed against live structural telemetry.

* **GIS Core Status**: Synchronized.
* **Available Resources**: NDRF Strike Units standby, State Air Wing standby, Shelter beds online.
* **Tactical Directive**:
  1. For dynamic flood plan, refer to the **Predictions scorecard** tool on the main dashboard to evaluate rain run-offs.
  2. To coordinate rescue team movements, dispatch pending **SOS Requests** or assign active disaster **Incidents** to the appropriate response team.
  3. Monitor live system weather triggers from the **Weather Monitors / Warnings** panel.

Operating in high-availability localized predictive reasoning mode.`;
  }

  // 1. Unified AI disaster command chat agent proxy endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "No message parameter provided" });
      }

      // Check if API key is present
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not configured in operator settings panel. Initiating local secure fallback...");
        const reply = generateMockChatResponse(message);
        return res.json({ reply, mode: "Local Tactical Fallback" });
      }

      try {
        const ai = getAi();
        const prompt = `Authorized Disastermind AI Operator query: "${message}". Formulate tactical response.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are the central system core of DisasterMind AI Command Center. Your role is to co-advise operators on crisis response coordination, shelter logistics, meteorological warning thresholds, and tactical NDRF troop marshaling vector plans. Be objective, calm, highly precise, professional, and act as a secure defensive co-advisor. Avoid overly dramatic hype. Provide direct bullet numbered lists or recommendations. Cite specific coordinates (e.g. Waterfront slums 22.59 N, 88.40 E) or shelter details when relevant.",
            temperature: 0.2
          },
        });

        const reply = response.text || "Empty telemetry received from AI system core.";
        res.json({ reply, mode: "Gemini AI Core" });
      } catch (geminiError: any) {
        console.warn("Gemini model execution error (e.g. restriction or permission). Slipping cleanly to local fallback:", geminiError.message);
        const reply = generateMockChatResponse(message);
        res.json({ reply, mode: "Local Tactical Fallback (Security Auto-Bypass)" });
      }

    } catch (error: any) {
      console.error("General API Failure:", error);
      const fallbackReply = generateMockChatResponse(req.body?.message || "");
      res.json({ reply: fallbackReply, mode: "Local Emergency Backup" });
    }
  });

  // --- REAL-TIME TELEMETRY TRACKER SIMULATOR TICK ---
  // Periodically shifts teams of status 'En Route' closer to their assigned coordinates
  setInterval(() => {
    DB_RESCUE_TEAMS.forEach(team => {
      if (team.status === 'En Route') {
        const assignedSos = DB_SOS_ALERTS.find(s => s.status === 'Dispatched' && (s.id === team.id || (s as any).assignedTeam === team.id));
        const assignedInc = DB_INCIDENTS.find(i => i.status === 'Deployed' && i.assignedTeam === team.id);
        
        let targetCoords: { lat: number; lng: number } | null = null;
        let targetName = "";
        
        if (assignedSos) {
          targetCoords = assignedSos.coords;
          targetName = `SOS Beacon #${assignedSos.id}`;
        } else if (assignedInc) {
          targetCoords = assignedInc.coords;
          targetName = `Incident #${assignedInc.id}`;
        }
        
        if (targetCoords && team.coords) {
          const dLat = targetCoords.lat - team.coords.lat;
          const dLng = targetCoords.lng - team.coords.lng;
          const distance = Math.sqrt(dLat * dLat + dLng * dLng);
          
          if (distance > 0.001) {
            team.coords.lat += dLat * 0.15;
            team.coords.lng += dLng * 0.15;
            console.log(`REALTIME RADAR UPDATE: ${team.id} moving closer to ${targetName} (Current: ${team.coords.lat.toFixed(4)}, ${team.coords.lng.toFixed(4)})`);
            broadcastEvent("team_movement", team);
          } else {
            team.status = 'On Scene';
            team.coords.lat = targetCoords.lat;
            team.coords.lng = targetCoords.lng;
            
            const logTimestamp = new Date().toUTCString().substring(17, 25) + " UTC";
            const arrivalLog = {
              id: `sys-${Date.now()}`,
              timestamp: logTimestamp,
              severity: "success" as const,
              component: "GPS Neural Trackers",
              message: `TACTICAL TARGET REACHED: Unit ${team.name} (${team.id}) arrived On Scene at ${targetName}. Commencing urgent operations.`
            };
            DB_SYSTEM_LOGS.unshift(arrivalLog);
            console.log(`REALTIME RADAR ARRIVAL: ${team.id} arrived On Scene at ${targetName}`);
            broadcastEvent("team_arrival", { team, log: arrivalLog });
          }
        }
      }
    });
  }, 6000);

  // 2. Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", version: "1.0.0", node: "WGS-84 Mainframe" });
  });

  // 3. Vite development vs Production asset serving middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`DisasterMind AI Command server booted active on http://0.0.0.0:${PORT}`);
  });

  // Bind WebSockets directly to the listening HTTP server
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    connectedClients.add(ws);
    ws.send(JSON.stringify({ type: "connection_established", message: "Radar Neural Websocket Online" }));
    
    ws.on("close", () => {
      connectedClients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WS connection error occurred:", error);
      connectedClients.delete(ws);
    });
  });
}

startServer();
