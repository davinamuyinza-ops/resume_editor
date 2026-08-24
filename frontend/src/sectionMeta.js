export const SECTION_LABELS = {
    summary: "Profile",
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

// Fluency label <-> dot-rating level, kept together so picking a label
// always keeps the resume's rendered dots in sync with it.
export const FLUENCY_LEVELS = [
    { label: "Native", level: 5 },
    { label: "Fluent", level: 4 },
    { label: "Advanced", level: 3 },
    { label: "Intermediate", level: 2 },
    { label: "Basic", level: 1 },
];

export function levelForFluency(label) {
    const match = FLUENCY_LEVELS.find((f) => f.label === label);
    return match ? match.level : 0;
}

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

// Compact preview shown on the collapsed item row - a primary label plus a
// secondary detail, so an expanded section doesn't dump every field at once.
export function itemSummary(sectionKey, item) {
    switch (sectionKey) {
        case "experience":
            return { primary: item.position || "Untitled position", secondary: item.company || "" };
        case "education":
            return { primary: item.degree || "Untitled degree", secondary: item.school || "" };
        case "projects":
            return { primary: item.name || "Untitled project", secondary: item.period || "" };
        case "volunteer":
            return { primary: item.organization || "Untitled", secondary: item.period || "" };
        case "certifications":
            return { primary: item.name || "Untitled certification", secondary: item.issuer || "" };
        case "skills":
            return { primary: item.name || "Untitled category", secondary: (item.keywords || []).join(", ") };
        case "languages":
            return { primary: item.language || "Untitled language", secondary: item.fluency || "" };
        default:
            return { primary: "Item", secondary: "" };
    }
}
