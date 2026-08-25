import json
import re

from app.services.ai_client import client, clean_ai_json

ATS_SAFE_FONTS = {
    "arial", "calibri", "georgia", "helvetica", "times new roman",
    "verdana", "lato", "open sans", "roboto", "segoe ui",
}

DECORATIVE_BULLET_PATTERN = re.compile(r"[●➤✓★▪◆➢]")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

STANDARD_SECTION_NAMES = {
    "experience": ["experience", "work experience", "employment", "berufserfahrung", "erfahrung"],
    "education": ["education", "bildung", "ausbildung"],
    "skills": ["skills", "fähigkeiten", "kenntnisse"],
    "languages": ["languages", "sprachen"],
    "projects": ["projects", "projekte"],
    "volunteer": ["volunteer", "volunteering", "freiwilligenarbeit", "freiwilliges engagement"],
    "certifications": ["certifications", "certificates", "zertifikate", "zertifizierungen"],
}

# Points deducted per finding severity when computing the overall score.
# "info" findings are context, not real problems, so they don't cost points.
SEVERITY_PENALTY = {"high": 20, "medium": 10, "low": 5, "info": 0}

ATS_REPORT_PROMPT = """
You are an ATS (Applicant Tracking System) expert advising a candidate on how
their resume would actually fare when it's parsed and screened by a real ATS
(e.g. Workday, Taleo, iCIMS, Greenhouse) before a human ever sees it.

You will receive a JSON object with:
- "score": an overall 0-100 ATS-compatibility score already computed by rule-based checks
- "findings": the list of issues those rule-based checks detected in the resume's
  layout, structure, and content (not a full rewrite of the resume text)
- "keyword_match" (optional): if the candidate supplied a target job description,
  this holds a match score plus which important keywords from that job description
  were found in the resume and which were missing

Write a short, clear, plain-English report written directly to the candidate.
Rules:

- Open with one sentence giving your overall read of how the resume would perform
  going through an ATS, consistent with the score.
- Group related findings together rather than listing them as disconnected bullets.
- For each finding, briefly explain WHY it matters for ATS parsing, and what they
  could do about it if they choose to.
- Where a finding's severity is "info" rather than a hard problem (e.g. a photo,
  which is normal in many European markets but can trip up some US-based ATS
  systems), present it as context to weigh, not as an instruction to remove it.
- If "keyword_match" is present, discuss it: call out a few of the most important
  missing keywords and suggest how the candidate could naturally work them in
  (only if truthful to their real experience - never suggest fabricating skills).
- Be concise and specific - no generic filler like "resumes are important."
- If the findings list is empty and there's no keyword_match, write one short
  sentence confirming no issues were detected.
- Return plain text only, no markdown headers, no JSON.
"""

KEYWORD_EXTRACTION_PROMPT = """
You are an ATS keyword-matching engine, the same kind of system a real
Applicant Tracking System uses to score a resume against a job description.

You will receive a job description and a candidate's resume content (plain
text extracted from their resume).

Identify the 12-18 most important skills, tools, qualifications, and role-specific
terms a real ATS would scan the job description for, then check which of those
terms are genuinely present in the resume text (allow for close variants and
common abbreviations, e.g. "JavaScript" matches "JS").

Return strict JSON only, no markdown, no commentary, in exactly this shape:
{
  "matched_keywords": ["...", "..."],
  "missing_keywords": ["...", "..."],
  "match_score": 0
}

"match_score" is matched_keywords.length / (matched_keywords.length + missing_keywords.length)
as an integer percentage (0-100). Never invent keywords that aren't genuinely
relevant to the job description.
"""


