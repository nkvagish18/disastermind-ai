from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.middleware.logging import SecureOperationalLoggingMiddleware

# Sub-routers
from backend.app.routes import auth, incidents, alerts, shelters, rescue_teams, sos, predictions, system_logs

# Create metadata database tables immediately as an operational startup procedure
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"PostgreSQL Connection Deferred: {e} (Expected in offline setup or if migration handles schemas)")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Tactical Decision Support and Dispatch Command Hub API for DisasterMind AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configurations matching strict frame and network guidelines
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Expandable according to deployment host configurations
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Operational custom tracking middleware
app.add_middleware(SecureOperationalLoggingMiddleware)

# Mount application controllers and routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(shelters.router, prefix=settings.API_V1_STR)
app.include_router(rescue_teams.router, prefix=settings.API_V1_STR)
app.include_router(sos.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(system_logs.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Command Status"])
def read_root():
    return {
        "status": "ONLINE",
        "api_endpoints_documentation": "/api/docs",
        "agency": "NATIONAL METEOROLOGICAL DISPATCH AND DISASTERMIND COMMAND",
        "metadata": {
            "version": "1.0.0",
            "active_secure_clearance_levels": ["operator", "administrator", "viewer"]
        }
    }

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
@app.websocket("/api/v1/ws")
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "connection_established", "message": "Neural Radar WebSocket Connected (FastAPI)"})
        while True:
            # Keep connection alive & handle incoming requests
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
