from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.ats_check import check_ats_friendliness, propose_fix
from app.services.resume_render import render_resume_html, render_resume_pdf

router = APIRouter()


class ResumeRequest(BaseModel):
    resume_json: dict


class AtsCheckRequest(BaseModel):
    resume_json: dict
    job_description: str | None = None


class SuggestFixRequest(BaseModel):
    resume_json: dict
    finding_id: str
    finding_message: str
    finding_fix: str = ""
    job_description: str | None = None


@router.post("/render-preview")
def render_preview(payload: ResumeRequest):
    html_content = render_resume_html(payload.resume_json)
    return Response(content=html_content, media_type="text/html")


@router.post("/export-pdf")
def export_pdf(payload: ResumeRequest):
    pdf_bytes = render_resume_pdf(payload.resume_json)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"},
    )


@router.post("/ats-check")
def ats_check(payload: AtsCheckRequest):
    return check_ats_friendliness(payload.resume_json, payload.job_description)


@router.post("/suggest-fix")
def suggest_fix(payload: SuggestFixRequest):
    return propose_fix(
        payload.resume_json,
        payload.finding_id,
        payload.finding_message,
        payload.finding_fix,
        payload.job_description,
    )
