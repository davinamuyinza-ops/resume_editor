const API_BASE_URL = "http://127.0.0.1:8200";

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

export async function renderPreview(resumeJson) {
    const response = await fetch(`${API_BASE_URL}/render-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: resumeJson }),
    });

    if (!response.ok) {
        throw new Error(await readErrorDetail(response));
    }

    return response.text();
}

export async function exportPdf(resumeJson) {
    const response = await fetch(`${API_BASE_URL}/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: resumeJson }),
    });

    if (!response.ok) {
        throw new Error(await readErrorDetail(response));
    }

    return response.blob();
}

export async function checkAts(resumeJson) {
    const response = await fetch(`${API_BASE_URL}/ats-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: resumeJson }),
    });

    if (!response.ok) {
        throw new Error(await readErrorDetail(response));
    }

    return response.json();
}
