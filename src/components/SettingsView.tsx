import { useState } from 'react';
import { 
  Sliders, Shield, RefreshCw, Layers, SlidersHorizontal, CheckSquare, 
  Trash2, BrainCircuit, Cpu, Save, CheckCircle2, AlertTriangle,
  Sun, Moon, Monitor
} from 'lucide-react';

interface SettingsViewProps {
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
  onFlushLogs?: () => void;
  themeMode?: 'light' | 'dark' | 'system';
  setThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
}

export default function SettingsView({ 
  onAddLog, 
  onFlushLogs, 
  themeMode = 'dark', 
  setThemeMode 
}: SettingsViewProps) {
  // Threshold sliders
  const [rainThreshold, setRainThreshold] = useState(45);
  const [windThreshold, setWindThreshold] = useState(120);
  const [seaSurchargeThreshold, setSeaSurchargeThreshold] = useState(3.0);

  // Neural configs
  const [activeModel, setActiveModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.3);
  const [isSyncingEngine, setIsSyncingEngine] = useState(false);

  // Synced node array state
  const [nodes, setNodes] = useState([
    { name: "Central Command Mainframe", role: "Primary Router", latency: "1.2ms", status: "Synced" },
    { name: "Sunderbans Coastal Outpost Alpha", role: "Cellular Gateway", latency: "24.5ms", status: "Synced" },
    { name: "Dum Dum Airbase Transit Link", role: "Air Support Comms", latency: "4.8ms", status: "Synced" },
    { name: "Waterfront Delta Gauge Cluster", role: "Telemetry Scraper", latency: "142.1ms", status: "Stale" }
  ]);

  const [savingSettings, setSavingSettings] = useState(false);
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isOverrideExecuted, setIsOverrideExecuted] = useState(false);

  const handleSaveSettings = () => {
    setSavingSettings(true);
    onAddLog("Settings Manager", `SYSTEM SEED WRITE: Warning benchmarks updated. Rainfall limit set to ${rainThreshold}mm/h. Cyclone alarm limit set to ${windThreshold}km/h.`, "warning");
    
    setTimeout(() => {
      setSavingSettings(false);
      setIsConfigSaved(true);
      onAddLog("Settings Manager", "BENCHMARKS COMMITTED SUCCESSFULLY. Sync complete across 4 GIS towers.", "info");
      setTimeout(() => {
        setIsConfigSaved(false);
      }, 4000);
    }, 1200);
  };

  const handleToggleNode = (name: string) => {
    setNodes(prev => prev.map(node => {
      if (node.name === name) {
        const nextStatus = node.status === "Synced" ? "Offline" : "Synced";
        onAddLog("Topology Desk", `Node ${node.name} status modified manually to ${nextStatus}.`, "warning");
        return { ...node, status: nextStatus };
      }
      return node;
    }));
  };

  const handleOverrideClearLogs = () => {
    setShowClearConfirm(true);
  };

  const confirmOverrideClearLogs = () => {
    setShowClearConfirm(false);
    if (onFlushLogs) {
      onFlushLogs();
    } else {
      onAddLog("Command Hub", "SYSTEM OVERRIDE COMMAND: Clean database synchronisation invoked. Resetting sensors parameter caches.", "critical");
    }
    setIsOverrideExecuted(true);
    setTimeout(() => {
      setIsOverrideExecuted(false);
    }, 4000);
  };

  return (
    <div id="settings-view" className="space-y-6">
      
      {/* Top section overview */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="font-sans font-medium text-slate-100 text-sm tracking-tight flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-blue-400" />
          Global Mission Critical Configs
        </h3>
        <p className="font-sans text-xs text-slate-400">Lock weather warning limits, synchronize telemetry nodes, and configure modern AI neural parameters</p>
      </div>

      {/* Visual Workspace Appearance */}
      {setThemeMode && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h4 className="font-sans font-medium text-slate-105 text-slate-100 text-xs uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Sun className="w-4.5 h-4.5 text-amber-500 animate-pulse shrink-0" />
              Dynamic System Theme & Workspace Appearance Protocols
            </h4>
            <p className="font-sans text-[11px] text-slate-400 mt-1 leading-relaxed">
              Configure the graphical host mode. Force crisp light, tactical slate dark, or align DisasterMind automatically with your device system default settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setThemeMode('light');
                onAddLog("Settings Desk", "Applied: LIGHT visual protocols aligned.", "info");
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                themeMode === 'light'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                  : 'bg-slate-950/45 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-350'
              }`}
            >
              <Sun className="w-5 h-5 shrink-0" />
              <div className="text-center">
                <p className="font-sans text-xs">Light Mode</p>
                <p className="font-mono text-[9px] text-slate-500 font-normal mt-0.5">High Contrast</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setThemeMode('dark');
                onAddLog("Settings Desk", "Applied: DARK visual protocols aligned.", "info");
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                themeMode === 'dark'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-bold'
                  : 'bg-slate-950/45 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-350'
              }`}
            >
              <Moon className="w-5 h-5 shrink-0" />
              <div className="text-center">
                <p className="font-sans text-xs">Dark Mode</p>
                <p className="font-mono text-[9px] text-slate-500 font-normal mt-0.5">Tactical Slate</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setThemeMode('system');
                onAddLog("Settings Desk", "Applied: SYSTEM automatic preference matched.", "info");
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                themeMode === 'system'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-bold'
                  : 'bg-slate-950/45 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-350'
              }`}
            >
              <Monitor className="w-5 h-5 shrink-0" />
              <div className="text-center">
                <p className="font-sans text-xs">System Match</p>
                <p className="font-mono text-[9px] text-slate-500 font-normal mt-0.5">Auto Handshake</p>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: SLIDERS THRESHOLDS CONFIG */}
        <div className="space-y-6">
          
          {/* Silder card */}
          <div className="p-5 bg-slate-905 bg-slate-905 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
            <h4 className="font-sans font-medium text-slate-300 text-xs tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              Precipitation Warning Benchmarks (Trigger Sliders)
            </h4>

            <div className="space-y-4 font-sans text-xs">
              
              {/* Rain Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-slate-400">
                  <span>Rainfall Alarm Trigger level:</span>
                  <span className="font-mono text-blue-400 font-bold">{rainThreshold} mm / hour</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={rainThreshold}
                  onChange={(e) => setRainThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[10px] text-slate-500">Current precipitations over this scale trigger automatic flash flood alerts.</p>
              </div>

              {/* Wind Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-slate-400">
                  <span>Cyclone Gale Warning velocity:</span>
                  <span className="font-mono text-amber-500 font-bold">{windThreshold} km / hour</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="200"
                  step="10"
                  value={windThreshold}
                  onChange={(e) => setWindThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-500">Gale speeds registering over this bar trigger structural collapse warning logs.</p>
              </div>

              {/* Sea Surcharge Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-slate-400">
                  <span>Sea Tidal Surcharge depth:</span>
                  <span className="font-mono text-red-400 font-bold">+{seaSurchargeThreshold.toFixed(1)} meters</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.5"
                  value={seaSurchargeThreshold}
                  onChange={(e) => setSeaSurchargeThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-[10px] text-slate-500">High sea waves crossing this mark trigger local estuary sluice dumps.</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-650 text-white font-sans text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  {savingSettings ? 'Writing to telemetry towers...' : 'Commit Alert Benchmarks'}
                  <Save className="w-4 h-4" />
                </button>
              </div>

              {isConfigSaved && (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/25 rounded-lg text-emerald-300 font-mono text-[10px] tracking-wide flex items-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  BENCHMARKS COMMITTED SUCCESSFULLY ACROSS 4 TOWERS
                </div>
              )}
            </div>
          </div>

          {/* AI NEURAL MODEL CONFIG */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h4 className="font-sans font-medium text-slate-300 text-xs tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <BrainCircuit className="w-4.5 h-4.5 text-emerald-400" />
              DisasterMind Generative Neural Engine (Model Alignment)
            </h4>

            <div className="space-y-3.5 font-sans text-xs text-slate-350">
              <div>
                <label className="block mb-1 text-[10px] font-mono text-slate-500 uppercase">Operational Reasoning Model Alias</label>
                <select
                  value={activeModel}
                  onChange={(e) => {
                    const next = e.target.value;
                    setActiveModel(next);
                    onAddLog("AI Core", `Neural model configuration target aligned to '${next}'.`, "info");
                  }}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 text-slate-200 text-xs rounded focus:outline-none focus:border-emerald-500 h-10 rounded-lg"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Edge speed, standard grounding)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex reasoning, smart evacuation allocations)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-baseline text-slate-400">
                  <span>Creativity Temperature / Randomness:</span>
                  <span className="font-mono text-emerald-400 font-bold">{temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-550 text-slate-500">Lower temperature ensures deterministic, risk-averse security protocols.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: DEPLOYMENT HIERARCHY TOPOLOGY TABLE */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
            <h4 className="font-sans font-medium text-slate-300 text-xs tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              Active System Cluster Topology (DB nodes)
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-850 text-slate-550 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    <th className="p-2.5">Database Cluster Node</th>
                    <th className="p-2.5">Functional Role</th>
                    <th className="p-2.5">Speed</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {nodes.map((node, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-medium">{node.name}</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500">{node.role}</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-400">{node.latency}</td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleNode(node.name)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                            node.status === "Synced" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : node.status === "Stale"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {node.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-805 border-slate-800/80">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="font-sans text-[11px] leading-relaxed text-slate-500">
                  WARNING: Forcing clear log files or executing direct database overrides resets telemetry parameters and flushes coordinates caches. Only execute on testing protocols.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {showClearConfirm ? (
                  <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg space-y-3">
                    <p className="font-sans text-[11px] text-red-350 leading-relaxed">
                      Are you sure you want to execute system flush? This forces local node overrides and resets sensors parameter caches.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={confirmOverrideClearLogs}
                        className="flex-1 py-2 rounded bg-red-650 hover:bg-red-600 text-white font-sans text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
                      >
                        Confirm Flush Nodes
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-2 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleOverrideClearLogs}
                    className="w-full py-2 rounded bg-slate-950 hover:bg-slate-900 border border-red-500/20 hover:border-red-500/40 text-red-300 font-sans text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    Execute Clear Database Override
                  </button>
                )}
              </div>

              {isOverrideExecuted && (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/25 rounded-lg text-emerald-300 font-mono text-[10px] tracking-wide flex items-center gap-1.5 animate-bounce mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  DATABASE NODE SYNCHRONIZATION COMPLETED SUCCESSFULLY
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
