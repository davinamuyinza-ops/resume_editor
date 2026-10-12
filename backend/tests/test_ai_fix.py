import json

from app.services import ats_check
from tests.conftest import FakeOpenAiClient


def use_fake_ai(monkeypatch, reply) -> FakeOpenAiClient:
    text = reply if isinstance(reply, str) else json.dumps(reply)
    fake = FakeOpenAiClient(text)
    monkeypatch.setattr(ats_check, "client", fake)
    return fake


def propose(resume, finding_id="unusual_font"):
    return ats_check.propose_fix(resume, finding_id, "message", "fix")


def test_valid_edit_is_returned_as_a_proposal(monkeypatch, good_resume):
    use_fake_ai(monkeypatch, {
        "can_fix": True,
        "explanation": "Switch to Arial.",
        "edits": [{"action": "updateMetadataField", "field": "fontFamily", "value": "Arial"}],
    })

    result = propose(good_resume)

    assert result["can_fix"] is True
    assert result["edits"] == [{"action": "updateMetadataField", "field": "fontFamily", "value": "Arial"}]


def test_actions_outside_the_allowed_vocabulary_are_dropped(monkeypatch, good_resume):
    use_fake_ai(monkeypatch, {
        "can_fix": True,
        "explanation": "x",
        "edits": [
            {"action": "deleteEverything"},
            {"action": "updateSectionTitle", "sectionKey": "skills", "title": "Skills"},
        ],
    })

    result = propose(good_resume)

    assert [e["action"] for e in result["edits"]] == ["updateSectionTitle"]


def test_a_proposal_with_only_invalid_actions_becomes_a_refusal(monkeypatch, good_resume):
    use_fake_ai(monkeypatch, {"can_fix": True, "explanation": "x", "edits": [{"action": "hackTheServer"}]})

    result = propose(good_resume)

    assert result["can_fix"] is False
    assert "edits" not in result


def test_refusal_passes_through_without_edits(monkeypatch, good_resume):
    use_fake_ai(monkeypatch, {"can_fix": False, "explanation": "Add your phone number yourself."})

    result = propose(good_resume, "missing_phone")

    assert result == {"can_fix": False, "explanation": "Add your phone number yourself."}


def test_refusal_cannot_smuggle_edits_through(monkeypatch, good_resume):
    use_fake_ai(monkeypatch, {
        "can_fix": False,
        "explanation": "no",
        "edits": [{"action": "updateSummaryContent", "content": "<p>invented</p>"}],
    })

    assert "edits" not in propose(good_resume)


def test_markdown_fenced_json_is_still_understood(monkeypatch, good_resume):
    use_fake_ai(monkeypatch, '```json\n{"can_fix": false, "explanation": "needs you"}\n```')

    assert propose(good_resume)["can_fix"] is False


def test_job_description_is_only_sent_when_provided(monkeypatch, good_resume):
    fake = use_fake_ai(monkeypatch, {"can_fix": False, "explanation": "x"})

    ats_check.propose_fix(good_resume, "missing_keywords", "m", "f", None)
    ats_check.propose_fix(good_resume, "missing_keywords", "m", "f", "We need Python")

    without, with_jd = (json.loads(call["input"][1]["content"]) for call in fake.calls)
    assert "job_description" not in without
    assert with_jd["job_description"] == "We need Python"


def test_prompt_forbids_inventing_facts():
    # The safety rule that stops the AI fabricating contact details or
    # experience must stay in the prompt; guard against it being edited out.
    assert "NEVER invent facts" in ats_check.AI_FIX_PROMPT
    assert "can_fix false" in ats_check.AI_FIX_PROMPT


def test_clean_resume_without_job_description_makes_no_ai_call(monkeypatch, good_resume):
    fake = use_fake_ai(monkeypatch, "should not be used")

    result = ats_check.check_ats_friendliness(good_resume, None)

    assert result["score"] == 100
    assert result["findings"] == []
    assert fake.calls == []
