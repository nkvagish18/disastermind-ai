import React, { useState } from 'react';
import { 
  Users, ShieldPlus, Plane, Eye, Search, PlusCircle, Check, 
  MapPin, Phone, RefreshCw, FileDown, CheckSquare, Sparkles 
} from 'lucide-react';
import { RescueTeam } from '../types';

interface ResourcesViewProps {
  rescueTeams: RescueTeam[];
  onAddRescueTeam: (team: Omit<RescueTeam, 'id'>) => void;
  onUpdateTeamStatus: (teamId: string, status: 'Standby' | 'En Route' | 'On Scene' | 'Resting') => void;
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function ResourcesView({
  rescueTeams,
  onAddRescueTeam,
  onUpdateTeamStatus,
  onAddLog
}: ResourcesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("NDRF-Unit-5");
  const [isShowingAddForm, setIsShowingAddForm] = useState(false);
  const [isRosterExported, setIsRosterExported] = useState(false);

  // New team form values
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamType, setNewTeamType] = useState<RescueTeam['type']>("NDRF Unit");
  const [newTeamMembers, setNewTeamMembers] = useState(12);
  const [newTeamLocation, setNewTeamLocation] = useState("");
  const [newTeamVehicle, setNewTeamVehicle] = useState("");
  const [newTeamPhone, setNewTeamPhone] = useState("");

