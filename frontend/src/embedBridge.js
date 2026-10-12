import { useResumeStore } from "./store/resumeStore.js";
import { useSourceJobStore } from "./store/sourceJobStore.js";

// Local-dev-only for now - the main app isn't deployed anywhere yet, so this
// stays a single hardcoded origin until production hosting is decided.
const MAIN_APP_ORIGIN = "http://localhost:5500";

export function isEmbedded() {
    return window !== window.parent;
}

export function initEmbedBridge() {
    window.addEventListener("message", (event) => {
        if (event.origin !== MAIN_APP_ORIGIN) return;
        if (event.data?.type === "load-resume" && event.data.resume) {
            useResumeStore.getState().setResume(event.data.resume);
            useSourceJobStore.getState().setJobDescription(event.data.jobDescription || null);
        }
    });
}

export function sendResumeToMainApp(resume) {
    if (!isEmbedded()) return;
    window.parent.postMessage({ type: "resume-updated", resume }, MAIN_APP_ORIGIN);
}
