import os
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from dotenv import load_dotenv

from ..models.policy import PolicySection, PolicySectionCreate, PolicySectionUpdate

# Load environment variables
load_dotenv(encoding="utf-8", override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PolicyService:
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGO_DB", "onboarding_bot")
        self.client: MongoClient = None
        self.db: Database = None
        self.policy_collection: Collection = None
        
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            if self.client is None:
                self.client = MongoClient(self.mongo_uri)
                self.db = self.client[self.db_name]
                self.policy_collection = self.db.policy_sections
                
                # Test connection
                self.client.admin.command('ping')
                logger.info(f"Connected to MongoDB: {self.db_name}")
                
                # Ensure unique indexes exist
                self._ensure_indexes()
                
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def _ensure_indexes(self):
        """Ensure unique indexes exist for section_id and order"""
        try:
            # Create unique index on section_id
            self.policy_collection.create_index("section_id", unique=True)
            logger.info("Created unique index on section_id")
            
            # Create unique index on order
            self.policy_collection.create_index("order", unique=True)
            logger.info("Created unique index on order")
            
        except Exception as e:
            logger.warning(f"Failed to create indexes (may already exist): {str(e)}")
    
    def get_section_by_id(self, section_id: str) -> Optional[PolicySection]:
        """Get a policy section by its ID"""
        try:
            if self.policy_collection is None:
                self.connect()
                
            doc = self.policy_collection.find_one({"section_id": section_id})
            if doc:
                return PolicySection(**doc)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get policy section {section_id}: {str(e)}")
            raise
    
    def get_section_by_order(self, order: int) -> Optional[PolicySection]:
        """Get a policy section by its order number"""
        try:
            if self.policy_collection is None:
                self.connect()
                
            doc = self.policy_collection.find_one({"order": order})
            if doc:
                return PolicySection(**doc)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get policy section with order {order}: {str(e)}")
            raise
    
    def get_all_sections(self) -> List[PolicySection]:
        """Get all policy sections ordered by their order field"""
        try:
            if self.policy_collection is None:
                self.connect()
                
            cursor = self.policy_collection.find().sort("order", 1)
            sections = []
            for doc in cursor:
                sections.append(PolicySection(**doc))
            return sections
            
        except Exception as e:
            logger.error(f"Failed to get all policy sections: {str(e)}")
            raise
    
    def create_section(self, section: PolicySectionCreate) -> str:
        """Create a new policy section"""
        try:
            if self.policy_collection is None:
                self.connect()
            
            # Create section document
            section_doc = section.model_dump()
            section_doc["updated_at"] = datetime.now(timezone.utc)
            
            result = self.policy_collection.insert_one(section_doc)
            section_id = str(result.inserted_id)
            
            logger.info(f"Created policy section: {section.section_id}")
            return section_id
            
        except Exception as e:
            # Handle duplicate key errors specifically
            if "duplicate key error" in str(e).lower():
                if "section_id" in str(e):
                    raise ValueError(f"Policy section with ID '{section.section_id}' already exists")
                elif "order" in str(e):
                    raise ValueError(f"Step {section.order} already exists")
                else:
                    raise ValueError("Duplicate key error occurred")
            else:
                logger.error(f"Failed to create policy section: {str(e)}")
                raise
    
    def update_section(self, section_id: str, updates: PolicySectionUpdate) -> bool:
        """Update an existing policy section"""
        try:
            if self.policy_collection is None:
                self.connect()
            
            # Prepare update document
            update_doc = {}
            if updates.title is not None:
                update_doc["title"] = updates.title
            if updates.content is not None:
                update_doc["content"] = updates.content
            if updates.order is not None:
                update_doc["order"] = updates.order
            
            update_doc["updated_at"] = datetime.now(timezone.utc)
            
            result = self.policy_collection.update_one(
                {"section_id": section_id},
                {"$set": update_doc}
            )
            
            if result.modified_count > 0:
                logger.info(f"Updated policy section: {section_id}")
                return True
            else:
                logger.warning(f"No changes made to policy section: {section_id}")
                return False
                
        except Exception as e:
            # Handle duplicate key errors specifically
            if "duplicate key error" in str(e).lower():
                if "order" in str(e):
                    raise ValueError(f"Step {updates.order} already exists")
                else:
                    raise ValueError("Duplicate key error occurred")
            else:
                logger.error(f"Failed to update policy section {section_id}: {str(e)}")
                raise
    
    def delete_section(self, section_id: str) -> bool:
        """Delete a policy section"""
        try:
            if self.policy_collection is None:
                self.connect()
            
            result = self.policy_collection.delete_one({"section_id": section_id})
            
            if result.deleted_count > 0:
                logger.info(f"Deleted policy section: {section_id}")
                return True
            else:
                logger.warning(f"Policy section not found: {section_id}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete policy section {section_id}: {str(e)}")
            raise
    
    def get_sections_for_context(self, mode: str, section_id: Optional[str] = None) -> str:
        """Get policy sections content based on mode for AI context"""
        try:
            if mode == "guided" and section_id:
                # Get single section content
                section = self.get_section_by_id(section_id)
                if section:
                    return f"Section {section.order}: {section.title}\n\n{section.content}"
                else:
                    raise ValueError(f"Policy section '{section_id}' not found")
            
            elif mode == "global" or (mode == "auto" and not section_id):
                # Get all sections content
                sections = self.get_all_sections()
                if not sections:
                    raise ValueError("No policy sections found")
                
                context_parts = []
                for section in sections:
                    context_parts.append(f"Section {section.order}: {section.title}\n{section.content}\n")
                
                return "\n".join(context_parts)
            
            else:
                raise ValueError(f"Invalid mode '{mode}' or missing section_id for guided mode")
                
        except Exception as e:
            logger.error(f"Failed to get sections for context: {str(e)}")
            raise
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    def get_used_orders(self) -> List[int]:
        """Get list of used order numbers"""
        try:
            if self.policy_collection is None:
                self.connect()
            
            cursor = self.policy_collection.find({}, {"order": 1})
            used_orders = [doc["order"] for doc in cursor]
            return sorted(used_orders)
            
        except Exception as e:
            logger.error(f"Failed to get used orders: {str(e)}")
            raise
    
    def get_used_section_ids(self) -> List[str]:
        """Get list of used section IDs"""
        try:
            if self.policy_collection is None:
                self.connect()
            
            cursor = self.policy_collection.find({}, {"section_id": 1})
            used_ids = [doc["section_id"] for doc in cursor]
            return sorted(used_ids)
            
        except Exception as e:
            logger.error(f"Failed to get used section IDs: {str(e)}")
            raise


# Global instance
policy_service = PolicyService()
