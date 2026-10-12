# Running the tests

None of these tests use a real OpenAI key, Supabase account, or live
service. The AI is replaced by a fake client, so running them never costs
anything.

**Backend** (ATS rules, the AI-fix safety guardrails, login enforcement):

```bash
cd backend
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt   # once
.venv/Scripts/python.exe -m pytest
```

**Frontend** (how the editor attaches the login token, refreshes it when it
expires, and tells an expired session apart from a real server error):

```bash
cd frontend
npm test
```

Run both before every deploy. If you change how a rule works, change its
test in the same commit.
