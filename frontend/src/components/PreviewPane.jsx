import { useEffect, useRef, useState } from "react";

import { AuthError, exportPdf, renderPreview } from "../api.js";
import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";
import PdfPageView from "./PdfPageView.jsx";

const HTML_DEBOUNCE_MS = 400;
// PDF generation launches a real browser to render each update, so it's
// debounced longer than the plain HTML preview to avoid piling up renders
// while the user is still actively typing.
const PDF_DEBOUNCE_MS = 900;

export default function PreviewPane() {
    const resume = useResumeStore((state) => state.resume);
    const { t } = useTranslation();
    const [html, setHtml] = useState("");
    const [pdfBytes, setPdfBytes] = useState(null);
    const [pageView, setPageView] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [htmlLoading, setHtmlLoading] = useState(false);
    const [error, setError] = useState("");
    const [zoom, setZoom] = useState(0.75);
    const [retryTick, setRetryTick] = useState(0);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        function handleFailure(err) {
            const isNetworkFailure = err instanceof TypeError;

            if (err instanceof AuthError) {
                setError(t("session.expired"));
                return;
            }

            setError(
                isNetworkFailure
                    ? t("preview.cantReachBackend")
                    : t("preview.previewFailed", { message: err.message })
            );
        }

        if (pageView) {
            setPdfLoading(true);
            debounceRef.current = setTimeout(() => {
                exportPdf(resume)
                    .then((blob) => blob.arrayBuffer())
                    .then((buffer) => {
                        setPdfBytes(buffer);
                        setError("");
                    })
                    .catch(handleFailure)
                    .finally(() => setPdfLoading(false));
            }, PDF_DEBOUNCE_MS);
        } else {
            // Set immediately (not inside the timeout) so the indicator covers
            // the debounce wait too - the user sees feedback the moment they
            // make a change, not just once the request finally goes out.
            setHtmlLoading(true);

            debounceRef.current = setTimeout(() => {
                renderPreview(resume)
                    .then((result) => {
                        setHtml(result);
                        setError("");
                    })
                    .catch(handleFailure)
                    .finally(() => setHtmlLoading(false));
            }, HTML_DEBOUNCE_MS);
        }

        return () => clearTimeout(debounceRef.current);
    }, [resume, retryTick, pageView]);

    return (
        <div className="preview-pane">
            <div className="preview-toolbar">
                <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}>-</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}>+</button>
                <button
                    className={`preview-mode-toggle ${pageView ? "active" : ""}`}
                    onClick={() => setPageView((v) => !v)}
                >
                    {pageView ? t("preview.continuousView") : t("preview.pageView")}
                </button>
            </div>

            {pageView && pdfLoading && <p className="preview-loading">{t("preview.generatingPages")}</p>}

            {error && (
                <p className="preview-error">
                    {error}
                    <button className="preview-retry-button" onClick={() => setRetryTick((n) => n + 1)}>
                        {t("preview.retry")}
                    </button>
                </p>
            )}

            <div className="preview-page-stack">
                {!pageView && htmlLoading && (
                    <div className="preview-updating-badge">
                        <span className="preview-updating-spinner" />
                        {t("preview.updatingPreview")}
                    </div>
                )}

                {pageView ? (
                    pdfBytes && <PdfPageView pdfBytes={pdfBytes} zoom={zoom} />
                ) : (
                    <iframe
                        title={t("preview.title")}
                        srcDoc={html}
                        className="preview-frame"
                        style={{ transform: `scale(${zoom})` }}
                    />
                )}
            </div>
        </div>
    );
}
