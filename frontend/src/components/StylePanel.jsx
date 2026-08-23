import { useResumeStore } from "../store/resumeStore.js";

const TEMPLATES = [
    { value: "classic", label: "Classic (single column)" },
    { value: "sidebar", label: "Sidebar (two column)" },
];

const FONTS = [
    { value: "Lato, 'Segoe UI', Arial, sans-serif", label: "Lato" },
    { value: "Arial, Helvetica, sans-serif", label: "Arial" },
    { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
    { value: "'Open Sans', Arial, sans-serif", label: "Open Sans" },
    { value: "Roboto, Arial, sans-serif", label: "Roboto" },
];

const FONT_SIZES = ["8.5pt", "9pt", "9.5pt", "10pt", "10.5pt", "11pt"];
const LINE_HEIGHTS = ["1.3", "1.45", "1.6", "1.75"];
const MARGINS = [
    { value: "10mm 12mm", label: "Compact" },
    { value: "14mm 16mm", label: "Normal" },
    { value: "20mm 22mm", label: "Spacious" },
];
const PAGE_FORMATS = [
    { value: "a4", label: "A4" },
    { value: "letter", label: "Letter" },
    { value: "free", label: "Free-Form" },
];

export default function StylePanel() {
    const resume = useResumeStore((state) => state.resume);
    const updateMetadataField = useResumeStore((state) => state.updateMetadataField);
    const metadata = resume.metadata || {};

    return (
        <div className="style-panel">
            <label className="style-field">
                <span>Template</span>
                <select value={metadata.template || "classic"} onChange={(e) => updateMetadataField("template", e.target.value)}>
                    {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </label>

            <label className="style-field">
                <span>Font</span>
                <select value={metadata.fontFamily} onChange={(e) => updateMetadataField("fontFamily", e.target.value)}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
            </label>

            <label className="style-field">
                <span>Font size</span>
                <select value={metadata.fontSize} onChange={(e) => updateMetadataField("fontSize", e.target.value)}>
                    {FONT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
            </label>

            <label className="style-field">
                <span>Line height</span>
                <select value={metadata.lineHeight} onChange={(e) => updateMetadataField("lineHeight", e.target.value)}>
                    {LINE_HEIGHTS.map((lh) => <option key={lh} value={lh}>{lh}</option>)}
                </select>
            </label>

            <label className="style-field">
                <span>Accent color</span>
                <input
                    type="color"
                    value={metadata.primaryColor || "#0f3381"}
                    onChange={(e) => updateMetadataField("primaryColor", e.target.value)}
                />
            </label>

            <label className="style-field">
                <span>Margins</span>
                <select value={metadata.margin} onChange={(e) => updateMetadataField("margin", e.target.value)}>
                    {MARGINS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </label>

            <label className="style-field">
                <span>Page format</span>
                <select value={metadata.pageFormat} onChange={(e) => updateMetadataField("pageFormat", e.target.value)}>
                    {PAGE_FORMATS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </label>
        </div>
    );
}
