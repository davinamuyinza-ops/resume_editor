import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";

function hasText(html) {
    return !!html && html.replace(/<[^>]+>/g, "").trim().length > 0;
}

// A short, deliberately achievable checklist - the goal-gradient effect
// (Kivetz, Urminsky & Zheng, 2006) shows people push harder to finish a task
// as the visible finish line gets closer, so this stays short enough that
// most of it is already true for a freshly loaded resume.
function computeCompleteness(resume) {
    const basics = resume.basics || {};
    const sections = resume.sections || {};

    const checks = [
        !!basics.name?.trim(),
        !!basics.email?.trim(),
        !!basics.headline?.trim(),
        !!basics.phone?.trim(),
        hasText(resume.summary?.content),
        (sections.experience?.items?.length || 0) > 0,
        (sections.education?.items?.length || 0) > 0,
        (sections.skills?.items?.length || 0) > 0,
    ];

    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
}

export default function CompletionMeter() {
    const resume = useResumeStore((state) => state.resume);
    const { t } = useTranslation();
    const percent = computeCompleteness(resume);

    return (
        <div className="completion-meter">
            <div className="completion-meter-header">
                <span>{t("completion.label")}</span>
                <span className="completion-meter-percent">{percent}%</span>
            </div>
            <div className="completion-meter-track">
                <div className="completion-meter-fill" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
