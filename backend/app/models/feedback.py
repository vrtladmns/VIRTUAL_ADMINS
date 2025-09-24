from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, validator


class FeedbackCreate(BaseModel):
    """Model for creating feedback"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    category: str = Field(..., min_length=1, max_length=50, description="Feedback category")
    message: str = Field(..., min_length=10, max_length=2000, description="Feedback message")
    email: Optional[EmailStr] = Field(None, description="Optional email for follow-up")
    anonymous: bool = Field(False, description="Whether feedback is anonymous")
    user_id: Optional[str] = Field(None, max_length=100, description="Optional user identifier")

    @validator('category')
    def validate_category(cls, v):
        """Validate category is from allowed list"""
        allowed_categories = [
            'HR', 'Onboarding', 'Technical', 'Bug Report', 
            'Feature Request', 'Other'
        ]
        if v not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v

    @validator('message')
    def validate_message(cls, v):
        """Sanitize and validate message content"""
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        
        # Basic content sanitization
        v = v.strip()
        
        # Check for minimum meaningful content
        if len(v) < 10:
            raise ValueError('Message must be at least 10 characters long')
        
        return v


class FeedbackResponse(BaseModel):
    """Model for feedback API responses"""
    status: str = Field(..., description="Response status")
    message: str = Field(..., description="Response message")
    feedback_id: Optional[str] = Field(None, description="Generated feedback ID")


class Feedback(BaseModel):
    """Complete feedback model with all fields"""
    id: Optional[str] = Field(None, alias="_id", description="MongoDB ObjectId")
    rating: int = Field(..., ge=1, le=5)
    category: str = Field(..., min_length=1, max_length=50)
    message: str = Field(..., min_length=10, max_length=2000)
    email: Optional[str] = Field(None)
    anonymous: bool = Field(False)
    user_id: Optional[str] = Field(None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class FeedbackStats(BaseModel):
    """Model for feedback statistics"""
    total_feedback: int
    average_rating: float
    category_breakdown: dict
    recent_feedback_count: int
    anonymous_percentage: float
