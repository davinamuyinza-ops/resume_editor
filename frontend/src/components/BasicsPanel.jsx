import Slider from "./Slider.jsx";
import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";

const ICON_OPTIONS = [
    { value: "", labelKey: "basics.iconGeneric" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "github", label: "GitHub" },
    { value: "twitter", label: "Twitter / X" },
    { value: "website", labelKey: "basics.iconWebsite" },
    { value: "email", labelKey: "basics.iconEmail" },
];

export default function BasicsPanel() {
    const resume = useResumeStore((state) => state.resume);
    const updateBasicsField = useResumeStore((state) => state.updateBasicsField);
    const updateWebsiteField = useResumeStore((state) => state.updateWebsiteField);
    const addCustomField = useResumeStore((state) => state.addCustomField);
    const removeCustomField = useResumeStore((state) => state.removeCustomField);
    const updateCustomField = useResumeStore((state) => state.updateCustomField);
    const updatePictureField = useResumeStore((state) => state.updatePictureField);
    const { t } = useTranslation();

    const basics = resume.basics || {};
    const website = basics.website || {};
    const customFields = basics.customFields || [];
    const picture = resume.picture || {};

    return (
        <div className="basics-panel">
            <div className="basics-section">
                <div className="basics-section-title">{t("basics.photo")}</div>
                <div className="photo-row">
                    <div
                        className="photo-preview"
                        style={{ width: Math.min(picture.size || 70, 100), height: Math.min(picture.size || 70, 100) }}
                    >
                        {!picture.hidden && picture.url ? (
                            <img src={picture.url} alt="" />
                        ) : (
                            <div className="photo-placeholder">{t("basics.noPhoto")}</div>
                        )}
                    </div>
                    <div className="photo-controls">
                        <label className="item-field item-field-full">
                            <span>{t("basics.photoUrl")}</span>
                            <input
                                type="text"
                                value={picture.url || ""}
                                placeholder="https://..."
                                onChange={(e) => updatePictureField("url", e.target.value)}
                            />
                        </label>
                        <Slider
                            label={t("basics.size")}
                            value={picture.size || 70}
                            min={40}
                            max={160}
                            step={5}
                            unit="px"
                            onChange={(value) => updatePictureField("size", value)}
                        />
                        <label className="checkbox-field">
                            <input
                                type="checkbox"
                                checked={!picture.hidden}
                                onChange={(e) => updatePictureField("hidden", !e.target.checked)}
                            />
                            <span>{t("basics.showPhoto")}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="basics-section">
                <div className="basics-section-title">{t("basics.personalDetails")}</div>
                <div className="item-fields">
                    <label className="item-field">
                        <span>{t("basics.fullName")}</span>
                        <input type="text" value={basics.name || ""} onChange={(e) => updateBasicsField("name", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>{t("basics.headline")}</span>
                        <input type="text" value={basics.headline || ""} onChange={(e) => updateBasicsField("headline", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>{t("basics.email")}</span>
                        <input type="text" value={basics.email || ""} onChange={(e) => updateBasicsField("email", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>{t("basics.phone")}</span>
                        <input type="text" value={basics.phone || ""} onChange={(e) => updateBasicsField("phone", e.target.value)} />
                    </label>
                    <label className="item-field item-field-full">
                        <span>{t("basics.address")}</span>
                        <input
                            type="text"
                            value={basics.location || ""}
                            placeholder={t("basics.addressPlaceholder")}
                            onChange={(e) => updateBasicsField("location", e.target.value)}
                        />
                    </label>
                </div>
            </div>

            <div className="basics-section">
                <div className="basics-section-title">{t("basics.website")}</div>
                <div className="item-fields">
                    <label className="item-field">
                        <span>{t("basics.url")}</span>
                        <input type="text" value={website.url || ""} onChange={(e) => updateWebsiteField("url", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>{t("basics.label")}</span>
                        <input type="text" value={website.label || ""} onChange={(e) => updateWebsiteField("label", e.target.value)} />
                    </label>
                </div>
            </div>

            <div className="basics-section">
                <div className="basics-section-title-row">
                    <div className="basics-section-title">{t("basics.customLinks")}</div>
                    <button className="add-link-button" onClick={addCustomField}>{t("basics.addLink")}</button>
                </div>
                {customFields.map((field) => (
                    <div key={field.id} className="item-card custom-field-row">
                        <label className="item-field field-icon">
                            <span>{t("basics.icon")}</span>
                            <select
                                value={field.icon || ""}
                                onChange={(e) => updateCustomField(field.id, "icon", e.target.value)}
                            >
                                {ICON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.labelKey ? t(opt.labelKey) : opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <label className="item-field field-text">
                            <span>{t("basics.text")}</span>
                            <input
                                type="text"
                                placeholder="LinkedIn"
                                value={field.text || ""}
                                onChange={(e) => updateCustomField(field.id, "text", e.target.value)}
                            />
                        </label>
                        <label className="item-field field-link">
                            <span>{t("basics.link")}</span>
                            <input
                                type="text"
                                placeholder="https://linkedin.com/in/..."
                                value={field.link || ""}
                                onChange={(e) => updateCustomField(field.id, "link", e.target.value)}
                            />
                        </label>
                        <button
                            className="remove-link-button field-remove"
                            onClick={() => removeCustomField(field.id)}
                            aria-label={t("basics.removeLink")}
                            title={t("basics.removeLink")}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
