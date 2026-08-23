const API_BASE_URL = "http://127.0.0.1:8200";

export async function renderPreview(resumeJson) {
    const response = await fetch(`${API_BASE_URL}/render-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_json: resumeJson }),
    });

    if (!response.ok) {
        throw new Error("Could not render preview.");
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
        throw new Error("Could not export PDF.");
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
        throw new Error("Could not run ATS check.");
    }

    return response.json();
}
