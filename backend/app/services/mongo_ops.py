import os
import logging
from typing import Dict
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from dotenv import load_dotenv

# Load environment variables
load_dotenv(encoding="utf-8", override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoService:
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGO_DB", "onboarding_bot")
        self.client: MongoClient = None
        self.db: Database = None
        self.employees_collection: Collection = None
        
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            self.employees_collection = self.db.employees
            
            # Test connection
            self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {self.db_name}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def save_employee(self, doc: Dict) -> str:
        """Save employee document to MongoDB and return the ObjectId as string"""
        try:
            if self.employees_collection is None:
                self.connect()
                
            result = self.employees_collection.insert_one(doc)
            employee_id = str(result.inserted_id)
            
            # Log success without sensitive data
            logger.info(f"Employee saved successfully with ID: {employee_id}")
            return employee_id
            
        except Exception as e:
            logger.error(f"Failed to save employee to MongoDB: {str(e)}")
            raise
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")


# Global instance
mongo_service = MongoService()
