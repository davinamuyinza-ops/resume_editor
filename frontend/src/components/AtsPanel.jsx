import { useState } from "react";

import { checkAts, suggestFix } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";
import { useSourceJobStore } from "../store/sourceJobStore.js";
import { useTranslation } from "../i18n.js";

const SEVERITY_LABEL_KEYS = {
    high: "ats.severityHigh",
    medium: "ats.severityMedium",
    low: "ats.severityLow",
    info: "ats.severityInfo",
};

// Each proposed edit maps 1:1 onto an existing store mutator, so applying
// one goes through the same undo-tracked path as a manual edit.
function applyEdit(edit) {
    const store = useResumeStore.getState();

    switch (edit.action) {
        case "updateSummaryContent":
            store.updateSummaryContent(edit.content);
            break;
        case "updateSectionTitle":
            store.updateSectionTitle(edit.sectionKey, edit.title);
            break;
        case "updateMetadataField":
            store.updateMetadataField(edit.field, edit.value);
            break;
        case "updatePictureField":
            store.updatePictureField(edit.field, edit.value);
            break;
        case "updateItemField":
            store.updateItemField(edit.sectionKey, edit.itemId, edit.field, edit.value);
            break;
        default:
            break;
    }
}

function editPreviewText(edit) {
    const raw = edit.content ?? edit.title ?? edit.value;
    if (typeof raw !== "string") return String(raw);
    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function scoreClass(score) {
    if (score >= 80) return "score-good";
    if (score >= 50) return "score-medium";
    return "score-poor";
}

export default function AtsPanel() {
    const resume = useResumeStore((state) => state.resume);
    const sourceJobDescription = useSourceJobStore((state) => state.jobDescription);
    const { t } = useTranslation();
    const [useSourceJob, setUseSourceJob] = useState(Boolean(sourceJobDescription));
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checkedFixes, setCheckedFixes] = useState(new Set());
    // id -> { loading, error, result }
    const [proposals, setProposals] = useState({});

    const effectiveJobDescription = useSourceJob && sourceJobDescription ? sourceJobDescription : jobDescription;

    function toggleFixChecked(id) {
        setCheckedFixes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function setProposal(id, value) {
        setProposals((prev) => ({ ...prev, [id]: value }));
    }

    async function handleAskAi(item) {
        setProposal(item.id, { loading: true });
        try {
            const result = await suggestFix(resume, item, effectiveJobDescription);
            setProposal(item.id, { result });
        } catch {
            setProposal(item.id, { error: true });
        }
    }

    function handleApply(item) {
        const proposal = proposals[item.id]?.result;
        if (!proposal?.edits) return;

        proposal.edits.forEach(applyEdit);
        setCheckedFixes((prev) => new Set(prev).add(item.id));
        setProposal(item.id, undefined);
    }

    async function handleCheck() {
        setLoading(true);
        setError("");
        setCheckedFixes(new Set());
        setProposals({});
        try {
            const data = await checkAts(resume, effectiveJobDescription);
            setResult(data);
        } catch {
            setError(t("ats.error"));
        } finally {
            setLoading(false);
        }
    }

    const missingKeywords = result?.keyword_match?.missing_keywords || [];
    const checklistItems = result
        ? [
              ...result.findings,
              ...(missingKeywords.length > 0
                  ? [
                        {
                            id: "missing_keywords",
                            severity: "medium",
                            message: `${t("ats.missingKeywordsFindingMessage")} (${missingKeywords.join(", ")})`,
                            fix: t("ats.workInMissingKeywords"),
                        },
                    ]
                  : []),
          ]
        : [];
    const hasChecklist = checklistItems.length > 0;
    const totalChecklistItems = checklistItems.length;

    return (
        <div className="ats-panel">
            {sourceJobDescription && (
                <div className="ats-source-toggle">
                    <label className="ats-source-option">
                        <input
                            type="radio"
                            name="atsJobSource"
                            checked={useSourceJob}
                            onChange={() => setUseSourceJob(true)}
                        />
                        {t("ats.useSourceJob")}
                    </label>
                    <label className="ats-source-option">
                        <input
                            type="radio"
                            name="atsJobSource"
                            checked={!useSourceJob}
                            onChange={() => setUseSourceJob(false)}
                        />
                        {t("ats.pasteDifferentJob")}
                    </label>
                </div>
            )}

            {sourceJobDescription && useSourceJob ? (
                <p className="ats-source-preview">
                    {sourceJobDescription.length > 220
                        ? `${sourceJobDescription.slice(0, 220)}…`
                        : sourceJobDescription}
                </p>
            ) : (
                <label className="item-field item-field-full">
                    <span>{t("ats.jobDescriptionLabel")}</span>
                    <textarea
                        rows={6}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder={t("ats.jobDescriptionPlaceholder")}
                    />
                </label>
            )}

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

                    {hasChecklist && (
                        <div className="ats-checklist">
                            <div className="ats-checklist-header">
                                <h4>{t("ats.suggestedFixes")}</h4>
                                <span className="ats-checklist-progress">
                                    {t("ats.checklistProgress", { done: checkedFixes.size, total: totalChecklistItems })}
                                </span>
                            </div>

                            <ul className="ats-findings">
                                {checklistItems.map((finding) => {
                                    const proposal = proposals[finding.id];
                                    const proposed = proposal?.result;

                                    return (
                                        <li
                                            key={finding.id}
                                            className={`ats-finding severity-${finding.severity} ${checkedFixes.has(finding.id) ? "done" : ""}`}
                                        >
                                            <label className="ats-finding-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedFixes.has(finding.id)}
                                                    onChange={() => toggleFixChecked(finding.id)}
                                                />
                                                <div>
                                                    <div className="ats-finding-header">
                                                        <span className="ats-severity-badge">{t(SEVERITY_LABEL_KEYS[finding.severity])}</span>
                                                        {finding.message}
                                                    </div>
                                                    {finding.fix && (
                                                        <p className="ats-finding-fix">
                                                            <strong>{t("ats.fixLabel")}:</strong> {finding.fix}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>

                                            {!proposal && !checkedFixes.has(finding.id) && (
                                                <button
                                                    type="button"
                                                    className="ats-ai-fix-button"
                                                    onClick={() => handleAskAi(finding)}
                                                >
                                                    {t("ats.askAiToFix")}
                                                </button>
                                            )}

                                            {proposal?.loading && (
                                                <p className="ats-ai-thinking">
                                                    <span className="preview-updating-spinner" />
                                                    {t("ats.aiThinking")}
                                                </p>
                                            )}

                                            {proposal?.error && <p className="entry-error">{t("ats.aiError")}</p>}

                                            {proposed && (
                                                <div className="ats-fix-proposal">
                                                    <p>{proposed.explanation}</p>

                                                    {proposed.can_fix &&
                                                        proposed.edits.map((edit, index) => (
                                                            <blockquote key={index} className="ats-fix-preview">
                                                                {editPreviewText(edit)}
                                                            </blockquote>
                                                        ))}

                                                    <div className="ats-fix-actions">
                                                        {proposed.can_fix && (
                                                            <button
                                                                type="button"
                                                                className="ats-fix-apply"
                                                                onClick={() => handleApply(finding)}
                                                            >
                                                                {t("ats.applyFix")}
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="ats-fix-reject"
                                                            onClick={() => setProposal(finding.id, undefined)}
                                                        >
                                                            {proposed.can_fix ? t("ats.rejectFix") : t("ats.dismissFix")}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <p className="ats-report">{result.report}</p>
                    <p className="ats-report-note">{t("ats.reportNote")}</p>
                </div>
            )}
        </div>
    );
}