def _run_rule_checks(resume_json: dict) -> list[dict]:
    findings = []
    metadata = resume_json.get("metadata") or {}
    template = metadata.get("template", "classic")
    basics = resume_json.get("basics") or {}
    sections = resume_json.get("sections") or {}

    if template == "sidebar":
        findings.append({
            "id": "multi_column_layout",
            "severity": "high",
            "message": (
                "This template uses a multi-column layout (a sidebar). Many ATS "
                "parsers read a page left-to-right, top-to-bottom as a single "
                "stream, so sidebar content like skills or contact info can end "
                "up jumbled or lost entirely."
            ),
        })

    email = (basics.get("email") or "").strip()
    if not email or not EMAIL_PATTERN.match(email):
        findings.append({
            "id": "missing_or_invalid_email",
            "severity": "high",
            "message": (
                "No valid email address was found. ATS systems and recruiters "
                "extract this field automatically to contact candidates - a "
                "missing or malformed email can mean you're never reached even "
                "if you're otherwise qualified."
            ),
        })

    if not (basics.get("phone") or "").strip():
        findings.append({
            "id": "missing_phone",
            "severity": "medium",
            "message": (
                "No phone number was found. Some ATS systems and most "
                "recruiters expect this as a standard contact field."
            ),
        })

    experience = sections.get("experience") or {}
    if experience.get("hidden") or not (experience.get("items") or []):
        findings.append({
            "id": "empty_experience",
            "severity": "high",
            "message": (
                "The Experience section is empty or hidden. This is usually the "
                "section an ATS weighs most heavily, and its absence can cause "
                "an automatic screen-out regardless of your other qualifications."
            ),
        })

    picture = resume_json.get("picture") or {}
    if not picture.get("hidden") and picture.get("url"):
        findings.append({
            "id": "photo_present",
            "severity": "info",
            "message": (
                "A photo is included. Some ATS systems, especially in the US, "
                "can't parse images and may discard that area of the page - "
                "though a photo is common and often expected on CVs in Germany "
                "and much of Europe, so this may not apply to you."
            ),
        })

    font_family = (metadata.get("fontFamily") or "").split(",")[0].strip().strip("'\"").lower()
    if font_family and font_family not in ATS_SAFE_FONTS:
        findings.append({
            "id": "unusual_font",
            "severity": "medium",
            "message": (
                f"The chosen font ('{font_family}') isn't one of the "
                "well-established ATS-safe fonts. Decorative or uncommon fonts "
                "can render incorrectly or fail to parse in some systems."
            ),
        })

    for key, expected_names in STANDARD_SECTION_NAMES.items():
        section = sections.get(key)
        if not section or section.get("hidden"):
            continue

        title = (section.get("title") or "").strip().lower()
        if title and not any(name in title for name in expected_names):
            findings.append({
                "id": f"nonstandard_title_{key}",
                "severity": "low",
                "message": (
                    f"The '{key}' section is titled '{section.get('title')}', "
                    "which isn't a standard heading. Some ATS parsers rely on "
                    "recognizable section titles to categorize content correctly."
                ),
            })

    has_decorative_bullets = any(
        DECORATIVE_BULLET_PATTERN.search(item.get("description") or "")
        for section in sections.values()
        for item in (section.get("items") or [])
    )
    if has_decorative_bullets:
        findings.append({
            "id": "decorative_bullets",
            "severity": "low",
            "message": (
                "Some bullet points use decorative characters (e.g. ●, ➤, ✓) "
                "instead of standard list formatting. These can appear as "
                "garbled symbols or get dropped entirely by ATS parsers."
            ),
        })

    return findings


def _compute_score(findings: list[dict]) -> int:
    score = 100
    for finding in findings:
        score -= SEVERITY_PENALTY.get(finding.get("severity"), 0)
    return max(0, min(100, score))


def _collect_resume_text(resume_json: dict) -> str:
    """Plain-text approximation of what an ATS parser would actually extract,
    used only for keyword matching - not the full render pipeline."""
    parts = []
    basics = resume_json.get("basics") or {}
    parts.append(basics.get("headline") or "")

    summary = resume_json.get("summary") or {}
    parts.append(re.sub(r"<[^>]+>", " ", summary.get("content") or ""))

    for section in (resume_json.get("sections") or {}).values():
        for item in section.get("items") or []:
            for field in ("position", "company", "school", "degree", "area", "name", "organization"):
                if item.get(field):
                    parts.append(str(item[field]))
            if item.get("description"):
                parts.append(re.sub(r"<[^>]+>", " ", item["description"]))
            if item.get("keywords"):
                parts.append(", ".join(item["keywords"]))

    return "\n".join(p for p in parts if p)


def _match_job_description(resume_json: dict, job_description: str) -> dict:
    resume_text = _collect_resume_text(resume_json)

    response = client.responses.create(
        model="gpt-4.1-mini",
        temperature=0,
        input=[
            {"role": "system", "content": KEYWORD_EXTRACTION_PROMPT},
            {
                "role": "user",
                "content": json.dumps(
                    {"job_description": job_description, "resume_text": resume_text},
                    ensure_ascii=False,
                ),
            },
        ],
    )

    return json.loads(clean_ai_json(response.output_text))


def check_ats_friendliness(resume_json: dict, job_description: str | None = None) -> dict:
    findings = _run_rule_checks(resume_json)
    score = _compute_score(findings)

    keyword_match = None
    if job_description and job_description.strip():
        keyword_match = _match_job_description(resume_json, job_description)

    if not findings and not keyword_match:
        return {
            "findings": [],
            "score": score,
            "keyword_match": None,
            "report": "No ATS-friendliness issues were detected in the current layout and styling.",
        }

    payload = {"score": score, "findings": findings}
    if keyword_match:
        payload["keyword_match"] = keyword_match

    response = client.responses.create(
        model="gpt-4.1-mini",
        temperature=0,
        input=[
            {"role": "system", "content": ATS_REPORT_PROMPT},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
    )

    report = clean_ai_json(response.output_text)

    return {"findings": findings, "score": score, "keyword_match": keyword_match, "report": report}
