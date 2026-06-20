import { useState, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { 
  Layers, Map, Play, Pause, ChevronRight, Check, AlertOctagon, 
  MapPin, Shield, CheckCircle2, Navigation, Wind, Eye, EyeOff 
} from 'lucide-react';
import { Incident, Shelter, RescueTeam, SOSAlert } from '../types';

interface LiveMapViewProps {
  incidents: Incident[];
  shelters: Shelter[];
  rescueTeams: RescueTeam[];
  sosAlerts: SOSAlert[];
  onDispatchTeam: (incidentId: string, teamId: string) => void;
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function LiveMapView({
  incidents,
  shelters,
  rescueTeams,
  sosAlerts,
  onDispatchTeam,
  onAddLog
}: LiveMapViewProps) {
  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Hardcode coordinates for rescue teams corresponding to district zones
  const RESCUE_TEAM_COORDS: Record<string, { lat: number; lng: number }> = {
    "NDRF-Unit-5": { lat: 22.61, lng: 88.38 }, // North Suburbs
    "NDRF-Unit-9": { lat: 21.90, lng: 88.08 }, // Coastal Sector B
    "Heli-Evac-Alpha": { lat: 22.82, lng: 88.42 }, // Hill Region (Dum Dum base coordinates shift)
    "Med-Unit-C": { lat: 22.53, lng: 88.35 } // Central Metro (Trauma unit coordinates shift)
  };

  const getTeamCoords = (team: RescueTeam, idx: number) => {
    if (RESCUE_TEAM_COORDS[team.id]) return RESCUE_TEAM_COORDS[team.id];
    return { lat: 22.55 - idx * 0.08, lng: 88.22 + idx * 0.08 };
  };

  // Predefined GIS Risk Zones
  const RISK_ZONES = [
    {
      name: "Waterfront Slums Flooding Hazard Area",
      center: [22.59, 88.40],
      radius: 2200, // meters
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.25,
      description: "Severe urban runoff. High vulnerability structure collapse reported."
    },
    {
      name: "Coastal Zone Gale & Surge Red Alert Zone",
      center: [21.90, 88.08],
      radius: 12000,
      color: "#ef4444",
      fillColor: "#f87171",
      fillOpacity: 0.15,
      description: "Severe wind gale. Coastal embankments highly compromised."
    },
    {
      name: "Hill Region Landslide Warning Area",
      center: [22.82, 88.42],
      radius: 1800,
      color: "#f59e0b",
      fillColor: "#fbbf24",
      fillOpacity: 0.2,
      description: "Severe rockfall and mud slippage. Arterial paths blocked."
    }
  ];

  // Predefined major evacuation corridor Route polylines
  const ROUTES = [
    {
      name: "Coastal Highway NH-117 Evacuation Corridor",
      path: [
        [21.90, 88.08],
        [21.98, 88.05],
        [22.12, 88.15],
        [22.35, 88.25],
        [22.53, 88.35]
      ],
      color: "#2563eb",
      dashArray: "5, 5",
      description: "Direct corridor to central metro zones."
    },
    {
      name: "Route 10A Mountain Evacuation Pass",
      path: [
        [22.82, 88.42],
        [22.75, 88.40],
        [22.65, 88.38],
        [22.61, 88.38]
      ],
      color: "#e11d48",
      dashArray: "8, 8",
      description: "Alternate Hill pass. Marked blocked at mud debris flows."
    }
  ];
  // Map layers states
  const [layers, setLayers] = useState({
    rainfall: true,
    floodRisk: true,
    cyclonePath: true,
    shelters: true,
    hospitals: true,
    rescueTeams: true
  });

  // Selected item popup detail state
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    type: 'incident' | 'shelter' | 'sos';
    name: string;
    coords: { lat: number; lng: number };
    status: string;
    details: string;
    metrics?: string;
  } | null>({
    id: "INC-3081",
    type: "incident",
    name: "Embankment Breach - Ward 12",
    coords: { lat: 22.57, lng: 88.36 },
    status: "Active",
    details: "Sector 12 primary masonry breach. High velocity water rushing through residential blocks.",
    metrics: "Current overflow volume estimate: 80,000 Gallons/Min"
  });

  // Interactive timeline state
  const [forecastHour, setForecastHour] = useState(0);
  const [isPlayingForecast, setIsPlayingForecast] = useState(false);

  // Dispatch floating state
  const [targetIncidentId, setTargetIncidentId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // Geolocation tracking states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-detect browser location on Mount (whenever user opens the map)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by client browser");
      onAddLog("Cell Radar GPS", "Geolocation query aborted. Standard browser API missing.", "warning");
      return;
    }

    onAddLog("Cell Radar GPS", "Retrieving real-time mobile telemetry...", "info");

    let isFirstPosition = true;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        setLocationError(null);

        // Center on the detected location only on the first lock to avoid disrupting user map scrolling
        if (isFirstPosition) {
          isFirstPosition = false;
          onAddLog("Cell Radar GPS", `Coordinates locked: [${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E]`, "info");
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 12);
          }
        }
      },
      (error) => {
        console.warn("Mobile telemetry lock failed: ", error);
        setLocationError(error.message);
        onAddLog("Cell Radar GPS", `Active tracking lock suspended: ${error.message}`, "warning");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleCenterOnUser = () => {
    if (!userLocation) {
      onAddLog("Cell Radar GPS", "Map camera adjustment aborted. No valid location coordinate lock obtained yet.", "warning");
      return;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 12);
      onAddLog("Cell Radar GPS", "Adjusting tactical view focused to your live coordinates.", "info");
    }
  };

  const handleToggleLayer = (item: keyof typeof layers) => {
    setLayers(prev => {
      const next = { ...prev, [item]: !prev[item] };
      onAddLog("Map GIS Engine", `Toggled layer: ${String(item)} to ${next[item] ? 'VISIBLE' : 'HIDDEN'}`, "info");
      return next;
    });
  };

  // Playback timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingForecast) {
      interval = setInterval(() => {
        setForecastHour(prev => {
          if (prev >= 24) {
            setIsPlayingForecast(false);
            return 0;
          }
          return prev + 3;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingForecast]);

  const triggerDispatch = (incId: string) => {
    if (!selectedTeamId) {
      onAddLog("Map Dispatcher", "FAILED DISPATCH: No mobile NDRF/Air rescue team selected.", "warning");
      return;
    }
    onDispatchTeam(incId, selectedTeamId);
    setTargetIncidentId(null);
    setSelectedTeamId("");
    onAddLog("Map Dispatcher", `DISPATCH CONFIRMED: Unit ${selectedTeamId} mobilised to incident ${incId}. Team has been notified over satellite link.`, "critical");
  };

  // --- LEAFLET LIFECYCLE ---
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [22.45, 88.22],
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // CartoDB Dark Matter tile service
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Clear instance if component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. RISK ZONES (Draw circles & polygons)
    if (layers.floodRisk) {
      RISK_ZONES.forEach(zone => {
        const circle = L.circle(zone.center as [number, number], {
          radius: zone.radius,
          color: zone.color,
          weight: 1.5,
          fillColor: zone.fillColor,
          fillOpacity: zone.fillOpacity
        });
        circle.bindTooltip(`<strong>${zone.name}</strong><br/>${zone.description}`, { sticky: true });
        layerGroup.addLayer(circle);
      });
    }

    // 2. ROUTE VISUALIZATION (Draw Polylines)
    if (layers.cyclonePath) {
      ROUTES.forEach(route => {
        const line = L.polyline(route.path as [number, number][], {
          color: route.color,
          dashArray: route.dashArray,
          weight: 3.5,
          opacity: 0.8
        });
        line.bindTooltip(`<strong>${route.name}</strong><br/>${route.description}`, { sticky: true });
        layerGroup.addLayer(line);
      });
    }

    // 3. INCIDENT MARKERS
    incidents.forEach(inc => {
      const isCritical = inc.priority === 'Critical';
      const isHigh = inc.priority === 'High';
      const markerColorClass = isCritical ? 'bg-red-650 font-sans' : isHigh ? 'bg-amber-600 font-sans' : 'bg-yellow-500 font-sans';
      const borderClass = isCritical ? 'border-red-400' : isHigh ? 'border-amber-400' : 'border-yellow-300';
      const pingAnim = isCritical ? '<div class="absolute -inset-1.5 bg-red-600/40 rounded-full blur-sm animate-ping"></div>' : '';

      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${pingAnim}
            <div class="p-1 px-2 rounded-md ${markerColorClass} border ${borderClass} text-[10px] text-white flex items-center gap-1 font-bold shadow-xl">
              ⚠️ ${inc.id}
            </div>
          </div>
        `,
        className: 'transparent-marker',
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      const marker = L.marker([inc.coords.lat, inc.coords.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedPin({
          id: inc.id,
          type: 'incident',
          name: inc.title,
          coords: inc.coords,
          status: inc.status,
          details: inc.details,
          metrics: `Reporter: ${inc.reporter}`
        });
      });
      layerGroup.addLayer(marker);
    });

    // 4. CITIZEN SOS MARKERS (Only active ones)
    sosAlerts.forEach(sos => {
      if (sos.status === 'Cleared') return;

      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-2 bg-teal-500/30 rounded-full animate-pulse"></div>
            <div class="p-1 px-2 rounded-md bg-teal-500 border border-teal-300 font-sans text-[10px] text-white flex items-center gap-1 font-bold shadow-xl animate-bounce">
              📡 ${sos.id}
            </div>
          </div>
        `,
        className: 'transparent-marker',
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      const marker = L.marker([sos.coords.lat, sos.coords.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedPin({
          id: sos.id,
          type: 'sos',
          name: `SOS - ${sos.district}`,
          coords: sos.coords,
          status: `${sos.status} Alert`,
          details: sos.message,
          metrics: `Battery: ${sos.powerLevel}% | Suggest Team: ${sos.recommendedTeamType}`
        });
      });
      layerGroup.addLayer(marker);
    });

    // 5. SHELTERS MARKERS
    if (layers.shelters) {
      shelters.forEach(shl => {
        const customIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <div class="p-1 rounded bg-blue-600 border border-blue-400 font-sans text-[9px] text-white font-semibold flex items-center gap-1 shadow-lg">
                🛡️ ${shl.id}
              </div>
            </div>
          `,
          className: 'transparent-marker',
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        });

        const marker = L.marker([shl.coordinates.lat, shl.coordinates.lng], { icon: customIcon });
        marker.on('click', () => {
          setSelectedPin({
            id: shl.id,
            type: 'shelter',
            name: shl.name,
            coords: shl.coordinates,
            status: `${shl.occupancy} / ${shl.capacity} Occupancy`,
            details: `Water supply: ${shl.potableWaterLiters} Liters | MRE Packs: ${shl.mrePacks} | Beds left: ${shl.bedsOpen}`,
            metrics: `Medical shortfalls: ${shl.medicalShortages.join(', ') || 'Cleared'}`
          });
        });
        layerGroup.addLayer(marker);
      });
    }

    // 6. RESCUE TEAMS MARKERS
    if (layers.rescueTeams) {
      rescueTeams.forEach((team, idx) => {
        const coords = getTeamCoords(team, idx);
        const isActive = team.status === 'On Scene' || team.status === 'En Route';
        const teamBg = team.status === 'On Scene' ? 'bg-amber-600' : team.status === 'En Route' ? 'bg-blue-600' : 'bg-slate-700';

        const customIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              ${isActive ? '<div class="absolute -inset-1.5 bg-blue-500/30 rounded-full blur-sm animate-ping"></div>' : ''}
              <div class="p-1.5 rounded-full border border-slate-950 flex items-center justify-center text-[12px] shadow-lg ${teamBg}" title="${team.name}">
                🚁
              </div>
            </div>
          `,
          className: 'transparent-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
        marker.on('click', () => {
          setSelectedPin({
            id: team.id,
            type: 'sos',
            name: team.name,
            coords,
            status: `Roster: ${team.status}`,
            details: `Battalion Category: ${team.type} | Total Active deployment members: ${team.members} | Comm System: ${team.phone}`,
            metrics: `Assigned vehicle: ${team.vehicle}`
          });
        });
        layerGroup.addLayer(marker);
      });
    }

    // 7. USER TRACKER MARKER
    if (userLocation) {
      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-2 bg-emerald-500/45 rounded-full animate-ping"></div>
            <div class="p-1 px-2 rounded-md bg-emerald-600 border border-emerald-400 font-sans text-[10px] text-white flex items-center gap-1 font-bold shadow-xl">
              🧑‍✈️ My Position
            </div>
          </div>
        `,
        className: 'transparent-marker',
        iconSize: [90, 24],
        iconAnchor: [45, 12]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedPin({
          id: 'USER-LOC',
          type: 'sos',
          name: 'My Live Coordinates',
          coords: userLocation,
          status: 'Tracking Active',
          details: `Current Detected Latitude: ${userLocation.lat.toFixed(6)}°, Longitude: ${userLocation.lng.toFixed(6)}°`,
          metrics: 'Source: Browser Geolocation'
        });
      });
      layerGroup.addLayer(marker);
    }

  }, [layers, incidents, shelters, sosAlerts, rescueTeams, userLocation]);

  return (
    <div id="live-map-view" className="space-y-6">
      
      {/* Upper header controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h3 className="font-sans font-medium text-slate-100 text-sm tracking-tight flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-emerald-400" />
            GIS Topographic Overlay Controller
          </h3>
          <p className="font-sans text-xs text-slate-400">Manage real-time multi-spectrum layers and coordinate airborne/ground dispatches directly from markers</p>
        </div>
        
        {/* Rapid coordinates stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 font-mono text-[11px] text-slate-500">
          <div className="flex flex-wrap gap-4">
            <p>Projection: <span className="text-slate-300">WGS-84 Sphere</span></p>
            {userLocation ? (
              <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live Location: <span className="text-slate-200">{userLocation.lat.toFixed(6)}° N, {userLocation.lng.toFixed(6)}° E</span>
              </p>
            ) : locationError ? (
              <p className="text-amber-500" title={locationError}>GPS Offline: <span className="text-slate-400">Locked / Refused</span></p>
            ) : (
              <p className="text-slate-400 animate-pulse">GPS: <span className="text-slate-200">Syncing coordinates...</span></p>
            )}
          </div>
          {userLocation && (
            <button
              onClick={handleCenterOnUser}
              className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/85 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 text-[10px] font-sans font-semibold rounded flex items-center gap-1 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <MapPin className="w-3 h-3" /> Center Map On Me
            </button>
          )}
        </div>
      </div>

      {/* Main Map Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: LAYERS CHECKLIST CONFIG */}
        <div className="lg:col-span-1 space-y-4">
          {/* GIS Toggle List card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h4 className="font-sans font-medium text-slate-300 text-xs tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Map className="w-4 h-4 text-slate-400" />
              GIS Layers Checklist
            </h4>
            
            <div className="space-y-2">
              <button
                onClick={() => handleToggleLayer('rainfall')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 font-sans text-xs text-slate-300 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${layers.rainfall ? 'bg-blue-600 border-blue-500' : 'border-slate-700'}`}>
                    {layers.rainfall && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                  <span>Rainfall Intensity Radar</span>
                </div>
                <span className="font-mono text-[10px] text-blue-400">42mm/h contour</span>
              </button>

              <button
                onClick={() => handleToggleLayer('floodRisk')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 font-sans text-xs text-slate-300 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${layers.floodRisk ? 'bg-red-600 border-red-500' : 'border-slate-700'}`}>
                    {layers.floodRisk && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                  <span>Flood Risk Live Outline</span>
                </div>
                <span className="font-mono text-[10px] text-red-400">Surcharge model</span>
              </button>

              <button
                onClick={() => handleToggleLayer('cyclonePath')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 font-sans text-xs text-slate-300 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${layers.cyclonePath ? 'bg-amber-600 border-amber-500' : 'border-slate-700'}`}>
                    {layers.cyclonePath && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                  <span>Cyclone Vector Path</span>
                </div>
                <span className="font-mono text-[10px] text-amber-500">Remal (Cat 4)</span>
              </button>

              <button
                onClick={() => handleToggleLayer('shelters')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 font-sans text-xs text-slate-300 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${layers.shelters ? 'bg-emerald-600 border-emerald-500' : 'border-slate-700'}`}>
                    {layers.shelters && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                  <span>Shelters Network Status</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">3 public bases</span>
              </button>

              <button
                onClick={() => handleToggleLayer('hospitals')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 font-sans text-xs text-slate-300 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${layers.hospitals ? 'bg-purple-600 border-purple-500' : 'border-slate-700'}`}>
                    {layers.hospitals && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                  <span>Hospitals & Trauma Units</span>
                </div>
                <span className="font-mono text-[10px] text-purple-400">Level 1 Trauma</span>
              </button>

              <button
                onClick={() => handleToggleLayer('rescueTeams')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 font-sans text-xs text-slate-300 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${layers.rescueTeams ? 'bg-cyan-600 border-cyan-500' : 'border-slate-700'}`}>
                    {layers.rescueTeams && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </div>
                  <span>NDRF Field Force Units</span>
                </div>
                <span className="font-mono text-[10px] text-cyan-400">4 active bands</span>
              </button>
            </div>
          </div>

          {/* Forecast hour quick status */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 font-sans text-xs">
            <h4 className="font-medium text-slate-300">Predictive Surge Index (AI Model)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Model Hours Run:</span>
                <span className="font-mono text-slate-200">T + {forecastHour} hrs</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Vulnerability Score:</span>
                <span className={`font-mono font-bold ${forecastHour > 15 ? 'text-red-400' : 'text-amber-400'}`}>
                  {forecastHour > 15 ? '8.92 Crit Limit' : '6.45 Dangerous'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (forecastHour / 24) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: THE SATELLITE MAP INTERACTIVE CANVAS */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl h-[480px] overflow-hidden">
            {/* Leaflet openstreetmap real map container */}
            <div ref={mapContainerRef} id="leaflet-gis-map" className="w-full h-full z-10" />

            {/* SELECTED MARKER DETAIL FLOATING CARD PANEL */}
            {selectedPin && (
              <div className="absolute top-4 right-4 w-[280px] bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-2xl backdrop-blur-md z-30 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {selectedPin.type} INFO CARD
                    </span>
                    <h5 className="font-sans font-medium text-slate-100 text-xs mt-1 leading-normal">
                      {selectedPin.name}
                    </h5>
                  </div>
                  <button 
                    onClick={() => setSelectedPin(null)} 
                    className="font-mono text-slate-500 hover:text-slate-300 text-xs px-1 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2 font-sans text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>COORDS:</span>
                    <span>{selectedPin.coords.lat.toFixed(4)} N, {selectedPin.coords.lng.toFixed(4)} E</span>
                  </div>

                  <div className="p-2 bg-slate-950/50 rounded-lg text-slate-400 leading-snug">
                    {selectedPin.details}
                  </div>

                  {selectedPin.metrics && (
                    <div className="font-mono text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-950 px-2 py-1.5 rounded flex items-center gap-1">
                      <Wind className="w-3 h-3" /> {selectedPin.metrics}
                    </div>
                  )}
                </div>

                {/* Quick Interactive Assign triggering */}
                {selectedPin.type === 'incident' && (
                  <button
                    onClick={() => setTargetIncidentId(selectedPin.id)}
                    className="w-full py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-semibold cursor-pointer transition-all active:scale-95"
                  >
                    Quick Dispatch Roster
                  </button>
                )}
              </div>
            )}

            {/* FLOATING ACTION BOTTOM ASSIGN COMPONENT */}
            {targetIncidentId && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900 border border-slate-700 p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl z-40 animate-fade-in">
                <div>
                  <p className="font-sans text-[11px] text-red-400 font-bold uppercase">DISPATCH INTERFACE FOR [{targetIncidentId}]</p>
                  <p className="font-sans text-xs text-slate-300">Assemble an active standby unit onto this tactical coordinate zone</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs p-2 rounded focus:outline-none focus:border-red-500 rounded-lg font-sans h-9 md:w-[220px]"
                  >
                    <option value="">-- Choose Standby Team --</option>
                    {rescueTeams.filter(t => t.status === 'Standby').map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.members} members)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => triggerDispatch(targetIncidentId)}
                    className="px-4 h-9 rounded bg-emerald-600 hover:bg-emerald-500 font-sans text-xs font-semibold text-white cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    Dispatch Force <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTargetIncidentId(null)}
                    className="px-3 h-9 rounded bg-slate-800 hover:bg-slate-750 font-sans text-xs text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom forecasting timeline / player slider */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="font-sans font-medium text-slate-200 text-xs tracking-tight flex items-center gap-2">
                  <Wind className="w-4 h-4 text-amber-400 animate-pulse" />
                  Cyclone Surge Forecast & Simulation Model (Synthetic Hour Tracking)
                </h4>
                <p className="font-sans text-[11px] text-slate-500">Slide timeline to simulate cyclone advance trajectory and project reservoir levels</p>
              </div>

              {/* Slider timeline playback logs */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setIsPlayingForecast(!isPlayingForecast)}
                  className={`p-1.5 rounded-lg border text-white cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 text-xs ${
                    isPlayingForecast ? 'bg-amber-600 border-amber-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {isPlayingForecast ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause Simulation
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Play Predictive Model
                    </>
                  )}
                </button>
                <div className="px-3 py-1.5 bg-slate-950 rounded font-mono text-xs text-slate-300 border border-slate-800">
                  Forecast: <span className="text-emerald-400">T + {forecastHour} hours</span>
                </div>
              </div>
            </div>

            {/* Interactive Timeline Range Input */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-slate-500">T+0h</span>
              <input
                type="range"
                min="0"
                max="24"
                step="3"
                value={forecastHour}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setForecastHour(val);
                  onAddLog("Predictive Engine", `Simulation range adjusted: Projected storm conditions at T+${val}h.`, "info");
                }}
                className="flex-1 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              />
              <span className="font-mono text-[10px] text-slate-500">T+24h</span>
            </div>

            {/* Chronological forecast details cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 font-sans text-[11px] text-slate-400 leading-snug">
              <div className={`p-2.5 rounded-lg border ${forecastHour >= 0 && forecastHour <= 6 ? 'bg-slate-950 border-amber-500/30 text-slate-200' : 'bg-slate-950/20 border-slate-900/60'}`}>
                <p className="font-semibold text-slate-400">Phase 1: T+0h to T+6h</p>
                <p className="text-[10px] text-slate-500">Wind shear rises to 140km/h. Surcharge levels +1.5m. North-metro rainfall peaks.</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${forecastHour >= 9 && forecastHour <= 12 ? 'bg-slate-950 border-amber-500/30 text-slate-200' : 'bg-slate-950/20 border-slate-900/60'}`}>
                <p className="font-semibold text-slate-400">Phase 2: T+9h to T+12h</p>
                <p className="text-[10px] text-slate-500">Eye wall crosses transit lines. Embankments exceed stress parameters. Surcharge +2.4m.</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${forecastHour >= 15 && forecastHour <= 18 ? 'bg-slate-950 border-amber-500/30 text-slate-200' : 'bg-slate-950/20 border-slate-900/60'}`}>
                <p className="font-semibold text-slate-400">Phase 3: T+15h to T+18h</p>
                <p className="text-[10px] text-slate-500">Extreme torrential overflow downpour. Waterfront reservoirs forced spillways. Slum inundation peak.</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${forecastHour >= 21 && forecastHour <= 24 ? 'bg-slate-950 border-amber-500/30 text-slate-200' : 'bg-slate-950/20 border-slate-900/60'}`}>
                <p className="font-semibold text-slate-400">Phase 4: T+21h to T+24h</p>
                <p className="text-[10px] text-slate-500">Cyclone moves inland, degrading wind speed. Surcharge levels recede slow, mud sliding zones critical.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
