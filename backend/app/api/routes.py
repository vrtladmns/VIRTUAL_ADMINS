from datetime import datetime, timezone
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models.policy import (
    PolicySection, 
    PolicySectionCreate, 
    PolicySectionUpdate,
    EmployeeKB, 
    EmployeeKBCreate, 
    EmployeeKBUpdate,
    EnhancedAskRequest, 
    EnhancedAskResponse
)
from ..models.employee import Employee, EmployeeResponse
from ..services.mongo_ops import mongo_service
from ..services.excel_writer import excel_writer
from ..services.ai_connector import ai_connector
from ..services.policy_service import policy_service
from ..services.employee_kb_service import employee_kb_service

router = APIRouter()

class HealthResponse(BaseModel):
    status: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="ok")
 
@router.post("/onboard", response_model=EmployeeResponse)
async def onboard_employee(employee: Employee):
    """Onboard a new employee"""
    try:
        # Convert employee model to dict
        employee_dict = employee.model_dump()
        
        # Convert date objects to ISO strings for MongoDB compatibility
        for key, value in employee_dict.items():
            if hasattr(value, 'isoformat'):
                employee_dict[key] = value.isoformat()
        
        # Add server-side timestamp
        employee_dict["created_at"] = datetime.now(timezone.utc)
        
        # Save to MongoDB
        employee_id = mongo_service.save_employee(employee_dict)
        
        # Append to Excel file
        excel_export_status = excel_writer.append_employee_row(employee_dict)
        
        return EmployeeResponse(status="success", id=employee_id, excel_export=excel_export_status)
        
    except Exception as e:
        # Log error without sensitive data
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to onboard employee: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to onboard employee. Please try again."
        )

# Legacy /api/ask endpoint removed - use consolidated /api/ask endpoint instead

