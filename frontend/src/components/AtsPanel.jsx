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

function scoreClass(score) {
    if (score >= 80) return "score-good";
    if (score >= 50) return "score-medium";
    return "score-poor";
}

export default function AtsPanel() {
    const resume = useResumeStore((state) => state.resume);
    const { t } = useTranslation();
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCheck() {
        setLoading(true);
        setError("");
        try {
            const data = await checkAts(resume, jobDescription);
            setResult(data);
        } catch {
            setError(t("ats.error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ats-panel">
            <label className="item-field item-field-full">
                <span>{t("ats.jobDescriptionLabel")}</span>
                <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={t("ats.jobDescriptionPlaceholder")}
                />
            </label>

            <button className="secondary-action" onClick={handleCheck} disabled={loading}>
                {loading ? t("ats.checking") : t("ats.check")}
            </button>

            {error && <p className="entry-error">{error}</p>}

            {result && (
                <div className="ats-results">
                    <div className="ats-score-row">
                        <div className={`ats-score-badge ${scoreClass(result.score)}`}>{result.score}</div>
                        <span className="ats-score-label">{t("ats.scoreLabel")}</span>
                    </div>

                    {result.keyword_match && (
                        <div className="ats-keyword-match">
                            <div className="ats-score-row">
                                <div className={`ats-score-badge ${scoreClass(result.keyword_match.match_score)}`}>
                                    {result.keyword_match.match_score}%
                                </div>
                                <span className="ats-score-label">{t("ats.keywordMatchLabel")}</span>
                            </div>

                            {result.keyword_match.matched_keywords?.length > 0 && (
                                <div className="ats-keyword-group">
                                    <span className="ats-keyword-group-title">{t("ats.matchedKeywords")}</span>
                                    <div className="ats-keyword-chips">
                                        {result.keyword_match.matched_keywords.map((kw) => (
                                            <span key={kw} className="ats-keyword-chip matched">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.keyword_match.missing_keywords?.length > 0 && (
                                <div className="ats-keyword-group">
                                    <span className="ats-keyword-group-title">{t("ats.missingKeywords")}</span>
                                    <div className="ats-keyword-chips">
                                        {result.keyword_match.missing_keywords.map((kw) => (
                                            <span key={kw} className="ats-keyword-chip missing">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
