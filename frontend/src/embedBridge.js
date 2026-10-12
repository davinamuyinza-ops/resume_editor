import { setAuthToken, setTokenRequester } from "./api.js";
import { useResumeStore } from "./store/resumeStore.js";
import { useSourceJobStore } from "./store/sourceJobStore.js";

// Local-dev-only for now - the main app isn't deployed anywhere yet, so this
// stays a single hardcoded origin until production hosting is decided.
const MAIN_APP_ORIGIN = "http://localhost:5500";

export function isEmbedded() {
    return window !== window.parent;
}

function postToParent(message) {
    if (!isEmbedded()) return;
    window.parent.postMessage(message, MAIN_APP_ORIGIN);
}

export function initEmbedBridge() {
    window.addEventListener("message", (event) => {
        if (event.origin !== MAIN_APP_ORIGIN) return;

        if (event.data?.type === "auth-token" && event.data.token) {
            setAuthToken(event.data.token);
        }

        if (event.data?.type === "load-resume" && event.data.resume) {
            useResumeStore.getState().setResume(event.data.resume);
            useSourceJobStore.getState().setJobDescription(event.data.jobDescription || null);
        }
    });

    // Lets api.js ask the host app for a fresh login token when needed.
    if (isEmbedded()) {
        setTokenRequester(() => postToParent({ type: "token-needed" }));
        // Tell the host the listener is live so it (re)sends the token.
        postToParent({ type: "editor-ready" });
    }
}

export function sendResumeToMainApp(resume) {
    postToParent({ type: "resume-updated", resume });
}
