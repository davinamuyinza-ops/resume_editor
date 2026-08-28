from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.sync_api import sync_playwright

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "resume_templates"
ALLOWED_TEMPLATES = {"classic", "sidebar"}

DEFAULT_SECTION_ORDER = [
    "summary", "experience", "education", "projects",
    "skills", "languages", "volunteer", "certifications",
]

DEFAULT_STYLE = {
    "pageFormat": "a4",
    "fontFamily": "Lato, 'Segoe UI', Arial, sans-serif",
    "fontSize": "9.5pt",
    "primaryColor": "#0f3381",
    "margin": "14mm 16mm",
    "lineHeight": "1.45",
    "sectionSpacing": 20,
    "skillsLayout": "stacked",
    "languagesLayout": "stacked",
    "bodyFontWeight": 400,
    "headingFontFamily": "Lato, 'Segoe UI', Arial, sans-serif",
    "headingFontSize": "10pt",
    "headingLineHeight": "1.3",
    "headingFontWeight": 700,
}

# Playwright's PDF engine needs a concrete page size. "free" is approximated
# as one generously tall page rather than true infinite/auto height, since
# there's no standard CSS @page size that means "grow to fit content".
PAGE_SIZE_CSS = {
    "a4": "A4",
    "letter": "Letter",
    "free": "215mm 3000mm",
}

_jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


def _resolve_style(resume_json: dict) -> dict:
    metadata = resume_json.get("metadata") or {}

    style = dict(DEFAULT_STYLE)
    for key in style:
        value = metadata.get(key)
        if value:
            style[key] = value

    style["pageSize"] = PAGE_SIZE_CSS.get(style["pageFormat"], "A4")

    return style


def _resolve_section_order(resume_json: dict) -> list:
    metadata = resume_json.get("metadata") or {}
    order = metadata.get("sectionOrder")

    if isinstance(order, list) and order:
        return order

    return DEFAULT_SECTION_ORDER


def render_resume_html(resume_json: dict, for_print: bool = False) -> str:
    metadata = resume_json.get("metadata") or {}
    template_name = metadata.get("template", "classic")

    # Resume JSON can arrive from other tools (the main app, real Reactive
    # Resume exports) carrying template names this editor doesn't have -
    # fall back to a known default rather than hard-failing the preview.
    if template_name not in ALLOWED_TEMPLATES:
        template_name = "classic"

    jinja_template = _jinja_env.get_template(f"{template_name}.html")
    style = _resolve_style(resume_json)
    section_order = _resolve_section_order(resume_json)

    return jinja_template.render(
        resume=resume_json, style=style, section_order=section_order, for_print=for_print
    )


def render_resume_pdf(resume_json: dict) -> bytes:
    # CSS padding on a fragmented box (like <body>) only renders at the very
    # start and end of the whole flow, not at each internal page break - so
    # margin has to come from real @page margin here, which Chromium's print
    # engine does repeat on every page. The plain HTML preview has no such
    # per-page concept, so it keeps using body padding (see the templates'
    # `for_print` branch) - switching both to @page would leave the preview
    # with no visible margin at all, since @page is a print-only rule.
    html_content = render_resume_html(resume_json, for_print=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.set_content(html_content, wait_until="load")
        pdf_bytes = page.pdf(print_background=True, prefer_css_page_size=True)
        browser.close()

    return pdf_bytes
