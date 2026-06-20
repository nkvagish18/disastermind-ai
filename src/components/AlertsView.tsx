import { useState } from 'react';
import { 
  Bell, Grid, List, Search, Filter, AlertTriangle, AlertCircle, 
  MapPin, Clock, Gauge, ArrowRight, Check 
} from 'lucide-react';
import { AlertWarning } from '../types';

interface AlertsViewProps {
  alerts: AlertWarning[];
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function AlertsView({ alerts, onAddLog }: AlertsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<'All' | 'Meteorological' | 'Hydrological' | 'Geological'>("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>("grid");
  const [selectedAlert, setSelectedAlert] = useState<AlertWarning | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  const handleAcknowledge = (id: string, title: string) => {
    if (acknowledgedAlerts.includes(id)) return;
    setAcknowledgedAlerts(prev => [...prev, id]);
    onAddLog("Warning Ops", `Acknowledge signal received for: ${title}. Operational team briefed.`, "info");
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' ? true : alert.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="alerts-view" className="space-y-6">
      
      {/* Search and Filters panel */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Category filter & search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by hazard, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:outline-none focus:border-red-500 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 md:w-[220px]"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
            {(['All', 'Meteorological', 'Hydrological', 'Geological'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans tracking-wide transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-red-950 border border-red-500/30 text-red-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Grid/List views */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-slate-500">View Layout:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view of active warnings */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredAlerts.map(alert => {
            const isCritical = alert.priority === 'Red';
            const isAck = acknowledgedAlerts.includes(alert.id);
            return (
              <div 
                key={alert.id}
                className={`p-5 bg-slate-900 border rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all ${
                  isCritical ? 'border-red-500/20' : 'border-amber-500/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {alert.priority} Priority • {alert.category}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {alert.time}
                    </span>
                  </div>

                  <h4 className="font-sans font-medium text-slate-200 text-sm tracking-tight leading-snug">
                    {alert.title}
                  </h4>
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Site:</span>
                    <span className="text-slate-300 font-sans">{alert.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Trigger Threshold:</span>
                    <span className="text-amber-500 font-mono text-[11px]">{alert.triggerThreshold}</span>
                  </div>

                  {/* Operational buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg font-sans text-xs font-semibold cursor-pointer transition-all active:scale-95"
                    >
                      Inspect Variables
                    </button>
                    <button
                      onClick={() => handleAcknowledge(alert.id, alert.title)}
                      className={`px-3 py-2 rounded-lg font-sans text-xs font-semibold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        isAck 
                          ? 'bg-slate-950 border border-slate-800 text-slate-500 pointer-events-none' 
                          : 'bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-200'
                      }`}
                    >
                      {isAck ? <Check className="w-4 h-4 text-emerald-400" /> : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View style */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
          {filteredAlerts.map(alert => {
            const isCritical = alert.priority === 'Red';
            const isAck = acknowledgedAlerts.includes(alert.id);
            return (
              <div key={alert.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/20 transition-colors">
                <div className="flex items-start gap-3.5 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-sans font-medium text-slate-200 text-sm">{alert.title}</h4>
                      <span className="font-mono text-[10px] text-slate-500">• {alert.time}</span>
                    </div>
                    <p className="font-sans text-xs text-slate-400 max-w-3xl leading-relaxed">{alert.description}</p>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500">
                      <span>SITE: <span className="text-slate-350 font-sans text-[11px]">{alert.location}</span></span>
                      <span>THRESHOLD: <span className="text-amber-500">{alert.triggerThreshold}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="p-2 px-3 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded font-sans cursor-pointer hover:border-slate-700"
                  >
                    Metrics
                  </button>
                  <button
                    onClick={() => handleAcknowledge(alert.id, alert.title)}
                    className={`p-2 px-4 text-xs rounded font-sans cursor-pointer transition-colors ${
                      isAck ? 'bg-slate-950 text-slate-600 pointer-events-none' : 'bg-red-950 text-red-300 hover:bg-red-900'
                    }`}
                  >
                    {isAck ? 'Acked' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL INSPECT VARIABLE DIALOG OVERLAY */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                <h4 className="font-sans font-semibold text-slate-200 text-sm tracking-tight">Active Sensor Verification</h4>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="font-mono text-slate-600 hover:text-slate-350 text-lg px-2 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-400 font-sans">
              <div className="p-3 bg-slate-950 rounded-lg space-y-1 font-mono text-[11px]">
                <p className="text-slate-500">WARNING COMPONENT ID:</p>
                <p className="text-slate-200 font-sans font-medium text-xs leading-normal">{selectedAlert.title}</p>
                <p className="text-slate-500 mt-2">LOCALIZED VECTOR COORDINATE:</p>
                <p className="text-slate-200">{selectedAlert.location}</p>
              </div>

              <p className="leading-relaxed">
                Sensor grid telemetry verifies heavy atmospheric displacement triggers. This model recommends immediate broadcast of localized safety corridors and evacuation protocols to any public stadium shelter inside the district.
              </p>

              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg space-y-2">
                <p className="font-semibold text-red-400">System Command Action</p>
                <p className="text-[11px] text-red-300">
                  Execute controlled spillway reservoir dumping to de-stress the northern water basin, mitigating downstream structural collapse risks.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  onAddLog("Warning Ops", `Cascade spillway triggered for ${selectedAlert.location}.`, "critical");
                  setSelectedAlert(null);
                }}
                className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
              >
                Trigger Automatic Sluice Control
              </button>
              <button
                onClick={() => setSelectedAlert(null)}
                className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 font-sans text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
