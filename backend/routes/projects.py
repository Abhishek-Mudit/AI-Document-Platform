"""
Project management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from database.db import get_db
from models.models import User, Project
from models.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from services.auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    # Validate document type
    if project_data.type not in ["docx", "pptx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type must be either 'docx' or 'pptx'"
        )
    
    # Create project
    new_project = Project(
        user_id=current_user.id,
        type=project_data.type,
        topic=project_data.topic,
        outline=json.dumps(project_data.outline) if project_data.outline else None,
        generated_content=None,
        refinement_history=json.dumps([])
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Parse JSON fields for response
    response_project = new_project
    response_project.outline = json.loads(new_project.outline) if new_project.outline else None
    response_project.generated_content = json.loads(new_project.generated_content) if new_project.generated_content else None
    response_project.refinement_history = json.loads(new_project.refinement_history) if new_project.refinement_history else []
    
    return response_project


@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all projects for current user"""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    
    # Parse JSON fields
    for project in projects:
        project.outline = json.loads(project.outline) if project.outline else None
        project.generated_content = json.loads(project.generated_content) if project.generated_content else None
        project.refinement_history = json.loads(project.refinement_history) if project.refinement_history else []
    
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Parse JSON fields
    project.outline = json.loads(project.outline) if project.outline else None
    project.generated_content = json.loads(project.generated_content) if project.generated_content else None
    project.refinement_history = json.loads(project.refinement_history) if project.refinement_history else []
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update fields
    if project_data.topic is not None:
        project.topic = project_data.topic
    if project_data.outline is not None:
        project.outline = json.dumps(project_data.outline)
    if project_data.generated_content is not None:
        project.generated_content = json.dumps(project_data.generated_content)
    
    db.commit()
    db.refresh(project)
    
    # Parse JSON fields
    project.outline = json.loads(project.outline) if project.outline else None
    project.generated_content = json.loads(project.generated_content) if project.generated_content else None
    project.refinement_history = json.loads(project.refinement_history) if project.refinement_history else []
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    
    return None
