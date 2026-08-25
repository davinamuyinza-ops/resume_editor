import { useEffect, useRef, useState } from "react";

import AtsPanel from "./AtsPanel.jsx";
import BasicsPanel from "./BasicsPanel.jsx";
import CompletionMeter from "./CompletionMeter.jsx";
import PreviewPane from "./PreviewPane.jsx";
import SectionList from "./SectionList.jsx";
import StylePanel from "./StylePanel.jsx";
import { exportPdf } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";
import { LANGUAGES, useTranslation } from "../i18n.js";

const TABS = [
    { id: "basics", labelKey: "tabs.profile" },
    { id: "sections", labelKey: "tabs.sections" },
    { id: "style", labelKey: "tabs.style" },
    { id: "ats", labelKey: "tabs.ats" },
];

export default function EditorLayout() {
    const resume = useResumeStore((state) => state.resume);
    const setResume = useResumeStore((state) => state.setResume);
    const { t, language, setLanguage } = useTranslation();
    const [activeTab, setActiveTab] = useState("basics");
    const [exporting, setExporting] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const [toast, setToast] = useState("");
    const isDraggingRef = useRef(false);
    const toastTimerRef = useRef(null);

    function showToast(message) {
        setToast(message);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(""), 2600);
    }

    useEffect(() => {
        function handleMouseMove(event) {
            if (!isDraggingRef.current) return;
            const newWidth = Math.min(Math.max(event.clientX, 280), 800);
            setSidebarWidth(newWidth);
        }

        function handleMouseUp() {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    function handleDividerMouseDown() {
        isDraggingRef.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }

    function handleUndo() {
        useResumeStore.temporal.getState().undo();
    }

    function handleRedo() {
        useResumeStore.temporal.getState().redo();
    }

    async function handleExportPdf() {
        setExporting(true);
        try {
            const blob = await exportPdf(resume);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "resume.pdf";
            link.click();
            URL.revokeObjectURL(url);
            showToast(t("topbar.exportSuccess"));
        } catch {
            showToast(t("topbar.exportFailed"));
        } finally {
            setExporting(false);
        }
    }

    function handleDownloadJson() {
        const jsonString = JSON.stringify(resume, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume.json";
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="editor-shell">
            <header className="editor-topbar">
                <div className="editor-brand">{t("entry.title")}</div>
                <div className="editor-topbar-actions">
                    <button onClick={handleUndo} title={t("topbar.undo")}>{t("topbar.undo")}</button>
                    <button onClick={handleRedo} title={t("topbar.redo")}>{t("topbar.redo")}</button>
                    <button onClick={() => setResume(null)} className="secondary-action">{t("topbar.loadDifferent")}</button>
                    <select
                        className="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        aria-label={t("topbar.language")}
                        title={t("topbar.language")}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                    <button onClick={handleDownloadJson} className="secondary-action">{t("topbar.downloadJson")}</button>
                    <button onClick={handleExportPdf} className="primary-action" disabled={exporting}>
                        {exporting ? t("topbar.exporting") : t("topbar.exportPdf")}
                    </button>
                </div>
            </header>

            {toast && (
                <div className="app-toast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    {toast}
                </div>
            )}

            <div className="editor-body">
                <aside className="editor-sidebar" style={{ width: sidebarWidth }}>
                    <CompletionMeter />
                    <div className="editor-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={activeTab === tab.id ? "active" : ""}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>

                    <div className="editor-tab-content">
                        {activeTab === "basics" && <BasicsPanel />}
                        {activeTab === "sections" && <SectionList />}
                        {activeTab === "style" && <StylePanel />}
                        {activeTab === "ats" && <AtsPanel />}
                    </div>
                </aside>

                <div className="editor-divider" onMouseDown={handleDividerMouseDown} />

                <main className="editor-preview-area">
                    <PreviewPane />
                </main>
            </div>
        </div>
    );
}
