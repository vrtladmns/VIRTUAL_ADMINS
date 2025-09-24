import os
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from dotenv import load_dotenv

from ..models.feedback import Feedback, FeedbackCreate, FeedbackStats

# Load environment variables
load_dotenv(encoding="utf-8", override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FeedbackService:
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGO_DB", "onboarding_bot")
        self.client: MongoClient = None
        self.db: Database = None
        self.feedback_collection: Collection = None
        
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            self.feedback_collection = self.db.feedback
            
            # Create indexes for performance
            self.feedback_collection.create_index("timestamp")
            self.feedback_collection.create_index("category")
            self.feedback_collection.create_index("rating")
            
            # Test connection
            self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB for feedback: {self.db_name}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB for feedback: {str(e)}")
            raise
    
    def create_feedback(self, feedback_data: FeedbackCreate) -> str:
        """Create a new feedback entry and return the ID"""
        try:
            if self.feedback_collection is None:
                self.connect()
            
            # Convert to dict and add timestamp
            feedback_dict = feedback_data.model_dump()
            feedback_dict["timestamp"] = datetime.now(timezone.utc)
            feedback_dict["created_at"] = datetime.now(timezone.utc)
            
            # Remove email if anonymous
            if feedback_dict.get("anonymous", False):
                feedback_dict["email"] = None
                feedback_dict["user_id"] = None
            
            # Insert into database
            result = self.feedback_collection.insert_one(feedback_dict)
            feedback_id = str(result.inserted_id)
            
            # Log success (without sensitive data)
            logger.info(f"Feedback created successfully with ID: {feedback_id}, Category: {feedback_data.category}, Rating: {feedback_data.rating}")
            
            return feedback_id
            
        except Exception as e:
            logger.error(f"Failed to create feedback: {str(e)}")
            raise
    
    def get_feedback(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get feedback entries with pagination"""
        try:
            if self.feedback_collection is None:
                self.connect()
            
            # Get feedback with pagination, sorted by newest first
            cursor = self.feedback_collection.find().sort("timestamp", -1).skip(offset).limit(limit)
            feedback_list = []
            
            for doc in cursor:
                # Convert ObjectId to string
                doc["_id"] = str(doc["_id"])
                feedback_list.append(doc)
            
            return feedback_list
            
        except Exception as e:
            logger.error(f"Failed to get feedback: {str(e)}")
            raise
    
    def get_feedback_by_category(self, category: str, limit: int = 50) -> List[Dict]:
        """Get feedback entries by category"""
        try:
            if self.feedback_collection is None:
                self.connect()
            
            # Get feedback by category, sorted by newest first
            cursor = self.feedback_collection.find({"category": category}).sort("timestamp", -1).limit(limit)
            feedback_list = []
            
            for doc in cursor:
                # Convert ObjectId to string
                doc["_id"] = str(doc["_id"])
                feedback_list.append(doc)
            
            return feedback_list
            
        except Exception as e:
            logger.error(f"Failed to get feedback by category {category}: {str(e)}")
            raise
    
    def get_feedback_by_id(self, feedback_id: str) -> Optional[Dict]:
        """Get a specific feedback entry by ID"""
        try:
            if self.feedback_collection is None:
                self.connect()
            
            from bson import ObjectId
            doc = self.feedback_collection.find_one({"_id": ObjectId(feedback_id)})
            
            if doc:
                doc["_id"] = str(doc["_id"])
                return doc
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get feedback by ID {feedback_id}: {str(e)}")
            raise
    
    def get_feedback_stats(self) -> Dict:
        """Get feedback statistics"""
        try:
            if self.feedback_collection is None:
                self.connect()
            
            # Get total count
            total_feedback = self.feedback_collection.count_documents({})
            
            if total_feedback == 0:
                return {
                    "total_feedback": 0,
                    "average_rating": 0.0,
                    "category_breakdown": {},
                    "recent_feedback_count": 0,
                    "anonymous_percentage": 0.0
                }
            
            # Get average rating
            pipeline = [
                {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}
            ]
            avg_result = list(self.feedback_collection.aggregate(pipeline))
            average_rating = round(avg_result[0]["avg_rating"], 2) if avg_result else 0.0
            
            # Get category breakdown
            category_pipeline = [
                {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            category_results = list(self.feedback_collection.aggregate(category_pipeline))
            category_breakdown = {item["_id"]: item["count"] for item in category_results}
            
            # Get recent feedback count (last 7 days)
            from datetime import timedelta
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            recent_feedback_count = self.feedback_collection.count_documents({
                "timestamp": {"$gte": week_ago}
            })
            
            # Get anonymous percentage
            anonymous_count = self.feedback_collection.count_documents({"anonymous": True})
            anonymous_percentage = round((anonymous_count / total_feedback) * 100, 1) if total_feedback > 0 else 0.0
            
            return {
                "total_feedback": total_feedback,
                "average_rating": average_rating,
                "category_breakdown": category_breakdown,
                "recent_feedback_count": recent_feedback_count,
                "anonymous_percentage": anonymous_percentage
            }
            
        except Exception as e:
            logger.error(f"Failed to get feedback stats: {str(e)}")
            raise
    
    def delete_feedback(self, feedback_id: str) -> bool:
        """Delete a feedback entry by ID"""
        try:
            if self.feedback_collection is None:
                self.connect()
            
            from bson import ObjectId
            result = self.feedback_collection.delete_one({"_id": ObjectId(feedback_id)})
            
            if result.deleted_count > 0:
                logger.info(f"Feedback deleted successfully: {feedback_id}")
                return True
            else:
                logger.warning(f"Feedback not found for deletion: {feedback_id}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete feedback {feedback_id}: {str(e)}")
            raise
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed for feedback service")


# Global instance
feedback_service = FeedbackService()
