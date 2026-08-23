import json
import re

from app.services.ai_client import client, clean_ai_json

ATS_SAFE_FONTS = {
    "arial", "calibri", "georgia", "helvetica", "times new roman",
    "verdana", "lato", "open sans", "roboto", "segoe ui",
}

DECORATIVE_BULLET_PATTERN = re.compile(r"[●➤✓★▪◆➢]")

STANDARD_SECTION_NAMES = {
    "experience": ["experience", "work experience", "employment", "berufserfahrung", "erfahrung"],
    "education": ["education", "bildung", "ausbildung"],
    "skills": ["skills", "fähigkeiten", "kenntnisse"],
    "languages": ["languages", "sprachen"],
    "projects": ["projects", "projekte"],
    "volunteer": ["volunteer", "volunteering", "freiwilligenarbeit", "freiwilliges engagement"],
    "certifications": ["certifications", "certificates", "zertifikate", "zertifizierungen"],
}

ATS_REPORT_PROMPT = """
You are an ATS (Applicant Tracking System) formatting advisor.

You will receive a JSON list of "findings" - issues already detected by rule-based
checks against a candidate's resume layout and styling (not its content).

Write a short, clear, plain-English report explaining these findings to the
candidate. Rules:

- Group related findings together rather than listing them as disconnected bullets.
- For each finding, briefly explain WHY it matters for ATS parsing, and what they
  could do about it if they choose to.
- Where a finding's severity is "info" rather than a hard problem (e.g. a photo,
  which is normal in many European markets but can trip up some US-based ATS
  systems), present it as context to weigh, not as an instruction to remove it.
- Be concise and specific - no generic filler like "resumes are important."
- If the findings list is empty, write one short sentence confirming no issues
  were detected.
- Return plain text only, no markdown headers, no JSON.
"""


def _run_rule_checks(resume_json: dict) -> list[dict]:
    findings = []
    metadata = resume_json.get("metadata") or {}
    template = metadata.get("template", "classic")

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

    sections = resume_json.get("sections") or {}

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


def check_ats_friendliness(resume_json: dict) -> dict:
    findings = _run_rule_checks(resume_json)

    if not findings:
        return {
            "findings": [],
            "report": "No ATS-friendliness issues were detected in the current layout and styling.",
        }

    response = client.responses.create(
        model="gpt-4.1-mini",
        temperature=0,
        input=[
            {"role": "system", "content": ATS_REPORT_PROMPT},
            {
                "role": "user",
                "content": json.dumps({"findings": findings}, ensure_ascii=False),
            },
        ],
    )

    report = clean_ai_json(response.output_text)

    return {"findings": findings, "report": report}
