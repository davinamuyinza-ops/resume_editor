import { useState } from "react";

import { checkAts } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";

const SEVERITY_LABELS = { high: "High", medium: "Medium", low: "Low", info: "Info" };

export default function AtsPanel() {
    const resume = useResumeStore((state) => state.resume);
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
            setError("Could not run the ATS check right now.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ats-panel">
            <button className="secondary-action" onClick={handleCheck} disabled={loading}>
                {loading ? "Checking..." : "Check ATS Friendliness"}
            </button>

            {error && <p className="entry-error">{error}</p>}

            {result && (
                <div className="ats-results">
                    {result.findings.length > 0 && (
                        <ul className="ats-findings">
                            {result.findings.map((finding) => (
                                <li key={finding.id} className={`ats-finding severity-${finding.severity}`}>
                                    <span className="ats-severity-badge">{SEVERITY_LABELS[finding.severity]}</span>
                                    {finding.message}
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="ats-report">{result.report}</p>
                </div>
            )}
        </div>
    );
}
