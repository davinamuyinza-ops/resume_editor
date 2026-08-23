import { useState } from "react";

import { SAMPLE_RESUME } from "../sampleResume.js";
import { useResumeStore } from "../store/resumeStore.js";

export default function EntryScreen() {
    const setResume = useResumeStore((state) => state.setResume);
    const [pastedJson, setPastedJson] = useState("");
    const [error, setError] = useState("");

    function loadFromObject(resumeObject) {
        if (!resumeObject.metadata) {
            resumeObject.metadata = {};
        }
        if (!resumeObject.metadata.template) {
            resumeObject.metadata.template = "classic";
        }
        setResume(resumeObject);
        setError("");
    }

    function handleLoadPasted() {
        try {
            const parsed = JSON.parse(pastedJson);
            loadFromObject(parsed);
        } catch {
            setError("That doesn't look like valid JSON. Check for a missing bracket or comma.");
        }
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                loadFromObject(parsed);
            } catch {
                setError("That file doesn't look like valid resume JSON.");
            }
        };
        reader.readAsText(file);
    }

    return (
        <main className="entry-screen">
            <div className="entry-card">
                <h1>AI Resume Design Editor</h1>
                <p className="entry-subtitle">
                    Load a resume JSON to start designing - drag sections, adjust fonts and colors, and export a
                    polished PDF.
                </p>

                <button className="secondary-action" onClick={() => loadFromObject(structuredClone(SAMPLE_RESUME))}>
                    Load Sample Resume
                </button>

                <div className="entry-divider">or</div>

                <label className="entry-label" htmlFor="jsonPaste">Paste resume JSON</label>
                <textarea
                    id="jsonPaste"
                    rows={8}
                    value={pastedJson}
                    onChange={(event) => setPastedJson(event.target.value)}
                    placeholder="Paste the JSON downloaded from your master resume..."
                />
                <button className="primary-action" onClick={handleLoadPasted} disabled={!pastedJson.trim()}>
                    Load Pasted JSON
                </button>

                <div className="entry-divider">or</div>

                <label className="entry-label" htmlFor="jsonUpload">Upload a .json file</label>
                <input id="jsonUpload" type="file" accept=".json" onChange={handleFileUpload} />

                {error && <p className="entry-error">{error}</p>}
            </div>
        </main>
    );
}
