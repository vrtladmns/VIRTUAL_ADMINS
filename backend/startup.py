"""
Azure App Service startup script for FastAPI application
This file is used by Azure App Service to start the FastAPI application
"""
import os
from uvicorn import run

# Import the FastAPI app directly (no need for custom sys.path manipulation)
from app.main import app

if __name__ == "__main__":
    # Get port from environment variable (Azure App Service sets this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"Starting FastAPI application on port {port}")
    print(f"Host: 0.0.0.0")
    print(f"Environment: {os.environ.get('WEBSITE_SITE_NAME', 'local')}")
    
    # Run the application by passing the app object directly (safer than string)
    run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        reload=False
    )
