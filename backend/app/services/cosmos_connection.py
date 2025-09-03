"""
Cosmos DB connection service for Azure production deployment
"""
import os
import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from ..config import settings

logger = logging.getLogger(__name__)

class CosmosConnection:
    """Manages connection to Cosmos DB (MongoDB API)"""
    
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.database = None
        self._connect()
    
    def _connect(self):
        """Establish connection to Cosmos DB"""
        try:
            # Use Cosmos DB connection string if available, otherwise fallback to MongoDB
            connection_string = settings.database_url
            database_name = settings.database_name
            
            logger.info(f"Connecting to database: {database_name}")
            
            # Create MongoDB client with Cosmos DB specific settings
            self.client = MongoClient(
                connection_string,
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                connectTimeoutMS=10000,         # 10 second connection timeout
                socketTimeoutMS=20000,          # 20 second socket timeout
                maxPoolSize=10,                 # Connection pool size
                retryWrites=True,               # Enable retryable writes
                retryReads=True                 # Enable retryable reads
            )
            
            # Test the connection
            self.client.admin.command('ping')
            self.database = self.client[database_name]
            
            logger.info("Successfully connected to Cosmos DB")
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to Cosmos DB: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error connecting to Cosmos DB: {str(e)}")
            raise
    
    def get_collection(self, collection_name: str):
        """Get a collection from the database"""
        if not self.database:
            raise ConnectionError("Database connection not established")
        return self.database[collection_name]
    
    def close(self):
        """Close the database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")
    
    def health_check(self) -> bool:
        """Check if the database connection is healthy"""
        try:
            if self.client:
                self.client.admin.command('ping')
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
        return False

# Global connection instance
cosmos_connection = CosmosConnection()
