import { useState } from "react";

import AtsPanel from "./AtsPanel.jsx";
import PreviewPane from "./PreviewPane.jsx";
import SectionList from "./SectionList.jsx";
import StylePanel from "./StylePanel.jsx";
import { exportPdf } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";

const TABS = [
    { id: "sections", label: "Sections" },
    { id: "style", label: "Style" },
    { id: "ats", label: "ATS Check" },
];

export default function EditorLayout() {
    const resume = useResumeStore((state) => state.resume);
    const setResume = useResumeStore((state) => state.setResume);
    const [activeTab, setActiveTab] = useState("sections");
    const [exporting, setExporting] = useState(false);

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
        } catch {
            // surfaced via disabled state resetting; a toast could be added later
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
                <div className="editor-brand">AI Resume Design Editor</div>
                <div className="editor-topbar-actions">
                    <button onClick={handleUndo} title="Undo">Undo</button>
                    <button onClick={handleRedo} title="Redo">Redo</button>
                    <button onClick={() => setResume(null)} className="secondary-action">Load Different Resume</button>
                    <button onClick={handleDownloadJson} className="secondary-action">Download JSON</button>
                    <button onClick={handleExportPdf} className="primary-action" disabled={exporting}>
                        {exporting ? "Exporting..." : "Export PDF"}
                    </button>
                </div>
            </header>

            <div className="editor-body">
                <aside className="editor-sidebar">
                    <div className="editor-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={activeTab === tab.id ? "active" : ""}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "sections" && <SectionList />}
                    {activeTab === "style" && <StylePanel />}
                    {activeTab === "ats" && <AtsPanel />}
                </aside>

                <main className="editor-preview-area">
                    <PreviewPane />
                </main>
            </div>
        </div>
    );
}
