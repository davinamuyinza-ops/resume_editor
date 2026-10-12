const API_BASE_URL = "http://127.0.0.1:8200";

// The editor has no login of its own. The host app passes the user's login
// token in (see embedBridge.js) and every backend call carries it.
let authToken = null;
let tokenRequester = null;
let tokenWaiters = [];

export class AuthError extends Error {
    constructor() {
        super("Session expired");
        this.name = "AuthError";
    }
}

export function setAuthToken(token) {
    authToken = token;
    tokenWaiters.forEach((resolve) => resolve());
    tokenWaiters = [];
}

// embedBridge registers how to ask the host app for a fresh token.
export function setTokenRequester(requester) {
    tokenRequester = requester;
}

function waitForNewToken(timeoutMs) {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, timeoutMs);
        tokenWaiters.push(() => {
            clearTimeout(timer);
            resolve();
        });
    });
}

async function readErrorDetail(response) {
    try {
        const data = await response.json();
        if (typeof data.detail === "string") return data.detail;
        if (data.detail?.message) return data.detail.message;
        return JSON.stringify(data.detail || data);
    } catch {
        return `Server responded with ${response.status}.`;
    }
}

function sendPost(path, body) {
    const headers = { "Content-Type": "application/json" };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    return fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
}

// One place for every backend call: attaches the token and, if the backend
// says it's missing/expired (Supabase tokens last about an hour), asks the
// host app for a fresh one and retries once before giving up.
async function authedPost(path, body) {
    if (!authToken && tokenRequester) {
        tokenRequester();
        await waitForNewToken(2500);
    }

    let response = await sendPost(path, body);

    if (response.status === 401 && tokenRequester) {
        tokenRequester();
        await waitForNewToken(2500);
        response = await sendPost(path, body);
    }

    if (response.status === 401) {
        throw new AuthError();
    }

    if (!response.ok) {
        throw new Error(await readErrorDetail(response));
    }

    return response;
}

export async function renderPreview(resumeJson) {
    const response = await authedPost("/render-preview", { resume_json: resumeJson });
    return response.text();
}

export async function exportPdf(resumeJson) {
    const response = await authedPost("/export-pdf", { resume_json: resumeJson });
    return response.blob();
}

export async function suggestFix(resumeJson, finding, jobDescription) {
    const response = await authedPost("/suggest-fix", {
        resume_json: resumeJson,
        finding_id: finding.id,
        finding_message: finding.message,
        finding_fix: finding.fix || "",
        job_description: jobDescription || null,
    });
    return response.json();
}

export async function checkAts(resumeJson, jobDescription) {
    const response = await authedPost("/ats-check", {
        resume_json: resumeJson,
        job_description: jobDescription || null,
    });
    return response.json();
}
