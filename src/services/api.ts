import axios, { AxiosError } from 'axios';
import { Incident, SOSAlert, Shelter, RescueTeam, AlertWarning, SystemUpdate } from '../types';

// Central API Axios configuration pointing to our server on port 3000
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Explicit typed response handler to unify error handling gracefully
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ error?: string; message?: string }>;
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown network gateway telemetry anomaly';
    console.error('API Error:', errMsg);
    throw new Error(errMsg);
  }
}

// 1. Incidents API
export const incidentsApi = {
  list: () => handleRequest<Incident[]>(apiClient.get('/incidents')),
  create: (incident: Omit<Incident, 'id'>) => handleRequest<Incident>(apiClient.post('/incidents', incident)),
  updateStatus: (id: string, status: Incident['status']) => 
    handleRequest<Incident>(apiClient.put(`/incidents/${id}`, { status })),
  updateTeam: (id: string, teamId: string) => 
    handleRequest<Incident>(apiClient.put(`/incidents/${id}`, { assignedTeam: teamId, status: 'Deployed' })),
};

// 2. SOS Alerts API
export const sosApi = {
  list: () => handleRequest<SOSAlert[]>(apiClient.get('/sos')),
  create: (sos: Omit<SOSAlert, 'id'>) => handleRequest<SOSAlert>(apiClient.post('/sos', sos)),
  updateStatus: (id: string, status: SOSAlert['status']) => 
    handleRequest<SOSAlert>(apiClient.put(`/sos/${id}`, { status })),
  dispatch: (id: string, teamId: string) => 
    handleRequest<{ sos: SOSAlert; team: RescueTeam }>(apiClient.post(`/sos/${id}/dispatch`, { teamId })),
  broadcast: (district: string) => 
    handleRequest<{ message: string; nodes: number; region: string }>(apiClient.post('/sos/broadcast', { district })),
};

// 3. Shelters API  
export const sheltersApi = {
  list: () => handleRequest<Shelter[]>(apiClient.get('/shelters')),
  update: (id: string, updates: Partial<Shelter>) => 
    handleRequest<Shelter>(apiClient.put(`/shelters/${id}`, updates)),
  requisition: (shelterId: string, waterLiters: number, mreCount: number, medicines: string[]) => 
    handleRequest<Shelter>(apiClient.post(`/shelters/${shelterId}/requisition`, { waterLiters, mreCount, medicines })),
};

// 4. Rescue Teams / Resources API
export const rescueTeamsApi = {
  list: () => handleRequest<RescueTeam[]>(apiClient.get('/rescue-teams')),
  create: (team: Omit<RescueTeam, 'id'>) => handleRequest<RescueTeam>(apiClient.post('/rescue-teams', team)),
  updateStatus: (id: string, status: RescueTeam['status']) => 
    handleRequest<RescueTeam>(apiClient.put(`/rescue-teams/${id}/status`, { status })),
};

// 5. Warnings / Alerts API
export const alertsApi = {
  list: () => handleRequest<AlertWarning[]>(apiClient.get('/alerts')),
  create: (alert: Omit<AlertWarning, 'id'>) => handleRequest<AlertWarning>(apiClient.post('/alerts', alert)),
};

// 6. System Logging API
export const logsApi = {
  list: () => handleRequest<SystemUpdate[]>(apiClient.get('/system-logs')),
  create: (log: Omit<SystemUpdate, 'id'>) => handleRequest<SystemUpdate>(apiClient.post('/system-logs', log)),
  flush: () => handleRequest<void>(apiClient.post('/system-logs/flush')),
};

// 7. Predictions & Analytics API
export interface PredictionMetrics {
  meteorological_confidence: number;
  seismic_integrity_index: number;
  satellite_sync_status: string;
  prediction_run_timestamp: string;
  alerts_heat_map: Array<{ lat: number; lng: number; intensity: number; risk: string }>;
  storm_trajectories_simulation: Array<{ hour: string; wind_speed_kmh: number; barometric_pressure_hpa: number }>;
}

export const predictionsApi = {
  getMetrics: () => handleRequest<PredictionMetrics>(apiClient.get('/predictions/metrics')),
  triggerSimulation: () => handleRequest<{ status: string; message: string; results_size: number }>(apiClient.post('/predictions/trigger-simulation')),
  
  // New AI Predictive Decision Hub API Integrations
  getRiskScore: (input: {
    district: string;
    windSpeed: number;
    precipitation: number;
    tidalSurge: number;
    populationDensity: 'low' | 'medium' | 'high' | 'critical';
  }) => handleRequest<any>(apiClient.post('/predictions/risk-score', input)),

  getResourceRecommendations: (input: {
    riskScore: number;
    district: string;
    primaryHazard: 'Flood' | 'Cyclone' | 'Landslide' | 'Earthquake' | 'Cloudburst';
    affectedPeopleEstimate: number;
  }) => handleRequest<any>(apiClient.post('/predictions/resource-recommendation', input)),

  getShelterRecommendations: (input: {
    district: string;
    disasterType: string;
    requiredCapacity: number;
  }) => handleRequest<any>(apiClient.post('/predictions/shelter-recommendation', input)),

  getRouteSafety: (input: {
    startCoords: { lat: number; lng: number };
    endCoords: { lat: number; lng: number };
    transportMode: 'Ambulance' | 'HeavyTruck' | 'Helicopter' | 'InflatableBoat';
  }) => handleRequest<any>(apiClient.post('/predictions/route-safety', input)),
};
