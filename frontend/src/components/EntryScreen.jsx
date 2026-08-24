import { useState } from "react";

import { SAMPLE_RESUME } from "../sampleResume.js";
import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";

export default function EntryScreen() {
    const setResume = useResumeStore((state) => state.setResume);
    const { t } = useTranslation();
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
            setError(t("entry.errorInvalidJson"));
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
                setError(t("entry.errorInvalidFile"));
            }
        };
        reader.readAsText(file);
    }

    return (
        <main className="entry-screen">
            <div className="entry-card">
                <h1>{t("entry.title")}</h1>
                <p className="entry-subtitle">{t("entry.subtitle")}</p>

                <button className="secondary-action" onClick={() => loadFromObject(structuredClone(SAMPLE_RESUME))}>
                    {t("entry.loadSample")}
                </button>

                <div className="entry-divider">{t("entry.or")}</div>

                <label className="entry-label" htmlFor="jsonPaste">{t("entry.pasteLabel")}</label>
                <textarea
                    id="jsonPaste"
                    rows={8}
                    value={pastedJson}
                    onChange={(event) => setPastedJson(event.target.value)}
                    placeholder={t("entry.pastePlaceholder")}
                />
                <button className="primary-action" onClick={handleLoadPasted} disabled={!pastedJson.trim()}>
                    {t("entry.loadPasted")}
                </button>

                <div className="entry-divider">{t("entry.or")}</div>

                <label className="entry-label" htmlFor="jsonUpload">{t("entry.uploadLabel")}</label>
                <input id="jsonUpload" type="file" accept=".json" onChange={handleFileUpload} />

                {error && <p className="entry-error">{error}</p>}
            </div>
        </main>
    );
}
