import RichTextEditor from "./RichTextEditor.jsx";
import { useResumeStore } from "../store/resumeStore.js";

const FIELD_LAYOUTS = {
    experience: [
        { key: "company", label: "Company" },
        { key: "position", label: "Position" },
        { key: "location", label: "Location" },
        { key: "period", label: "Period" },
    ],
    education: [
        { key: "school", label: "School" },
        { key: "degree", label: "Degree" },
        { key: "area", label: "Area" },
        { key: "period", label: "Period" },
        { key: "grade", label: "Grade" },
    ],
    projects: [
        { key: "name", label: "Project name" },
        { key: "period", label: "Period" },
    ],
    volunteer: [
        { key: "organization", label: "Organization" },
        { key: "location", label: "Location" },
        { key: "period", label: "Period" },
    ],
    certifications: [
        { key: "name", label: "Name" },
        { key: "issuer", label: "Issuer" },
        { key: "date", label: "Date" },
    ],
};

const DESCRIPTION_SECTIONS = new Set(["experience", "projects", "volunteer"]);

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
