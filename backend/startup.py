"""
Azure App Service startup script for FastAPI application
This file is used by Azure App Service to start the FastAPI application
"""
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

# Import and run the FastAPI app
from app.main import app

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable (Azure App Service sets this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"Starting FastAPI application on port {port}")
    print(f"Host: 0.0.0.0")
    print(f"Environment: {os.environ.get('WEBSITE_SITE_NAME', 'local')}")
    
    # Run the application with more verbose logging
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        reload=False
    )
