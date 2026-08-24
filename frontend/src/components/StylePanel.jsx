import Slider from "./Slider.jsx";
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

const PAGE_FORMATS = [
    { value: "a4", label: "A4" },
    { value: "letter", label: "Letter" },
    { value: "free", label: "Free-Form" },
];

function parseFontSize(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 9.5;
}

function parseMargin(value) {
    const match = /^(\d+(?:\.\d+)?)mm/.exec(value || "");
    return match ? parseFloat(match[1]) : 14;
}

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

            <Slider
                label="Font size"
                value={parseFontSize(metadata.fontSize)}
                min={8}
                max={12}
                step={0.5}
                unit="pt"
                onChange={(value) => updateMetadataField("fontSize", `${value}pt`)}
            />

            <Slider
                label="Line height"
                value={parseFloat(metadata.lineHeight) || 1.45}
                min={1.2}
                max={2}
                step={0.05}
                onChange={(value) => updateMetadataField("lineHeight", String(value))}
            />

            <label className="style-field">
                <span>Accent color</span>
                <input
                    type="color"
                    value={metadata.primaryColor || "#0f3381"}
                    onChange={(e) => updateMetadataField("primaryColor", e.target.value)}
                />
            </label>

            <Slider
                label="Margin (page edge to content)"
                value={parseMargin(metadata.margin)}
                min={8}
                max={28}
                step={1}
                unit="mm"
                onChange={(value) => updateMetadataField("margin", `${value}mm ${value + 2}mm`)}
            />

            <Slider
                label="Padding (spacing between sections)"
                value={metadata.sectionSpacing || 20}
                min={12}
                max={40}
                step={2}
                unit="px"
                onChange={(value) => updateMetadataField("sectionSpacing", value)}
            />

            <label className="style-field">
                <span>Page format</span>
                <select value={metadata.pageFormat} onChange={(e) => updateMetadataField("pageFormat", e.target.value)}>
                    {PAGE_FORMATS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </label>
        </div>
    );
}
