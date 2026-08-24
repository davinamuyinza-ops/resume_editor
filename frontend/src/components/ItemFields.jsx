import RichTextEditor from "./RichTextEditor.jsx";
import { DESCRIPTION_SECTIONS, FIELD_LAYOUTS } from "../sectionMeta.js";
import { useResumeStore } from "../store/resumeStore.js";

export default function ItemFields({ sectionKey, item }) {
    const updateItemField = useResumeStore((state) => state.updateItemField);
    const fields = FIELD_LAYOUTS[sectionKey] || [];

    return (
        <div className="item-fields">
            {fields.map((field) => (
                <label key={field.key} className="item-field">
                    <span>{field.label}</span>
                    <input
                        type="text"
                        value={item[field.key] || ""}
                        onChange={(event) => updateItemField(sectionKey, item.id, field.key, event.target.value)}
                    />
                </label>
            ))}

            {DESCRIPTION_SECTIONS.has(sectionKey) && (
                <label className="item-field item-field-full">
                    <span>Description</span>
                    <RichTextEditor
                        value={item.description}
                        onChange={(html) => updateItemField(sectionKey, item.id, "description", html)}
                    />
                </label>
            )}
        </div>
    );
}
