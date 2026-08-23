import { useEffect, useRef, useState } from "react";

import { renderPreview } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";

const DEBOUNCE_MS = 400;

export default function PreviewPane() {
    const resume = useResumeStore((state) => state.resume);
    const [html, setHtml] = useState("");
    const [error, setError] = useState("");
    const [zoom, setZoom] = useState(0.75);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            renderPreview(resume)
                .then((result) => {
                    setHtml(result);
                    setError("");
                })
                .catch(() => setError("Could not reach the preview server."));
        }, DEBOUNCE_MS);

        return () => clearTimeout(debounceRef.current);
    }, [resume]);

    return (
        <div className="preview-pane">
            <div className="preview-toolbar">
                <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}>-</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}>+</button>
            </div>
            {error && <p className="preview-error">{error}</p>}
            <div className="preview-page-stack">
                <iframe
                    title="Resume preview"
                    srcDoc={html}
                    className="preview-frame"
                    style={{ transform: `scale(${zoom})` }}
                />
            </div>
        </div>
    );
}
