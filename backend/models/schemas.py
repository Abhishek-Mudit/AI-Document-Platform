"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Project Schemas
class ProjectCreate(BaseModel):
    type: str  # "docx" or "pptx"
    topic: str
    outline: Optional[List[str]] = None


class ProjectUpdate(BaseModel):
    topic: Optional[str] = None
    outline: Optional[List[str]] = None
    generated_content: Optional[List[Any]] = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    type: str
    topic: str
    outline: Optional[Any] = None
    generated_content: Optional[Any] = None
    refinement_history: Optional[Any] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# AI Generation Schemas
class GenerateContentRequest(BaseModel):
    project_id: int


class RefineContentRequest(BaseModel):
    project_id: int
    section_index: int
    refinement_prompt: str
    feedback: Optional[str] = None  # "like" or "dislike"
    comment: Optional[str] = None


class SuggestOutlineRequest(BaseModel):
    topic: str
    type: str  # "docx" or "pptx"
