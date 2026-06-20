import React, { useState } from 'react';
import { 
  Users, Radio, MapPin, Battery, AlertTriangle, CheckCircle, 
  Send, Phone, Search, Sparkles, Navigation, Globe, BellRing, Plus, X 
} from 'lucide-react';
import { SOSAlert, RescueTeam } from '../types';

interface SOSQueueViewProps {
  sosAlerts: SOSAlert[];
  rescueTeams: RescueTeam[];
  onAssignSOSTeam: (sosId: string, teamId: string) => void;
  onUpdateSOSStatus: (sosId: string, status: SOSAlert['status']) => void;
  onCreateSOSAlert: (sos: Omit<SOSAlert, 'id' | 'time'>) => void;
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function SOSQueueView({
  sosAlerts,
  rescueTeams,
  onAssignSOSTeam,
  onUpdateSOSStatus,
  onCreateSOSAlert,
  onAddLog
}: SOSQueueViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unassigned' | 'Allocating' | 'Dispatched'>("All");
  const [selectedSOSId, setSelectedSOSId] = useState<string>("SOS-9421");
  const [selectedRescueTeamId, setSelectedRescueTeamId] = useState<string>("");
  const [broadcastCompletedDistrict, setBroadcastCompletedDistrict] = useState<string | null>(null);
  
  // --- SOS CREATION FORM STATES ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDistrict, setNewDistrict] = useState("North Suburbs");
  const [newPhone, setNewPhone] = useState("+91 ");
  const [newMessage, setNewMessage] = useState("");
  const [newLat, setNewLat] = useState(22.58);
  const [newLng, setNewLng] = useState(88.37);
  const [newPower, setNewPower] = useState(88);
  const [newTeamType, setNewTeamType] = useState("NDRF Unit");

  const handleSubmitSOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !newPhone.trim()) {
      onAddLog("SOS Registry Desk", "FAILED REGISTRY: Cannot submit empty distress description or empty contact phone.", "warning");
      return;
    }
    onCreateSOSAlert({
      district: newDistrict,
      coords: { lat: Number(newLat), lng: Number(newLng) },
      reporterPhone: newPhone,
      message: newMessage,
      status: 'Unassigned',
      powerLevel: Number(newPower),
      recommendedTeamType: newTeamType
    });
    // Reset forms
    setNewMessage("");
    setNewPhone("+91 ");
    setNewLat(22.58);
    setNewLng(88.37);
    setShowCreateModal(false);
  };

  const handleDispatch = (sosId: string) => {
    if (!selectedRescueTeamId) {
      onAddLog("SOS Dispatch Desk", "FAILED RESOLUTION: Operating group neglected to select rescue force.", "warning");
      return;
    }
    onAssignSOSTeam(sosId, selectedRescueTeamId);
    setSelectedRescueTeamId("");
    onAddLog("SOS Dispatch Desk", `SATELLITE SYNC: Unit ${selectedRescueTeamId} deployed to coordinates under SOS signal ${sosId}. SMS notification transmitted to victim.`, "critical");
  };

  const handleMassBroadcast = (district: string) => {
    onAddLog("Warning Ops", `SMS EMERGENCY BROADCAST TRANSMITTED: All citizens in '${district}' have received high-priority warning SMS alerts.`, "critical");
    setBroadcastCompletedDistrict(district);
    setTimeout(() => {
      setBroadcastCompletedDistrict(null);
    }, 4000);
  };

  const filteredSOS = sosAlerts.filter(sos => {
    const matchesSearch = sos.district.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sos.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : sos.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedSos = sosAlerts.find(s => s.id === selectedSOSId) || sosAlerts[0];

  return (
    <div id="sos-queue-view" className="space-y-6">
      
      {/* Top statistical dispatch cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[11px] text-slate-500 uppercase font-semibold">Unresolved Feed Items</p>
            <p className="font-mono text-2xl font-bold text-red-400 mt-1">
              {sosAlerts.filter(s => s.status !== 'Cleared').length} SOS Streams
            </p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[11px] text-slate-500 uppercase font-semibold">Ready Air Support</p>
            <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">
              {rescueTeams.filter(t => t.type === 'State Air Wing' && t.status === 'Standby').length} Heli Standby
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Navigation className="w-5 h-5 font-bold" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-sans text-[11px] text-slate-500 uppercase font-semibold">Critical Battery Victims</p>
            <p className="font-mono text-2xl font-bold text-amber-500 mt-1">
              {sosAlerts.filter(s => s.powerLevel <= 15).length} Low-Power
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Battery className="w-5 h-5" />
          </div>
        </div>
      </div>

      {broadcastCompletedDistrict && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-300 font-mono text-[11px] tracking-wide flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          SMS EMERGENCY BROADCAST SUCCESSFULLY QUEUED AND DISTRIBUTED TO ALL CELLULAR NODES IN SUB-REGION: {broadcastCompletedDistrict.toUpperCase()}
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Feed List with search/filter */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
            <h3 className="font-sans font-medium text-slate-200 text-xs tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Stranded Victim Feeds</span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2.5 py-1 bg-red-900/50 hover:bg-red-800 border border-red-500/30 hover:border-red-500 text-red-100 text-[10px] font-sans font-bold rounded flex items-center gap-1 hover:text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-red-955/20 uppercase"
              >
                <Plus className="w-3.5 h-3.5" /> Log SOS Signal
              </button>
            </h3>

            {/* Inputs controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
                <input
                  type="text"
                  placeholder="Filter by message text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex bg-slate-950 p-0.5 border border-slate-850 rounded text-[11px] flex-wrap justify-between">
                {(['All', 'Unassigned', 'Allocating', 'Dispatched'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`flex-1 py-1 rounded text-center transition-all cursor-pointer font-sans ${
                      statusFilter === f 
                        ? 'bg-slate-800 text-slate-100 font-semibold shadow-inner' 
                        : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* SOS cards listing */}
            <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
              {filteredSOS.map(sos => {
                const isSelected = sos.id === selectedSOSId;
                const isLowPower = sos.powerLevel <= 15;
                return (
                  <div
                    key={sos.id}
                    onClick={() => setSelectedSOSId(sos.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-slate-950 border-red-500/40 text-slate-100' 
                        : 'bg-slate-950/30 hover:bg-slate-950/65 border-slate-850/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-red-400">#{sos.id}</span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        {isLowPower && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                        <span className={`flex items-center gap-0.5 px-1 rounded ${
                          isLowPower ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Battery className="w-3 h-3" /> {sos.powerLevel}%
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-[11px] leading-relaxed line-clamp-2 mb-2">
                      {sos.message}
                    </p>

                    <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 border-t border-slate-900/60 pt-1.5">
                      <span className="text-slate-400 font-sans">{sos.district}</span>
                      <span>{sos.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Right: SELECTED DETAIL PANEL & COMMAND ALLOCATION */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSos ? (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              
              {/* Header card info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wide">Selected Crisis Feed</span>
                  <p className="font-sans font-semibold text-slate-100 text-sm mt-0.5">#{selectedSos.id} - Location Delta Base Outpost</p>
                </div>
                <div className="font-mono text-[10px] text-slate-400 flex items-center gap-2">
                  <span>Urgency status:</span>
                  <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                    selectedSos.status === 'Unassigned' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    selectedSos.status === 'Allocating' ? 'bg-amber-500/10 text-amber-400 border border-amber-505/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {selectedSos.status}
                  </span>
                </div>
              </div>

              {/* OPERATOR OVERRIDE STATUS CONTROL */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850">
                <div className="space-y-0.5">
                  <p className="font-sans font-bold text-slate-200 text-xs uppercase">SOS Live Status Update</p>
                  <p className="font-sans text-[10px] text-slate-500">Explicitly modify the civilian hazard urgency resolution state</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['Unassigned', 'Allocating', 'Dispatched', 'Cleared'] as const).map(stat => (
                    <button
                      key={stat}
                      onClick={() => onUpdateSOSStatus(selectedSos.id, stat)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border cursor-pointer active:scale-95 ${
                        selectedSos.status === stat
                          ? 'bg-red-500/10 text-red-300 border-red-500/30 font-extrabold shadow shadow-red-500/10'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {stat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographical Coordinates details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
                <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg space-y-0.5">
                  <span className="text-slate-500 text-[10px] font-mono">COORDINATES WGS-84</span>
                  <p className="font-mono text-slate-200">22.593 N • 88.402 E</p>
                </div>

                <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg space-y-0.5">
                  <span className="text-slate-500 text-[10px] font-mono font-sans"><Phone className="w-3 h-3 text-slate-600 inline mr-1" /> REPORTER MOBILE</span>
                  <p className="font-mono text-slate-200">{selectedSos.reporterPhone}</p>
                </div>

                <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg space-y-0.5">
                  <span className="text-slate-500 text-[10px]">ENVIRONMENT SENSORS ACTIVE</span>
                  <p className="font-mono text-amber-500">{selectedSos.floodLevel || selectedSos.windSpeed || 'Extremely Damp Area'}</p>
                </div>
              </div>

              {/* Message Core text block */}
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-slate-500 uppercase">Text message payload</p>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-slate-200 font-sans text-sm tracking-wide">
                  "{selectedSos.message}"
                </div>
              </div>

              {/* COUPLING THE RECOMMENDED TEAMS AI RECOMMENDATION PANEL */}
              <div className="p-4 bg-emerald-950/15 border border-emerald-500/25 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-emerald-300 text-xs tracking-tight">AI Smart Resource Allocator Recommendations</h4>
                    <p className="font-sans text-[10px] text-emerald-500">Suggested field units to dispatch based on coordinates, terrain, and battery thresholds</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg space-y-1">
                    <p className="font-semibold text-slate-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimal Deployment Force:
                    </p>
                    <p className="font-mono text-slate-400">{selectedSos.recommendedTeamType} deployment recommended</p>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg space-y-1">
                    <p className="font-semibold text-slate-300">Tactical Strategy justification:</p>
                    <p className="text-slate-400 text-[11px] leading-normal font-sans">
                      {selectedSos.powerLevel <= 15 
                        ? 'Low device battery (11%) requires immediate satellite triangulation on STANDBY units. Moving air unit enroute is prioritized.' 
                        : 'Deep water logged streets require inflatables rather than ground motorways. Allocating boat divisions immediately.'}
                    </p>
                  </div>
                </div>

                {/* Dispatch interactive choice list */}
                <div className="space-y-2 border-t border-emerald-900/40 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Select Ready Standby Force</label>
                    <select
                      value={selectedRescueTeamId}
                      onChange={(e) => setSelectedRescueTeamId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2 rounded focus:outline-none focus:border-red-500 rounded-lg md:w-[260px] h-9"
                    >
                      <option value="">-- Choose active Standby Force --</option>
                      {rescueTeams.filter(t => t.status === 'Standby').map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleMassBroadcast(selectedSos.district)}
                      className="px-3 h-9 bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded hover:border-slate-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                      title="Transmit emergency warning SMS broadcast to citizens in proximate cells"
                    >
                      <BellRing className="w-3.5 h-3.5" /> Broadcast Mass Alert
                    </button>
                    <button
                      onClick={() => handleDispatch(selectedSos.id)}
                      className="px-4 h-9 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 select-none"
                    >
                      Assign Team & Sat-Sync
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 font-sans text-xs">
              Select an SOS feed ticker item from the left roster list to initiate tracking coordinates.
            </div>
          )}
        </div>
      </div>

      {/* 2. LOG NEW CIVILIAN SOS BEACON MODAL OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-750 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 text-red-500">
                <Radio className="w-5 h-5 animate-pulse" />
                <h3 className="font-sans font-bold text-slate-100 text-sm tracking-wide uppercase">Transmit Live SOS Beacon</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSOS} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase">Select Sector / District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 focus:outline-none focus:border-red-500 rounded-lg"
                  >
                    <option value="Waterfront slums">Waterfront slums</option>
                    <option value="South Delta Crossing">South Delta Crossing</option>
                    <option value="North Suburbs">North Suburbs</option>
                    <option value="Central Metro">Central Metro</option>
                    <option value="Coastal Transit">Coastal Transit</option>
                    <option value="Hill Region">Hill Region</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase">Reporter Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 12345 67890"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 focus:outline-none focus:border-red-500 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 font-mono text-[10px] uppercase">Distress Payload Message</label>
                <textarea
                  required
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="E.g., Elderly family members stranded on attic floor. Water rising at 20cm/hr."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 focus:outline-none focus:border-red-500 rounded-lg leading-relaxed placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase">Latitude Coordinates</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 focus:outline-none focus:border-red-500 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase">Longitude Coordinates</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 focus:outline-none focus:border-red-500 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase">Device Power Level (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newPower}
                    onChange={(e) => setNewPower(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 focus:outline-none focus:border-red-500 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-mono text-[10px] uppercase">Target Rescue Support Type</label>
                  <select
                    value={newTeamType}
                    onChange={(e) => setNewTeamType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 focus:outline-none focus:border-red-500 rounded-lg"
                  >
                    <option value="NDRF Unit">NDRF Unit</option>
                    <option value="State Air Wing">State Air Wing</option>
                    <option value="Medical Emergency Unit">Medical Emergency Unit</option>
                    <option value="Civil Defense Force">Civil Defense Force</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 hover:border-slate-700 text-slate-400 rounded-lg border border-slate-800 font-semibold cursor-pointer"
                >
                  Cancel Operation
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white rounded-lg font-bold cursor-pointer transition-all active:scale-95 uppercase flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Initialize Beacon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
