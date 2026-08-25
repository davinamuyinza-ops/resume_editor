import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Render backing-store resolution multiplier so text stays crisp even when
// the on-screen CSS size is scaled down by `zoom`.
const RENDER_SCALE = 1.5;

export default function PdfPageView({ pdfBytes, zoom }) {
    const [pdfDoc, setPdfDoc] = useState(null);
    const canvasRefs = useRef([]);

    useEffect(() => {
        let cancelled = false;
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });

        loadingTask.promise.then((doc) => {
            if (cancelled) return;
            canvasRefs.current = new Array(doc.numPages);
            setPdfDoc(doc);
        });

        return () => {
            cancelled = true;
            loadingTask.destroy();
        };
    }, [pdfBytes]);

    useEffect(() => {
        if (!pdfDoc) return;
        let cancelled = false;

        async function renderPages() {
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                if (cancelled) return;
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: zoom * RENDER_SCALE });
                const canvas = canvasRefs.current[i - 1];
                if (!canvas || cancelled) continue;

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = `${viewport.width / RENDER_SCALE}px`;
                canvas.style.height = `${viewport.height / RENDER_SCALE}px`;

                await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
            }
        }

        renderPages();
        return () => {
            cancelled = true;
        };
    }, [pdfDoc, zoom]);

    if (!pdfDoc) return null;

    return (
        <div className="pdf-page-view">
            {Array.from({ length: pdfDoc.numPages }, (_, i) => (
                <div key={i} className="pdf-page">
                    <canvas ref={(el) => (canvasRefs.current[i] = el)} />
                    <span className="pdf-page-number">
                        {i + 1} / {pdfDoc.numPages}
                    </span>
                </div>
            ))}
        </div>
    );
}
