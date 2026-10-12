import copy

from app.services.ats_check import _compute_score, _run_rule_checks


def ids(findings):
    return {finding["id"] for finding in findings}


def test_clean_resume_has_no_findings(good_resume):
    assert _run_rule_checks(good_resume) == []
    assert _compute_score([]) == 100


def test_sidebar_template_is_flagged_high(good_resume):
    good_resume["metadata"]["template"] = "sidebar"
    findings = _run_rule_checks(good_resume)
    assert [f for f in findings if f["id"] == "multi_column_layout"][0]["severity"] == "high"


def test_classic_template_is_not_flagged_as_multi_column(good_resume):
    assert "multi_column_layout" not in ids(_run_rule_checks(good_resume))


def test_missing_and_malformed_email_are_flagged(good_resume):
    for bad in ("", "   ", "not-an-email", "a@b"):
        good_resume["basics"]["email"] = bad
        assert "missing_or_invalid_email" in ids(_run_rule_checks(good_resume)), bad


def test_missing_phone_is_flagged(good_resume):
    good_resume["basics"]["phone"] = ""
    assert "missing_phone" in ids(_run_rule_checks(good_resume))


def test_empty_or_hidden_experience_is_flagged(good_resume):
    empty = copy.deepcopy(good_resume)
    empty["sections"]["experience"]["items"] = []
    assert "empty_experience" in ids(_run_rule_checks(empty))

    hidden = copy.deepcopy(good_resume)
    hidden["sections"]["experience"]["hidden"] = True
    assert "empty_experience" in ids(_run_rule_checks(hidden))


def test_visible_photo_is_info_only_and_costs_no_points(good_resume):
    good_resume["picture"] = {"hidden": False, "url": "https://example.com/me.jpg"}
    findings = _run_rule_checks(good_resume)
    photo = [f for f in findings if f["id"] == "photo_present"][0]
    assert photo["severity"] == "info"
    assert _compute_score(findings) == 100


def test_hidden_photo_is_not_flagged(good_resume):
    good_resume["picture"] = {"hidden": True, "url": "https://example.com/me.jpg"}
    assert "photo_present" not in ids(_run_rule_checks(good_resume))


def test_unusual_font_is_flagged_but_safe_fonts_pass(good_resume):
    good_resume["metadata"]["fontFamily"] = "Papyrus"
    assert "unusual_font" in ids(_run_rule_checks(good_resume))

    for safe in ("Arial", "'Lato', sans-serif", "Open Sans"):
        good_resume["metadata"]["fontFamily"] = safe
        assert "unusual_font" not in ids(_run_rule_checks(good_resume)), safe


def test_nonstandard_section_title_is_flagged(good_resume):
    good_resume["sections"]["education"]["title"] = "My Learning Journey"
    assert "nonstandard_title_education" in ids(_run_rule_checks(good_resume))


def test_german_standard_titles_are_accepted(good_resume):
    good_resume["sections"]["experience"]["title"] = "Berufserfahrung"
    good_resume["sections"]["education"]["title"] = "Bildung"
    assert not any(i.startswith("nonstandard_title") for i in ids(_run_rule_checks(good_resume)))


def test_decorative_bullets_are_flagged(good_resume):
    good_resume["sections"]["experience"]["items"][0]["description"] = "<p>➤ Did a thing</p>"
    assert "decorative_bullets" in ids(_run_rule_checks(good_resume))


def test_score_deducts_by_severity_and_never_goes_below_zero():
    assert _compute_score([{"severity": "high"}]) == 80
    assert _compute_score([{"severity": "medium"}, {"severity": "low"}]) == 85
    assert _compute_score([{"severity": "high"}] * 20) == 0


def test_every_finding_comes_with_a_suggested_fix(good_resume):
    # Trip every rule at once, then confirm none is missing its "fix" text
    # (the Suggested Fixes checklist relies on it).
    broken = copy.deepcopy(good_resume)
    broken["basics"] = {"email": "", "phone": ""}
    broken["picture"] = {"hidden": False, "url": "https://example.com/x.jpg"}
    broken["metadata"] = {"template": "sidebar", "fontFamily": "Papyrus"}
    broken["sections"]["experience"] = {"title": "Stuff", "items": []}
    broken["sections"]["education"]["title"] = "Learning"
    broken["sections"]["skills"] = {
        "title": "Things", "items": [{"id": "s1", "description": "● bullet"}],
    }

    findings = _run_rule_checks(broken)

    assert len(findings) >= 8
    assert all(f.get("fix") for f in findings), [f["id"] for f in findings if not f.get("fix")]
