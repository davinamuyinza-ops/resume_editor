import { useState } from "react";

import RichTextEditor from "./RichTextEditor.jsx";
import { ADDABLE_SECTIONS, blankItem, DESCRIPTION_SECTIONS, FIELD_LAYOUTS, FLUENCY_LEVELS, getSectionTitle, levelForFluency } from "../sectionMeta.js";
import { useResumeStore } from "../store/resumeStore.js";
import { useTranslation } from "../i18n.js";

export default function AddItemForm() {
    const resume = useResumeStore((state) => state.resume);
    const addItem = useResumeStore((state) => state.addItem);
    const { t } = useTranslation();
    const [sectionKey, setSectionKey] = useState("experience");
    const [fields, setFields] = useState({});

    function handleFieldChange(key, value) {
        setFields((prev) => ({ ...prev, [key]: value }));
    }

    function handleSectionChange(newKey) {
        setSectionKey(newKey);
        setFields({});
    }

    function handleAdd() {
        const item = blankItem(sectionKey);

        if (sectionKey === "skills") {
            item.name = fields.name || "";
            item.keywords = (fields.keywords || "").split(",").map((k) => k.trim()).filter(Boolean);
        } else if (sectionKey === "languages") {
            item.language = fields.language || "";
            item.fluency = fields.fluency || "";
            item.level = levelForFluency(fields.fluency || "");
        } else {
            for (const layoutField of FIELD_LAYOUTS[sectionKey] || []) {
                item[layoutField.key] = fields[layoutField.key] || "";
            }
            if (DESCRIPTION_SECTIONS.has(sectionKey)) {
                item.description = fields.description || "";
            }
        }

        addItem(sectionKey, item);
        setFields({});
    }

    return (
        <div className="add-item-form">
            <div className="add-item-header">
                <span className="add-item-title">{t("sections.addNewItem")}</span>
                <select value={sectionKey} onChange={(e) => handleSectionChange(e.target.value)}>
                    {ADDABLE_SECTIONS.map((key) => (
                        <option key={key} value={key}>{getSectionTitle(resume, key)}</option>
                    ))}
                </select>
            </div>

            <div className="add-item-fields">
                {sectionKey === "skills" && (
                    <>
                        <label className="item-field">
                            <span>{t("sections.categoryName")}</span>
                            <input type="text" value={fields.name || ""} onChange={(e) => handleFieldChange("name", e.target.value)} />
                        </label>
                        <label className="item-field item-field-full">
                            <span>{t("sections.keywords")}</span>
                            <input type="text" value={fields.keywords || ""} onChange={(e) => handleFieldChange("keywords", e.target.value)} />
                        </label>
                    </>
                )}

                {sectionKey === "languages" && (
                    <>
                        <label className="item-field">
                            <span>{t("sections.language")}</span>
                            <input type="text" value={fields.language || ""} onChange={(e) => handleFieldChange("language", e.target.value)} />
                        </label>
                        <label className="item-field">
                            <span>{t("sections.fluency")}</span>
                            <select value={fields.fluency || ""} onChange={(e) => handleFieldChange("fluency", e.target.value)}>
                                <option value="">{t("sections.selectFluency")}</option>
                                {FLUENCY_LEVELS.map((f) => (
                                    <option key={f.label} value={f.label}>{f.label}</option>
                                ))}
                            </select>
                        </label>
                    </>
                )}

                {FIELD_LAYOUTS[sectionKey]?.map((field) => (
                    <label key={field.key} className="item-field">
                        <span>{t(field.labelKey)}</span>
                        <input
                            type="text"
                            value={fields[field.key] || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        />
                    </label>
                ))}

                {DESCRIPTION_SECTIONS.has(sectionKey) && (
                    <label className="item-field item-field-full">
                        <span>{t("sections.description")}</span>
                        <RichTextEditor
                            value={fields.description || ""}
                            onChange={(html) => handleFieldChange("description", html)}
                        />
                    </label>
                )}
            </div>

            <button className="primary-action add-item-button" onClick={handleAdd}>
                {t("sections.addTo", { title: getSectionTitle(resume, sectionKey) })}
            </button>
        </div>
    );
}
