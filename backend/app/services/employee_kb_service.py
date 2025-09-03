from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from bson import ObjectId
import logging
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from pymongo.cursor import Cursor

from ..models.policy import EmployeeKB, EmployeeKBCreate, EmployeeKBUpdate

logger = logging.getLogger(__name__)

class EmployeeKBService:
    """Service for managing Employee Knowledge Base documents"""
    
    def __init__(self):
        self.collection_name = "employee_kb_docs"
        self.client: MongoClient = None
        self.db: Database = None
        self.collection: Collection = None
        
    def _connect(self):
        """Establish connection to MongoDB"""
        try:
            # Use the same connection logic as mongo_ops.py
            from .mongo_ops import mongo_service
            if mongo_service.db is None:
                mongo_service.connect()
            
            self.client = mongo_service.client
            self.db = mongo_service.db
            self.collection = self.db[self.collection_name]
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def create_document(self, kb_doc: EmployeeKBCreate) -> str:
        """Create a new Employee KB document"""
        try:
            if self.collection is None:
                self._connect()
            
            # Convert to dict and add timestamps
            doc_dict = kb_doc.model_dump()
            doc_dict["created_at"] = datetime.now(timezone.utc)
            doc_dict["updated_at"] = datetime.now(timezone.utc)
            
            # Set effective_from if not provided
            if not doc_dict.get("effective_from"):
                doc_dict["effective_from"] = datetime.now(timezone.utc)
            

            
            # Insert into MongoDB
            result = self.collection.insert_one(doc_dict)
            doc_id = str(result.inserted_id)
            
            logger.info(f"Created Employee KB document: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to create Employee KB document: {str(e)}")
            raise
    
    def get_document_by_id(self, doc_id: str) -> Optional[EmployeeKB]:
        """Get an Employee KB document by ID"""
        try:
            if self.collection is None:
                self._connect()
            
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(doc_id)
            except Exception:
                logger.warning(f"Invalid ObjectId format: {doc_id}")
                return None
            
            doc = self.collection.find_one({"_id": object_id})
            if doc:
                # Convert MongoDB ObjectId to string
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                return EmployeeKB(**doc)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get Employee KB document {doc_id}: {str(e)}")
            raise
    

    
    def get_all_documents(self, limit: int = 100) -> List[EmployeeKB]:
        """Get all Employee KB documents"""
        try:
            if self.collection is None:
                self._connect()
            
            query = {}
            cursor = self.collection.find(query).limit(limit)
            docs = list(cursor)
            
            result = []
            for doc in docs:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                result.append(EmployeeKB(**doc))
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get all Employee KB documents: {str(e)}")
            raise
    
    def update_document(self, doc_id: str, updates: EmployeeKBUpdate) -> bool:
        """Update an Employee KB document"""
        try:
            if self.collection is None:
                self._connect()
            
            # Check if document exists
            existing_doc = self.get_document_by_id(doc_id)
            if not existing_doc:
                logger.warning(f"Employee KB document {doc_id} not found for update")
                return False
            
            # Prepare update data
            update_dict = updates.model_dump(exclude_unset=True)
            update_dict["updated_at"] = datetime.now(timezone.utc)
            
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(doc_id)
            except Exception:
                logger.warning(f"Invalid ObjectId format: {doc_id}")
                return False
            
            # Update in MongoDB
            result = self.collection.update_one(
                {"_id": object_id},
                {"$set": update_dict}
            )
            
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated Employee KB document: {doc_id}")
            else:
                logger.warning(f"No changes made to Employee KB document: {doc_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to update Employee KB document {doc_id}: {str(e)}")
            raise
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete an Employee KB document"""
        try:
            if self.collection is None:
                self._connect()
            
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(doc_id)
            except Exception:
                logger.warning(f"Invalid ObjectId format: {doc_id}")
                return False
            
            result = self.collection.delete_one({"_id": object_id})
            
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted Employee KB document: {doc_id}")
            else:
                logger.warning(f"Employee KB document {doc_id} not found for deletion")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete Employee KB document {doc_id}: {str(e)}")
            raise
    

    
    def get_document_stats(self) -> Dict[str, Any]:
        """Get statistics about Employee KB documents"""
        try:
            if self.collection is None:
                self._connect()
            
            pipeline = [
                {"$group": {
                    "_id": None,
                    "total_documents": {"$sum": 1}
                }},
                {"$project": {
                    "_id": 0,
                    "total_documents": 1
                }}
            ]
            
            cursor = self.collection.aggregate(pipeline)
            result = list(cursor)
            
            if result:
                stats = result[0]
                return stats
            else:
                return {
                    "total_documents": 0
                }
                
        except Exception as e:
            logger.error(f"Failed to get Employee KB stats: {str(e)}")
            raise

    def get_all_documents_for_context(self) -> str:
        """Get all Employee KB documents content for AI context (Global Mode)"""
        try:
            if self.collection is None:
                self._connect()
            
            # Get all documents (like get_all_sections() in policy service)
            cursor = self.collection.find().sort("title", 1)
            docs = list(cursor)
            
            if not docs:
                raise ValueError("No Employee KB documents found")
            
            # Build comprehensive context (like Global Mode does)
            context_parts = []
            for doc in docs:
                context_parts.append(f"Document: {doc['title']}\n{doc['content']}\n")
            
            return "\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Failed to get documents for context: {str(e)}")
            raise

# Global instance
employee_kb_service = EmployeeKBService()
