import Slider from "./Slider.jsx";
import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";

const TEMPLATES = [
    { value: "classic", labelKey: "style.templateClassic" },
    { value: "sidebar", labelKey: "style.templateSidebar" },
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
    { value: 300, labelKey: "weight.light" },
    { value: 400, labelKey: "weight.regular" },
    { value: 500, labelKey: "weight.medium" },
    { value: 600, labelKey: "weight.semibold" },
    { value: 700, labelKey: "weight.bold" },
    { value: 800, labelKey: "weight.extraBold" },
];

const PAGE_FORMATS = [
    { value: "a4", labelKey: "style.pageFormatA4" },
    { value: "letter", labelKey: "style.pageFormatLetter" },
    { value: "free", labelKey: "style.pageFormatFree" },
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
    const { t } = useTranslation();
    const metadata = resume.metadata || {};

    return (
        <div className="style-panel">
            <div className="basics-section-title">{t("style.layout")}</div>

            <label className="style-field">
                <span>{t("style.template")}</span>
                <select value={metadata.template || "classic"} onChange={(e) => updateMetadataField("template", e.target.value)}>
                    {TEMPLATES.map((tpl) => <option key={tpl.value} value={tpl.value}>{t(tpl.labelKey)}</option>)}
                </select>
            </label>

            <label className="style-field">
                <span>{t("style.accentColor")}</span>
                <input
                    type="color"
                    value={metadata.primaryColor || "#0f3381"}
                    onChange={(e) => updateMetadataField("primaryColor", e.target.value)}
                />
            </label>

            <Slider
                label={t("style.margin")}
                value={parseMargin(metadata.margin)}
                min={2}
                max={28}
                step={1}
                unit="mm"
                onChange={(value) => updateMetadataField("margin", `${value}mm ${value + 2}mm`)}
            />

            <Slider
                label={t("style.padding")}
                value={metadata.sectionSpacing || 20}
                min={5}
                max={40}
                step={1}
                unit="px"
                onChange={(value) => updateMetadataField("sectionSpacing", value)}
            />

            <label className="style-field">
                <span>{t("style.pageFormat")}</span>
                <select value={metadata.pageFormat} onChange={(e) => updateMetadataField("pageFormat", e.target.value)}>
                    {PAGE_FORMATS.map((p) => <option key={p.value} value={p.value}>{t(p.labelKey)}</option>)}
                </select>
            </label>

            <div className="basics-section-title style-section-spacer">{t("style.headings")}</div>

            <label className="style-field">
                <span>{t("style.headingFont")}</span>
                <select
                    value={metadata.headingFontFamily || metadata.fontFamily}
                    onChange={(e) => updateMetadataField("headingFontFamily", e.target.value)}
                >
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
            </label>

            <Slider
                label={t("style.headingFontSize")}
                value={parseFontSize(metadata.headingFontSize, 10)}
                min={7}
                max={16}
                step={0.5}
                unit="pt"
                onChange={(value) => updateMetadataField("headingFontSize", `${value}pt`)}
            />

            <Slider
                label={t("style.headingLineHeight")}
                value={parseFloat(metadata.headingLineHeight) || 1.3}
                min={1}
                max={2}
                step={0.05}
                onChange={(value) => updateMetadataField("headingLineHeight", String(value))}
            />

            <label className="style-field">
                <span>{t("style.headingBoldness")}</span>
                <select
                    value={metadata.headingFontWeight || 700}
                    onChange={(e) => updateMetadataField("headingFontWeight", Number(e.target.value))}
                >
                    {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{t(w.labelKey)}</option>)}
                </select>
            </label>

            <div className="basics-section-title style-section-spacer">{t("style.bodyText")}</div>

            <label className="style-field">
                <span>{t("style.bodyFont")}</span>
                <select value={metadata.fontFamily} onChange={(e) => updateMetadataField("fontFamily", e.target.value)}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
            </label>

            <Slider
                label={t("style.bodyFontSize")}
                value={parseFontSize(metadata.fontSize, 9.5)}
                min={8}
                max={12}
                step={0.5}
                unit="pt"
                onChange={(value) => updateMetadataField("fontSize", `${value}pt`)}
            />

            <Slider
                label={t("style.bodyLineHeight")}
                value={parseFloat(metadata.lineHeight) || 1.45}
                min={1.2}
                max={2}
                step={0.05}
                onChange={(value) => updateMetadataField("lineHeight", String(value))}
            />

            <label className="style-field">
                <span>{t("style.bodyBoldness")}</span>
                <select
                    value={metadata.bodyFontWeight || 400}
                    onChange={(e) => updateMetadataField("bodyFontWeight", Number(e.target.value))}
                >
                    {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{t(w.labelKey)}</option>)}
                </select>
            </label>

            <div className="basics-section-title style-section-spacer">{t("style.skillsAndLanguages")}</div>

            <label className="style-field">
                <span>{t("style.skillsLayout")}</span>
                <select
                    value={metadata.skillsLayout || "stacked"}
                    onChange={(e) => updateMetadataField("skillsLayout", e.target.value)}
                >
                    <option value="stacked">{t("style.stackedSkills")}</option>
                    <option value="inline">{t("style.inline")}</option>
                </select>
            </label>

            <label className="style-field">
                <span>{t("style.languagesLayout")}</span>
                <select
                    value={metadata.languagesLayout || "stacked"}
                    onChange={(e) => updateMetadataField("languagesLayout", e.target.value)}
                >
                    <option value="stacked">{t("style.stackedLanguages")}</option>
                    <option value="inline">{t("style.inline")}</option>
                </select>
            </label>
        </div>
    );
}
