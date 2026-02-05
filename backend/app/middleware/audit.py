import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging

# Configure audit logger
logging.basicConfig(level=logging.INFO)
audit_logger = logging.getLogger("audit_trail")

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We only care about state-changing mutations
        if request.method in ["POST", "PUT", "DELETE"]:
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Simple audit log
            audit_logger.info(
                f"AUDIT - Method: {request.method} | Path: {request.url.path} | "
                f"Status: {response.status_code} | Duration: {process_time:.4f}s"
            )
            return response
            
        return await call_next(request)
