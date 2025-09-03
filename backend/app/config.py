"""
Configuration settings for Azure production deployment
"""
import os
from typing import Optional

class Settings:
    """Application settings for production deployment"""
    
    # Database Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "hr_onboarding")
    
    # Cosmos DB Configuration (MongoDB API)
    COSMOS_DB_CONNECTION_STRING: Optional[str] = os.getenv("COSMOS_DB_CONNECTION_STRING")
    COSMOS_DB_DATABASE_NAME: str = os.getenv("COSMOS_DB_DATABASE_NAME", "hr-onboarding-db")
    COSMOS_DB_COLLECTION_EMPLOYEES: str = os.getenv("COSMOS_DB_COLLECTION_EMPLOYEES", "employees")
    COSMOS_DB_COLLECTION_POLICIES: str = os.getenv("COSMOS_DB_COLLECTION_POLICIES", "policies")
    COSMOS_DB_COLLECTION_EMPLOYEE_KB: str = os.getenv("COSMOS_DB_COLLECTION_EMPLOYEE_KB", "employee_kb")
    
    # AI Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-3.5-turbo")
    
    # Application Configuration
    APP_NAME: str = "HR Onboarding Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://your-static-web-app.azurestaticapps.net",  # Replace with your actual Static Web App URL
        "*"  # Remove this in production and specify exact origins
    ]
    
    # File Storage Configuration
    EXCEL_FILE_PATH: str = os.getenv("EXCEL_FILE_PATH", "/tmp/onboarded_employees.xlsx")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @property
    def database_url(self) -> str:
        """Get the appropriate database URL based on environment"""
        if self.COSMOS_DB_CONNECTION_STRING:
            return self.COSMOS_DB_CONNECTION_STRING
        return self.MONGODB_URL
    
    @property
    def database_name(self) -> str:
        """Get the appropriate database name based on environment"""
        if self.COSMOS_DB_CONNECTION_STRING:
            return self.COSMOS_DB_DATABASE_NAME
        return self.MONGODB_DATABASE

# Global settings instance
settings = Settings()
