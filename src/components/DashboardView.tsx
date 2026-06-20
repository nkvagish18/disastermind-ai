import { useState } from 'react';
import { 
  Building2, Users, AlertTriangle, Radio, Activity, 
  Droplets, Wind, CloudRain, ShieldCheck, ArrowUpRight, Zap 
} from 'lucide-react';
import { Incident, SOSAlert, Shelter, RescueTeam, AlertWarning, SystemUpdate } from '../types';
import AIDisasterAssistant from './AIDisasterAssistant';

interface DashboardViewProps {
  incidents: Incident[];
  sosAlerts: SOSAlert[];
  shelters: Shelter[];
  rescueTeams: RescueTeam[];
  alerts: AlertWarning[];
  logs: SystemUpdate[];
  onTabChange: (tab: string) => void;
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function DashboardView({
  incidents,
  sosAlerts,
  shelters,
  rescueTeams,
  alerts,
  logs,
  onTabChange,
  onAddLog
}: DashboardViewProps) {
  const [activeQuickCommand, setActiveQuickCommand] = useState<string | null>(null);

  // Compute stats
  const activeCount = incidents.filter(i => i.status !== 'Resolved').length;
  const redAlertsCount = alerts.filter(a => a.priority === 'Red').length;
  const totalShelterCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOcc = shelters.reduce((acc, s) => acc + s.occupancy, 0);
  const activeTeamsCount = rescueTeams.filter(t => t.status !== 'Resting').length;
  const unassignedSos = sosAlerts.filter(s => s.status === 'Unassigned').length;

  const handleQuickCommand = (id: string, name: string) => {
    setActiveQuickCommand(name);
    onAddLog("Command Hub", `EXECUTED DIRECTIVE: "${name}". Syncing across regional broadcast units...`, "critical");
    setTimeout(() => {
      setActiveQuickCommand(null);
    }, 2800);
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* Top Banner Alert if any Red alerts exist */}
      {redAlertsCount > 0 && (
        <div className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-between text-red-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-sans font-medium text-sm">CRITICAL ADVISORY LEVEL RED</p>
              <p className="font-sans text-xs text-red-400">Cyclone Remal approaching coastal sectors. Extreme weather warning active. Heavy rains flooding waterfront sectors.</p>
            </div>
          </div>
          <button 
            onClick={() => onTabChange("alerts")} 
            className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 border border-red-600/40 hover:border-red-500 font-sans text-xs text-white cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            Review Warning Deck <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => onTabChange("incidents")}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/40 cursor-pointer transition-all active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] text-slate-500 font-medium tracking-wider uppercase">Active Incidents</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">{activeCount}</span>
            <span className="font-mono text-xs text-red-400">Ongoing</span>
          </div>
          <p className="font-sans text-[11px] text-slate-500 mt-2 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            Analyze priority streams <ArrowUpRight className="w-3" />
          </p>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onTabChange("alerts")}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/40 cursor-pointer transition-all active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-600/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] text-slate-500 font-medium tracking-wider uppercase">Hazard Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">{alerts.length}</span>
            <span className="font-mono text-xs text-amber-500">{redAlertsCount} Critical</span>
          </div>
          <p className="font-sans text-[11px] text-slate-500 mt-2 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            View thresholds & metrics <ArrowUpRight className="w-3" />
          </p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onTabChange("sos")}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 cursor-pointer transition-all active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] text-slate-500 font-medium tracking-wider uppercase">SOS Queue</span>
            <Radio className="w-4 h-4 text-emerald-500 animate-bounce" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">{sosAlerts.length}</span>
            <span className="font-mono text-xs text-emerald-400">{unassignedSos} Unassigned</span>
          </div>
          <p className="font-sans text-[11px] text-slate-500 mt-2 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            Dispatch team now <ArrowUpRight className="w-3" />
          </p>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onTabChange("shelters")}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/40 cursor-pointer transition-all active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] text-slate-500 font-medium tracking-wider uppercase">Shelter Beds</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-semibold text-slate-100">
              {Math.round((totalShelterOcc / totalShelterCap) * 100)}%
            </span>
            <span className="font-mono text-xs text-slate-400">
              ({totalShelterCap - totalShelterOcc} Open)
            </span>
          </div>
          <p className="font-sans text-[11px] text-slate-500 mt-2 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            Check supply inventories <ArrowUpRight className="w-3" />
          </p>
        </div>

        {/* Metric 5 */}
        <div 
          onClick={() => onTabChange("resources")}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/40 cursor-pointer transition-all active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] text-slate-500 font-medium tracking-wider uppercase">Rescue Force</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-100">{rescueTeams.length}</span>
            <span className="font-mono text-xs text-purple-400">{activeTeamsCount} Field Active</span>
          </div>
          <p className="font-sans text-[11px] text-slate-500 mt-2 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            Track vehicles & helicopters <ArrowUpRight className="w-3" />
          </p>
        </div>
      </div>

      {/* Main Grid: Map & Weather Overview | Operations Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Regional Map Outline & Sensors */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Outline Panel */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans font-medium text-slate-200 text-sm tracking-tight flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-emerald-500" />
                  Tactical GIS Map Simulation
                </h3>
                <p className="font-sans text-xs text-slate-400">Dynamic coordinate overlay displaying centers of density, rain gauge levels, and incident locations</p>
              </div>
              <button 
                onClick={() => onTabChange("map")} 
                className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-slate-600 font-sans text-xs text-slate-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                Launch Satellite Map View <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Interactive SVG Map */}
            <div className="relative h-[250px] bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.6)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
              
              {/* Ambient Radial Glowing Elements around waterfront slums */}
              <div className="absolute top-[35%] left-[60%] w-36 h-36 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-[20%] left-[25%] w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1000ms' }} />

              {/* Vector Map Boundaries */}
              <svg className="w-full h-full max-w-sm text-slate-800 opacity-80" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Simulated bay boundary */}
                <path d="M 20,40 Q 150,120 230,50 T 360,110 T 390,260" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
                {/* Simulated river delta curves */}
                <path d="M 120,0 C 130,100 160,165 240,200 C 265,220 280,260 282,300" stroke="#0284c7" strokeWidth="3" opacity="0.4" />
                <path d="M 148,150 C 120,180 80,190 30,220" stroke="#0284c7" strokeWidth="1.5" opacity="0.3" />
                {/* Land boundary contours */}
                <path d="M 10,10 L 390,10 L 390,290 L 10,290 Z" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* Sector text labels */}
                <text x="50" y="40" fill="#475569" fontSize="9" fontFamily="monospace">SECTOR A - HILLS</text>
                <text x="310" y="160" fill="#475569" fontSize="9" fontFamily="monospace">SECTOR B - DELTA</text>
                <text x="80" y="270" fill="#475569" fontSize="9" fontFamily="monospace">SECTOR C - METRO</text>
              </svg>

              {/* Markers Absolute Placement (Simulation overlay overlaying the vector path) */}
              {/* INC-3081: Embankment Breach */}
              <div 
                onClick={() => onTabChange("incidents")}
                className="absolute top-[38%] left-[55%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-slate-900 flex items-center justify-center text-[7px] text-white font-bold animate-ping absolute" />
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-slate-900 flex items-center justify-center text-[7px] text-white font-bold relative z-10">🚨</span>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-slate-100 font-sans tracking-wide whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <p className="font-semibold text-red-400">🚨 FLOOD OVERFLOW</p>
                  <p className="text-[9px] text-slate-400">Embankment Breach - INC-3081</p>
                </div>
              </div>

              {/* SOS-9421: Water slums */}
              <div 
                onClick={() => onTabChange("sos")}
                className="absolute top-[52%] left-[64%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center animate-bounce"
              >
                <span className="w-4 h-4 rounded-full bg-teal-500 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white font-sans font-bold z-10">SOS</span>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-slate-100 font-sans tracking-wide whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <p className="font-semibold text-teal-400">📡 SOS-9421 ACTIVE</p>
                  <p className="text-[9px] text-slate-400">8 trapped on storage crates</p>
                </div>
              </div>

              {/* Shelter SHL-401 St Xavier */}
              <div 
                onClick={() => onTabChange("shelters")}
                className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center"
              >
                <div className="p-1 rounded bg-blue-600 text-white border border-slate-900 text-[8px] leading-none font-bold relative z-10">
                  🎪 SHL-401
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-slate-100 font-sans tracking-wide whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <p className="font-semibold text-blue-400">🏫 St. Xavier Stadium</p>
                  <p className="text-[9px] text-slate-400">Occupancy: 980/1200 (220 Available)</p>
                </div>
              </div>

              {/* Weather indicators overlay in corner */}
              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 p-2 rounded px-3 font-mono text-[9px] text-slate-400 space-y-0.5">
                <p className="text-slate-300">🛰️ METEO TIMESTAMPS OVERLAY</p>
                <p>Sensor grid: <span className="text-emerald-400">Active</span></p>
                <p>Lat / Lng: <span className="text-slate-200">22.5691 / 88.3622</span></p>
              </div>

              {/* GIS overlays feedback legend left */}
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 p-2 rounded px-3 font-mono text-[9px] text-slate-500 space-y-0.5 pointer-events-none">
                <p className="text-slate-400 font-semibold uppercase">Map Elements</p>
                <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Extreme Incident</p>
                <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Active SOS Feed</p>
                <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Public Shelter</p>
              </div>
            </div>
          </div>

          {/* Environmental telemetry and Meteorological sensors */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-sans font-medium text-slate-200 text-sm tracking-tight mb-4 flex items-center gap-2">
              <Droplets className="w-4.5 h-4.5 text-blue-400" />
              Regional Weather Sensor Telemetry (Satellite Feed)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <CloudRain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">Hourly Rain</p>
                  <p className="font-mono text-sm text-slate-200 font-semibold">41.8 mm / h</p>
                  <p className="font-sans text-[10px] text-red-400 font-medium">Critical Threshold (A-C)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">Wind Shear</p>
                  <p className="font-mono text-sm text-slate-200 font-semibold">142.5 km/h</p>
                  <p className="font-sans text-[10px] text-amber-400">Direction: SSE Vector</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">Surge Inflow</p>
                  <p className="font-mono text-sm text-slate-200 font-semibold">+3.18 meters</p>
                  <p className="font-sans text-[10px] text-red-400">Extreme Sea Tidal Surcharge</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">Telemetry Integrity</p>
                  <p className="font-mono text-sm text-emerald-400 font-semibold">99.78% Pass</p>
                  <p className="font-sans text-[10px] text-slate-500">12 sensors reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Emergency Dispatch Controls & Chat */}
        <div className="space-y-6">
          
          {/* Quick Directives & Force Mobilizer */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-sans font-medium text-slate-200 text-sm tracking-tight mb-4 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-red-400" />
              Tactical Actions Dispatcher
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleQuickCommand("broadcast", "Trigger Regional Siren & Evacuation Broadcast")}
                disabled={activeQuickCommand !== null}
                className={`w-full p-2.5 rounded-lg border text-left font-sans text-xs transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
                  activeQuickCommand === "Trigger Regional Siren & Evacuation Broadcast"
                    ? 'bg-red-950 border-red-500/40 text-red-200'
                    : 'bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <p className="font-medium">Trigger Regional Siren & Evac Broadcast</p>
                  <p className="text-[10px] text-slate-500">Sends alerts over local SMS gateways, radios, and outdoor audio speaker clusters</p>
                </div>
                <div className="text-red-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
              </button>

              <button
                onClick={() => handleQuickCommand("drain", "Initiate Reservoir Cascade Auto-Drain Command")}
                disabled={activeQuickCommand !== null}
                className={`w-full p-2.5 rounded-lg border text-left font-sans text-xs transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
                  activeQuickCommand === "Initiate Reservoir Cascade Auto-Drain Command"
                    ? 'bg-blue-950 border-blue-500/40 text-blue-200'
                    : 'bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <p className="font-medium">Initiate Reservoir Cascade Auto-Drain</p>
                  <p className="text-[10px] text-slate-500">Executes controlled spillway release at central sluice gate gates to prevent overtopping</p>
                </div>
                <div className="text-blue-400">
                  <Droplets className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => handleQuickCommand("ndrf", "Coordinate Airborne NDRF Heavy Machinery Helicopter Lift")}
                disabled={activeQuickCommand !== null}
                className={`w-full p-2.5 rounded-lg border text-left font-sans text-xs transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
                  activeQuickCommand === "Coordinate Airborne NDRF Heavy Machinery Helicopter Lift"
                    ? 'bg-purple-950 border-purple-500/40 text-purple-200'
                    : 'bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <p className="font-medium">Command Airborne NDRF Helicopter Lift</p>
                  <p className="text-[10px] text-slate-500">Launches state helicopters to drop heavy cutters and marine inflatable boats to water slum zones</p>
                </div>
                <div className="text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Quick Command Processing Visual Response */}
            {activeQuickCommand && (
              <div className="mt-3 p-3 bg-slate-950 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono tracking-wider flex items-center gap-2 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM LIVE INSTRUCTION BROADCAST SUCCEEDED: "{activeQuickCommand}"
              </div>
            )}
          </div>

          {/* AI Disaster Assistant Widget Panel */}
          <div className="h-[480px]">
            <AIDisasterAssistant onAddLog={onAddLog} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Operational Logs */}
      <div id="system-logs-container" className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-medium text-slate-200 text-sm tracking-tight flex items-center gap-2">
            <Radio className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
            Live Tactical Stream & Neural Network Audits
          </h3>
          <span className="font-mono text-[10px] text-slate-500">Log sequence: auto-updating</span>
        </div>

        <div className="bg-slate-950 rounded-lg border border-slate-800/80 p-3 max-h-[140px] overflow-y-auto font-mono text-[11px] divide-y divide-slate-900 leading-relaxed">
          {logs.map((log) => (
            <div key={log.id} className="py-2 flex items-start gap-4">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                log.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {log.severity}
              </span>
              <span className="text-slate-400 font-semibold shrink-0">[{log.component}]</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
