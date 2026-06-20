import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DisasterMind-SecureGateway")

class SecureOperationalLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_host = request.client.host if request.client else "unknown"
        
        # Safe URL parsing
        path = request.url.path
        method = request.method
        
        logger.info(f"INGRESS SIGNAL: {method} {path} initiated from Operator Source: {client_host}")
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            response.headers["X-Processing-Time-Ms"] = str(round(duration * 1000, 2))
            
            logger.info(f"EGRESS SIGNAL: {method} {path} resolved. status={response.status_code} in {round(duration * 1000, 2)}ms")
            return response
        except Exception as err:
            duration = time.time() - start_time
            logger.error(f"OPERATIONAL GRID ERROR: Exception on {method} {path}: {str(err)} [elapsed: {round(duration * 1000, 2)}ms]")
            raise err
