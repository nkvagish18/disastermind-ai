import { useState } from 'react';
import { 
  BarChart4, ArrowUpRight, FileSpreadsheet, Download, Activity, 
  TrendingUp, Compass, Sparkles, Database, CheckCircle2, ShieldAlert,
  Users, MapPin, Route, Truck, Anchor, Plane, Building, AlertTriangle, HelpCircle, RefreshCw
} from 'lucide-react';
import { predictionsApi } from '../services/api';

interface AnalyticsViewProps {
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function AnalyticsView({ onAddLog }: AnalyticsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'predictions'>('trends');
  const [reportCompiling, setReportCompiling] = useState(false);
  const [compiledReportData, setCompiledReportData] = useState<string | null>(null);

  // --- AI PREDICTIONS CORE STATE ---
  const [activeCalculator, setActiveCalculator] = useState<'risk' | 'resources' | 'shelter' | 'routing'>('risk');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Risk Score Module State
  const [riskInputs, setRiskInputs] = useState({
    district: 'North Suburbs',
    windSpeed: 105,
    precipitation: 40,
    tidalSurge: 2.8,
    populationDensity: 'high' as 'low' | 'medium' | 'high' | 'critical'
  });
  const [riskResult, setRiskResult] = useState<any>(null);

  // 2. Resource Optimizer State
  const [resourceInputs, setResourceInputs] = useState({
    riskScore: 78,
    district: 'North Suburbs',
    primaryHazard: 'Flood' as 'Flood' | 'Cyclone' | 'Landslide' | 'Earthquake' | 'Cloudburst',
    affectedPeopleEstimate: 1200
  });
  const [resourceResult, setResourceResult] = useState<any>(null);

  // 3. Shelter Matcher State
  const [shelterInputs, setShelterInputs] = useState({
    district: 'North Suburbs',
    disasterType: 'Flood',
    requiredCapacity: 350
  });
  const [shelterResult, setShelterResult] = useState<any>(null);

  // 4. Transit Router State
  const [routingInputs, setRoutingInputs] = useState({
    startCoords: { lat: 22.59, lng: 88.40 }, // Waterfront slums
    endCoords: { lat: 22.53, lng: 88.35 }, // St Xavier
    transportMode: 'InflatableBoat' as 'Ambulance' | 'HeavyTruck' | 'Helicopter' | 'InflatableBoat'
  });
  const [routingResult, setRoutingResult] = useState<any>(null);

  // --- API TRIGGER METHODS ---
  const handleCalculateRisk = async () => {
    setLoading(true);
    setError(null);
    onAddLog("AI Core", `INVOKING TACTICAL RISK ASSESSMENT for district: ${riskInputs.district}`, "info");
    try {
      const data = await predictionsApi.getRiskScore(riskInputs);
      setRiskResult(data);
      onAddLog("AI Core", `RISK ASSESSMENT CALCULATED: Threat Score resolved at [${data.riskScore}/100]`, "info");
    } catch (err: any) {
      setError(err.message || "Failed to contact local intelligence servers.");
      onAddLog("AI Core", `Risk assessment failed: ${err.message}`, "critical");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateResources = async () => {
    setLoading(true);
    setError(null);
    onAddLog("AI Core", `INVOKING LOGISTICAL FORCES PLAN for estimated: ${resourceInputs.affectedPeopleEstimate} citizens`, "info");
    try {
      const data = await predictionsApi.getResourceRecommendations(resourceInputs);
      setResourceResult(data);
      onAddLog("AI Core", `LOGISTICAL FORCES ASSESSMENT SUCCEEDED: Modeled ${data.recommendations?.length || 0} unit vectors.`, "info");
    } catch (err: any) {
      setError(err.message || "Relief computation protocol abort.");
      onAddLog("AI Core", `Relief matching malfunctioned: ${err.message}`, "critical");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchShelter = async () => {
    setLoading(true);
    setError(null);
    onAddLog("AI Core", `INVOKING STRATEGIC SHELTER PROXIMITY SECTOR matching for district: ${shelterInputs.district}`, "info");
    try {
      const data = await predictionsApi.getShelterRecommendations(shelterInputs);
      setShelterResult(data);
      onAddLog("AI Core", `SHELTER CORRELATIONS RESOLVED: Primary Recommendation enqueued: ID ${data.recommendedShelterId}`, "info");
    } catch (err: any) {
      setError(err.message || "Shelter database lookup failed.");
      onAddLog("AI Core", `Shelter match failed: ${err.message}`, "critical");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    setLoading(true);
    setError(null);
    onAddLog("AI Core", `INVOKING RADAR TRANSIT ROUTE SECURITY ANALYSERS via ${routingInputs.transportMode}`, "info");
    try {
      const data = await predictionsApi.getRouteSafety(routingInputs);
      setRoutingResult(data);
      onAddLog("AI Core", `ROUTE RECONNAISSANCE SUCCESS: Resolved Route Safety Score: [${data.safetyScore}/100]`, "info");
    } catch (err: any) {
      setError(err.message || "Navigation calculation anomaly.");
      onAddLog("AI Core", `Route calculator anomaly: ${err.message}`, "critical");
    } finally {
      setLoading(false);
    }
  };

  const handleCompileReport = () => {
    setReportCompiling(true);
    onAddLog("Analytics Engine", "COMPILING: Generating comprehensive regional meteorological & force deployment audit report...", "info");
    
    setTimeout(() => {
      setReportCompiling(false);
      setCompiledReportData(`DISASTERMIND AI - REGIONAL DISASTER COMMAND CENTER REPORT
COMPILED AT: ${new Date().toUTCString()}
SECURITY STATUS: REOP-RESTRICTED

1. METEOROLOGICAL METRICS & ADVISORY STATS
* Cyclone Severity: Cat-4 Hurricane gale winds peak at 142.5 km/h.
* Rainfall Intensity Radar: Sector 12 precipitation exceeds 41.8mm/hour.
* Estuary Tidal Surge Height: +3.18m above mean river sea levels.

2. SURGE INCIDENTS & CRISIS AUDITS
* Active Incident count: 3 ongoing, 1 safely resolved.
* Critical Embankment Breaches: INC-3081 flooding waterfront slums.
* STRANDED CITIZENS FEED (SOS): SOS-9421 (8 persons stranded on crates), SOS-9418 (Fallen trees blocked transport route).

3. RESOURCE FORCE REALLOCATION AUDIT
* NDRF Units deployed: 3 battalions, state Air Wing active support.
* Shelter Capacity occupancy ratio: 980 / 1200 beds (St Xavier community base).
* Supply Inventories: Potable water levels at 14,700L cumulative, MRE meal boxes at 7,450.

4. PREDICTIVE READY INDEX MATRIX
* Air transport mobility rating: 92% readiness (Dhruv helicopters).
* Satellite synchronization lag: 0.8s (Zero packet routing loss).
--- END OF SECURE TELEMETRY REPORT ---`);
      onAddLog("Analytics Engine", "COMPILATION SUCCESS: System telemetry compiled securely into memory local. Ready for printing.", "info");
    }, 2000);
  };

  const categories = [
    { name: "Severe Flooding & Reservoir", percentage: 45, color: "bg-blue-500" },
    { name: "Cyclone Storms & Gale Winds", percentage: 35, color: "bg-amber-500" },
    { name: "Mountainous Mudslides & Rockfall", percentage: 12, color: "bg-orange-500" },
    { name: "Tectonic Tremors & Earthquakes", percentage: 8, color: "bg-red-500" }
  ];

  return (
    <div id="analytics-view" className="space-y-6">
      
      {/* 0. Clean Multi-tab Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart4 className="w-5 h-5 text-red-500 shrink-0" />
            Visual Analytics & Predictive Insights
          </h2>
          <p className="text-xs text-slate-400">Review historical telemetry grids and run deep AI neural assessments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'trends'
                ? 'bg-red-650 text-white shadow-lg shadow-red-955/35'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Historical Trends & Audits
          </button>
          <button
            onClick={() => {
              setActiveSubTab('predictions');
              // Auto-assess on first launch of predictions tab to build interactive immersion
              if (!riskResult) handleCalculateRisk();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'predictions'
                ? 'bg-red-650 text-white shadow-lg shadow-red-955/35'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
            AI Decision Hub
          </button>
        </div>
      </div>

      {/* Top micro indicators deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Predictive Spill Coefficient</p>
            <p className="font-mono text-xl font-bold text-emerald-400 mt-1">0.82 Stable Limits</p>
          </div>
          <Compass className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Surge Velocity Model</p>
            <p className="font-mono text-xl font-bold text-amber-500 mt-1">4.25 Knots Core</p>
          </div>
          <Activity className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">GIS Grid Sensor Health</p>
            <p className="font-mono text-xl font-bold text-emerald-400 mt-1">99.78% Operating</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Database Node Clusters</p>
            <p className="font-mono text-xl font-bold text-blue-400 mt-1">Active (Postgres CJS)</p>
          </div>
          <Database className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* SUBTAB 1: TRADITIONAL TRENDS & DEPOS */}
      {activeSubTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Side: Occurrences Trend visual and progress distributions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Trend Chart Area SVG */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-sans font-medium text-slate-200 text-sm tracking-tight">Disaster Occurrences & Surge Trend Model</h3>
                  <p className="font-sans text-xs text-slate-400 font-medium">Quarterly statistical visualization displaying simulated flood-surge occurrences across coastal sectors</p>
                </div>
                
                {/* Legends */}
                <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500 shrink-0">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Flooding</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Winds</span>
                </div>
              </div>

              {/* Custom Interactive SVG Line Plot */}
              <div className="h-[200px] bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px))] bg-[size:100%_30px] pointer-events-none opacity-40" />
                
                <svg className="w-full h-full max-w-lg mt-1" viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 40,140 L 100,100 L 180,120 L 260,60 L 340,90 L 420,30 L 460,40 L 460,140 Z" fill="url(#blueGridFillGrad)" opacity="0.15" />
                  
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#334155" strokeWidth="1" />
                  <line x1="40" y1="20" x2="40" y2="140" stroke="#334155" strokeWidth="1" />

                  <path d="M 40,140 L 100,100 L 180,120 L 260,60 L 340,90 L 420,30 L 460,40" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 40,120 L 100,130 L 180,80 L 260,110 L 340,40 L 420,70 L 460,90" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" opacity="0.7" />

                  <circle cx="260" cy="60" r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" className="animate-pulse cursor-pointer" />
                  <circle cx="420" cy="30" r="5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" className="animate-pulse cursor-pointer" />

                  <text x="40" y="152" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">Q1</text>
                  <text x="100" y="152" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">Q2</text>
                  <text x="180" y="152" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">Q3</text>
                  <text x="260" y="152" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">Q4 (C1)</text>
                  <text x="340" y="152" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">Q5</text>
                  <text x="420" y="152" fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CURRENT PEAK</text>
                  <text x="460" y="152" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">FORECAST</text>

                  <text x="32" y="34" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="end">120 cps</text>
                  <text x="32" y="74" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="end">80 cps</text>
                  <text x="32" y="114" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="end">40 cps</text>

                  <defs>
                    <linearGradient id="blueGridFillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 p-1.5 rounded text-[10px] text-slate-300 font-sans tracking-wide">
                  ⚠️ Peak Storm Surge displacement: <span className="text-red-400 font-bold font-mono">112 active incidences / min</span>
                </div>
              </div>
            </div>

            {/* Incident Category progressive breakdown */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h3 className="font-sans font-medium text-slate-200 text-sm tracking-tight">Precipitation & Hazard Profile Breakdown</h3>
              
              <div className="space-y-3 font-sans text-xs">
                {categories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-slate-350">
                      <span className="font-medium text-slate-300">{cat.name}</span>
                      <span className="font-mono font-bold text-slate-200">{cat.percentage}% index severity</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Export compilations report center */}
          <div className="space-y-6">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-slate-200 text-xs tracking-tight">Secure Telemetry Compiler</h4>
                  <p className="font-sans text-[10px] text-slate-500">Generate, compile, and download regional briefing summaries</p>
                </div>
              </div>

              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                Consolidate radar sensor statistics, standby force rosters, current SOS queues, and medical shortages immediately into a unified cryptographic operator report.
              </p>

              <button
                onClick={handleCompileReport}
                disabled={reportCompiling}
                className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-650 text-white font-sans text-xs font-semibold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {reportCompiling ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Compiling telemetry...
                  </>
                ) : (
                  <>
                    Compile Operator Briefing <Download className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Generated Compile Results panel */}
              {compiledReportData && (
                <div className="space-y-2 animate-fade-in pt-2">
                  <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-300 font-mono text-[10px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Operator Briefing Ready for Download!
                  </div>
                  
                  <textarea
                    readOnly
                    rows={8}
                    value={compiledReportData}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded font-mono text-[10px] text-slate-400 focus:outline-none scrollbar-thin"
                  />

                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([compiledReportData], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = "disastermind_operations_center_briefing.txt";
                      document.body.appendChild(element);
                      element.click();
                      onAddLog("Analytics Engine", "COMPLETED: Briefing compiled file exported to driver local disk.", "info");
                    }}
                    className="w-full py-2 rounded bg-slate-955 border border-slate-800 hover:border-slate-700 text-slate-201 text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    Download Report File (.txt) <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI PREDICTIVE HUB */}
      {activeSubTab === 'predictions' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Interface Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 4 Cols: Vertical Calculator Tabs Selection */}
            <div className="lg:col-span-3 space-y-2.5">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <p className="font-sans text-[11px] text-slate-500 uppercase font-bold tracking-wide">Select Prediction Module</p>
              </div>

              <button
                onClick={() => { setActiveCalculator('risk'); setError(null); }}
                className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                  activeCalculator === 'risk'
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <ShieldAlert className={`w-5 h-5 shrink-0 ${activeCalculator === 'risk' ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                <div>
                  <p className="font-sans font-bold text-xs">Disaster Risk Vector</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">District meteorological threat index</p>
                </div>
              </button>

              <button
                onClick={() => { setActiveCalculator('resources'); setError(null); }}
                className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                  activeCalculator === 'resources'
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <Users className={`w-5 h-5 shrink-0 ${activeCalculator === 'resources' ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                <div>
                  <p className="font-sans font-bold text-xs">Resource Optimizer</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Relief team & supplies forecast</p>
                </div>
              </button>

              <button
                onClick={() => { setActiveCalculator('shelter'); setError(null); }}
                className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                  activeCalculator === 'shelter'
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <Building className={`w-5 h-5 shrink-0 ${activeCalculator === 'shelter' ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                <div>
                  <p className="font-sans font-bold text-xs">Shelter Allocator</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Beds open & occupancy modeling</p>
                </div>
              </button>

              <button
                onClick={() => { setActiveCalculator('routing'); setError(null); }}
                className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                  activeCalculator === 'routing'
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <Route className={`w-5 h-5 shrink-0 ${activeCalculator === 'routing' ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                <div>
                  <p className="font-sans font-bold text-xs">Route Safety & Transit</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Obstructions & navigation analysis</p>
                </div>
              </button>

              {/* Cognitive Sync Status Panel */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-[10px] text-slate-300 font-bold uppercase">AI Engine Status</span>
                </div>
                <div className="space-y-1.5 font-mono text-[10px] text-slate-503">
                  <div className="flex justify-between">
                    <span>API Interface:</span>
                    <span className="text-emerald-400 font-semibold">ONLINE (FastAPI/Express CJS)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model Sync:</span>
                    <span className="text-blue-400 font-semibold">Gemini 3.5 Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="text-orange-400 font-semibold uppercase">{riskResult?.engine?.includes("Gemini") ? "Gemini Live Core" : "Mock Predict Fallback"}</span>
                  </div>
                </div>
                <p className="text-[9px] font-sans text-slate-500 font-medium leading-relaxed border-t border-slate-850 pt-2 text-center">
                  Set GEMINI_API_KEY in operator settings panel to automatically engage live Gemini model reasoning.
                </p>
              </div>
            </div>

            {/* Right 9 Cols: Selected Active Interactive Calculator Panel */}
            <div className="lg:col-span-9 space-y-6">

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* MODULE 1: DISASTER RISK VECTOR */}
              {activeCalculator === 'risk' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column Controls */}
                  <div className="md:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-tight border-b border-slate-855 pb-2">Meteorological Parameters</h3>
                    
                    <div className="space-y-3 font-sans text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase">Target Sector Zone</label>
                        <select
                          value={riskInputs.district}
                          onChange={e => setRiskInputs({ ...riskInputs, district: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        >
                          <option value="North Suburbs">North Suburbs</option>
                          <option value="Waterfront slums">Waterfront slums</option>
                          <option value="Coastal Transit">Coastal Transit</option>
                          <option value="Central Metro">Central Metro</option>
                          <option value="Hill Region">Hill Region</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-slate-450 uppercase font-medium">
                          <span>Wind Speed</span>
                          <span className="text-slate-100 font-bold">{riskInputs.windSpeed} km/h</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="160"
                          value={riskInputs.windSpeed}
                          onChange={e => setRiskInputs({ ...riskInputs, windSpeed: Number(e.target.value) })}
                          className="w-full select-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-slate-450 uppercase font-medium">
                          <span>Precipitation Rate</span>
                          <span className="text-slate-100 font-bold">{riskInputs.precipitation} mm/h</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={riskInputs.precipitation}
                          onChange={e => setRiskInputs({ ...riskInputs, precipitation: Number(e.target.value) })}
                          className="w-full select-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-slate-450 uppercase font-medium">
                          <span>Tidal Surge Height</span>
                          <span className="text-slate-100 font-bold">+{riskInputs.tidalSurge}m</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={riskInputs.tidalSurge}
                          onChange={e => setRiskInputs({ ...riskInputs, tidalSurge: Number(e.target.value) })}
                          className="w-full select-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase">Population Density Vector</label>
                        <select
                          value={riskInputs.populationDensity}
                          onChange={e => setRiskInputs({ ...riskInputs, populationDensity: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleCalculateRisk}
                      disabled={loading}
                      className="w-full py-2.5 rounded bg-red-650 hover:bg-red-500 hover:shadow-lg disabled:bg-slate-800 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Assessing Vectors...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" /> Evaluate Risk Matrix
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column Results Display */}
                  <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    {riskResult ? (
                      <div className="space-y-5 animate-fade-in flex flex-col h-full justify-between">
                        
                        {/* Summary Block */}
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wide">Threat Analysis Output</h4>
                            <span className="font-mono text-[9px] text-slate-500">Processed by: {riskResult.engine}</span>
                          </div>

                          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                            {/* Radial Score Gauge SVG */}
                            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6.5" fill="transparent" />
                                <circle 
                                  cx="40" 
                                  cy="40" 
                                  r="32" 
                                  stroke={riskResult.riskScore > 70 ? "#ef4444" : riskResult.riskScore > 40 ? "#f59e0b" : "#10b981"} 
                                  strokeWidth="6.5" 
                                  fill="transparent" 
                                  strokeDasharray={2 * Math.PI * 32}
                                  strokeDashoffset={2 * Math.PI * 32 * (1 - riskResult.riskScore / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center">
                                <span className="font-mono text-lg font-bold text-slate-150">{riskResult.riskScore}</span>
                                <span className="font-sans text-[8px] text-slate-500 uppercase font-bold">Threat Index</span>
                              </div>
                            </div>

                            {/* Risk Badges and descriptive lines */}
                            <div className="space-y-1 font-sans">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                                  riskResult.riskLevel === 'Extreme' ? 'bg-red-500/10 text-red-400 border border-red-500/30 font-black animate-pulse' :
                                  riskResult.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {riskResult.riskLevel} Risk Level
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                                  riskResult.warningLevel === 'Red' ? 'bg-red-650 text-white' : 'bg-orange-500 text-slate-950'
                                }`}>
                                  {riskResult.warningLevel} Warning Priority
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm font-medium mt-1">
                                {riskResult.analysis}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Factors sub breakdown segments */}
                        <div className="space-y-2.5 pt-4 border-t border-slate-850">
                          <p className="font-mono text-[9px] text-slate-500 uppercase font-semibold">Breakdown of Contributing Elements</p>
                          <div className="grid grid-cols-1 gap-2">
                            {riskResult.factors?.map((f: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-850/60 font-sans text-xs">
                                <div className="flex justify-between text-[11px] font-medium text-slate-200">
                                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {f.factor}</span>
                                  <span className="font-mono font-bold text-slate-400">Score contributions: {f.score}% (weight {f.weight}%)</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-snug mt-1 italic">{f.analysis}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <HelpCircle className="w-12 h-12 stroke-1 text-slate-700 mb-2 animate-bounce" />
                        <p className="text-xs">Select settings parameters and click "Evaluate Risk Matrix" to run predictions on current GIS grid sectors.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 2: TACTICAL RESOURCE OPTIMIZER */}
              {activeCalculator === 'resources' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column Controls */}
                  <div className="md:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-tight border-b border-slate-855 pb-2">Crisis Demographics</h3>
                    
                    <div className="space-y-3 font-sans text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Input Sector Risk rating (1-100)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={resourceInputs.riskScore}
                          onChange={e => setResourceInputs({ ...resourceInputs, riskScore: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Primary Spatial Hazard</label>
                        <select
                          value={resourceInputs.primaryHazard}
                          onChange={e => setResourceInputs({ ...resourceInputs, primaryHazard: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        >
                          <option value="Flood">Flood</option>
                          <option value="Cyclone">Cyclone</option>
                          <option value="Landslide">Landslide</option>
                          <option value="Earthquake">Earthquake</option>
                          <option value="Cloudburst">Cloudburst</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Target Location</label>
                        <input
                          type="text"
                          value={resourceInputs.district}
                          onChange={e => setResourceInputs({ ...resourceInputs, district: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-slate-450 uppercase font-medium">
                          <span>Affected Citizens (Est)</span>
                          <span className="text-slate-100 font-bold">{resourceInputs.affectedPeopleEstimate} persons</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="8000"
                          step="100"
                          value={resourceInputs.affectedPeopleEstimate}
                          onChange={e => setResourceInputs({ ...resourceInputs, affectedPeopleEstimate: Number(e.target.value) })}
                          className="w-full select-none cursor-pointer accent-red-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCalculateResources}
                      disabled={loading}
                      className="w-full py-2.5 rounded bg-red-650 hover:bg-red-500 hover:shadow-lg disabled:bg-slate-800 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Simulating Logistical Force...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" /> Optimize Logistics Resource
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column Results Display */}
                  <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    {resourceResult ? (
                      <div className="space-y-5 animate-fade-in flex flex-col h-full justify-between">
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wide">Military & Civil Resource Dispatches</h4>
                            <span className="font-mono text-[9px] text-slate-500">Processed by: {resourceResult.engine}</span>
                          </div>

                          {/* Suggested Teams loop list */}
                          <div className="space-y-2.5">
                            <p className="font-mono text-[9px] text-slate-400 uppercase font-semibold">Priority Force allocations</p>
                            
                            {resourceResult.recommendations?.map((rec: any, idx: number) => (
                              <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between font-sans text-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                    {rec.teamType.includes("Wing") ? <Plane className="w-4 h-4" /> : rec.teamType.includes("Medical") ? <Activity className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-200 text-[11px]">{rec.teamType} ({rec.count} en-route)</h5>
                                    <p className="text-[10px] text-slate-500 leading-snug mt-0.5 font-medium">{rec.reasoning}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase shrink-0 ${
                                  rec.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {rec.priority} PRIORITY
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Required Supplies details */}
                        <div className="space-y-3 pt-4 border-t border-slate-850">
                          <p className="font-mono text-[9px] text-slate-400 uppercase font-semibold">Dry Supplies & Survival Medical Packages</p>
                          <div className="grid grid-cols-2 gap-2">
                            {resourceResult.supplies?.map((supply: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-slate-950/30 rounded-lg border border-slate-850/60 font-sans text-[11px]">
                                <div className="text-slate-500 uppercase text-[9px] font-bold tracking-wide">{supply.item}</div>
                                <div className="flex justify-between items-baseline mt-1">
                                  <span className="font-mono text-xs font-bold text-slate-100">{supply.quantity} {supply.unit}</span>
                                  <span className={`text-[8px] font-bold uppercase ${supply.priority === 'High' ? 'text-red-400' : 'text-slate-500'}`}>{supply.priority} priority</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Critical aviation banner safety notification */}
                        <div className="mt-4 p-3 bg-blue-950/15 border border-blue-900/30 rounded-xl flex items-start gap-2.5 font-sans text-xs">
                          <Plane className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-blue-300 block">Airborne Aviation Liftoff: {resourceResult.airSupportRequired ? "AUTHORIZED MANDATED" : "NOT REQUIRED"}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 font-medium block leading-snug">{resourceResult.airSupportReasoning}</span>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <Users className="w-12 h-12 stroke-1 text-slate-700 mb-2 animate-bounce" />
                        <p className="text-xs">Adjust target risk index & impacted population to dynamically generate tactical forces dispatches or medicines payload enqueues.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 3: STRATEGIC SHELTER PROXIMITY SECTOR */}
              {activeCalculator === 'shelter' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column Controls */}
                  <div className="md:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-tight border-b border-slate-855 pb-2">Target Safe Shelter requirements</h3>
                    
                    <div className="space-y-3 font-sans text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Distressed Evacuation Sector</label>
                        <select
                          value={shelterInputs.district}
                          onChange={e => setShelterInputs({ ...shelterInputs, district: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        >
                          <option value="North Suburbs">North Suburbs</option>
                          <option value="Waterfront slums">Waterfront slums</option>
                          <option value="Coastal Transit">Coastal Transit</option>
                          <option value="Central Metro">Central Metro</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Disaster Disaster Category</label>
                        <select
                          value={shelterInputs.disasterType}
                          onChange={e => setShelterInputs({ ...shelterInputs, disasterType: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        >
                          <option value="Flood">Flood</option>
                          <option value="Cyclone">Cyclone</option>
                          <option value="Landslide">Landslide</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-slate-450 uppercase font-medium">
                          <span>Displaced Evacuees (Seeking Bed)</span>
                          <span className="text-slate-100 font-bold">{shelterInputs.requiredCapacity} seats</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="1500"
                          step="50"
                          value={shelterInputs.requiredCapacity}
                          onChange={e => setShelterInputs({ ...shelterInputs, requiredCapacity: Number(e.target.value) })}
                          className="w-full select-none cursor-pointer accent-red-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleMatchShelter}
                      disabled={loading}
                      className="w-full py-2.5 rounded bg-red-650 hover:bg-red-500 hover:shadow-lg disabled:bg-slate-800 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Core Shelters Matching...
                        </>
                      ) : (
                        <>
                          <Building className="w-4 h-4 text-emerald-400 shrink-0" /> Match Optimal Shelter
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column Results Display */}
                  <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    {shelterResult ? (
                      <div className="space-y-5 animate-fade-in flex flex-col h-full justify-between">
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wide">Shelter Matching Projections</h4>
                            <span className="font-mono text-[9px] text-slate-500">Processed by: {shelterResult.engine}</span>
                          </div>

                          {/* Main Selection Recommendation card */}
                          <div className="p-4 bg-emerald-950/20 border border-emerald-900/35 rounded-xl flex items-start gap-3 text-xs">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-bold text-emerald-300 block text-xs">PRIMARY SUGGESTION shelter MATCHED</span>
                              <p className="font-mono text-[10px] text-slate-400 font-bold">
                                Shelter Code Reference ID: <span className="text-emerald-300 bg-emerald-900/40 px-1.5 py-0.5 rounded ml-1">{shelterResult.recommendedShelterId}</span>
                              </p>
                              <p className="font-sans text-slate-400 leading-relaxed font-semibold">
                                {shelterResult.allocationReasoning}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-[10px] text-slate-500 uppercase font-mono block">Transit Feasibility</span>
                              <span className={`text-xs font-bold ${
                                shelterResult.routeFeasibility === 'Safe' ? 'text-emerald-400' : 'text-amber-500'
                              }`}>{shelterResult.routeFeasibility} Passage</span>
                            </div>
                            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-[10px] text-slate-500 uppercase font-mono block">Alternate Base back-up</span>
                              <span className="text-xs font-bold text-slate-300">{shelterResult.alternativeShelterId || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Occupancy Timeline Projections Graph representation */}
                        <div className="space-y-3 pt-4 border-t border-slate-850">
                          <p className="font-mono text-[9px] text-slate-400 uppercase font-bold">Capacity Growth Forecast (Occupancy timeline)</p>
                          <div className="space-y-2">
                            {shelterResult.occupancyProjections?.map((proj: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                                <span className="font-mono w-16 text-[10px] text-slate-500">In +{proj.timeOffsetHours} Hours</span>
                                <div className="flex-1 h-3 bg-slate-950 rounded overflow-hidden relative">
                                  <div 
                                    className={`h-full transition-all duration-300 ${
                                      proj.estimatedOccupancyPercent > 90 ? 'bg-red-500' : proj.estimatedOccupancyPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${proj.estimatedOccupancyPercent}%` }}
                                  />
                                </div>
                                <span className="font-mono w-10 text-[10px] text-slate-400 text-right">{proj.estimatedOccupancyPercent}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <Building className="w-12 h-12 stroke-1 text-slate-700 mb-2 animate-bounce" />
                        <p className="text-xs">Adjust evacuee quotas & target sector to match optimal safe shelter bases matching capacity.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 4: RADAR TRANSIT ROUTE SECURITY */}
              {activeCalculator === 'routing' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column Controls */}
                  <div className="md:col-span-12 lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-tight border-b border-slate-855 pb-2">Transit Routing Parameters</h3>
                    
                    <div className="space-y-3 font-sans text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-450 font-medium font-mono text-[9px] uppercase font-bold">Start Location</label>
                          <select
                            onChange={e => {
                              const mapping: Record<string, any> = {
                                slums: { lat: 22.59, lng: 88.40 },
                                north: { lat: 22.61, lng: 88.38 },
                                delta: { lat: 22.48, lng: 88.22 }
                              };
                              setRoutingInputs({ ...routingInputs, startCoords: mapping[e.target.value] });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-[11px] font-semibold outline-none"
                          >
                            <option value="slums">Waterfront slums</option>
                            <option value="north">North Suburbs Base</option>
                            <option value="delta">South Delta Crossing</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Destination Shelter</label>
                          <select
                            onChange={e => {
                              const mapping: Record<string, any> = {
                                xavier: { lat: 22.53, lng: 88.35 },
                                meadows: { lat: 22.61, lng: 88.38 },
                                transit: { lat: 21.90, lng: 88.08 }
                              };
                              setRoutingInputs({ ...routingInputs, endCoords: mapping[e.target.value] });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-[11px] font-semibold outline-none"
                          >
                            <option value="xavier">St Xavier stadium</option>
                            <option value="meadows">Golden Meadows</option>
                            <option value="transit">Transit Station 4</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-450 font-medium font-mono text-[10px] uppercase font-bold">Transit Vehicle Mode</label>
                        <select
                          value={routingInputs.transportMode}
                          onChange={e => setRoutingInputs({ ...routingInputs, transportMode: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-semibold focus:border-red-500 outline-none"
                        >
                          <option value="Ambulance">Ambulance Emergency</option>
                          <option value="HeavyTruck">Tatra Heavy Truck</option>
                          <option value="Helicopter">Dhruv Air Helicopter</option>
                          <option value="InflatableBoat">Ondoy Inflatable Boat</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleCalculateRoute}
                      disabled={loading}
                      className="w-full py-2.5 rounded bg-red-650 hover:bg-red-500 hover:shadow-lg disabled:bg-slate-800 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Resolving Security...
                        </>
                      ) : (
                        <>
                          <Route className="w-4 h-4 text-orange-400 shrink-0" /> Resolve Route Security
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column Results Display */}
                  <div className="md:col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    {routingResult ? (
                      <div className="space-y-5 animate-fade-in flex flex-col h-full justify-between">
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wide">Radar Navigation Scan</h4>
                            <span className="font-mono text-[9px] text-slate-500">Processed by: {routingResult.engine}</span>
                          </div>

                          {/* Core Route indicators */}
                          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-semibold">
                            
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl border ${
                                routingResult.safetyStatus === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                routingResult.safetyStatus === 'Alternative Required' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                                {routingInputs.transportMode === 'Helicopter' ? <Plane className="w-5 h-5 animate-pulse" /> : routingInputs.transportMode === 'InflatableBoat' ? <Anchor className="w-5 h-5 animate-pulse" /> : <Truck className="w-5 h-5 animate-pulse" />}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-slate-500 uppercase font-mono text-[10px]">Route Safety Rating</span>
                                <span className="text-sm font-bold text-slate-250 block">{routingResult.safetyScore}/100 - {routingResult.safetyStatus}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-slate-505 block font-mono text-[9px] uppercase">Route Length</span>
                              <span className="text-slate-200 font-mono text-xs font-bold block mt-0.5">{routingResult.distanceKm} km</span>
                              <span className="text-[10px] text-slate-450 font-sans block">~ {routingResult.estimatedTravelTimeMins} mins ETA</span>
                            </div>

                          </div>
                        </div>

                        {/* List obstacles */}
                        <div className="space-y-2.5 pt-2">
                          <p className="font-mono text-[9px] text-slate-400 uppercase font-semibold">Sensor Hazards Detected En-route</p>
                          <div className="space-y-1.5 font-sans text-xs">
                            {routingResult.identifiedHazards?.map((obstacle: string, idx: number) => (
                              <div key={idx} className="p-2 py-1.5 bg-slate-950/40 border border-slate-850/80 rounded flex items-center gap-2 font-medium text-slate-400">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <span>{obstacle}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Alternate command message box */}
                        <div className="p-3 bg-red-955/10 border border-red-900/30 rounded-xl flex items-start gap-2.5 font-sans text-xs mt-3">
                          <Route className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-red-300 block">TACTICAL REROUTING STEER RECOMMENDED:</span>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-relaxed font-semibold">
                              {routingResult.alternateNavigationInstructions}
                            </p>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <Route className="w-12 h-12 stroke-1 text-slate-700 mb-2 animate-bounce" />
                        <p className="text-xs">Adjust coordinates indices and selected convoy vehicle to model Route Safety factors en-route.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
