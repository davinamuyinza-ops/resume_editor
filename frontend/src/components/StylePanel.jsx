import Slider from "./Slider.jsx";
import { useResumeStore } from "../store/resumeStore.js";

const TEMPLATES = [
    { value: "classic", label: "Classic (single column)" },
    { value: "sidebar", label: "Sidebar (two column)" },
];

const FONTS = [
    { value: "Inter, 'Segoe UI', Arial, sans-serif", label: "Inter" },
    { value: "Roboto, Arial, sans-serif", label: "Roboto" },
    { value: "'Open Sans', Arial, sans-serif", label: "Open Sans" },
    { value: "Lato, 'Segoe UI', Arial, sans-serif", label: "Lato" },
    { value: "Montserrat, Arial, sans-serif", label: "Montserrat" },
    { value: "Poppins, Arial, sans-serif", label: "Poppins" },
    { value: "Nunito, Arial, sans-serif", label: "Nunito" },
    { value: "Raleway, Arial, sans-serif", label: "Raleway" },
    { value: "Merriweather, Georgia, serif", label: "Merriweather" },
    { value: "'Playfair Display', Georgia, serif", label: "Playfair Display" },
    { value: "Lora, Georgia, serif", label: "Lora" },
    { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
    { value: "Arial, Helvetica, sans-serif", label: "Arial" },
];

const FONT_WEIGHTS = [
    { value: 300, label: "Light" },
    { value: 400, label: "Regular" },
    { value: 500, label: "Medium" },
    { value: 600, label: "Semibold" },
    { value: 700, label: "Bold" },
    { value: 800, label: "Extra Bold" },
];

const PAGE_FORMATS = [
    { value: "a4", label: "A4" },
    { value: "letter", label: "Letter" },
    { value: "free", label: "Free-Form" },
];

function parseFontSize(value, fallback) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
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
            <div className="basics-section-title">Layout</div>

            <label className="style-field">
                <span>Template</span>
                <select value={metadata.template || "classic"} onChange={(e) => updateMetadataField("template", e.target.value)}>
                    {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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

            <Slider
                label="Margin (page edge to content)"
                value={parseMargin(metadata.margin)}
                min={2}
                max={28}
                step={1}
                unit="mm"
                onChange={(value) => updateMetadataField("margin", `${value}mm ${value + 2}mm`)}
            />

            <Slider
                label="Padding (spacing between sections)"
                value={metadata.sectionSpacing || 20}
                min={5}
                max={40}
                step={1}
                unit="px"
                onChange={(value) => updateMetadataField("sectionSpacing", value)}
            />

            <label className="style-field">
                <span>Page format</span>
                <select value={metadata.pageFormat} onChange={(e) => updateMetadataField("pageFormat", e.target.value)}>
                    {PAGE_FORMATS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </label>

            <div className="basics-section-title style-section-spacer">Headings</div>

            <label className="style-field">
                <span>Heading font</span>
                <select
                    value={metadata.headingFontFamily || metadata.fontFamily}
                    onChange={(e) => updateMetadataField("headingFontFamily", e.target.value)}
                >
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
            </label>

            <Slider
                label="Heading font size"
                value={parseFontSize(metadata.headingFontSize, 10)}
                min={7}
                max={16}
                step={0.5}
                unit="pt"
                onChange={(value) => updateMetadataField("headingFontSize", `${value}pt`)}
            />

            <Slider
                label="Heading line height"
                value={parseFloat(metadata.headingLineHeight) || 1.3}
                min={1}
                max={2}
                step={0.05}
                onChange={(value) => updateMetadataField("headingLineHeight", String(value))}
            />

            <label className="style-field">
                <span>Heading boldness</span>
                <select
                    value={metadata.headingFontWeight || 700}
                    onChange={(e) => updateMetadataField("headingFontWeight", Number(e.target.value))}
                >
                    {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
            </label>

            <div className="basics-section-title style-section-spacer">Body text</div>

            <label className="style-field">
                <span>Body font</span>
                <select value={metadata.fontFamily} onChange={(e) => updateMetadataField("fontFamily", e.target.value)}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
            </label>

            <Slider
                label="Body font size"
                value={parseFontSize(metadata.fontSize, 9.5)}
                min={8}
                max={12}
                step={0.5}
                unit="pt"
                onChange={(value) => updateMetadataField("fontSize", `${value}pt`)}
            />

            <Slider
                label="Body line height"
                value={parseFloat(metadata.lineHeight) || 1.45}
                min={1.2}
                max={2}
                step={0.05}
                onChange={(value) => updateMetadataField("lineHeight", String(value))}
            />

            <label className="style-field">
                <span>Body boldness</span>
                <select
                    value={metadata.bodyFontWeight || 400}
                    onChange={(e) => updateMetadataField("bodyFontWeight", Number(e.target.value))}
                >
                    {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
            </label>

            <div className="basics-section-title style-section-spacer">Skills &amp; languages</div>

            <label className="style-field">
                <span>Skills layout</span>
                <select
                    value={metadata.skillsLayout || "stacked"}
                    onChange={(e) => updateMetadataField("skillsLayout", e.target.value)}
                >
                    <option value="stacked">Stacked (one category per line)</option>
                    <option value="inline">Inline (wrapped)</option>
                </select>
            </label>

            <label className="style-field">
                <span>Languages layout</span>
                <select
                    value={metadata.languagesLayout || "stacked"}
                    onChange={(e) => updateMetadataField("languagesLayout", e.target.value)}
                >
                    <option value="stacked">Stacked (one per line)</option>
                    <option value="inline">Inline (wrapped)</option>
                </select>
            </label>
        </div>
    );
}
