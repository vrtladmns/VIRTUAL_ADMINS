import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ValidationInfo


class PolicySection(BaseModel):
    section_id: str = Field(..., description="Unique identifier for the policy section")
    title: str = Field(..., min_length=1, max_length=150, description="Title of the policy section")
    content: str = Field(..., min_length=1, max_length=20000, description="Full content of the policy section")
    order: int = Field(..., ge=1, description="Order/step number (minimum 1)")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    @field_validator('section_id')
    @classmethod
    def validate_section_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Section ID must contain only alphanumeric characters and underscores')
        if len(v) > 100:
            raise ValueError('Section ID must be 100 characters or less')
        return v


class PolicySectionCreate(BaseModel):
    section_id: str = Field(..., description="Unique identifier for the policy section")
    title: str = Field(..., min_length=1, max_length=150, description="Title of the policy section")
    content: str = Field(..., min_length=1, max_length=20000, description="Full content of the policy section")
    order: int = Field(..., ge=1, description="Order/step number (minimum 1)")

    @field_validator('section_id')
    @classmethod
    def validate_section_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Section ID must contain only alphanumeric characters and underscores')
        if len(v) > 100:
            raise ValueError('Section ID must be 100 characters or less')
        return v


class PolicySectionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    content: Optional[str] = Field(None, min_length=1, max_length=20000)
    order: Optional[int] = Field(None, ge=1)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None and len(v) > 150:
            raise ValueError('Title must be 150 characters or less')
        return v

    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if v is not None and len(v) > 20000:
            raise ValueError('Content must be 20000 characters or less')
        return v


class EmployeeKB(BaseModel):
    """Employee Knowledge Base document model for Employee Helpdesk"""
    id: Optional[str] = Field(None, description="Unique identifier for the KB document")
    title: str = Field(..., min_length=1, max_length=200, description="Title of the KB document")
    content: str = Field(..., min_length=1, max_length=50000, description="Full content of the KB document")
    effective_from: datetime = Field(default_factory=lambda: datetime.now(), description="When this document becomes effective")

    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class EmployeeKBCreate(BaseModel):
    """Model for creating new Employee KB documents"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=50000)
    effective_from: Optional[datetime] = None


class EmployeeKBUpdate(BaseModel):
    """Model for updating Employee KB documents"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=50000)
    effective_from: Optional[datetime] = None






class EnhancedAskRequest(BaseModel):
    """Enhanced request model for /api/ask endpoint supporting both onboarding and employee helpdesk"""
    scope: str = Field("onboarding", description="Scope: 'onboarding' or 'employee' (default: onboarding)")
    mode: Optional[str] = Field(None, description="Mode: 'guided' or 'global' (only relevant if scope='onboarding')")
    message: str = Field(..., min_length=1, max_length=1000, description="The question or message")
    context_hints: Optional[list[str]] = Field(None, description="Optional context hints for better AI responses")
    section_id: Optional[str] = Field(None, description="Specific section ID for guided mode (only relevant if scope='onboarding')")

    @field_validator('scope')
    @classmethod
    def validate_scope(cls, v):
        valid_scopes = ["onboarding", "employee"]
        if v.lower() not in valid_scopes:
            raise ValueError(f'Scope must be one of: {", ".join(valid_scopes)}')
        return v.lower()

    @field_validator('mode')
    @classmethod
    def validate_mode(cls, v, info: ValidationInfo):
        if v is not None:
            valid_modes = ["guided", "global"]
            if v.lower() not in valid_modes:
                raise ValueError(f'Mode must be one of: {", ".join(valid_modes)}')
            
            # Mode is only relevant for onboarding scope
            if hasattr(info, 'data') and info.data.get('scope') == 'employee' and v is not None:
                raise ValueError('Mode is not applicable for employee scope')
            
            return v.lower()
        return v

    @field_validator('section_id')
    @classmethod
    def validate_section_id(cls, v, info: ValidationInfo):
        # Section ID is only relevant for onboarding scope with guided mode
        if v is not None:
            if hasattr(info, 'data') and info.data.get('scope') == 'employee':
                raise ValueError('Section ID is not applicable for employee scope')
            if hasattr(info, 'data') and info.data.get('mode') == 'global':
                raise ValueError('Section ID is not applicable for global mode')
        return v


class EnhancedAskResponse(BaseModel):
    """Enhanced response model for /api/ask endpoint"""
    scope: str = Field(..., description="The scope that was used")
    mode_used: Optional[str] = Field(None, description="Mode used (only for onboarding scope)")
    answer: str = Field(..., description="The AI-generated answer")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(), description="Response timestamp")
