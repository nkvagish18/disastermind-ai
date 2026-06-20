import React, { useState } from 'react';
import { 
  Building2, Users, Droplets, Utensils, Heart, ShieldAlert, 
  Send, Phone, MapPin, Sparkles, CheckSquare, Plus, CheckCircle2 
} from 'lucide-react';
import { Shelter } from '../types';

interface SheltersViewProps {
  shelters: Shelter[];
  onRequisitionResources: (shelterId: string, waterLiters: number, mreCount: number, medicines: string[]) => void;
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function SheltersView({
  shelters,
  onRequisitionResources,
  onAddLog
}: SheltersViewProps) {
  const [selectedShelterId, setSelectedShelterId] = useState<string>("SHL-401");
  const [waterReq, setWaterReq] = useState(1000);
  const [mreReq, setMreReq] = useState(200);
  const [requestedMedicalSupplyStr, setRequestedMedicalSupplyStr] = useState("");
  const [isDoneRequisition, setIsDoneRequisition] = useState(false);

  const handleRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelterId) return;

    // Compile medicines list
    const medicines = requestedMedicalSupplyStr 
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onRequisitionResources(selectedShelterId, waterReq, mreReq, medicines);
    onAddLog("Shelter Logistics", `REQUISITION QUEUED for ${selectedShelterId}: +${waterReq}L Potable Water, +${mreReq} MREs, Medicines: [${medicines.join(', ') || 'None'}]`, "info");
    
    setIsDoneRequisition(true);
    setWaterReq(1000);
    setMreReq(200);
    setRequestedMedicalSupplyStr("");

    // Reset indicator
    setTimeout(() => {
      setIsDoneRequisition(false);
    }, 3000);
  };

  const selectedShelter = shelters.find(s => s.id === selectedShelterId) || shelters[0];

  return (
    <div id="shelters-view" className="space-y-6">
      
      {/* Top statistical grid of shelters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {shelters.map(shelter => {
          const occRatio = shelter.occupancy / shelter.capacity;
          return (
            <div 
              key={shelter.id}
              onClick={() => setSelectedShelterId(shelter.id)}
              className={`p-4 bg-slate-900 border rounded-xl cursor-pointer transition-all active:scale-98 flex flex-col justify-between ${
                selectedShelterId === shelter.id ? 'border-blue-500' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">{shelter.id} • {shelter.district}</span>
                  <span className={`w-2 h-2 rounded-full ${occRatio >= 0.9 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                </div>
                <h4 className="font-sans font-semibold text-slate-200 text-xs mt-1.5 leading-tight">{shelter.name}</h4>
              </div>

              <div className="mt-4 space-y-2 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between items-baseline">
                  <span>Occupancy Capacity:</span>
                  <span className="text-slate-100 font-bold">{shelter.occupancy} / {shelter.capacity}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      occRatio >= 0.9 ? 'bg-red-500' : occRatio >= 0.7 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${occRatio * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail inspect Split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns: Selected Shelter Supply Inventories */}
        <div className="lg:col-span-2 space-y-6">
          {selectedShelter ? (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-tight">{selectedShelter.name}</h3>
                    <p className="font-sans text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> District: {selectedShelter.district} • Contact hotline: {selectedShelter.contact}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 font-mono text-xs text-slate-300">
                  Remaining Beds: <span className="text-blue-400 font-bold">{selectedShelter.bedsOpen} Beds</span>
                </div>
              </div>

              {/* Occupant density profile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                    <Droplets className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-medium">Potable Water</p>
                    <p className="font-mono text-sm text-slate-200 font-semibold">{selectedShelter.potableWaterLiters} Liters</p>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Estimated 3 days supply</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                    <Utensils className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-medium">MRE Ration Packs</p>
                    <p className="font-mono text-sm text-slate-200 font-semibold">{selectedShelter.mrePacks} cases</p>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Ready dry food boxes</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0">
                    <Heart className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-medium">Medical Contingency</p>
                    <p className="font-mono text-sm text-red-400 font-semibold">Shortage Flag</p>
                    <p className="text-[10px] text-red-500/80 font-sans mt-0.5 font-medium">{selectedShelter.medicalShortages.length} pharmaceutical gaps</p>
                  </div>
                </div>
              </div>

              {/* Shortage indicator tags logs */}
              <div className="space-y-2">
                <h4 className="font-sans font-semibold text-slate-300 text-xs tracking-wider uppercase flex items-center gap-1 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  Acknowledge Supply Gaps
                </h4>
                
                {selectedShelter.medicalShortages.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedShelter.medicalShortages.map((short, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded bg-red-950 border border-red-500/20 text-red-300 text-[11px] font-medium font-sans flex items-center gap-1.5 animate-pulse"
                      >
                        🚨 Stranded medical bottleneck: {short}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="p-3 bg-emerald-950/20 border border-emerald-950 text-emerald-300 rounded text-xs">
                    ✓ All key clinical pharmaceuticals are fully stocked at this station.
                  </p>
                )}
              </div>

              {/* Historical requisition receipt logs template info */}
              <div className="p-3.5 bg-slate-950/60 rounded-lg space-y-1 text-slate-400 text-xs font-sans">
                <p className="font-mono font-semibold text-[10px] text-slate-500 uppercase">Shelter Structural Specs</p>
                <p>Structure engineered to resist winds up to <span className="text-slate-300">180km/h (Level 4 Cyclone Shield)</span>.</p>
                <p>Power backup system: <span className="text-emerald-400 font-mono">150kW Caterpillar soundless diesel generator active</span>.</p>
              </div>

            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
              Select any shelter metric card from the top deck to analyze supply allocations.
            </div>
          )}
        </div>

        {/* Right Columns: FLEX requisition order builder */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                <Heart className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-slate-200 text-xs tracking-tight">Supply Dispatch Requisition</h4>
                <p className="font-sans text-[10px] text-slate-500">Route lifeboats, water barrels, or pharmaceuticals to {selectedShelter?.name || 'Selected shelter'}</p>
              </div>
            </div>

            <form onSubmit={handleRequisitionSubmit} className="space-y-4 font-sans text-xs">
              
              <div>
                <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Target Station</label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2.5 focus:outline-none focus:border-blue-500 rounded-lg h-10"
                >
                  {shelters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Water Barrels (+Liters)</label>
                  <input
                    type="number"
                    value={waterReq}
                    onChange={(e) => setWaterReq(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 text-slate-100 rounded focus:outline-none focus:border-blue-500 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">MRE cases (+Rations)</label>
                  <input
                    type="number"
                    value={mreReq}
                    onChange={(e) => setMreReq(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 text-slate-100 rounded focus:outline-none focus:border-blue-500 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Add Medical / Pharmaceutical kits (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Anti-venom, Oral Rehydration Salts, Blankets"
                  value={requestedMedicalSupplyStr}
                  onChange={(e) => setRequestedMedicalSupplyStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 text-slate-300 text-xs rounded focus:outline-none focus:border-blue-500 rounded-lg"
                />
              </div>

              {/* Submit requisition Dispatcher */}
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold cursor-pointer select-none transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950/40"
              >
                Send Supply Requisition <Send className="w-3.5 h-3.5" />
              </button>

              {isDoneRequisition && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-mono text-[10px] tracking-wide flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  REQUISITION SUCCESSFULLY DISPATCHED AND REGISTERED!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