# Policy Management Endpoints
@router.get("/policies", response_model=list[PolicySection])
async def get_policies(
    section_id: Optional[str] = None,
    step: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get policies with flexible filtering - single endpoint for all policy retrieval"""
    try:
        # Get by specific section ID
        if section_id:
            section = policy_service.get_section_by_id(section_id)
            if not section:
                raise HTTPException(status_code=404, detail="Policy section not found")
            return [section]  # Return as list for consistency
        
        # Get by step order
        elif step:
            if step < 1 or step > 17:
                raise HTTPException(status_code=400, detail="Step order must be between 1 and 17")
            
            section = policy_service.get_section_by_order(step)
            if not section:
                raise HTTPException(status_code=404, detail=f"Policy section for step {step} not found")
            return [section]  # Return as list for consistency
        
        # Search policies (future enhancement)
        elif search:
            # For now, return all policies and let frontend filter
            # In future, implement search in policy_service
            sections = policy_service.get_all_sections()
            # Simple text search (case-insensitive)
            filtered_sections = [
                s for s in sections 
                if search.lower() in s.title.lower() or search.lower() in s.content.lower()
            ]
            return filtered_sections[offset:offset + limit]
        
        # Get all policies with pagination
        else:
            sections = policy_service.get_all_sections()
            return sections[offset:offset + limit]
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to retrieve policies: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve policies. Please try again."
        )

# ============================================================================
# POLICY CRUD OPERATIONS
# ============================================================================

@router.post("/policies", response_model=dict)
async def create_policy_section(section: PolicySectionCreate):
    """Create a new HR policy section"""
    try:
        section_id = policy_service.create_section(section)
        return {
            "status": "success",
            "message": "Policy section created successfully",
            "section_id": section_id
        }
        
    except ValueError as e:
        error_msg = str(e)
        if "already exists" in error_msg:
            if "section_id" in error_msg:
                raise HTTPException(
                    status_code=409, 
                    detail={
                        "error": "duplicate",
                        "field": "section_id",
                        "message": error_msg
                    }
                )
            elif "Step" in error_msg and "already exists" in error_msg:
                raise HTTPException(
                    status_code=409, 
                    detail={
                        "error": "duplicate",
                        "field": "order",
                        "message": error_msg
                    }
                )
            else:
                raise HTTPException(status_code=400, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create policy section: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to create policy section. Please try again."
        )

@router.put("/policies/{section_id}", response_model=dict)
async def update_policy_section(section_id: str, updates: PolicySectionUpdate):
    """Update an existing HR policy section"""
    try:
        # Check if section exists
        existing_section = policy_service.get_section_by_id(section_id)
        if not existing_section:
            raise HTTPException(
                status_code=404, 
                detail={
                    "error": "not_found",
                    "message": "Policy section not found"
                }
            )
        
        success = policy_service.update_section(section_id, updates)
        if success:
            return {
                "status": "success",
                "message": "Policy section updated successfully"
            }
        else:
            return {
                "status": "info",
                "message": "No changes made to policy section"
            }
        
    except ValueError as e:
        error_msg = str(e)
        if "already exists" in error_msg:
            if "Step" in error_msg and "already exists" in error_msg:
                raise HTTPException(
                    status_code=409, 
                    detail={
                        "error": "duplicate",
                        "field": "order",
                        "message": error_msg
                    }
                )
            else:
                raise HTTPException(status_code=400, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to update policy section {section_id}: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to update policy section. Please try again."
        )

@router.delete("/policies/{section_id}", response_model=dict)
async def delete_policy_section(section_id: str):
    """Delete an HR policy section"""
    try:
        # Check if section exists
        existing_section = policy_service.get_section_by_id(section_id)
        if not existing_section:
            raise HTTPException(
                status_code=404, 
                detail={
                    "error": "not_found",
                    "message": "Policy section not found"
                }
            )
        
        success = policy_service.delete_section(section_id)
        if success:
            return {
                "status": "success",
                "message": "Policy section deleted successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete policy section")
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to delete policy section {section_id}: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to delete policy section. Please try again."
        )

@router.get("/policies/validation/used-orders", response_model=dict)
async def get_used_orders():
    """Get list of used order numbers for frontend validation"""
    try:
        used_orders = policy_service.get_used_orders()
        return {
            "status": "success",
            "used_orders": used_orders
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to get used orders: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve used orders. Please try again."
        )

@router.get("/policies/validation/used-section-ids", response_model=dict)
async def get_used_section_ids():
    """Get list of used section IDs for frontend validation"""
    try:
        used_section_ids = policy_service.get_used_orders()
        return {
            "status": "success",
            "used_section_ids": used_section_ids
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to get used section IDs: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve used section IDs. Please try again."
        )

# ============================================================================
# EMPLOYEE KNOWLEDGE BASE ENDPOINTS
# ============================================================================

@router.post("/employee-kb", response_model=dict)
async def create_employee_kb_document(kb_doc: EmployeeKBCreate):
    """Create a new Employee Knowledge Base document"""
    try:
        doc_id = employee_kb_service.create_document(kb_doc)
        return {
            "status": "success",
            "message": "Employee KB document created successfully",
            "document_id": doc_id
        }
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create Employee KB document: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to create Employee KB document. Please try again."
        )

@router.get("/employee-kb", response_model=list[EmployeeKB])
async def get_employee_kb_documents(limit: int = 50):
    """Get all Employee KB documents"""
    try:
        docs = employee_kb_service.get_all_documents(limit)
        return docs
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to retrieve Employee KB documents: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve Employee KB documents. Please try again."
        )

@router.get("/employee-kb/{doc_id}", response_model=EmployeeKB)
async def get_employee_kb_document(doc_id: str):
    """Get a specific Employee KB document by ID"""
    try:
        doc = employee_kb_service.get_document_by_id(doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Employee KB document not found")
        
        return doc
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to get Employee KB document {doc_id}: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve Employee KB document. Please try again."
        )

@router.put("/employee-kb/{doc_id}", response_model=dict)
async def update_employee_kb_document(doc_id: str, updates: EmployeeKBUpdate):
    """Update an existing Employee KB document"""
    try:
        success = employee_kb_service.update_document(doc_id, updates)
        if success:
            return {
                "status": "success",
                "message": "Employee KB document updated successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Employee KB document not found")
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to update Employee KB document {doc_id}: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to update Employee KB document. Please try again."
        )

@router.delete("/employee-kb/{doc_id}", response_model=dict)
async def delete_employee_kb_document(doc_id: str):
    """Delete an Employee KB document"""
    try:
        success = employee_kb_service.delete_document(doc_id)
        if success:
            return {
                "status": "success",
                "message": "Employee KB document deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Employee KB document not found")
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to delete Employee KB document {doc_id}: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to delete Employee KB document. Please try again."
        )



@router.get("/employee-kb/stats", response_model=dict)
async def get_employee_kb_stats():
    """Get statistics about Employee KB documents"""
    try:
        stats = employee_kb_service.get_document_stats()
        return {
            "status": "success",
            "stats": stats
        }
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to get Employee KB stats: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve Employee KB stats. Please try again."
        )

@router.post("/ask", response_model=EnhancedAskResponse)
async def enhanced_ask(request: EnhancedAskRequest):
    """Enhanced ask endpoint supporting both onboarding and employee helpdesk scopes"""
    try:
        if request.scope == "employee":
            # Employee Helpdesk Mode - Use specialized helpdesk method
            try:
                # Get all documents for context (Global Mode approach)
                context = employee_kb_service.get_all_documents_for_context()
                
                # Process question with AI using the specialized helpdesk method
                answer = await ai_connector.ask_helpdesk_question(
                    question=request.message,
                    context=context,
                    max_tokens=512
                )
                
                return EnhancedAskResponse(
                    scope="employee",
                    answer=answer
                )
                
            except Exception as e:
                # Fallback to generic response if AI processing fails
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to process employee question with AI: {str(e)}")
                
                answer = "Employee Helpdesk Mode is active. Ask about insurance, payroll, holidays, IT, reimbursements, etc."
                
                return EnhancedAskResponse(
                    scope="employee",
                    answer=answer
                )
            
        elif request.scope == "onboarding":
            # Onboarding Mode - use policy context and AI processing
            if not request.mode:
                # Default to global mode if none specified
                request.mode = "global"
            
            # Determine the actual mode to use
            actual_mode = request.mode
            if request.mode == "auto":
                if request.section_id:
                    actual_mode = "guided"
                else:
                    actual_mode = "global"
            
            # Get policy context based on mode
            try:
                context = policy_service.get_sections_for_context(actual_mode, request.section_id)
            except ValueError as e:
                raise HTTPException(status_code=404, detail=str(e))
            
            # Ask AI with context
            answer = await ai_connector.ask_policy_question(
                question=request.message,
                context=context,
                mode=actual_mode,
                max_tokens=512
            )
            
            return EnhancedAskResponse(
                scope="onboarding",
                mode_used=actual_mode,
                answer=answer
            )
        
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid scope. Use 'onboarding' or 'employee'"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to process enhanced ask request: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to process request. Please try again."
        )
