export const SECTION_LABELS = {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    languages: "Languages",
    volunteer: "Volunteering",
    certifications: "Certifications",
};

export const DEFAULT_ORDER = Object.keys(SECTION_LABELS);

// Sections whose items share the "long-form" shape (company/school/name +
// period + description) and can be moved between each other.
export const MOVABLE_SECTIONS = ["experience", "education", "projects", "volunteer", "certifications"];

// Every section type the "Add item" form can create into.
export const ADDABLE_SECTIONS = ["experience", "education", "projects", "skills", "languages", "volunteer", "certifications"];

export const FIELD_LAYOUTS = {
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

export const DESCRIPTION_SECTIONS = new Set(["experience", "projects", "volunteer"]);

export function blankItem(sectionKey) {
    const base = { id: crypto.randomUUID(), hidden: false };

    switch (sectionKey) {
        case "experience":
            return { ...base, company: "", position: "", location: "", period: "", website: { url: "", label: "" }, description: "" };
        case "education":
            return { ...base, school: "", degree: "", area: "", grade: "", location: "", period: "", website: { url: "", label: "" }, description: "" };
        case "projects":
            return { ...base, name: "", period: "", website: { url: "", label: "" }, description: "" };
        case "volunteer":
            return { ...base, organization: "", location: "", period: "", website: { url: "", label: "" }, description: "" };
        case "certifications":
            return { ...base, name: "", issuer: "", date: "", summary: "" };
        case "skills":
            return { ...base, name: "", proficiency: "", level: 0, keywords: [] };
        case "languages":
            return { ...base, language: "", fluency: "", level: 0 };
        default:
            return base;
    }
}