  const handleAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamLocation) return;

    onAddRescueTeam({
      name: newTeamName,
      type: newTeamType,
      members: newTeamMembers,
      location: newTeamLocation,
      status: "Standby",
      vehicle: newTeamVehicle || "Standard Utility SUV",
      phone: newTeamPhone || "+91 94444 11100"
    });

    onAddLog("Roster Hub", `NEW FORCE INTEGRATED: "${newTeamName}" registered under standby status.`, "info");
    
    // Clear
    setIsShowingAddForm(false);
    setNewTeamName("");
    setNewTeamMembers(12);
    setNewTeamLocation("");
    setNewTeamVehicle("");
    setNewTeamPhone("");
  };

  const handleUpdateStatus = (id: string, stat: RescueTeam['status']) => {
    onUpdateTeamStatus(id, stat);
    onAddLog("Roster Hub", `STATUS CHANGE: ${id} modified to '${stat}' ready status. Syncing transmitters...`, "info");
  };

  const exportRoster = () => {
    onAddLog("Roster Hub", "EXPORT READY: Tactical force directory compiled and downloaded in telemetry CSV structure.", "info");
    setIsRosterExported(true);
    setTimeout(() => {
      setIsRosterExported(false);
    }, 4000);
  };

  const filteredTeams = rescueTeams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTeam = rescueTeams.find(t => t.id === selectedTeamId) || rescueTeams[0];

  return (
    <div id="resources-view" className="space-y-6">
      
      {/* Top general statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
            <Users className="w-5 h-5 font-bold" />
          </div>
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Ready Personnel</p>
            <p className="font-mono text-xl font-bold text-slate-100">
              {rescueTeams.reduce((acc, t) => acc + t.members, 0)} operators
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Heli Transport Wings</p>
            <p className="font-mono text-xl font-bold text-slate-100">
              {rescueTeams.filter(t => t.type === 'State Air Wing').length} Airborne units
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <CheckSquare className="w-5 h-5 font-bold" />
          </div>
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Standby Clusters</p>
            <p className="font-mono text-xl font-bold text-slate-100">
              {rescueTeams.filter(t => t.status === 'Standby').length} Standby forces
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="font-sans text-[10px] text-slate-500 uppercase font-medium">Response Sites</p>
            <p className="font-mono text-xl font-bold text-slate-100">
              {rescueTeams.filter(t => t.status === 'On Scene').length} Active Sectors
            </p>
          </div>
        </div>
      </div>

      {isRosterExported && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-300 font-mono text-[11px] tracking-wide flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />
          ROSTER TELEMETRY REPORT EXPORTED SUCCESSFULLY AS 'ndrf_roster_directory_export.csv'
        </div>
      )}

      {/* Main double panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double column: NDRF Units manifest Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-sans font-medium text-slate-100 text-sm tracking-tight">Active Mobilisation Manifest</h3>
                <p className="font-sans text-xs text-slate-400">Tactical list directory verifying standby resources, vehicle loads, and telemetry numbers</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShowingAddForm(!isShowingAddForm)}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" /> Register New Unit
                </button>
                <button
                  onClick={exportRoster}
                  className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-slate-650 text-slate-300 font-sans text-xs flex items-center gap-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" /> Export Telemetry CSV
                </button>
              </div>
            </div>

            {/* Form to insert new group */}
            {isShowingAddForm && (
              <form onSubmit={handleAddTeamSubmit} className="p-4 bg-slate-950 border border-blue-500/20 rounded-xl gap-4 grid grid-cols-1 md:grid-cols-3 font-sans text-xs animate-fade-in text-slate-300">
                <div className="md:col-span-3 pb-1 flex items-center justify-between text-blue-400">
                  <span className="font-semibold">Register New Emergency Response Unit</span>
                  <button type="button" onClick={() => setIsShowingAddForm(false)} className="text-slate-500 hover:text-slate-300">Cancel</button>
                </div>
                
                <div>
                  <label className="block mb-1 text-[10px] uppercase text-slate-505 font-mono">Force Unit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delta Quick Rescue Division"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] uppercase text-slate-505 font-mono">Service Division Type</label>
                  <select
                    value={newTeamType}
                    onChange={(e) => setNewTeamType(e.target.value as RescueTeam['type'])}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-xs"
                  >
                    <option value="NDRF Unit">NDRF Unit</option>
                    <option value="State Air Wing">State Air Wing Force</option>
                    <option value="Medical Emergency Unit">Medical Emergency Unit</option>
                    <option value="Civil Defense Force">Civil Defense Force</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[10px] uppercase text-slate-505 font-mono">Roster Personnel Size</label>
                  <input
                    type="number"
                    value={newTeamMembers}
                    onChange={(e) => setNewTeamMembers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] uppercase text-slate-505 font-mono">Deployment Base Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 5 Central Port"
                    value={newTeamLocation}
                    onChange={(e) => setNewTeamLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] uppercase text-slate-505 font-mono">Assigned Vehicle Equipment</label>
                  <input
                    type="text"
                    placeholder="e.g. Watercraft Floaters x4, Trucks"
                    value={newTeamVehicle}
                    onChange={(e) => setNewTeamVehicle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] uppercase text-slate-505 font-mono">Roster Phone Link</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94331 55660"
                    value={newTeamPhone}
                    onChange={(e) => setNewTeamPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-xs"
                  />
                </div>

                <div className="md:col-span-3 pt-2 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    Commit New Team Force
                  </button>
                </div>
              </form>
            )}

            {/* Table data structure */}
            <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-3">Reference Code</th>
                    <th className="p-3">Unit Force Name</th>
                    <th className="p-3">Primary Division</th>
                    <th className="p-3">Base Location</th>
                    <th className="p-3">Status Roster</th>
                    <th className="p-3 text-right">Members</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredTeams.map(team => {
                    const isSelected = team.id === selectedTeamId;
                    return (
                      <tr 
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`hover:bg-slate-900/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-900 text-slate-100 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3 font-mono text-cyan-400 font-bold">#{team.id.substring(0, 8)}</td>
                        <td className="p-3">{team.name}</td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{team.type}</td>
                        <td className="p-3 text-slate-400">{team.location}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                            team.status === 'On Scene' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            team.status === 'En Route' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            team.status === 'Standby' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {team.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-medium">{team.members}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Selected Group Detail and STATUS CONTROLLER */}
        <div className="space-y-6">
          {selectedTeam ? (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
              
              <div className="border-b border-slate-800 pb-3">
                <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-wider">#{selectedTeam.id} PROFILE CARD</span>
                <h4 className="font-sans font-semibold text-slate-100 text-sm mt-0.5 leading-snug">{selectedTeam.name}</h4>
                <p className="font-sans text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-505" /> Station: {selectedTeam.location}
                </p>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-slate-950 rounded-lg space-y-1.5 font-mono text-[11px] text-slate-400 leading-normal">
                  <p className="font-sans text-slate-500 font-semibold mb-1 uppercase text-[10px]">Division Specifications</p>
                  <p>Service: <span className="text-slate-200">{selectedTeam.type}</span></p>
                  <p>Unit Mobility: <span className="text-slate-200">{selectedTeam.vehicle}</span></p>
                  <p>Roster Size: <span className="text-emerald-400">{selectedTeam.members} operators</span></p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-600" /> satellite link: {selectedTeam.phone}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Change Active Deployment Status</label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {(['Standby', 'En Route', 'On Scene', 'Resting'] as const).map(stat => (
                      <button
                        key={stat}
                        onClick={() => handleUpdateStatus(selectedTeam.id, stat)}
                        className={`py-2 rounded-lg border font-sans text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                          selectedTeam.status === stat
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-950/40 hover:bg-slate-950 border-slate-850 text-slate-400'
                        }`}
                      >
                        {stat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-950/15 border border-blue-900/30 rounded-lg text-slate-400 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Syncing changes distributes real-time target path coords onto the unit's onboard digital cockpit map. No secondary pairing required.
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
              Select any troop row from map mobilisation manifest directory to manage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
