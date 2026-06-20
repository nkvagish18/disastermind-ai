export type IncidentType = 'Flood' | 'Cyclone' | 'Landslide' | 'Earthquake' | 'Cloudburst';
export type IncidentPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'Escalated' | 'Active' | 'Deployed' | 'Resolved';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  district: string;
  coords: { lat: number; lng: number };
  priority: IncidentPriority;
  status: IncidentStatus;
  time: string;
  reporter: string;
  contact: string;
  details: string;
  assignedTeam?: string;
}

export interface SOSAlert {
  id: string;
  district: string;
  coords: { lat: number; lng: number };
  time: string;
  reporterPhone: string;
  message: string;
  status: 'Unassigned' | 'Allocating' | 'Dispatched' | 'Cleared';
  powerLevel: number;
  floodLevel?: string;
  windSpeed?: string;
  recommendedTeamType: string;
  assignedTeam?: string;
}

export interface Shelter {
  id: string;
  name: string;
  district: string;
  coordinates: { lat: number; lng: number };
  capacity: number;
  occupancy: number;
  bedsOpen: number;
  medicalShortages: string[];
  potableWaterLiters: number;
  mrePacks: number;
  contact: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  type: 'NDRF Unit' | 'State Air Wing' | 'Medical Emergency Unit' | 'Civil Defense Force';
  members: number;
  location: string;
  status: 'Standby' | 'En Route' | 'On Scene' | 'Resting';
  vehicle: string;
  phone: string;
  coords?: { lat: number; lng: number };
}

export interface AlertWarning {
  id: string;
  title: string;
  category: 'Meteorological' | 'Hydrological' | 'Geological' | 'General';
  priority: 'Red' | 'Orange' | 'Yellow';
  description: string;
  location: string;
  time: string;
  triggerThreshold: string;
}

export interface SystemUpdate {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  component: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Initial robust datasets for a realistic, engaging command experience
export const INITIAL_INCIDENTS: Incident[] = [
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
    details: "Primary river defense wall has given way due to prolonged heavy downpours. Fast current flooding populated settlements in Sector 4. Elderly residents are stranded in single-story homes.",
    assignedTeam: undefined
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

export const INITIAL_SOS_ALERTS: SOSAlert[] = [
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

export const INITIAL_SHELTERS: Shelter[] = [
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

export const INITIAL_RESCUE_TEAMS: RescueTeam[] = [
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

export const INITIAL_ALERTS: AlertWarning[] = [
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

export const INITIAL_SYSTEM_UPDATES: SystemUpdate[] = [
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
