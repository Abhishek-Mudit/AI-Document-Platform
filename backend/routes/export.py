"""
Export routes for generating downloadable documents
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from database.db import get_db
from models.models import User, Project
from services.auth import get_current_user
from services.export_service import export_service

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/docx/{project_id}")
def export_docx(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export project as a Word document"""
    # Get project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.type != "docx":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not a Word document type"
        )
    
    # Parse generated content
    generated_content = json.loads(project.generated_content) if project.generated_content else []
    
    if not generated_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content has been generated for this project"
        )
    
    # Generate document
    file_stream = export_service.export_docx(
        topic=project.topic,
        sections=generated_content
    )
    
    # Return as downloadable file
    filename = f"{project.topic.replace(' ', '_')}.docx"
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/pptx/{project_id}")
def export_pptx(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export project as a PowerPoint presentation"""
    # Get project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.type != "pptx":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not a PowerPoint presentation type"
        )
    
    # Parse generated content
    generated_content = json.loads(project.generated_content) if project.generated_content else []
    
    if not generated_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content has been generated for this project"
        )
    
    # Generate presentation
    file_stream = export_service.export_pptx(
        topic=project.topic,
        slides=generated_content
    )
    
    # Return as downloadable file
    filename = f"{project.topic.replace(' ', '_')}.pptx"
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
