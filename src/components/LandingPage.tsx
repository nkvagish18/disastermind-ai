import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Activity, Compass, AlertTriangle, Radio, HardHat, Layers, 
  ArrowRight, Play, Server, FileText, CheckCircle2, ChevronRight, Laptop,
  Cpu, Award, Database, RefreshCw, Zap, Sun, Moon, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Coordinates of tactical hotspots for true orthographic 3D projection rendering
interface Hotspot {
  id: string;
  name: string;
  lat: number;   // radians
  lon: number;   // radians
  type: 'flood' | 'cyclone' | 'wildfire' | 'earthquake';
  status: 'SEVERE' | 'CRITICAL' | 'MONITORING' | 'DEPLOYED';
  intensity: string;
  locationName: string;
}

const DISASTER_HOTSPOTS: Hotspot[] = [
  { id: '1', name: 'CYCLONE ZEPHYR-IV', lat: 0.35, lon: 2.4, type: 'cyclone', status: 'CRITICAL', intensity: '142 km/h winds', locationName: 'East Coast Delta' },
  { id: '2', name: 'ESTUARINE FLOOD SURGE', lat: 0.45, lon: 1.3, type: 'flood', status: 'SEVERE', intensity: '+3.2m water level', locationName: 'Waterfront Slums Grid' },
  { id: '3', name: 'THERMAL CORRIDOR BLAZE', lat: 0.55, lon: -2.1, type: 'wildfire', status: 'SEVERE', intensity: '850MW energy release', locationName: 'Southern Forest Belt' },
  { id: '4', name: 'SEISMIC FAULT SHOCK-X', lat: -0.6, lon: 2.6, type: 'earthquake', status: 'MONITORING', intensity: '6.2 Richters', locationName: 'Littoral Trench Lines' },
  { id: '5', name: 'PACIFIC WAVE CREST SURGE', lat: -0.2, lon: -1.7, type: 'flood', status: 'DEPLOYED', intensity: '+4.5m surge delta', locationName: 'Port Alpha Wetlands' },
  { id: '6', name: 'CONVECTION STORM ALPHA', lat: 0.1, lon: 0.5, type: 'cyclone', status: 'CRITICAL', intensity: '110 km/h gusts', locationName: 'Central Plains' }
];

interface LandingPageProps {
  onEnterCommandCenter: () => void;
  isAuthenticated?: boolean;
  operatorId?: string;
  themeMode?: 'light' | 'dark' | 'system';
  setThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
}

