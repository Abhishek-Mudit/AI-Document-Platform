"""
AI generation routes for content creation and refinement
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from datetime import datetime

from database.db import get_db
from models.models import User, Project
from models.schemas import (
    GenerateContentRequest,
    RefineContentRequest,
    SuggestOutlineRequest
)
from services.auth import get_current_user
from ai.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Generation"])


@router.post("/suggest-outline")
def suggest_outline(
    request: SuggestOutlineRequest,
    current_user: User = Depends(get_current_user)
):
    """Suggest an outline for a document based on topic"""
    outline = ai_service.suggest_outline(request.topic, request.type)
    return {"outline": outline}


@router.post("/generate")
def generate_content(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content for all sections/slides in a project"""
    # Get project
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Parse outline
    outline = json.loads(project.outline) if project.outline else []
    
    if not outline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project has no outline defined"
        )
    
    # Generate content for each section
    generated_sections = []
    context = ""
    
    for i, section_title in enumerate(outline):
        content = ai_service.generate_section_content(
            topic=project.topic,
            section_title=section_title,
            doc_type=project.type,
            context=context if i > 0 else None
        )
        
        generated_sections.append({
            "title": section_title,
            "content": content,
            "index": i
        })
        
        # Build context for next section
        context = f"{context}\n{section_title}: {content[:200]}..."
    
    # Save generated content
    project.generated_content = json.dumps(generated_sections)
    db.commit()
    
    return {
        "message": "Content generated successfully",
        "sections": generated_sections
    }


@router.post("/refine")
def refine_content(
    request: RefineContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refine content for a specific section"""
    # Get project
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Parse generated content
    generated_content = json.loads(project.generated_content) if project.generated_content else []
    
    if not generated_content or request.section_index >= len(generated_content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid section index"
        )
    
    # Get current section
    section = generated_content[request.section_index]
    original_content = section['content']
    
    # Refine content
    if request.feedback == 'like':
        # If user likes it, don't change content, just record feedback
        refined_content = original_content
    elif request.feedback == 'dislike' and request.comment:
        # If user dislikes and provides comment, use comment as instruction
        refined_content = ai_service.refine_content(
            original_content=original_content,
            refinement_prompt=request.comment,
            section_title=section['title']
        )
    else:
        # Standard refinement
        refined_content = ai_service.refine_content(
            original_content=original_content,
            refinement_prompt=request.refinement_prompt,
            section_title=section['title']
        )
    
    # Update section content and metadata
    section['content'] = refined_content
    if request.feedback:
        section['feedback'] = request.feedback
        if request.feedback == 'dislike' and request.comment:
            section['comment'] = request.comment
        
    generated_content[request.section_index] = section
    
    # Save updated content
    project.generated_content = json.dumps(generated_content)
    
    # Update refinement history
    refinement_history = json.loads(project.refinement_history) if project.refinement_history else []
    refinement_history.append({
        "section_index": request.section_index,
        "timestamp": datetime.utcnow().isoformat(),
        "prompt": request.refinement_prompt,
        "feedback": request.feedback,
        "comment": request.comment,
        "original_content": original_content[:100] + "...",
        "refined_content": refined_content[:100] + "..."
    })
    project.refinement_history = json.dumps(refinement_history)
    
    db.commit()
    
    return {
        "message": "Content refined successfully",
        "section": section
    }
