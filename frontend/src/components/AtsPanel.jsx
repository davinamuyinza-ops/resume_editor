import { useState } from "react";

import { checkAts } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";

const SEVERITY_LABEL_KEYS = {
    high: "ats.severityHigh",
    medium: "ats.severityMedium",
    low: "ats.severityLow",
    info: "ats.severityInfo",
};

export default function AtsPanel() {
    const resume = useResumeStore((state) => state.resume);
    const { t } = useTranslation();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCheck() {
        setLoading(true);
        setError("");
        try {
            const data = await checkAts(resume);
            setResult(data);
        } catch {
            setError(t("ats.error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ats-panel">
            <button className="secondary-action" onClick={handleCheck} disabled={loading}>
                {loading ? t("ats.checking") : t("ats.check")}
            </button>

            {error && <p className="entry-error">{error}</p>}

            {result && (
                <div className="ats-results">
                    {result.findings.length > 0 && (
                        <ul className="ats-findings">
                            {result.findings.map((finding) => (
                                <li key={finding.id} className={`ats-finding severity-${finding.severity}`}>
                                    <span className="ats-severity-badge">{t(SEVERITY_LABEL_KEYS[finding.severity])}</span>
                                    {finding.message}
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="ats-report">{result.report}</p>
                    <p className="ats-report-note">{t("ats.reportNote")}</p>
                </div>
            )}
        </div>
    );
}