export default function LandingPage({ 
  onEnterCommandCenter, 
  isAuthenticated, 
  operatorId, 
  themeMode = 'dark', 
  setThemeMode 
}: LandingPageProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(DISASTER_HOTSPOTS[0]);
  const [initStage, setInitStage] = useState<number | null>(null);
  const [simPlaying, setSimPlaying] = useState<boolean>(false);
  const [demoCommandLogs, setDemoCommandLogs] = useState<string[]>([
    "INITIALIZING TELEMETRY LINK...",
    "SECURE SHELL ESTABLISHED TO ORBITAL BEACON",
    "GIS COORDINATES MATCHED WITH METEOROLOGICAL MATRIX"
  ]);

  // Handle simulation simulation logs
  useEffect(() => {
    if (!simPlaying) return;
    const logs = [
      "ACQUIRING COPERNICUS SATELLITE PASS...",
      "SYNCHRONIZING RADARS (10.4 GHz SF RANGE)...",
      "UPDATING ATMOSPHERIC LIQUID MASS METRICS...",
      "DISPATCHING NDRF TEAM VECTORS (GRID 14A)...",
      "REALLOCATING SHELTER LOGISTICS MATRICES...",
      "PREDICTIVE SENSOR SCORECARD OVERLAYS READY..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setDemoCommandLogs(prev => [...prev.slice(-4), `[SIM] ${logs[i]}`]);
        i++;
      } else {
        setDemoCommandLogs(prev => [...prev.slice(-4), "[SIM] SIMULATION RUN COMPLETE."]);
        setSimPlaying(false);
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [simPlaying]);

  // System sequence timer execution
  const startInitialization = () => {
    setInitStage(1);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play sci-fi system boot chime
    try {
      const playBeep = (freq: number, duration: number, delay: number) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        }, delay * 1000);
      };
      playBeep(440, 0.4, 0);
      playBeep(554, 0.4, 0.15);
      playBeep(659, 1.2, 0.3);
    } catch (_) {}

    setTimeout(() => setInitStage(2), 1000);
    setTimeout(() => setInitStage(3), 2000);
    setTimeout(() => setInitStage(4), 3000);
    setTimeout(() => {
      onEnterCommandCenter();
    }, 4200);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans select-none selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER NAV */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-md border-b border-cyan-950/40 p-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-white text-base">DISASTERMIND AI</h1>
            <p className="font-mono text-[9px] text-[#00E5FF] tracking-widest uppercase">TACTICAL OPERATIONS CENTRE</p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-400">
          <a href="#map" className="hover:text-[#00E5FF] transition-colors">THREAT MAP</a>
          <a href="#ai-engine" className="hover:text-[#00E5FF] transition-colors">NEURAL ENGINE</a>
          <a href="#network" className="hover:text-[#00E5FF] transition-colors">RESPONSE DEPLOYMENTS</a>
          <a href="#metrics" className="hover:text-[#00E5FF] transition-colors">SENSORS STATS</a>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Public theme toggler segments */}
          {setThemeMode && (
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1 rounded cursor-pointer transition-colors ${themeMode === 'light' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500 hover:text-slate-350'}`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1 rounded cursor-pointer transition-colors ${themeMode === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-350'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('system')}
                className={`p-1 rounded cursor-pointer transition-colors ${themeMode === 'system' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-350'}`}
                title="System Preference"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button 
            onClick={startInitialization}
            className="group relative px-4 py-2 bg-gradient-to-r from-red-650 to-red-700 hover:from-red-600 hover:to-red-650 text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider border border-red-500/30 hover:border-red-400/50 transition-all duration-300 shadow-lg shadow-red-950/40 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span className="relative z-10">
              {isAuthenticated ? "RESUME CONSOLE ⚡" : "ENTER COMMAND"}
            </span>
            <ChevronRight className="w-4 h-4 text-red-100 group-hover:translate-x-1 transition-transform" />
            <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          </button>
        </div>
      </header>

      {/* 1. HERO SECTION & 2. LIVE GLOBAL THREAT MAP COMBINED IN A WORKSTATION SPLIT */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 md:px-12 pt-12 pb-24 border-b border-cyan-950/20">
        
        {/* Dynamic Scan Line Over Hero */}
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scan-y top-24 pointer-events-none" />

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline and Console Info */}
          <div className="lg:col-span-5 space-y-8 text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] tracking-widest uppercase animate-pulse">
              <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-ping" />
              SATELLITE SYNC: ACTIVE [ORBIT-4]
            </div>

            <div className="space-y-4">
              <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-5xl leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 tracking-tight">
                Predict.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-cyan-400">Coordinate.</span><br />
                Respond.
              </h2>
              <p className="font-sans text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
                Military-grade neural architecture orchestrating real-time satellite radar arrays, storm vector matrices, shelter capacities, and immediate swiftwater fleet dispatch algorithms.
              </p>
            </div>

            {/* Tactical Console Details */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 font-mono text-[11px] text-slate-400 backdrop-blur-md space-y-2 max-w-md shadow-inner shadow-black">
              <div className="flex justify-between border-b border-slate-900 pb-1 text-[#00E5FF] font-bold">
                <span>SYSTEM STATUS CORE</span>
                <span>SECURE LINK v4.0.2</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>GEOLOCATION:</div> <div className="text-slate-300 text-right">GLOBAL SATELLITE</div>
                <div>DATABASE:</div> <div className="text-emerald-400 text-right">FIRESTORE CLOUD [ON]</div>
                <div>WS STREAM:</div> <div className="text-emerald-400 text-right">CONNECTED [4.1ms]</div>
                <div>NEURAL CORRELATION:</div> <div className="text-red-400 text-right">ACTIVE GRID</div>
              </div>
              
              {/* Fake Micro logs stream */}
              <div className="mt-3 bg-black/60 p-2.5 rounded border border-cyan-950/40 text-[9px] text-slate-500 h-[65px] overflow-hidden space-y-0.5 select-text font-semibold">
                {demoCommandLogs.map((log, idx) => (
                  <div key={idx} className="truncate">
                    <span className="text-[#00E5FF]">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={startInitialization}
                className="group px-6 py-3 bg-red-650 hover:bg-red-600 font-mono text-xs font-bold uppercase tracking-wider text-white rounded-lg transition-all duration-300 shadow-md shadow-red-950/40 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-red-500/20"
              >
                <span>{isAuthenticated ? "RESUME HUB CONSOLE ⚡" : "LAUNCH COMMAND HUB"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  setSimPlaying(true);
                  setDemoCommandLogs(p => [...p, "INITIATING THREAT SIMULATOR BATCH MATRIX..."]);
                }}
                disabled={simPlaying}
                className="px-6 py-3 bg-slate-950 hover:bg-slate-900 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-[#00E5FF]" />
                {simPlaying ? "SIMULATING THREATS..." : "RUN THREAT SIMULATION"}
              </button>
            </div>
          </div>

          {/* Right Column: 3D Holographic Globe */}
          <div id="map" className="lg:col-span-7 flex flex-col items-center justify-center relative w-full aspect-square max-w-[600px] mx-auto z-10 lg:pl-6">
            
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 text-[10px] font-mono p-3 bg-slate-950/80 backdrop-blur-md rounded-lg border border-cyan-950/60 shadow-xl shadow-black">
              <div className="text-cyan-400 font-extrabold uppercase mb-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> SATELLITE ROTATOR
              </div>
              <p className="text-slate-500">HOLD & DRAG GLOBE TO ROTATE</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> FIRE</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> SURGE</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> WIND</span>
              </div>
            </div>

            {/* Globe Canvas Container */}
            <div className="relative w-full aspect-square border border-cyan-950/40 bg-slate-950/20 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(6,182,212,0.06)] group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 via-transparent to-red-500/5 pointer-events-none rounded-full" />
              <GlobeCanvas activeHotspot={activeHotspot} onSelectHotspot={setActiveHotspot} />
            </div>

            {/* Active Threat Card detail on hover coordinates */}
            <AnimatePresence mode="wait">
              {activeHotspot && (
                <motion.div 
                  key={activeHotspot.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-2 left-6 right-6 md:left-12 md:right-12 z-20 p-4 bg-slate-950/90 border border-cyan-900/60 rounded-xl backdrop-blur-md shadow-2xl shadow-black grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        activeHotspot.type === 'wildfire' ? 'bg-orange-500' :
                        activeHotspot.type === 'flood' ? 'bg-cyan-400' :
                        activeHotspot.type === 'cyclone' ? 'bg-pink-500' : 'bg-red-500'
                      } animate-ping`} />
                      <p className="text-[11px] font-mono tracking-widest text-[#00E5FF] font-bold uppercase">{activeHotspot.type} THREAT FEED</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-red-950/60 border border-red-500/40 text-red-400 rounded">
                        {activeHotspot.status}
                      </span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-white tracking-wide">{activeHotspot.name}</h4>
                    <p className="text-[11px] font-sans text-slate-400">Target Region: <strong className="text-slate-300 font-medium">{activeHotspot.locationName}</strong></p>
                  </div>
                  <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-900 pt-2 md:pt-0 md:pl-4">
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">SIGNAL TELEMETRY</p>
                    <p className="text-xs font-mono font-bold text-amber-400">{activeHotspot.intensity}</p>
                    <p className="text-[9px] font-mono text-slate-500 mt-1">LAT: {(activeHotspot.lat * (180 / Math.PI)).toFixed(2)}N | LON: {(activeHotspot.lon * (180 / Math.PI)).toFixed(2)}E</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visual radar sweep simulation */}
            <div className="absolute inset-0 rounded-full border border-[#00e5ff]/5 select-none pointer-events-none scale-90 animate-radar-spin" />
          </div>

        </div>
      </section>

      {/* 3. AI DISASTER ENGINE (NEURAL NETWORK INTERACTIVE WEB) */}
      <section id="ai-engine" className="py-24 px-6 md:px-12 border-b border-slate-950 bg-slate-950/20 relative">
        <div className="w-full max-w-7xl mx-auto space-y-16">
          <div className="text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-850 rounded-full font-mono text-[9px] text-cyan-400 tracking-wider uppercase font-bold">
              <Cpu className="w-3.5 h-3.5" /> DEEP COGNITIVE CORE
            </div>
            <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">AI Disaster Operations Engine</h2>
            <p className="font-sans text-slate-400 text-sm max-w-xl">
              Neural Network interfaces running machine learning models matching global sensors with real-time response grids.
            </p>
          </div>

          {/* Interactive Bento Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Box: Futuristic Interactive Synaptic Canvas */}
            <div className="lg:col-span-6 border border-cyan-950/50 rounded-2xl bg-[#060a16] p-6 relative overflow-hidden group shadow-2xl h-[380px] flex flex-col justify-between">
              
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent shadow-md" />

              <div className="z-10 flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" /> LIVE SYNAPTIC STREAM</span>
                <span>MODEL v3.5-FLASH [HYPER-CORE]</span>
              </div>

              {/* Neural Synapses Graphic */}
              <div className="flex-1 relative flex items-center justify-center my-4 overflow-hidden">
                <NeuralNetworkGraphic />
              </div>

              <div className="z-10 p-3 bg-black/40 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-400">
                <span className="text-red-400 font-bold">CORE METRICS:</span> Model evaluated 94,103 storm pathways, predicting flood inundation coordinates with a 94.2% historic coefficient map.
              </div>
            </div>

            {/* Right: The Showcase Hologram Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Feature Card 1 */}
              <div className="group border border-slate-900 hover:border-cyan-500/20 bg-slate-950/40 hover:bg-[#060a16] rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-cyan-400 transition-all duration-300" />
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[#00E5FF] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#00E5FF] group-hover:text-black">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-sm text-slate-100 tracking-wide mb-1.5 uppercase">Disaster Prediction</h3>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  LSTM deep-learning layers track rainfall accumulation coefficients to output live flood probability heatmaps.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="group border border-slate-900 hover:border-red-500/20 bg-slate-950/40 hover:bg-[#060a16] rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-red-500 transition-all duration-300" />
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center justify-center mb-4 transition-colors group-hover:bg-red-500 group-hover:text-black">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-sm text-slate-100 tracking-wide mb-1.5 uppercase">Resource Allocation</h3>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Real-time shelter telemetry is matched dynamically against evacuated citizen clusters requesting active backup.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="group border border-slate-900 hover:border-pink-500/20 bg-slate-950/40 hover:bg-[#060a16] rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-pink-505 transition-all duration-300" />
                <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400 flex items-center justify-center mb-4 transition-colors group-hover:bg-pink-500 group-hover:text-black">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-sm text-slate-100 tracking-wide mb-1.5 uppercase">SOS Prioritization</h3>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Natural language parsing scans community alerts to evaluate threat risk and dynamically bubble up emergency beacons.
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="group border border-slate-900 hover:border-emerald-500/20 bg-slate-950/40 hover:bg-[#060a16] rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-emerald-500 transition-all duration-300" />
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-500 group-hover:text-black">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-sm text-slate-100 tracking-wide mb-1.5 uppercase">Rescue Optimization</h3>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Constructs multi-variable safe pathways, dodging active storm blockades and electrical transformer fires.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. REAL-TIME RESPONSE NETWORK */}
      <section id="network" className="py-24 px-6 md:px-12 border-b border-cyan-950/20 relative">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Description */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-850 rounded-full font-mono text-[9px] text-cyan-400 tracking-wider uppercase font-bold">
              <Server className="w-3.5 h-3.5" /> GRID TELEMETRY NODE
            </div>
            <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">
              Real-Time Emergency Command Grid
            </h2>
            <p className="font-sans text-slate-400 text-sm leading-relaxed">
              DisasterMind links disconnected rescue channels—NDRF battalions, medical shelters, helicopters, and local community distress channels—into a synchronized, cohesive, and resilient peer mesh command network.
            </p>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-slate-300"><strong className="text-white font-medium">Automatic Routing Mesh:</strong> Realtime vector map recalculates safe transits during flooding.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-slate-300"><strong className="text-white font-medium">Auto-scaling Database:</strong> Instant multi-user operational sync guarantees zero data slippage during crisis events.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-slate-300"><strong className="text-white font-medium">Secure API Integration:</strong> Easily connects local meteorological sensor feeds on a unified JSON interface.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic response connection network */}
          <div className="lg:col-span-7 bg-slate-950/60 border border-slate-900 rounded-2xl p-6 relative overflow-hidden h-[420px] shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> SECURE SATELLITE VECTOR NETWORK</span>
              <span>PING: ONLINE [24ms]</span>
            </div>

            <div className="flex-1 relative my-4">
              <CommandNetworkGraphic />
            </div>

            {/* Micro network checklist */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-black/40 border border-slate-900 rounded-lg text-center">
              <div>
                <p className="font-mono text-[9px] text-[#00E5FF] uppercase font-bold">RESCUE SQUADS</p>
                <p className="font-sans font-bold text-xs text-slate-200 mt-0.5">8 ACTIVE</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-pink-500 uppercase font-bold">AIR RESCUE</p>
                <p className="font-sans font-bold text-xs text-slate-200 mt-0.5">3 STANDBY</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-emerald-400 uppercase font-bold">SHELTERS</p>
                <p className="font-sans font-bold text-xs text-slate-200 mt-0.5">15 SECURED</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-amber-500 uppercase font-bold">METEOR STATUS</p>
                <p className="font-sans font-bold text-xs text-slate-200 mt-0.5">STORM LINE</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. SYSTEM METRICS */}
      <section id="metrics" className="py-24 px-6 md:px-12 bg-[#060a16] border-b border-cyan-950/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.02),transparent)] pointer-events-none" />
        
        <div className="w-full max-w-6xl mx-auto space-y-16">
          <div className="space-y-3">
            <p className="font-mono text-[9px] text-[#00E5FF] tracking-widest uppercase font-black">CONTINUOUS PROTECTION</p>
            <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">System Operational Diagnostics</h2>
            <p className="font-sans text-slate-400 text-xs max-w-md mx-auto">
              Real-time synchronization across continuous sensor meshes tracking emergency data on modular telemetry matrices.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
            
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-lg relative group">
              <div className="absolute -top-1 left-4 right-4 h-[2px] bg-red-500/40 rounded-full" />
              <p className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight">
                <AnimatedCounter target={25450} suffix="+" />
              </p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-2">Lives Protected</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-lg relative group">
              <div className="absolute -top-1 left-4 right-4 h-[2px] bg-cyan-400/40 rounded-full" />
              <p className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight">
                <AnimatedCounter target={142} suffix="" />
              </p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-2">Incidents Tracked</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-lg relative group">
              <div className="absolute -top-1 left-4 right-4 h-[2px] bg-pink-500/40 rounded-full" />
              <p className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight">
                <AnimatedCounter target={88} suffix="%" />
              </p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-2">Allocation Speed</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-lg relative group">
              <div className="absolute -top-1 left-4 right-4 h-[2px] bg-emerald-450/40 rounded-full" />
              <p className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight">
                <AnimatedCounter target={24} suffix={` hr`} />
              </p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-2">ACTIVE SATELLITE PASS</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. COMMAND CENTER PREVIEW */}
      <section className="py-24 px-6 md:px-12 border-b border-cyan-950/20 bg-slate-950/10">
        <div className="w-full max-w-7xl mx-auto space-y-16">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-850 rounded-full font-mono text-[9px] text-[#00E5FF] tracking-wider uppercase font-bold">
              <Laptop className="w-3.5 h-3.5" /> SYSTEM GRAPHICAL WORKSTATION PREVIEW
            </div>
            <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">Operational CommandCenter Interface</h2>
            <p className="font-sans text-slate-400 text-xs">
              Take a tactical glimpse of the real-time GIS command interface used by central disaster relief authorities.
            </p>
          </div>

          <div 
            onClick={startInitialization}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-cyan-950/30 bg-slate-950 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            {/* Spotlight Overlay Animation effect */}
            <div className="absolute leading-none inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-red-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-300 z-10" />
            <div className="absolute inset-0 bg-black/25 z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 bg-red-650 rounded-full text-white shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300 z-20 flex items-center justify-center font-sans font-extrabold text-xs cursor-pointer border-2 border-white/20 select-none tracking-widest uppercase">
              ACTIVATE THE HUB
            </div>

            {/* Dashboard Interface Mockup rendering */}
            <div className="w-full aspect-[16/11] min-h-[465px] md:min-h-[515px] opacity-75 group-hover:scale-[1.015] group-hover:opacity-90 transition-all duration-700 select-none rounded-2xl flex flex-col bg-slate-950">
              {/* Fake topbar window */}
              <div className="h-7 border-b border-slate-900 bg-slate-950 px-4 flex items-center justify-between font-mono text-[9px] text-slate-650">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-2 font-bold text-slate-400">DISASTERMIND LIVE INTERFACE v4.0.2</span>
                </div>
                <span>STATUS: EMERGENCY STANDBY</span>
              </div>
              <div className="flex-1 p-4 grid grid-cols-12 gap-3 overflow-hidden text-slate-500 font-mono text-[9px]">
                {/* Block 1 */}
                <div className="col-span-3 border border-slate-900 rounded bg-[#070b16] p-2 space-y-2 flex flex-col justify-between">
                  <div className="border-b border-slate-900 pb-1 font-bold text-cyan-400">SENSORS COGNITIVE STREAM</div>
                  <div className="space-y-1">
                    <p className="text-slate-400">RADAR PASS 4: SAT OK</p>
                    <p className="text-slate-400">ATMOSPHERE: 984 mbar</p>
                    <p className="text-green-400">CELL GRID SYNC: YES</p>
                  </div>
                  <div className="h-10 bg-slate-950 border border-slate-900 rounded flex items-center justify-center font-bold">INCIDENTS FEED (6)</div>
                </div>
                {/* Block 2 (Globe map preview layout) */}
                <div className="col-span-6 border border-slate-900 rounded bg-[#04070f] relative p-3 flex flex-col justify-between">
                  <div className="border-b border-slate-900 pb-1 font-bold text-slate-400">LITTORAL SATELLITE GEOGRAPHIC LAYER</div>
                  <div className="flex-1 flex items-center justify-center my-2 border border-dashed border-cyan-955/20 rounded relative overflow-hidden bg-black/40">
                    <div className="absolute w-24 h-24 rounded-full border border-cyan-500/15 animate-ping" />
                    <Compass className="w-10 h-10 text-cyan-500/20" />
                  </div>
                  <div className="flex justify-between text-slate-500 text-[8px] font-bold">
                    <span>SE-SURGE SATELLITE LAYER INC: ON</span>
                    <span>WETLAND ALPHA COORDINATES MATCHED</span>
                  </div>
                </div>
                {/* Block 3 */}
                <div className="col-span-3 border border-slate-900 rounded bg-[#070b16] p-2 flex flex-col justify-between">
                  <div className="border-b border-slate-900 pb-1 font-bold text-[#00E5FF]">SHELTER STATUS GRIDS</div>
                  <div className="space-y-1.5 text-[8px]">
                    <div className="flex justify-between"><span>SHL-401</span> <span className="text-blue-400 font-bold">98% CAP</span></div>
                    <div className="flex justify-between"><span>SHL-402</span> <span className="text-green-450 font-bold">45% CAP</span></div>
                    <div className="flex justify-between"><span>SHL-403</span> <span className="text-green-450 font-bold">12% CAP</span></div>
                  </div>
                  <div className="h-10 bg-slate-950 border border-slate-900 rounded flex items-center justify-center text-red-400 font-bold">SOS LOGS MATRIX</div>
                </div>
              </div>
            </div>

            {/* Simulated terminal overlay line code */}
            <div className="absolute bottom-6 right-6 font-mono text-[9px] text-[#00E5FF] font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 px-3 py-1.5 rounded-lg border border-cyan-900/40">
              ⚡ LIVE GRID PREVIEW - CLICK TO SECURE ACCESS
            </div>
          </div>
        </div>
      </section>

      {/* 8. FUTURISTIC OPERATIONAL FOOTER */}
      <footer className="border-t border-cyan-950/40 bg-slate-950 py-16 px-6 md:px-12 font-mono text-xs text-slate-500">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-900 pb-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-500">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <h4 className="font-sans font-bold text-slate-200">DISASTERMIND AI</h4>
            </div>
            <p className="text-[11px] leading-relaxed select-text text-slate-400 font-sans">
              Dynamic orchestration platform coordinating critical response assets during severe meteorological events.
            </p>
          </div>

          <div className="space-y-3.5">
            <h5 className="text-slate-350 font-extrabold uppercase text-[10px] tracking-wider text-[#00E5FF]">RESOURCES & TECH</h5>
            <ul className="space-y-2 text-[11px]">
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">SATELLITE API</span></li>
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">MODEL COEFFICIENTS</span></li>
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">DEVELOPER COMPLIANCE</span></li>
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">SECURE WEB CONSOLE</span></li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h5 className="text-slate-350 font-extrabold uppercase text-[10px] tracking-wider text-pink-500">SECURITY COMPLIANCE</h5>
            <ul className="space-y-2 text-[11px]">
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">MILITARY NIST MATRIX</span></li>
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">FIRESTORE CLOUD SECURE</span></li>
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">GRID AES-256 PARITY</span></li>
              <li><span className="hover:text-slate-300 transition-colors cursor-pointer">OPERATIONAL LOGS CHECK</span></li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h5 className="text-slate-350 font-extrabold uppercase text-[10px] tracking-wider text-emerald-400">TACTICAL DEPLOYMENTS</h5>
            <p className="text-[11px] font-sans text-slate-400 leading-relaxed select-text">
              Sector Coordinates Alpha: 22.59° N, 88.40° E<br />
              Secure Link Active to ND-401
            </p>
          </div>

        </div>

        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600">
          <p>© 2026 DISASTERMIND CENTRAL SYSTEM COMMAND. DEPLOYED WITH SECURE AI SATELLITES.</p>
          <div className="flex gap-6">
            <span>VERSION 4.0.2 [RELEASE-PROD]</span>
            <span>CELL SENSORS: VERIFIED</span>
          </div>
        </div>
      </footer>

      {/* 7. SYSTEM INITIALIZATION OVERLAY GRID */}
      <AnimatePresence>
        {initStage !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#02050b] flex flex-col items-center justify-center p-6 font-mono selection:bg-cyan-500/20 antialiased"
          >
            {/* Digital grid mesh lines backing */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            <div className="w-full max-w-md select-none relative space-y-8 text-center">
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-full animate-pulse">
                  <Compass className="w-10 h-10 text-red-500 animate-spin-slow" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-sans font-black text-white text-lg tracking-wider uppercase">DISASTERMIND AI SYSTEM CORE</h3>
                <p className="text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase">INITIALIZING COMMAND ACCESS CONSOLE</p>
              </div>

              {/* Secure Progression Terminal */}
              <div className="border border-cyan-900/60 bg-black/80 rounded-xl p-5 text-left text-xs text-slate-300 space-y-3.5 relative overflow-hidden shadow-2xl shadow-cyan-950/20">
                <div className="absolute top-0 left-0 h-[2px] bg-[#00E5FF] animate-loading-bar" />
                
                <div className="space-y-2 text-[11px] font-semibold">
                  <div className="flex justify-between">
                    <span>STAGE 1: ENCRYPTED HANDSHAKE</span>
                    <span className={initStage >= 1 ? "text-emerald-450 text-right font-bold" : "text-slate-600 text-right"}>
                      {initStage >= 1 ? "COMPLETE" : "WAITING..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>STAGE 2: RESPONSE GRID DEPLOYMENT</span>
                    <span className={initStage >= 2 ? "text-emerald-450 text-right font-bold" : "text-slate-600 text-right"}>
                      {initStage >= 2 ? "COMPLETE" : initStage === 1 ? "SYNCHRONIZING..." : "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>STAGE 3: GIS INTERCEPT SATELLITES</span>
                    <span className={initStage >= 3 ? "text-emerald-450 text-right font-bold" : "text-slate-600 text-right"}>
                      {initStage >= 3 ? "COMPLETE" : initStage === 2 ? "ESTABLISHING..." : "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>STAGE 4: TERMINAL BOOTSTREAM</span>
                    <span className={initStage >= 4 ? "text-emerald-450 text-right font-bold" : "text-slate-600 text-right"}>
                      {initStage >= 4 ? "ESTABLISHED" : initStage === 3 ? "VERIFYING..." : "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Micro load percentage progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex-1 mr-3 h-1.5 bg-slate-950 border border-slate-900 rounded overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-[#00E5FF] h-full transition-all duration-1000 ease-out"
                      style={{ width: `${initStage === 1 ? 25 : initStage === 2 ? 55 : initStage === 3 ? 85 : initStage === 4 ? 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-extrabold text-[#00E5FF]">
                    {initStage === 1 ? '25%' : initStage === 2 ? '55%' : initStage === 3 ? '85%' : initStage === 4 ? '100%' : '0%'}
                  </span>
                </div>
              </div>

              {/* Status flashing message */}
              <p className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse font-extrabold">
                {initStage === 1 ? "STABLIZING SECURE LINK..." :
                 initStage === 2 ? "ESTABLISHING EMERGENCY INTERCEPTS..." :
                 initStage === 3 ? "CORRELATING LITTORAL SENSORS..." :
                 "ACCESS PORT GRANTED. GREET OPERATOR."}
              </p>

              {/* Fast Skip bypass Option */}
              <div className="pt-2 z-20 relative">
                <button
                  type="button"
                  onClick={() => {
                    onEnterCommandCenter();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all active:scale-95"
                >
                  Skip Boot Sequence ⚡
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ---------------------------------------------------------------------------
// 100% Custom Orthographic 3D Rotating Globe with Active Hotspots
// Extremely performant, interactive, and responsive Canvas 2D component
// ---------------------------------------------------------------------------
function GlobeCanvas({ activeHotspot, onSelectHotspot }: { activeHotspot: Hotspot | null, onSelectHotspot: (h: Hotspot) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(2.2); // Current rotation parameter
  const angleRef = useRef<number>(0.12);    // Pitch angle parameter (tilted view)
  const draggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const hoverPointRef = useRef<Hotspot | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = canvas.width;
    let height = canvas.height;

    // Handle high DPI retina display automatically for sharp visual text indicators
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      width = rect.width;
      height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawGlobe = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.38; // Globe Radius

      const theta = rotationRef.current; // rotation angle around Y axis
      const phiGrid = angleRef.current;  // tilt angle (X pitch)

      // 1. Draw Star / Space atmosphere particle background dots
      ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(i * 123.4) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 543.2) * 0.5 + 0.5) * height;
        const size = (Math.sin(i + rotationRef.current * 0.2) * 0.5 + 0.5) * 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw outer atmosphere aura glow halo
      const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.25);
      glowGrad.addColorStop(0, "rgba(0, 229, 255, 0.15)");
      glowGrad.addColorStop(0.3, "rgba(0, 229, 255, 0.05)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Solid Black Sphere backplate to mask backend grids
      ctx.fillStyle = "#040710";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Save clipping path so grids don't protrude outside sphere outline
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 4. Draw latitude grid lines (horizontal ellipses)
      ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let latDeg = -75; latDeg <= 75; latDeg += 15) {
        const latRad = (latDeg * Math.PI) / 180;
        // Transform coordinates
        const yOffset = Math.sin(latRad) * R;
        const rx = Math.cos(latRad) * R;
        const ry = rx * Math.sin(phiGrid); // flattened due to pitch angle tilt

        // Draw horizontal slice
        ctx.beginPath();
        ctx.ellipse(cx, cy - yOffset * Math.cos(phiGrid), rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Draw longitude grid lines (rotating vertical lines)
      ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
      for (let lonDeg = 0; lonDeg < 360; lonDeg += 20) {
        const lonRad = (lonDeg * Math.PI) / 180 + theta;
        const rx = Math.sin(lonRad) * R;
        const angleRot = phiGrid;

        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(rx), R, angleRot * Math.sign(rx), -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }

      // 6. Project and Render Active Disaster Hotspots
      let currentHovered: Hotspot | null = null;

      DISASTER_HOTSPOTS.forEach(hs => {
        // Orthographic spherical calculation matching latitude/longitude
        // Unit coordinates:
        const xUnit = Math.cos(hs.lat) * Math.sin(hs.lon);
        const yUnit = Math.sin(hs.lat);
        const zUnit = Math.cos(hs.lat) * Math.cos(hs.lon);

        // Rotate Y relative to drag/time
        const xRot = xUnit * Math.cos(theta) + zUnit * Math.sin(theta);
        const yRot = yUnit;
        const zRot = -xUnit * Math.sin(theta) + zUnit * Math.cos(theta);

        // Apply pitch tilt offset around X axis
        const xProj = xRot;
        const yProj = yRot * Math.cos(phiGrid) - zRot * Math.sin(phiGrid);
        const zProj = yRot * Math.sin(phiGrid) + zRot * Math.cos(phiGrid);

        // If on the front-facing half of the sphere (facing camera)
        if (zProj > 0) {
          const px = cx + xProj * R;
          const py = cy - yProj * R; // invert canvas coordinates

          // Check click / hover boundary
          const distToCursor = Math.hypot(width / 2 - px, height / 2 - py); // placeholder logic or actual tracked hover
          
          // Color coding
          let color = "rgba(239, 68, 68, 1)"; // Red default
          let shadow = "rgba(239, 68, 68, 0.4)";
          if (hs.type === 'flood') { color = "rgba(34, 211, 238, 1)"; shadow = "rgba(34, 211, 238, 0.4)"; }
          if (hs.type === 'cyclone') { color = "rgba(236, 72, 153, 1)"; shadow = "rgba(236, 72, 153, 0.4)"; }
          if (hs.type === 'wildfire') { color = "rgba(249, 115, 22, 1)"; shadow = "rgba(249, 115, 22, 0.4)"; }

          // Draw active ripple rings (pulsing over time)
          const pulseSpeed = Date.now() / 300 + parseInt(hs.id) * 40;
          const rippleRadius = 6 + (pulseSpeed % 22);
          const rippleAlpha = 1 - (pulseSpeed % 22) / 22;

          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Draw core hotspot dot
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();

          // If active match
          if (activeHotspot && activeHotspot.id === hs.id) {
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(px, py, 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;

            // Draw connecting text bracket
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
            ctx.font = "bold 9px monospace";
            const textWidth = ctx.measureText(hs.name).width;
            
            ctx.fillRect(px + 12, py - 18, textWidth + 12, 16);
            ctx.strokeRect(px + 12, py - 18, textWidth + 12, 16);
            
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(hs.name, px + 18, py - 7);
          }
        }
      });

      ctx.restore(); // release clipping mask

      // 7. Draw Satellite beacon orbit path ring
      ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // tilted satellite orbit circle outline
      ctx.ellipse(cx, cy, R * 1.25, R * 0.4, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;

      // Draw active orbiting satellite unit
      const satAngle = (Date.now() / 4600) % (Math.PI * 2);
      const satX = cx + Math.cos(satAngle) * R * 1.25;
      const satY = cy + Math.sin(satAngle) * R * 0.4;
      
      // Outer satellite dot beacon
      ctx.fillStyle = "#00E5FF";
      ctx.beginPath();
      ctx.arc(satX, satY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Satellite scanner beacon rays radiating towards the earth core
      const gradientSatRay = ctx.createLinearGradient(satX, satY, cx, cy);
      gradientSatRay.addColorStop(0, "rgba(0, 229, 255, 0.2)");
      gradientSatRay.addColorStop(1, "rgba(0, 229, 255, 0)");
      ctx.strokeStyle = gradientSatRay;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      // Slow dynamic spin increments over time if not user dragging focus
      if (!draggingRef.current) {
        rotationRef.current += 0.0015;
      }

      animFrame = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeHotspot]);

  // Handle Drag / Rotation Interaction controls
  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) {
      // Logic for changing hover hotspots targets
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const R = Math.min(rect.width, rect.height) * 0.38;

      const theta = rotationRef.current;
      const phiGrid = angleRef.current;

      let found: Hotspot | null = null;
      DISASTER_HOTSPOTS.forEach(hs => {
        const xUnit = Math.cos(hs.lat) * Math.sin(hs.lon);
        const yUnit = Math.sin(hs.lat);
        const zUnit = Math.cos(hs.lat) * Math.cos(hs.lon);

        const xRot = xUnit * Math.cos(theta) + zUnit * Math.sin(theta);
        const yRot = yUnit;
        const zRot = -xUnit * Math.sin(theta) + zUnit * Math.cos(theta);

        const xProj = xRot;
        const yProj = yRot * Math.cos(phiGrid) - zRot * Math.sin(phiGrid);
        const zProj = yRot * Math.sin(phiGrid) + zRot * Math.cos(phiGrid);

        if (zProj > 0) {
          const px = cx + xProj * R;
          const py = cy - yProj * R;
          if (Math.hypot(mx - px, my - py) < 18) {
            found = hs;
          }
        }
      });
      if (found) {
        canvas.style.cursor = 'pointer';
        hoverPointRef.current = found;
      } else {
        canvas.style.cursor = 'grab';
        hoverPointRef.current = null;
      }
      return;
    }

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    rotationRef.current += dx * 0.007;
    angleRef.current = Math.max(-0.6, Math.min(0.6, angleRef.current - dy * 0.005));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    if (draggingRef.current) {
      draggingRef.current = false;
    } else if (hoverPointRef.current) {
      onSelectHotspot(hoverPointRef.current);
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full aspect-square touch-none outline-none select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}

// ---------------------------------------------------------------------------
// Action Metric Animation Count-up increments Component
// ---------------------------------------------------------------------------
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState<number>(0);

  useEffect(() => {
    let current = 0;
    const incrementStep = target / 60; // 60 steps total over ~1 second duration
    const timer = setInterval(() => {
      current += incrementStep;
      if (current >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{val.toLocaleString()}{suffix}</span>;
}

// ---------------------------------------------------------------------------
// Visual Neural Synapse Connect Graphic
// Realtime procedural lines rendering
// ---------------------------------------------------------------------------
function NeuralNetworkGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = canvas.width = 460;
    let height = canvas.height = 320;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      isActive: boolean;
      pulseTimer: number;
      type: 'predictor' | 'allocator' | 'sos' | 'route';
    }

    const nodeTypes: Node['type'][] = ['predictor', 'allocator', 'sos', 'route'];
    const nodes: Node[] = [];
    
    // Build 16 active cognitive modules coordinates
    for (let i = 0; i < 18; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        isActive: Math.random() > 0.6,
        pulseTimer: Math.random() * 100,
        type: nodeTypes[i % nodeTypes.length]
      });
    }

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw link paths
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 100) {
            const alpha = (1 - (dist / 100)) * 0.25;
            
            // Pulse connection highlight paths
            if (nodes[i].isActive && nodes[j].isActive) {
              ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * 2})`;
            } else {
              ctx.strokeStyle = `rgba(30, 41, 59, ${alpha})`;
            }
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Render nodes
      nodes.forEach(node => {
        // Move nodes bounds check
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        node.pulseTimer += 0.55;
        const pulseRatio = Math.sin(node.pulseTimer * 0.05) * 0.5 + 0.5;

        // Choose visual style color
        let color = "rgba(0, 229, 255, "; // Pred cyan
        if (node.type === 'allocator') color = "rgba(239, 68, 68, "; // Red alloc
        if (node.type === 'sos') color = "rgba(236, 72, 153, "; // Pink sos
        if (node.type === 'route') color = "rgba(16, 185, 129, "; // Green route

        // Draw pulsing outer circle ring
        ctx.fillStyle = color + (pulseRatio * 0.15) + ")";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4 + pulseRatio * 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw core node
        ctx.fillStyle = color + "1.0)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Little sci-fi micro-grid indicators tag text label
        if (node.isActive && pulseRatio > 0.75) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.5)";
          ctx.font = "7px monospace";
          ctx.fillText(`CORTEX-${node.type.toUpperCase().substring(0, 3)}`, node.x + 8, node.y - 4);
        }
      });

      // Periodically spark alternate active channels of neural synapses
      if (Math.random() > 0.985) {
        const randNode = nodes[Math.floor(Math.random() * nodes.length)];
        randNode.isActive = !randNode.isActive;
      }

      animFrame = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="max-w-full aspect-[46/32] opacity-80" />
  );
}

// ---------------------------------------------------------------------------
// Visual Command Action Deployment mesh networks
// Shows dispatch connection vectors
// ---------------------------------------------------------------------------
function CommandNetworkGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = canvas.width = 540;
    let height = canvas.height = 300;

    // Define coordinate focal points for operations mesh:
    const nodes = [
      { id: 'HQ', label: 'COMMAND CORPS', x: 270, y: 150, color: '#00E5FF' },
      { id: 'SHL401', label: 'SHELTER ST. XAVIER', x: 100, y: 80, color: '#3B82F6' },
      { id: 'SHL402', label: 'CENTRAL HEALTH SANCTUARY', x: 140, y: 220, color: '#10B981' },
      { id: 'TEAM3', label: 'NDRF AMBULANCE DISPATCH', x: 440, y: 70, color: '#EF4444' },
      { id: 'HELI_PASS', label: 'SWIFTWATER BOATS', x: 420, y: 230, color: '#EC4899' }
    ];

    const drawNetwork = () => {
      ctx.clearRect(0, 0, width, height);

      const time = Date.now() / 1000;

      // Draw radar circle grids loops
      ctx.strokeStyle = "rgba(0, 229, 255, 0.03)";
      ctx.beginPath();
      ctx.arc(270, 150, 120, 0, Math.PI * 2);
      ctx.stroke();

      // Draw connecting lines from HQ with animated pulse signal particles flowing from focal HQ outwards
      ctx.lineWidth = 1;
      nodes.forEach(node => {
        if (node.id === 'HQ') return;

        // Draw connection structural vector line
        ctx.strokeStyle = "rgba(30, 41, 59, 0.7)";
        ctx.beginPath();
        ctx.moveTo(270, 150);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        // Calculate active flowing data signal particle position matches vector interpolation
        const speedRatio = (time * 0.45 + parseInt(node.id.length.toString()) * 0.25) % 1.0;
        const mx = 270 + (node.x - 270) * speedRatio;
        const my = 150 + (node.y - 150) * speedRatio;

        // Draw data beam path particle
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        // Small signal glow tail
        ctx.fillStyle = node.color + "0.3)";
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw main elements with titles
      nodes.forEach(node => {
        // pulsing indicator aura
        const sizeRatio = Math.sin(time * 3 + parseInt(node.x.toString())) * 0.15 + 1.0;
        
        ctx.fillStyle = node.color + "0.15)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14 * sizeRatio, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Node Title Tag overlay blocks
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(node.id, node.x, node.y - 16);

        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "7px Helvetica, sans-serif";
        ctx.fillText(node.label, node.x, node.y + 18);
      });

      animFrame = requestAnimationFrame(drawNetwork);
    };

    drawNetwork();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="max-w-full aspect-[54/30] opacity-90 mx-auto" style={{ width: '100%', height: '100%' }} />
  );
}
