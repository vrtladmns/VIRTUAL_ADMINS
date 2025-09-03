from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class Employee(BaseModel):
    employee_code: str = Field(..., min_length=1, max_length=50)
    employee_name: str = Field(..., min_length=2, max_length=100)
    gender: str = Field(..., min_length=1, max_length=20)
    date_of_birth: date
    date_of_joining: date
    designation: str = Field(..., min_length=2, max_length=100)
    ctc_at_joining: float = Field(..., gt=0, description="Cost to Company in rupees")
    aadhaar_number: str = Field(..., min_length=8, max_length=20)
    uan: Optional[str] = Field(None, max_length=20)
    personal_email_id: EmailStr
    official_email_id: EmailStr
    contact_number: str = Field(..., min_length=5, max_length=30)
    emergency_contact_name: str = Field(..., min_length=2, max_length=100)
    emergency_contact_number: str = Field(..., min_length=5, max_length=30)


class EmployeeResponse(BaseModel):
    status: str
    id: str
    excel_export: str  # "ok" or "failed"
