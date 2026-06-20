import { useState, useEffect } from 'react';
import { 
  Building2, Users, AlertTriangle, Radio, Activity, 
  Layers, Map, Compass, HardHat, FileText, Settings, Sparkles, LogOut, Clock, ShieldCheck,
  Sun, Moon, Monitor
} from 'lucide-react';

import { 
  Incident, SOSAlert, Shelter, RescueTeam, AlertWarning, SystemUpdate,
  INITIAL_INCIDENTS, INITIAL_SOS_ALERTS, INITIAL_SHELTERS, INITIAL_RESCUE_TEAMS, INITIAL_ALERTS, INITIAL_SYSTEM_UPDATES
} from './types';

import {
  incidentsApi, sosApi, sheltersApi, rescueTeamsApi, alertsApi, logsApi
} from './services/api';

// Views
import DashboardView from './components/DashboardView';
import LiveMapView from './components/LiveMapView';
import AlertsView from './components/AlertsView';
import SOSQueueView from './components/SOSQueueView';
import SheltersView from './components/SheltersView';
import ResourcesView from './components/ResourcesView';
import IncidentsView from './components/IncidentsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import LandingPage from './components/LandingPage';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("dm_auth") === "true";
  });

  const [operatorId, setOperatorId] = useState<string>(() => {
    return localStorage.getItem("dm_operator_id") || "DM-ADM-2041";
  });

  const [currentTime, setCurrentTime] = useState("");

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem("dm_theme") as 'light' | 'dark' | 'system') || 'dark';
  });

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      if (themeMode === 'light') {
        root.classList.add('light-theme');
      } else if (themeMode === 'dark') {
        root.classList.remove('light-theme');
      } else {
        // System preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.remove('light-theme');
        } else {
          root.classList.add('light-theme');
        }
      }
    };

    applyTheme();
    localStorage.setItem("dm_theme", themeMode);

    // Watch for system preference changes live if themeMode is system
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Orchestrated Global States
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>(INITIAL_SOS_ALERTS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(INITIAL_RESCUE_TEAMS);
  const [alerts, setAlerts] = useState<AlertWarning[]>(INITIAL_ALERTS);
  const [systemLogs, setSystemLogs] = useState<SystemUpdate[]>(INITIAL_SYSTEM_UPDATES);

  // Connection management states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Synchronous loading of initial values from the Express API
  const syncOperationalGrids = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setIsLoading(true);
    setApiError(null);
    try {
      const [
        loadedIncidents,
        loadedSOS,
        loadedShelters,
        loadedTeams,
        loadedAlerts,
        loadedLogs
      ] = await Promise.all([
        incidentsApi.list(),
        sosApi.list(),
        sheltersApi.list(),
        rescueTeamsApi.list(),
        alertsApi.list(),
        logsApi.list()
      ]);
      setIncidents(loadedIncidents);
      setSosAlerts(loadedSOS);
      setShelters(loadedShelters);
      setRescueTeams(loadedTeams);
      setAlerts(loadedAlerts);
      setSystemLogs(loadedLogs);
    } catch (err: any) {
      console.error("Critical Mainframe Grid Fetch Fail:", err);
      setApiError(err.message || "Central disaster database response telemetry failed.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Sync core databases when authorized session begins
  useEffect(() => {
    syncOperationalGrids();
    // Periodically poll database to keep multi-user live indicators updated
    const scheduler = setInterval(() => syncOperationalGrids(true), 12000);
    return () => clearInterval(scheduler);
  }, [isAuthenticated]);

  // Real-time WebSocket listener with auto-reconnection mechanics
  useEffect(() => {
    if (!isAuthenticated) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isClosedIntentional = false;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      console.log(`[WebSocket] Establishing real-time satellite stream to: ${wsUrl}`);
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("[WebSocket] Synchronized stream linked active.");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("[WebSocket] Telemetry signal intercepted:", payload);
          // Trigger a silent database pull on any updates to maintain strict sync
          if (payload.type) {
            syncOperationalGrids(true);
          }
        } catch (err) {
          console.error("[WebSocket] Unrecognized payload structure:", err);
        }
      };

      socket.onclose = () => {
        if (!isClosedIntentional) {
          console.warn("[WebSocket] Satellite link severed. Reconnecting in 4s...");
          reconnectTimeout = setTimeout(() => {
            connectWebSocket();
          }, 4000);
        }
      };

      socket.onerror = (err) => {
        console.error("[WebSocket] Link connection anomaly:", err);
        socket?.close();
      };
    };

    connectWebSocket();

    return () => {
      isClosedIntentional = true;
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated]);

  // Synchronization clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System Action: Create log entries on database and local
  const handleAddLog = async (comp: string, msg: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    try {
      const persistedLog = await logsApi.create({
        timestamp: "", // Backend handles timestamp formulation
        severity,
        component: comp,
        message: msg
      });
      setSystemLogs(prev => [persistedLog, ...prev]);
    } catch (err) {
      console.error("Local offline fallback log triggered:", err);
      const timeStr = new Date().toUTCString().substring(17, 25) + " UTC";
      const localLog: SystemUpdate = {
        id: `sys-${Date.now()}`,
        timestamp: timeStr,
        severity,
        component: comp,
        message: msg
      };
      setSystemLogs(prev => [localLog, ...prev]);
    }
  };

  // System Action: Dispatch Incident response teams
  const handleDispatchTeam = async (incidentId: string, teamId: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await incidentsApi.updateTeam(incidentId, teamId);
      await rescueTeamsApi.updateStatus(teamId, 'En Route');
      await handleAddLog("Command Hub", `DISPATCH VECTOR ACTIVE: Assigned Team ${teamId} to Incident ${incidentId}.`, "critical");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Failed directing rescue battalions.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Allocate rescue squad to critical citizen SOS alerts
  const handleAssignSOSTeam = async (sosId: string, teamId: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await sosApi.dispatch(sosId, teamId);
      await handleAddLog("SOS Response", `SQUAD EN ROUTE: Assigned Unit ${teamId} to SOS alert beacon ${sosId}.`, "critical");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Failed dispatching critical SOS team.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Create customized SOS alerts
  const handleCreateSOSAlert = async (newSOS: Omit<SOSAlert, 'id' | 'time'>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const added = await sosApi.create({
        ...newSOS,
        time: "Just now"
      } as any);
      await handleAddLog("SOS Response", `NEW EMERGENCY SIGNAL LOGGED: In district ${added.district} by ${added.reporterPhone}.`, "critical");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Failed to log critical SOS request.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Update SOS alert status
  const handleUpdateSOSStatus = async (sosId: string, status: SOSAlert['status']) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await sosApi.updateStatus(sosId, status);
      await handleAddLog("SOS Response", `SOS alert signal ${sosId} changed to status: [${status}].`, "info");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Failed to update SOS status.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Requisition emergency supplies inside Shelters database
  const handleRequisitionResources = async (
    shelterId: string, 
    waterLiters: number, 
    mreCount: number, 
    medicines: string[]
  ) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await sheltersApi.requisition(shelterId, waterLiters, mreCount, medicines);
      await handleAddLog("Shelter Logistics", `SUPPLY DISPATCH: Mobilized ${waterLiters}L water, ${mreCount} MREs, and medical packages to shelter ${shelterId}.`, "info");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Resource logistics allocations failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Modify active duty status for rescue battalions
  const handleUpdateTeamStatus = async (teamId: string, status: RescueTeam['status']) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await rescueTeamsApi.updateStatus(teamId, status);
      await handleAddLog("Resources Manager", `Unit ${teamId} mobilization status changed to ${status}.`, "info");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Status change registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Update priority status of report incidents
  const handleUpdateIncidentStatus = async (id: string, status: Incident['status']) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await incidentsApi.updateStatus(id, status);
      await handleAddLog("Incidents Desk", `Incident ${id} updated to status level: [${status}].`, "warning");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Incident status alteration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Write a brand new incident report to DB
  const handleAddIncident = async (newInc: Omit<Incident, 'id'>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const added = await incidentsApi.create(newInc);
      await handleAddLog("Incidents Desk", `NEW INCIDENT SUBMITTED: ${added.title} issued in district ${added.district}.`, "critical");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Incident reporting channel failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Register new military command units to operational roster
  const handleAddRescueTeam = async (newTeam: Omit<RescueTeam, 'id'>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const added = await rescueTeamsApi.create(newTeam);
      await handleAddLog("Resources Registry", `BATTALION COMMISSIONED: Unit ${added.name} of category ${added.type} enqueued.`, "info");
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Resource logistics deployment registry failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // System Action: Purge system logs on secure testing command
  const handleFlushLogs = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      await logsApi.flush();
      await syncOperationalGrids();
    } catch (err: any) {
      setApiError(err.message || "Secure log clearance database failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dm_auth");
    localStorage.removeItem("dm_operator_id");
    setIsAuthenticated(false);
    navigate('/');
    handleAddLog("Security System", "Operator logged out, clearance credentials cleared.", "warning");
  };

  // Nav items specifications with matching mockup coordinates
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "map", label: "Live Sat Map", icon: Map },
    { id: "alerts", label: "Warnings Console", icon: AlertTriangle },
    { id: "sos", label: "SOS Active Queue", icon: Radio },
    { id: "shelters", label: "Shelters Base", icon: Building2 },
    { id: "resources", label: "Battalion Rosters", icon: HardHat },
    { id: "incidents", label: "Active Incidents", icon: Layers },
    { id: "analytics", label: "Visual Analytics", icon: FileText },
    { id: "settings", label: "System Configs", icon: Settings },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/command-center/')) {
      return path.replace('/command-center/', '');
    }
    return "dashboard";
  };
  const activeTab = getActiveTab();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={
          <LandingPage 
            onEnterCommandCenter={() => {
              navigate('/login');
            }}
            isAuthenticated={isAuthenticated}
            operatorId={operatorId}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
          />
        } />
        <Route path="/login" element={
          <LoginView onLoginSuccess={() => {
            const savedId = localStorage.getItem("dm_operator_id") || "DM-ADM-2041";
            setOperatorId(savedId);
            setIsAuthenticated(true);
            navigate('/command-center/dashboard');
            handleAddLog("Security System", `Clearance established for Operator ${savedId}. Access granted.`, "info");
          }} />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If authenticated but visiting root, show Landing page or dynamic command link
  if (location.pathname === "/") {
    return (
      <LandingPage 
        onEnterCommandCenter={() => {
          navigate('/command-center/dashboard');
        }}
        isAuthenticated={isAuthenticated}
        operatorId={operatorId}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
    );
  }

  return (
    <div id="command-center-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans tracking-wide font-medium">
      
      {/* 1. LEFT SIDE NAVIGATION DRAW BAR */}
      <aside id="sidebar-navigation" className="w-full md:w-[260px] bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0 z-40">
        <div className="flex flex-col">
          {/* Main banner header with Stitch design structure */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/30 text-red-500 flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="font-sans font-semibold text-slate-100 text-sm tracking-tight leading-snug uppercase">
                DisasterMind AI
              </h1>
              <p className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-widest mt-0.5">
                Command Terminal
              </p>
            </div>
          </div>

          {/* Nav Item loops */}
          <nav className="p-3.5 space-y-1">
            {/* View Public Portal link */}
            <button
              onClick={() => {
                navigate('/');
                handleAddLog("Navigator", "Transitioned to Public Landing Portal.", "info");
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 border border-cyan-500/20 bg-cyan-950/10 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/20 hover:border-cyan-500/40 transition-all duration-200 rounded-lg text-xs font-semibold font-sans cursor-pointer active:scale-95 mb-3"
            >
              <Compass className="w-4.5 h-4.5 text-cyan-400 animate-spin-slow shrink-0" />
              <span className="font-semibold font-sans">Exit to Public Portal</span>
            </button>

            {navItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate('/command-center/' + item.id);
                    handleAddLog("Navigator", `Focus shifted: viewing '${item.label}' console.`, "info");
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg font-sans text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-98 ${
                    isActive
                      ? 'bg-red-650 text-white shadow-lg shadow-red-955/35 font-bold border-l-4 border-red-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <IconComp className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer operator identification */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs text-slate-350">
              CC
            </div>
            <div>
              <p className="font-sans font-medium text-xs text-slate-200">Auth Operator</p>
              <p className="font-mono text-[9px] text-slate-500">ID: {operatorId}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. CHIEF DATA INTERFACE CANVASES */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP STATUS CONTROL HEADER PANEL */}
        <header id="control-topbar" className="h-16 border-b border-slate-800 bg-slate-900/40 p-4 px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-spin' : 'bg-emerald-500 animate-ping'}`} />
              <p className="font-mono text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                {isLoading ? (
                  <span className="text-amber-400">🔃 Syncing Core Mainframe Grid...</span>
                ) : (
                  <span className="text-emerald-400">📡 Cell Radar Sync Active</span>
                )}
              </p>
            </div>
            
            {/* Quick dashboard summary inline tags */}
            <div className="hidden md:flex items-center gap-2 border-l border-slate-850 pl-4 font-mono text-[9px] text-slate-500">
              <p>INCIDENTS: <span className="text-red-400 font-bold">{incidents.filter(i => i.status !== 'Resolved').length} Active</span></p>
              <span className="text-slate-700">•</span>
              <p>SHELTERS: <span className="text-blue-400 font-bold">{shelters.filter(s => s.bedsOpen < 100).length} Near Limit</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
            {apiError && (
              <div className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 rounded text-[10px] text-red-400 font-sans tracking-wide animate-pulse max-w-[200px] truncate" title={apiError}>
                ⚠️ API Anomaly: {apiError}
              </div>
            )}

            {/* CommandCenter Theme Selector Segment Container */}
            <div className="flex items-center bg-slate-950 border border-slate-850 p-1 rounded-lg">
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded cursor-pointer transition-colors ${themeMode === 'light' ? 'bg-amber-500/25 text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
                title="Force Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded cursor-pointer transition-colors ${themeMode === 'dark' ? 'bg-blue-500/25 text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
                title="Force Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded cursor-pointer transition-colors ${themeMode === 'system' ? 'bg-purple-500/25 text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
                title="Match System Preference"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTime || 'Synchronizing UTC...'}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-755 text-slate-300 hover:text-red-400 transition-all rounded-lg text-xs font-semibold font-sans cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-sans">Log Out</span>
            </button>
          </div>
        </header>

        {/* CONTENT INJECTOR */}
        <div className="flex-grow overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          {apiError && (
            <div className="mb-4 p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-350 font-sans flex items-center justify-between">
              <span><strong>Grid Telemetry Warning:</strong> Your commands failed to synchronize on the centralized Express database. Details: {apiError}</span>
              <button onClick={() => setApiError(null)} className="px-2 py-1 bg-red-900/40 text-red-200 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-red-800 transition-colors">Acknowledge</button>
            </div>
          )}

          <Routes>
            <Route path="/command-center/dashboard" element={
              <DashboardView 
                incidents={incidents}
                sosAlerts={sosAlerts}
                shelters={shelters}
                rescueTeams={rescueTeams}
                alerts={alerts}
                logs={systemLogs}
                onTabChange={(tab) => {
                  navigate('/command-center/' + tab);
                  handleAddLog("Navigator", `Focus shifted: viewing '${tab}' console.`, "info");
                }}
                onAddLog={handleAddLog}
              />
            } />
            
            <Route path="/command-center/map" element={
              <LiveMapView 
                incidents={incidents}
                shelters={shelters}
                rescueTeams={rescueTeams}
                sosAlerts={sosAlerts}
                onDispatchTeam={handleDispatchTeam}
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/alerts" element={
              <AlertsView 
                alerts={alerts}
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/sos" element={
              <SOSQueueView 
                sosAlerts={sosAlerts}
                rescueTeams={rescueTeams}
                onAssignSOSTeam={handleAssignSOSTeam}
                onUpdateSOSStatus={handleUpdateSOSStatus}
                onCreateSOSAlert={handleCreateSOSAlert}
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/shelters" element={
              <SheltersView 
                shelters={shelters}
                onRequisitionResources={handleRequisitionResources}
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/resources" element={
              <ResourcesView 
                rescueTeams={rescueTeams}
                onAddRescueTeam={handleAddRescueTeam}
                onUpdateTeamStatus={handleUpdateTeamStatus}
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/incidents" element={
              <IncidentsView 
                incidents={incidents}
                rescueTeams={rescueTeams}
                onAddIncident={handleAddIncident}
                onUpdateIncidentStatus={handleUpdateIncidentStatus}
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/analytics" element={
              <AnalyticsView 
                onAddLog={handleAddLog}
              />
            } />

            <Route path="/command-center/settings" element={
              <SettingsView 
                onAddLog={handleAddLog}
                onFlushLogs={handleFlushLogs}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
              />
            } />

            {/* Support legacy paths so navigating back or refreshing them redirects perfectly */}
            <Route path="/dashboard" element={<Navigate to="/command-center/dashboard" replace />} />
            <Route path="/map" element={<Navigate to="/command-center/map" replace />} />
            <Route path="/alerts" element={<Navigate to="/command-center/alerts" replace />} />
            <Route path="/sos" element={<Navigate to="/command-center/sos" replace />} />
            <Route path="/shelters" element={<Navigate to="/command-center/shelters" replace />} />
            <Route path="/resources" element={<Navigate to="/command-center/resources" replace />} />
            <Route path="/incidents" element={<Navigate to="/command-center/incidents" replace />} />
            <Route path="/analytics" element={<Navigate to="/command-center/analytics" replace />} />
            <Route path="/settings" element={<Navigate to="/command-center/settings" replace />} />

            {/* Error fallback */}
            <Route path="/" element={<Navigate to="/command-center/dashboard" replace />} />
            <Route path="/command-center" element={<Navigate to="/command-center/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/command-center/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

