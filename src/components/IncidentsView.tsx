import React, { useState } from 'react';
import { 
  AlertOctagon, PlusCircle, Search, Filter, HelpCircle, MapPin, 
  Clock, ShieldAlert, Phone, Users, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Incident, IncidentType, IncidentPriority, RescueTeam } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  rescueTeams: RescueTeam[];
  onAddIncident: (inc: Omit<Incident, 'id'>) => void;
  onUpdateIncidentStatus: (id: string, status: Incident['status']) => void;
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function IncidentsView({
  incidents,
  rescueTeams,
  onAddIncident,
  onUpdateIncidentStatus,
  onAddLog
}: IncidentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("INC-3081");
  const [isDoneReporting, setIsDoneReporting] = useState(false);

  // New incident reporting form states
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [newIncTitle, setNewIncTitle] = useState("");
  const [newIncType, setNewIncType] = useState<IncidentType>("Flood");
  const [newIncDistrict, setNewIncDistrict] = useState("North Suburbs");
  const [newIncPriority, setNewIncPriority] = useState<IncidentPriority>("High");
  const [newIncDetails, setNewIncDetails] = useState("");
  const [newIncReporter, setNewIncReporter] = useState("");
  const [newIncPhone, setNewIncPhone] = useState("");

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncTitle || !newIncDetails) return;

    onAddIncident({
      title: newIncTitle,
      type: newIncType,
      district: newIncDistrict,
      priority: newIncPriority,
      status: "Active",
      time: "Just now",
      coords: { lat: 22.56, lng: 88.36 }, // Center-approx coords
      reporter: newIncReporter || "Citizen Hotline",
      contact: newIncPhone || "108 Emergency Dial",
      details: newIncDetails
    });

    onAddLog("Incident Stream", `CRISIS SIGNED: "${newIncTitle}" logged in ${newIncDistrict} under ${newIncPriority} priority.`, "warning");
    
    // Clear & show success animation
    setIsReportingOpen(false);
    setIsDoneReporting(true);
    setNewIncTitle("");
    setNewIncDetails("");
    setNewIncReporter("");
    setNewIncPhone("");

    setTimeout(() => {
      setIsDoneReporting(false);
    }, 2800);
  };

  const handleUpdateStatus = (id: string, stat: Incident['status']) => {
    onUpdateIncidentStatus(id, stat);
    onAddLog("Incident Stream", `INCIDENT UPDATE: #${id} marked as [${stat}]. Roster systems synced.`, "info");
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "All" ? true : inc.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const selectedInc = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Distilled lists of districts represented
  const districtsList = ["All", ...Array.from(new Set(incidents.map(i => i.district)))];

  return (
    <div id="incidents-view" className="space-y-6">
      
      {/* Top action header panel */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search ongoing incidents list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-805 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500 w-full md:w-[220px]"
            />
          </div>

          {/* District dropdown filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500 uppercase">Sector Filter:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-350 text-xs p-1.5 focus:outline-none rounded-lg focus:border-red-500 font-sans cursor-pointer h-9"
            >
              {districtsList.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsReportingOpen(!isReportingOpen)}
            className="px-4 py-2 rounded-lg bg-red-650 hover:bg-red-600 text-white font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-lg shadow-red-950/20"
          >
            <PlusCircle className="w-4 h-4" /> Log Active Emergency
          </button>
        </div>
      </div>

      {/* Report New Incident overlay form wizard */}
      {isReportingOpen && (
        <form onSubmit={handleSubmitIncident} className="p-5 bg-slate-900 border border-slate-700 rounded-xl space-y-4 font-sans text-xs text-slate-300 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-red-400 font-semibold mb-2">
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-5 h-5" /> Assemble Field Incident Report Form
            </span>
            <button type="button" onClick={() => setIsReportingOpen(false)} className="text-slate-505 hover:text-slate-300 text-sm font-semibold">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">Incident Header / Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Broken Sluice Spillway Sector 4"
                value={newIncTitle}
                onChange={(e) => setNewIncTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">Disaster Category</label>
              <select
                value={newIncType}
                onChange={(e) => setNewIncType(e.target.value as IncidentType)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205"
              >
                <option value="Flood">🌊 Flooding/Reservoir</option>
                <option value="Cyclone">🌀 Hurricane Gale Wind</option>
                <option value="Landslide">⛰️ Mudslide/Rockfall</option>
                <option value="Earthquake">🌋 Seismic Shockwave</option>
                <option value="Cloudburst">⛈️ Sudden Precipitation</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">District Precinct</label>
              <input
                required
                type="text"
                placeholder="e.g. North Suburbs"
                value={newIncDistrict}
                onChange={(e) => setNewIncDistrict(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">Priority Threat Index</label>
              <select
                value={newIncPriority}
                onChange={(e) => setNewIncPriority(e.target.value as IncidentPriority)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205 font-bold"
              >
                <option value="Critical">🔴 Critical Priority</option>
                <option value="High">🟠 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">Reporter Full Name</label>
              <input
                type="text"
                placeholder="e.g. Officer D. Banner"
                value={newIncReporter}
                onChange={(e) => setNewIncReporter(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">Phone Hotline</label>
              <input
                type="text"
                placeholder="e.g. +91 99110 55220"
                value={newIncPhone}
                onChange={(e) => setNewIncPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] uppercase font-mono mb-1 text-slate-500">Details Description & Live coordinates parameters</label>
              <textarea
                required
                rows={3}
                placeholder="Provide details about structural damages, water depth level meters, or blocked egress routes. Distinguish details clearly..."
                value={newIncDetails}
                onChange={(e) => setNewIncDetails(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-red-500 text-slate-205"
              />
            </div>
          </div>

          <div className="text-right pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
            >
              Dispatch Alarm into Command Centers
            </button>
          </div>
        </form>
      )}

      {isDoneReporting && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-300 font-mono text-[11px] tracking-wide flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          EMERGENCY DISASTER SITUATION LOGGED SUCCESSFULLY! RADAR IS DISTRIBUTING DATA OVER GPS SATELLITES...
        </div>
      )}

      {/* Main double column screen layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double Columns: Real-time Incidents Feed Grid */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            
            <h3 className="font-sans font-medium text-slate-200 text-xs tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Operational Stream Indicators</span>
              <span className="font-mono text-[10px] text-slate-500">Sorted: Chronological Priority</span>
            </h3>

            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {filteredIncidents.map(inc => {
                const isSelected = inc.id === selectedIncidentId;
                const isCritical = inc.priority === 'Critical';
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      isSelected 
                        ? 'bg-slate-950 border-red-500/30 text-slate-100 shadow-lg' 
                        : 'bg-slate-950/20 hover:bg-slate-950/50 border-slate-850 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isCritical ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] text-cyan-400 font-bold">#{inc.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isCritical ? 'bg-red-950 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {inc.priority} priority
                          </span>
                        </div>
                        <h4 className="font-sans font-medium text-slate-200 text-xs">{inc.title}</h4>
                        <p className="font-sans text-[11px] text-slate-450 leading-relaxed text-slate-400 line-clamp-1">{inc.details}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1 font-mono text-[9px] text-slate-500">
                      <span>{inc.time}</span>
                      <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[8px] ${
                        inc.status === 'Escalated' ? 'bg-amber-950 text-amber-400 border border-amber-950' :
                        inc.status === 'Active' ? 'bg-red-950 text-red-400 border border-red-950' :
                        inc.status === 'Deployed' ? 'bg-blue-950 text-blue-400 border border-blue-955' :
                        'bg-slate-850 text-slate-500'
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Incident command Details and Team updates */}
        <div className="space-y-6">
          {selectedInc ? (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
              
              <div className="border-b border-slate-800 pb-3">
                <span className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-wider">#{selectedInc.id} INCIDENT COMMAND</span>
                <h4 className="font-sans font-semibold text-slate-100 text-sm mt-0.5 leading-normal">{selectedInc.title}</h4>
                <p className="font-sans text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Sector: {selectedInc.district}
                </p>
              </div>

              <div className="space-y-3 font-sans text-xs">
                
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg space-y-2 text-slate-350 leading-relaxed font-sans text-[11px]">
                  <p className="font-mono text-[10px] text-slate-500 font-semibold uppercase">Operational Incident description</p>
                  <p className="text-slate-200">"{selectedInc.details}"</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[10px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <p>REPORTER: <span className="text-slate-200 font-sans">{selectedInc.reporter}</span></p>
                  <p>HOTLINE: <span className="text-slate-200">{selectedInc.contact}</span></p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <span className="block font-sans text-[10px] text-slate-505 font-semibold uppercase">Force Assignment status</span>
                  
                  {selectedInc.assignedTeam ? (
                    <div className="p-2 bg-blue-950/20 border border-blue-900/30 rounded-lg text-blue-300 flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Deployed: {selectedInc.assignedTeam}</span>
                      <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-blue-900/30 font-bold uppercase tracking-wide">Sync Active</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-950/25 border border-amber-900/30 rounded-lg text-amber-300 text-xs text-center font-medium">
                      ⚠️ No NDRF boat force or helicopters assigned yet. Check Map overlay to dispatch.
                    </div>
                  )}
                </div>

                {/* Status Command changer */}
                <div className="space-y-1.5 border-t border-slate-800 pt-3">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Acknowledge Incident Level Update</label>
                  
                  <div className="flex gap-2 flex-wrap">
                    {(['Escalated', 'Active', 'Deployed', 'Resolved'] as const).map(stat => (
                      <button
                        key={stat}
                        onClick={() => handleUpdateStatus(selectedInc.id, stat)}
                        className={`flex-1 py-1.5 px-2 rounded-lg border font-sans text-xs font-semibold cursor-pointer active:scale-95 transition-all ${
                          selectedInc.status === stat
                            ? 'bg-red-650 border-red-500 text-white font-bold shadow-lg'
                            : 'bg-slate-950/40 hover:bg-slate-950 border-slate-850 text-slate-400'
                        }`}
                      >
                        {stat}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
              Select any incident ticker item from the Left stream manifest to coordinate dispatch signals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
